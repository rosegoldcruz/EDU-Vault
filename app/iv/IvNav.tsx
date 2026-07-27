"use client";

import { useEffect, useState } from "react";

const links = [
  { label: "Academy", href: "#academy" },
  { label: "Platform", href: "#system" },
  { label: "IV SOL", href: "#token" },
  { label: "Progress", href: "#proof" },
  { label: "Enroll", href: "#enroll" },
];

export function IvNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="iv-nav" data-scrolled={scrolled || open} data-open={open}>
      <div className="iv-nav-inner iv-shell">
        <a className="iv-wordmark" href="#top" aria-label="Iron Vault home">
          Iron Vault <em>Vaulted Academy</em>
        </a>

        <nav className="iv-nav-links" aria-label="Primary navigation">
          {links.map(({ label, href }) => (
            <a href={href} key={href} onClick={() => setOpen(false)}>{label}</a>
          ))}
        </nav>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a className="iv-nav-cta" href="/login">Sign in</a>
          <button
            className="iv-nav-toggle"
            type="button"
            aria-expanded={open}
            aria-label={open ? "Close navigation" : "Open navigation"}
            onClick={() => setOpen((value) => !value)}
          >
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
