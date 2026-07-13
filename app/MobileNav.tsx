"use client";

import { useRef } from "react";

const items = [
  ["Method", "#method"],
  ["Curriculum", "#curriculum"],
  ["Experience", "#academy-experience"],
  ["Rewards", "#rewards"],
  ["Standards", "#standards"],
];

export function MobileNav() {
  const menuRef = useRef<HTMLDetailsElement>(null);

  const closeMenu = () => {
    menuRef.current?.removeAttribute("open");
  };

  return (
    <details className="mobile-nav" ref={menuRef}>
      <summary aria-label="Open navigation"><span /><span /></summary>
      <nav aria-label="Mobile navigation">
        {items.map(([label, href]) => <a href={href} onClick={closeMenu} key={href}>{label}</a>)}
        <a href="#academy-experience" onClick={closeMenu}>Enter the Academy</a>
      </nav>
    </details>
  );
}
