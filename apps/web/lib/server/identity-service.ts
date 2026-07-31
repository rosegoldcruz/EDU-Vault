import type { PoolClient } from "@iron-vault/database";
import { withDatabaseTransaction } from "@iron-vault/database";

import type { AuthenticatedPrivyUser } from "@/lib/server/privy-auth";

export type CanonicalMember = {
  id: string;
  status: "active" | "suspended" | "closed";
  created: boolean;
};

async function findMemberByPrivySubject(
  client: PoolClient,
  privyUserId: string,
): Promise<{ id: string; status: CanonicalMember["status"] } | null> {
  const result = await client.query<{
    id: string;
    status: CanonicalMember["status"];
  }>(
    `
      SELECT members.id, members.status
      FROM identity_accounts
      INNER JOIN members ON members.id = identity_accounts.member_id
      WHERE identity_accounts.provider = 'privy'
        AND identity_accounts.provider_subject = $1
      FOR UPDATE OF identity_accounts, members
    `,
    [privyUserId],
  );

  return result.rows[0] ?? null;
}

async function createMemberForPrivySubject(
  client: PoolClient,
  privyUserId: string,
): Promise<{ memberId: string; created: boolean }> {
  const memberResult = await client.query<{ id: string }>(
    "INSERT INTO members DEFAULT VALUES RETURNING id",
  );
  const candidateMemberId = memberResult.rows[0].id;
  const identityResult = await client.query<{ member_id: string }>(
    `
      INSERT INTO identity_accounts (
        member_id,
        provider,
        provider_subject
      )
      VALUES ($1, 'privy', $2)
      ON CONFLICT (provider, provider_subject) DO NOTHING
      RETURNING member_id
    `,
    [candidateMemberId, privyUserId],
  );

  if (identityResult.rows[0]) {
    return { memberId: identityResult.rows[0].member_id, created: true };
  }

  await client.query("DELETE FROM members WHERE id = $1", [candidateMemberId]);
  const existing = await findMemberByPrivySubject(client, privyUserId);
  if (!existing) {
    throw new Error("Canonical Privy identity could not be resolved");
  }

  return { memberId: existing.id, created: false };
}

async function syncPrimaryEmail(
  client: PoolClient,
  memberId: string,
  email: string,
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return;

  const primaryResult = await client.query<{ exists: boolean }>(
    `
      SELECT EXISTS (
        SELECT 1
        FROM member_emails
        WHERE member_id = $1
          AND is_primary = TRUE
      ) AS exists
    `,
    [memberId],
  );

  await client.query(
    `
      INSERT INTO member_emails (
        member_id,
        email,
        source,
        is_primary,
        verified_at
      )
      VALUES ($1, $2, 'privy', $3, NOW())
      ON CONFLICT (member_id, normalized_email)
      DO UPDATE SET
        email = EXCLUDED.email,
        verified_at = COALESCE(member_emails.verified_at, EXCLUDED.verified_at),
        updated_at = NOW()
    `,
    [memberId, email.trim(), !primaryResult.rows[0]?.exists],
  );
}

async function ensureMemberRole(
  client: PoolClient,
  memberId: string,
): Promise<void> {
  await client.query(
    `
      INSERT INTO member_role_assignments (member_id, role_id, reason)
      SELECT $1, roles.id, 'Privy identity synchronized'
      FROM roles
      WHERE roles.code = 'member'
        AND NOT EXISTS (
          SELECT 1
          FROM member_role_assignments
          WHERE member_role_assignments.member_id = $1
            AND member_role_assignments.role_id = roles.id
            AND member_role_assignments.revoked_at IS NULL
        )
    `,
    [memberId],
  );
}

export async function syncCanonicalMember(
  identity: AuthenticatedPrivyUser,
): Promise<CanonicalMember> {
  return withDatabaseTransaction(async (client) => {
    const existing = await findMemberByPrivySubject(
      client,
      identity.privyUserId,
    );
    const resolved = existing
      ? { memberId: existing.id, created: false }
      : await createMemberForPrivySubject(client, identity.privyUserId);

    const memberResult = await client.query<{
      id: string;
      status: CanonicalMember["status"];
    }>(
      `
        UPDATE members
        SET last_login_at = NOW(),
            updated_at = NOW()
        WHERE id = $1
        RETURNING id, status
      `,
      [resolved.memberId],
    );
    const member = memberResult.rows[0];
    if (!member) throw new Error("Canonical member could not be updated");

    await client.query(
      `
        UPDATE identity_accounts
        SET last_authenticated_at = NOW(),
            updated_at = NOW()
        WHERE provider = 'privy'
          AND provider_subject = $1
      `,
      [identity.privyUserId],
    );

    if (identity.email) {
      await syncPrimaryEmail(client, member.id, identity.email);
    }
    await ensureMemberRole(client, member.id);

    return {
      id: member.id,
      status: member.status,
      created: resolved.created,
    };
  });
}
