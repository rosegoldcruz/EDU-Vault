# Privy Setup

Privy remains the sole application authentication and wallet-session provider.

Use separate development/staging and production Privy applications. Configure browser origins for:

- `https://ironvaulttoken.com` and `https://www.ironvaulttoken.com`
- `https://member.ironvaulttoken.com`
- approved Vercel preview origins
- approved Railway preview/staging API origins where Privy configuration requires them
- local web/member development origins

The browser receives only the public app/client identifiers. Railway receives the app secret and optional verification key. Railway verifies every bearer token, cross-checks token subjects, maps the Privy subject to one stable internal UUID, and enforces database roles/entitlements. Supabase Auth is not involved.

Wallet ownership uses a short-lived, single-use server challenge and Solana signature. A submitted address or recursively discovered Privy field is not ownership proof.

