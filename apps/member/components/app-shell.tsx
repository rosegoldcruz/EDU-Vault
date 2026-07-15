"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ComponentType, type ReactNode } from "react";
import { Award, BookOpen, BriefcaseBusiness, CircleHelp, Gauge, Gift, Landmark, LayoutDashboard, LogOut, Menu, ShieldCheck, Sparkles, UserRound, Users, WalletCards, X } from "lucide-react";
import { useAppContext } from "./providers";

type NavItem = { href: string; label: string; icon: ComponentType<{ size?: number }> };
const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/academy", label: "Academy", icon: BookOpen },
  { href: "/rewards", label: "Rewards", icon: Gift },
  { href: "/vault", label: "Vault", icon: Landmark },
  { href: "/positions", label: "Positions", icon: BriefcaseBusiness },
  { href: "/referrals", label: "Referrals", icon: Users },
  { href: "/vip", label: "VIP", icon: Sparkles },
  { href: "/status", label: "Status", icon: Gauge },
  { href: "/support", label: "Support", icon: CircleHelp },
  { href: "/account", label: "Account", icon: UserRound },
];

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { session } = useAppContext();
  const items = session.identity.role === "ADMIN" ? [...navItems, { href: "/admin/rewards", label: "Admin Rewards", icon: ShieldCheck }] : navItems;
  return <nav className="nav-list" aria-label="Member navigation">{items.map(({ href, label, icon: Icon }) => {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    return <Link key={href} href={href} className={active ? "active" : ""} aria-current={active ? "page" : undefined} onClick={onNavigate}><Icon size={18} /><span>{label}</span></Link>;
  })}</nav>;
}

export function Sidebar() {
  const { session } = useAppContext();
  return <aside className="sidebar"><Link href="/dashboard" className="brand"><span className="brand-mark">IV</span><span><strong>IRON VAULT</strong><small>Member Back Office</small></span></Link><Navigation /><div className="sidebar-member"><div className="avatar">{session.identity.initials}</div><div><strong>{session.identity.displayName}</strong><span>{session.identity.email}</span></div></div></aside>;
}

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { session } = useAppContext();
  if (!open) return null;
  return <div className="mobile-layer"><button className="mobile-backdrop" aria-label="Close navigation" onClick={onClose} /><aside className="mobile-drawer"><div className="drawer-head"><Link href="/dashboard" className="brand" onClick={onClose}><span className="brand-mark">IV</span><span><strong>IRON VAULT</strong><small>Member Back Office</small></span></Link><button className="icon-button" onClick={onClose} aria-label="Close navigation"><X /></button></div><div className="mobile-identity"><div className="avatar">{session.identity.initials}</div><div><strong>{session.identity.displayName}</strong><span>{session.identity.email}</span></div></div><Navigation onNavigate={onClose} /></aside></div>;
}

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { dataMode, session } = useAppContext();
  return <header className="topbar"><button className="icon-button menu-button" onClick={onMenu} aria-label="Open navigation"><Menu /></button><div className="topbar-title"><span className="live-dot" /> Member workspace</div><div className="topbar-meta"><span className="mode-label">{dataMode === "mock" ? "Local mock data" : "Live API"}</span><span className="xp-chip"><Award size={14} /> 2,380 XP</span><span className="wallet-chip"><WalletCards size={14} /> Ready</span><button className="icon-button" onClick={() => void session.logout()} title="Log out" aria-label="Log out"><LogOut /></button></div></header>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <div className="app-shell"><Sidebar /><MobileNav open={open} onClose={() => setOpen(false)} /><div className="app-column"><Topbar onMenu={() => setOpen(true)} /><main className="main-content">{children}</main></div></div>;
}
