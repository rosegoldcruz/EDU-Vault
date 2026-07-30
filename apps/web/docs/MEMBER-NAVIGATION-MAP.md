# Member Navigation Map

## Legacy shell

The committed dashboard route group uses one shell:

```text
app/(dashboard)/layout.tsx
  server entitlement guard
  BackofficeProvider
    Privy token -> profile API
    BackofficeLayout
      desktop sidebar
      sticky header
      mobile drawer
      route content
```

### Desktop navigation

Order from `components/backoffice/BackofficeLayout.tsx`:

1. Dashboard
2. Academy
3. Rewards
4. Vault
5. Referrals
6. VIP
7. Status
8. Account
9. Admin Rewards, only when profile role is `ADMIN`
10. Logout

The sidebar footer displays membership tier. The header displays email, role, and XP. Active matching supports nested paths.

### Mobile navigation

The mobile drawer reuses the same navigation function and admin visibility rule. It adds email, role, and tier. The header retains role and XP. Overlay and close controls are present; the drawer closes on navigation.

### Missing shell capabilities

- No notifications or unread state.
- No account menu; Account is a full navigation item.
- No primary/reward wallet summary in the header.
- No clear membership status/expiry indicator.
- No breadcrumbs or Academy path/module/lesson context.
- No persistent Academy progress control outside the Academy component.
- No route-level skeleton after branded loaders were removed.
- No explicit server-cookie cleanup in normal sidebar logout.
- No admin navigation beyond rewards.

## Academy shell defect

`/academy` is committed at `app/academy/page.tsx`, outside `app/(dashboard)`. Clicking Academy from the member sidebar exits the shared shell and opens a full-screen Academy-specific experience. Returning requires internal component navigation or browser history; the member sidebar is absent.

Git history contains the correct structural precedent: `app/(dashboard)/academy/page.tsx` rendered the Academy inside `BackofficeLayout`. It was deleted by `784ca82` when Module 0 and Modules 7-12 were added. The target should restore the structural relationship, not the old component implementation.

## Canonical shell

`apps/member` owns one authenticated shell for member and admin product areas.

```text
MemberShell
  AccessBoundary
  DesktopSidebar
  MobileDrawer
  Header
    page context / breadcrumb
    membership state
    XP summary
    verified wallet summary
    notifications only if a real notification domain is approved
    account menu / logout
  MainContent
    dashboard
    academy and all nested Academy routes
    account / wallets
    positions / vault
    referrals
    tickets / status
    rewards / VIP
    settings / export
    role-gated admin routes
```

### Proposed primary navigation

| Label | Route | Visibility | Source justification |
|---|---|---|---|
| Dashboard | `/dashboard` | Authenticated free or entitled member, final dashboard rule pending | Legacy dashboard |
| Academy | `/academy` | Authenticated users; content filtered by access scope | Legacy Academy and entitlement model |
| Positions | `/positions` | Authenticated member with applicable records | Legacy Vault position matrix |
| Vault | `/vault` | Authenticated member | Legacy Vault resources/wallet context |
| Referrals | `/referrals` | Authenticated member | Legacy referral lead flow |
| Tickets | `/tickets` | Authenticated member | Legacy Status Desk |
| Rewards | `/rewards` | Authenticated member; data may be empty | Legacy reward status, redesigned manual-only |
| VIP | `/vip` | VIP or ADMIN | Legacy VIP surface; grant rule must be approved |

Account, Wallets, Settings, Data Export, and Logout belong in the account menu unless usability testing favors visible navigation. `Status` remains a product decision because the legacy route is actually support tickets.

### Academy navigation

- `/academy` is a scoped overview within `MemberShell`.
- Learning path pages show modules available to the member.
- Module pages show lessons and assessment state.
- Lesson pages retain shell header/sidebar and add Academy breadcrumbs.
- Assessment pages retain shell and never receive answer keys.
- A member returns to Dashboard or any backoffice area through the same primary navigation; no second Academy nav replaces it.

### Administrator navigation

ADMIN users receive one Admin group with Users, Entitlements, Academy, Rewards, Payments, Tickets, and Reports. Role checks are server/API authoritative and every admin mutation is audited. Hiding a link is not authorization.

## Loading, empty, and error standards

| State | Canonical behavior |
|---|---|
| Auth bootstrap | Stable shell-sized skeleton; no blank page |
| Access check | Preserve shell and show scoped loading state |
| Empty data | Explain absence without inventing records; include allowed action when one exists |
| API failure | Local error with retry; keep navigation usable |
| Revoked/expired | Access explanation and next action; do not conflate with sign-out |
| Mobile | Drawer and fixed controls must not cover lesson/assessment actions; long wallet IDs wrap |
| Logout | Clear Privy client state and member session cookies, then return to login |

## Decisions still required

- Whether authenticated free members can see Dashboard or only Academy Module 0.
- Whether Status remains separate from Tickets.
- Whether Notifications has a verified domain and delivery source.
- Whether Vault remains separate from Positions and Account/Wallets.
- Whether VIP belongs in primary navigation for non-VIP members as an upsell or is hidden until granted.
