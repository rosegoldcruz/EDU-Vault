"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ChevronDown,
  CircleUserRound,
  Crown,
  Gift,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  ShieldCheck,
  Users,
  Vault,
  X,
  type LucideIcon,
} from "lucide-react"
import { usePrivy } from "@privy-io/react-auth"
import { useState, type FormEvent, type ReactNode } from "react"

import { ThemeToggle } from "@/app/iv/ThemeToggle"
import { useBackofficeAuth } from "@/hooks/useBackofficeAuth"
import { DotPatternWithGlowEffect } from "@/components/ui/dot-pattern-with-glow-effect"

type NavigationItem = {
  href: string
  label: string
  icon: LucideIcon
}

const NAV_ITEMS: NavigationItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/academy", label: "Academy", icon: GraduationCap },
  { href: "/rewards", label: "Rewards", icon: Gift },
  { href: "/vault", label: "Vault", icon: Vault },
  { href: "/referrals", label: "Referrals", icon: Users },
  { href: "/vip", label: "VIP", icon: Crown },
  { href: "/status", label: "Status", icon: LifeBuoy },
  { href: "/account", label: "Account", icon: CircleUserRound },
]

function pageTitle(pathname: string): string {
  const match = [...NAV_ITEMS, { href: "/admin/rewards", label: "Rewards admin" }]
    .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
  return match?.label ?? "Member workspace"
}

function MemberLinks({
  pathname,
  isAdmin,
  collapsed = false,
  onNavigate,
}: {
  pathname: string
  isAdmin: boolean
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const links: NavigationItem[] = isAdmin
    ? [...NAV_ITEMS, { href: "/admin/rewards", label: "Admin", icon: ShieldCheck }]
    : NAV_ITEMS

  return (
    <>
      {links.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className="iv-member-nav-link"
            aria-current={active ? "page" : undefined}
            aria-label={collapsed ? item.label : undefined}
            title={collapsed ? item.label : undefined}
          >
            <Icon aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </>
  )
}

export function BackofficeLayout({
  children,
  initialCollapsed = false,
}: {
  children: ReactNode
  initialCollapsed?: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = usePrivy()
  const { profile } = useBackofficeAuth()
  const [collapsed, setCollapsed] = useState(initialCollapsed)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [query, setQuery] = useState("")
  const isAdmin = profile?.role === "ADMIN"

  function setSidebarCollapsed(nextCollapsed: boolean) {
    setCollapsed(nextCollapsed)
    document.cookie = `iv-member-sidebar=${nextCollapsed ? "collapsed" : "expanded"}; Path=/; Max-Age=31536000; SameSite=Lax`
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = query.trim().toLowerCase()
    if (!normalized) return
    const match = NAV_ITEMS.find((item) => item.label.toLowerCase().includes(normalized))
    if (match) {
      setQuery("")
      router.push(match.href)
    }
  }

  async function handleLogout() {
    if (signingOut) return
    setSigningOut(true)
    try {
      await fetch("/api/auth/privy-session", {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
      }).catch(() => null)
      await logout().catch(() => undefined)
    } finally {
      router.replace("/login")
      router.refresh()
    }
  }

  return (
    <div className="iv-member-shell" data-sidebar={collapsed ? "collapsed" : "expanded"}>
      <DotPatternWithGlowEffect />

      <aside className="iv-member-sidebar" aria-label="Member navigation">
        <Link className="iv-member-brand" href="/dashboard" aria-label="Iron Vault member dashboard">
          <span className="iv-member-brand-mark" aria-hidden="true">IV</span>
          <span className="iv-member-brand-copy">
            <strong>Iron Vault</strong>
            <small>Member portal</small>
          </span>
        </Link>

        <nav className="iv-member-nav">
          <MemberLinks pathname={pathname} isAdmin={isAdmin} collapsed={collapsed} />
        </nav>

        <button
          className="iv-member-collapse"
          type="button"
          onClick={() => setSidebarCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen aria-hidden="true" /> : <PanelLeftClose aria-hidden="true" />}
          <span>{collapsed ? "Expand" : "Collapse"}</span>
        </button>
      </aside>

      <div className="iv-member-workspace">
        <header className="iv-member-header">
          <div className="iv-member-header-title">
            <button
              className="iv-member-menu-button"
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open member navigation"
            >
              <Menu aria-hidden="true" />
            </button>
            <h1>{pageTitle(pathname)}</h1>
          </div>

          <div className="iv-member-actions">
            <form className="iv-member-search" role="search" onSubmit={submitSearch}>
              <Search aria-hidden="true" />
              <input
                aria-label="Search member pages"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search pages"
                value={query}
              />
            </form>
            <span className="iv-member-xp">
              <small>XP</small>
              <strong>{profile?.vault_xp?.toLocaleString() ?? "0"}</strong>
            </span>
            <ThemeToggle />
            <div className="iv-member-account">
              <button
                className="iv-member-account-trigger"
                type="button"
                onClick={() => setAccountOpen((open) => !open)}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
              >
                <CircleUserRound aria-hidden="true" />
                <span>{profile?.current_tier ?? "Member"}</span>
                <ChevronDown aria-hidden="true" />
              </button>
              {accountOpen ? (
                <div className="iv-member-account-menu" role="menu">
                  <div>
                    <strong>{profile?.email ?? "Iron Vault member"}</strong>
                    <small>{profile?.role ?? "MEMBER"} · {profile?.current_tier ?? "MEMBER"}</small>
                  </div>
                  <Link href="/account" role="menuitem" onClick={() => setAccountOpen(false)}>
                    <CircleUserRound aria-hidden="true" />
                    Account
                  </Link>
                  <button
                    disabled={signingOut}
                    type="button"
                    role="menuitem"
                    onClick={() => void handleLogout()}
                  >
                    <LogOut aria-hidden="true" />
                    {signingOut ? "Signing out…" : "Sign out"}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="iv-member-main">{children}</main>
      </div>

      {drawerOpen ? (
        <div className="iv-member-drawer" role="dialog" aria-modal="true" aria-label="Member navigation">
          <button
            className="iv-member-drawer-backdrop"
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close member navigation"
          />
          <aside className="iv-member-drawer-panel">
            <div className="iv-member-drawer-head">
              <span className="iv-member-brand-copy">
                <strong>Iron Vault</strong>
                <small>Member portal</small>
              </span>
              <button
                className="iv-member-menu-button"
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close member navigation"
              >
                <X aria-hidden="true" />
              </button>
            </div>
            <nav className="iv-member-drawer-links" aria-label="Mobile member navigation">
              <MemberLinks pathname={pathname} isAdmin={isAdmin} onNavigate={() => setDrawerOpen(false)} />
            </nav>
            <div className="iv-member-drawer-profile">
              <span>{profile?.email ?? "No email on file"}</span>
              <small>{profile?.current_tier ?? "MEMBER"} · {profile?.role ?? "MEMBER"}</small>
            </div>
            <button
              className="iv-btn iv-btn-ghost"
              disabled={signingOut}
              type="button"
              onClick={() => void handleLogout()}
            >
              <LogOut aria-hidden="true" />
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </aside>
        </div>
      ) : null}
    </div>
  )
}
