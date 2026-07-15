# Entitlement Model

## Authority principle

Authentication and entitlement are separate.

- Privy answers: who is this?
- Canonical user mapping answers: which internal user owns this activity?
- Roles answer: what administrative authority does this user have?
- Entitlements answer: which paid/VIP product scopes are currently available?

Privy sign-in alone never grants paid Academy access. `MEMBER` role alone never grants paid access.

## Access states

| State | Identity | Entitlement | Effective access |
|---|---|---|---|
| Anonymous | None | None | Public marketing only; Module 0 behavior pending lead-capture decision |
| Authenticated free member | Privy mapped to user UUID | No active paid entitlement | Member shell scope approved for free users; Module 0 only |
| Single-module member | Authenticated | Active `SINGLE_MODULE` for Module 1-6 | Module 0 plus purchased module; no other paid modules |
| Full Academy member | Authenticated | Active `FULL_ACADEMY` | Module 0 plus Modules 1-12, subject to progression |
| VIP | Authenticated | Active VIP grant and any Academy entitlement | VIP surface plus underlying Academy scope; VIP does not silently imply Academy unless product rule says so |
| Administrator | Authenticated + ADMIN role | Entitlement bypass for support/inspection | Full operational access, audited; no asset-transfer capability |
| Revoked | Authenticated | Revoked grant | No access from that entitlement; reason/audit retained |
| Expired | Authenticated | End time passed or status expired | No access from that entitlement; renewal path may be shown |

## Legacy evidence to retain

- Active/unexpired lookup.
- ADMIN bypass.
- Identity matching and grandfathered source history.
- Sources `stripe`, `invite`, `grandfathered`, and `admin` as migration evidence.
- Single-module/full-Academy scope and reward-track metadata.
- Invite identity binding, expiry, max-use, and idempotency concepts.
- Unique Stripe Checkout Session fulfillment.

## Canonical grant model

`entitlements` references one canonical user. It does not authorize by matching email or wallet at request time. Email/wallet matches are used only during controlled grant reconciliation, then resolved to the user UUID.

Required fields:

- `id`, `user_id`, `kind`, `status`.
- `scope`: normalized module grant or entitlement-scope relation.
- `starts_at`, `expires_at`.
- `source_type`, `source_reference`.
- `granted_by_user_id` or trusted system actor.
- `created_at`, `updated_at`.

Every transition creates append-only `entitlement_events` with actor, reason, correlation ID, previous/new state, and source evidence.

## Effective access algorithm

1. Verify Privy access token.
2. Resolve `external_identities(provider=PRIVY, subject)` to one active user.
3. Load effective roles and active entitlements at database time.
4. ADMIN may bypass ordinary content entitlement checks; record sensitive admin access.
5. Otherwise evaluate requested scope against active, started, unexpired, non-revoked entitlements.
6. Return a typed access scope containing only allowed capabilities/modules; never return provider secrets or authorization internals.

## Invite redemption

One PostgreSQL transaction locks the invite, validates state/expiry/binding/usage, verifies no existing redemption for invite+user, inserts redemption and entitlement grant/event, increments usage, and commits. No compensating delete is used. Master codes should be modeled as auditable admin-created campaigns or removed; an environment-wide reusable grant code is a product/security decision.

## Payment entitlement

The Railway webhook route verifies provider signature against raw body, validates mode/event identity, persists the event exactly once, retrieves authoritative provider state when required, maps product to entitlement rules, and writes payment transaction plus entitlement grant/event in one transaction. Refund/dispute/chargeback events create revocation or review events according to policy.

## Current canonical correction

The current EDU Vault `syncAcademyUser()` inserts new users with `membershipStatus = ACTIVE`, `membershipStartedAt = now`, and `membershipSource = PRIVY_SIGN_IN`. Before any member migration, replace this with neutral identity creation. Authentication may create/link a user and verified embedded wallet record; it may not create paid membership.

## Free Module 0 decision boundary

Repository evidence shows anonymous Module 0 viewing/quiz, but the corrected product model says authenticated free access according to a final lead-capture rule. Until that decision is made, canonical policy must remain configurable in product data without making paid modules public. No implementation should guess the capture point.

## Audit and revocation

- Grants, overrides, expiry changes, revocations, and admin bypasses are audited.
- Revocation never deletes payment or grant history.
- Entitlement status changes do not delete user progress.
- Reward review state is separate and cannot restore content access.
- Role changes do not manufacture entitlements.
