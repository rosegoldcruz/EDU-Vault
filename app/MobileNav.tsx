"use client";

import { useRef } from "react";
import { landingNavItems } from "./landingNavigation";

export function MobileNav() {
  const menuRef = useRef<HTMLDetailsElement>(null);

  const closeMenu = () => {
    menuRef.current?.removeAttribute("open");
  };

  return (
    <details className="mobile-nav" ref={menuRef}>
      <summary aria-label="Open navigation"><span /><span /></summary>
      <nav aria-label="Mobile navigation">
        {landingNavItems.map(({ label, href }) => <a href={href} onClick={closeMenu} key={href}>{label}</a>)}
        <a href="#academy-experience" onClick={closeMenu}>Enter Vaulted Academy</a>
      </nav>
    </details>
  );
}
