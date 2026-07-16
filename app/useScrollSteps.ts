"use client";

import { useEffect, useRef, type RefObject } from "react";

type ScrollStepsOptions = {
  rootRef: RefObject<HTMLElement | null>;
  stepCount: number;
  onStepChange: (index: number) => void;
  pinSelector?: string;
  start?: string;
  stepViewportRatio?: number;
  snap?: boolean;
  pinOnMobile?: boolean;
  pinMinWidth?: number;
  refreshPriority?: number;
};

function afterFirstPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

export function useScrollSteps({
  rootRef,
  stepCount,
  onStepChange,
  pinSelector,
  start = "top top",
  stepViewportRatio = 0.82,
  snap = false,
  pinOnMobile = true,
  pinMinWidth = 801,
  refreshPriority = 0,
}: ScrollStepsOptions) {
  const onStepChangeRef = useRef(onStepChange);

  useEffect(() => {
    onStepChangeRef.current = onStepChange;
  }, [onStepChange]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || stepCount < 2) return;
    const rootElement = root;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    async function mount() {
      await afterFirstPaint();
      if (cancelled) return;

      const { gsap, ScrollTrigger } = await import("./motion/gsap");
      if (cancelled) return;

      const pin = pinSelector ? rootElement.querySelector<HTMLElement>(pinSelector) : rootElement;
      if (!pin) return;

      const context = gsap.context(() => {
        const media = gsap.matchMedia();

        const createTrigger = (pinEnabled: boolean) => {
          let currentIndex = -1;
          const trigger = ScrollTrigger.create({
            trigger: rootElement,
            start: pinEnabled ? start : "top 72%",
            end: pinEnabled
              ? () => `+=${Math.round(window.innerHeight * stepViewportRatio * (stepCount - 1))}`
              : "bottom 28%",
            pin: pinEnabled ? pin : false,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            refreshPriority,
            scrub: 0.28,
            ...(snap && pinEnabled
              ? {
                  snap: {
                    snapTo: 1 / (stepCount - 1),
                    duration: { min: 0.12, max: 0.32 },
                    delay: 0.04,
                    ease: "power1.inOut",
                  },
                }
              : {}),
            onUpdate: (self) => {
              const nextIndex = Math.min(stepCount - 1, Math.round(self.progress * (stepCount - 1)));
              rootElement.style.setProperty("--scroll-story-progress", self.progress.toFixed(4));
              if (nextIndex !== currentIndex) {
                currentIndex = nextIndex;
                rootElement.dataset.scrollStep = String(nextIndex);
                onStepChangeRef.current(nextIndex);
              }
            },
          });

          return () => trigger.kill();
        };

        if (pinOnMobile) {
          media.add("(prefers-reduced-motion: no-preference)", () => createTrigger(true));
        } else {
          media.add(`(prefers-reduced-motion: no-preference) and (min-width: ${pinMinWidth}px)`, () => createTrigger(true));
          media.add(`(prefers-reduced-motion: no-preference) and (max-width: ${pinMinWidth - 1}px)`, () => createTrigger(false));
        }

        media.add("(prefers-reduced-motion: reduce)", () => {
          rootElement.dataset.scrollStep = "0";
          onStepChangeRef.current(0);
        });

        return () => media.revert();
      }, rootElement);

      const refresh = () => {
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      };
      document.addEventListener("landing-sections-ready", refresh);
      refresh();
      cleanup = () => {
        document.removeEventListener("landing-sections-ready", refresh);
        context.revert();
      };
    }

    void mount();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [pinMinWidth, pinOnMobile, pinSelector, refreshPriority, rootRef, snap, start, stepCount, stepViewportRatio]);
}
