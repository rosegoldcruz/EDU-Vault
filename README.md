# vinext-starter

A clean full-stack starter running on
[vinext](https://github.com/cloudflare/vinext), with optional Cloudflare D1 and
Drizzle support.

## Prerequisites

- Node.js `>=22.13.0`

## Quick Start

```bash
npm install
npm run dev
npm run build
```

This starter does not use `wrangler.jsonc`.

## Included Shape

- edit site code under `app/`
- `.openai/hosting.json` declares optional Sites D1 and R2 bindings
- `vite.config.ts` simulates declared bindings for local development
- `db/schema.ts` contains the Vaulted Academy LibSQL/Drizzle schema
- `examples/d1/` contains an optional D1 example surface
- `drizzle.config.ts` supports local migration generation when needed

## Workspace Auth Headers

OpenAI workspace sites can read the current user's email from
`oai-authenticated-user-email`.

SIWC-authenticated workspace sites may also receive
`oai-authenticated-user-full-name` when the user's SIWC profile has a non-empty
`name` claim. The full-name value is percent-encoded UTF-8 and is accompanied by
`oai-authenticated-user-full-name-encoding: percent-encoded-utf-8`.

Treat the full name as optional and fall back to email when it is absent:

```tsx
import { headers } from "next/headers";

export default async function Home() {
  const requestHeaders = await headers();
  const email = requestHeaders.get("oai-authenticated-user-email");
  const encodedFullName = requestHeaders.get("oai-authenticated-user-full-name");
  const fullName =
    encodedFullName &&
    requestHeaders.get("oai-authenticated-user-full-name-encoding") ===
      "percent-encoded-utf-8"
      ? decodeURIComponent(encodedFullName)
      : null;

  const displayName = fullName ?? email;
  // ...
}
```

## Optional Dispatch-Owned ChatGPT Sign-In

Import the ready-to-use helpers from `app/chatgpt-auth.ts` when the site needs
optional or required ChatGPT sign-in:

- Use `getChatGPTUser()` for optional signed-in UI.
- Use `requireChatGPTUser(returnTo)` for server-rendered pages that should send
  anonymous visitors through Sign in with ChatGPT.
- Use `chatGPTSignInPath(returnTo)` and `chatGPTSignOutPath(returnTo)` for
  browser links or actions.
- Pass a same-origin relative `returnTo` path for the destination after sign-in
  or sign-out. The helper validates and safely encodes it.
- Mark protected pages with `export const dynamic = "force-dynamic"` because
  they depend on per-request identity headers.

Dispatch owns `/signin-with-chatgpt`, `/signout-with-chatgpt`, `/callback`, the
OAuth cookies, and identity header injection. Do not implement app routes for
those reserved paths. Routes that do not import and call the helper remain
anonymous-compatible.

SIWC establishes identity only; it does not prove workspace membership. Use the
Sites hosting platform's access policy controls for workspace-wide restrictions,
or enforce explicit server-side membership or allowlist checks.

Use SIWC for account pages, user-specific dashboards, saved records, and write
actions tied to the current ChatGPT user. Leave public content anonymous.

## Useful Commands

- `npm run dev`: start local development
- `npm run build`: verify the vinext build output
- `npm test`: run the Vaulted Academy domain tests, production build, and rendered-route checks
- `npm run db:generate`: generate Drizzle migrations after schema changes

## Vaulted Academy Foundation

The Vaulted Academy application lives beside the unchanged public homepage. Privy owns
authentication and wallet connectivity; the application database owns internal
users, entitlements, wallet verification, curriculum, progress, unlocks, and XP.

### Branding

Official product lock:

Iron Vault | Vaulted Academy  
#760CBC · #56E628 · #FFFFFF

### Official Color System — Locked

The Iron Vault | Vaulted Academy visual identity must use this exact primary palette:

- Vault Purple: `#760CBC`
- Electric Green: `#56E628`
- White: `#FFFFFF`

Use Vault Purple as the dominant brand color for primary identity, major gradients,
selected states, branded surfaces, and premium visual elements.

Use Electric Green for progress, success states, XP, completion indicators, active
learning elements, achievement feedback, and strategic calls to action.

Use White for primary typography, high-contrast interface content, icons, and clean
visual separation.

Dark neutral backgrounds may support the interface, but they must not replace or
dilute the three official brand colors. Maintain strong readability for older
viewers and never use near-black text or low-contrast gray copy on dark surfaces.

Do not introduce cyan, pink, blue, gold, orange, or unrelated accent colors. Status
colors may only be added when functionally necessary and must remain visually
subordinate to the official palette.

All gradients must be derived from:
`#760CBC` -> `#56E628`

The complete product must feel unified, premium, energetic, modern, and
unmistakably Iron Vault. Purple owns the identity, green communicates momentum and
achievement, and white keeps the whole product readable.

Required production environment variables:

- `NEXT_PUBLIC_PRIVY_APP_ID`: public Privy application ID.
- `PRIVY_APP_SECRET`: server-only Privy application secret.
- `PRIVY_VERIFICATION_KEY`: optional server-side JWT verification key; when
  omitted, the Privy server SDK retrieves the app key.
- `NEXT_PUBLIC_PRIVY_CLIENT_ID`: optional Privy App Client ID for environments
  that use App Clients.
- `DATABASE_URL`: persistent LibSQL/Turso URL used by Vercel. Local development
  defaults to the ignored `.data/academy.db` file.
- `DATABASE_AUTH_TOKEN`: server-only token for a remote LibSQL/Turso database.

Privy production and development apps should be separate. Register every live
origin in Privy. If a production app uses a custom auth domain, localhost must
use a development Privy app or a configured App Client; otherwise the custom
domain will correctly reject the localhost iframe.

Database setup:

```bash
npm run db:migrate
npm run db:seed
```

Quality and verification:

```bash
npm run lint
npm run typecheck
npm run test
NITRO_PRESET=vercel npx vite build
```

Production readiness follow-up:

- Dependency audit remediation remains open: Step 0 `npm install` reported 38
  findings, 30 moderate and 8 high. Handle this in a dedicated pass before
  calling the platform production-ready; do not run a disruptive audit fix in the
  middle of feature buildout.

Application routes:

- `/login` and `/refresh`: Privy entry and session restoration.
- `/academy`: authenticated learner dashboard.
- `/academy/paths/crypto-foundations`: the core learning path.
- `/academy/modules/wallet-foundations`: module entry.
- `/academy/lessons/[slug]`: server-authorized lesson start and completion.
- `/account`: wallet connection, verification, and primary/reward selection.
- `/admin/academy`: read-only, server-authorized inspection for administrators.

The initial path contains the three wallet-foundation lessons already represented
by the public academy preview. Assessment scoring is intentionally deferred because
the repository had no viable assessment engine. Token payouts, badges, ranks,
streaks, credentials, leaderboards, and the full curriculum are also out of scope.

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)
