"use client";

import { useEffect, type ReactNode } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function afterFirstPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    let cancelled = false;
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
    let frameId: number | null = null;
    let lenis: InstanceType<typeof import("lenis").default> | null = null;
    let scrollTriggerUpdate: (() => void) | null = null;

    const stop = () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }

      if (lenis) {
        if (scrollTriggerUpdate) lenis.off("scroll", scrollTriggerUpdate);
        lenis.destroy();
        lenis = null;
      }
    };

    const start = async () => {
      if (lenis || reducedMotion.matches) return;

      await afterFirstPaint();
      if (cancelled || lenis || reducedMotion.matches) return;

      const [{ default: Lenis }, { ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("./motion/gsap"),
      ]);

      if (cancelled || lenis || reducedMotion.matches) return;

      scrollTriggerUpdate = ScrollTrigger.update;
      lenis = new Lenis({
        anchors: true,
        autoRaf: false,
      });
      lenis.on("scroll", scrollTriggerUpdate);

      const raf = (time: number) => {
        lenis?.raf(time);
        frameId = requestAnimationFrame(raf);
      };

      frameId = requestAnimationFrame(raf);
    };

    const syncMotionPreference = () => {
      if (reducedMotion.matches) stop();
      else void start();
    };

    syncMotionPreference();
    reducedMotion.addEventListener("change", syncMotionPreference);

    return () => {
      cancelled = true;
      reducedMotion.removeEventListener("change", syncMotionPreference);
      stop();
    };
  }, []);

  return children;
}
