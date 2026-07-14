"use client";

import { useEffect, useState } from "react";
import { CTAButton } from "./CTAButton";
import { LandingBrand } from "./LandingBrand";
import { MobileNav } from "./MobileNav";
import { landingNavItems } from "./landingNavigation";
import { readMotionTokens } from "./motion/tokens";

type HoverState = "idle" | "in" | "out";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function afterFirstPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

export function Nav() {
  const [activeHref, setActiveHref] = useState<string>(landingNavItems[0].href);
  const [hoverStates, setHoverStates] = useState<Record<string, HoverState>>({});

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    async function mountMotion() {
      await afterFirstPaint();
      if (cancelled) return;

      const [{ gsap, ScrollTrigger }] = await Promise.all([import("./motion/gsap")]);
      if (cancelled) return;

      const tokens = readMotionTokens();
      const elevation = document.querySelector<HTMLElement>(".nav-elevation");
      const hero = document.querySelector<HTMLElement>("#top");
      if (!elevation || !hero) return;

      const context = gsap.context(() => {
        const duration = prefersReducedMotion() ? 0 : tokens.section;
        const elevate = (visible: boolean) => {
          gsap.to(elevation, {
            opacity: visible ? 1 : 0,
            duration,
            ease: tokens.easeSignature,
            overwrite: true,
          });
        };

        ScrollTrigger.create({
          trigger: hero,
          start: "bottom top",
          onEnter: () => elevate(true),
          onLeaveBack: () => elevate(false),
        });

        landingNavItems.forEach((item) => {
          const section = document.getElementById(item.triggerId);
          if (!section) return;

          ScrollTrigger.create({
            trigger: section,
            start: "top 45%",
            end: "bottom 45%",
            onEnter: () => setActiveHref(item.href),
            onEnterBack: () => setActiveHref(item.href),
          });
        });
      });

      cleanup = () => context.revert();
    }

    void mountMotion();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return (
    <header className="site-header shell">
      <span className="nav-elevation" aria-hidden="true" />
      <a className="brand" href="#top" aria-label="Iron Vault | Vaulted Academy home">
        <LandingBrand />
      </a>

      <nav className="nav-links" aria-label="Primary navigation">
        {landingNavItems.map((item) => {
          const hoverState = hoverStates[item.href] ?? "idle";
          return (
            <a
              className="nav-link"
              data-hover-state={hoverState}
              href={item.href}
              key={item.href}
              onClick={() => setActiveHref(item.href)}
              onMouseEnter={() => setHoverStates((current) => ({ ...current, [item.href]: "in" }))}
              onMouseLeave={() => setHoverStates((current) => ({ ...current, [item.href]: "out" }))}
            >
              {item.label}
              <span className="nav-hover-line" aria-hidden="true" />
              {activeHref === item.href ? (
                <span className="nav-active-line" aria-hidden="true" />
              ) : null}
            </a>
          );
        })}
      </nav>

      <CTAButton className="header-cta" href="#academy-experience" size="small">
        Enter Vaulted Academy
      </CTAButton>

      <MobileNav />
    </header>
  );
}
