# Canonical Architecture

Status: superseded on 2026-07-30

The previous contents of this file described an invented split deployment
across `apps/member`, Vercel, Railway, and Supabase. That topology is not the
Iron Vault architecture and must not be implemented.

The canonical product and implementation contract is:

- [`docs/REVENUE-ENGINE-ARCHITECTURE.md`](../../../docs/REVENUE-ENGINE-ARCHITECTURE.md)

The controlling boundaries are:

- `apps/web` is the sole application.
- The VPS, nginx, PM2, and local PostgreSQL are the production platform.
- Privy supplies identity proof.
- Supabase is a temporary read-only migration source, not the target data
  plane.
- Authorize.Net remains inactive until separately authorized.
- `info.ironvaulttoken.com` remains the separately managed legacy website and
  is never a documentation portal.
