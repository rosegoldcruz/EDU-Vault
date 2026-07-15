"use client";

import { useEffect } from "react";
import { readMotionTokens } from "./motion/tokens";

function afterFirstPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

export function LandingMotionController() {
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    async function mountMotion() {
      await afterFirstPaint();
      if (cancelled) return;

      const { gsap } = await import("./motion/gsap");
      if (cancelled) return;

      const tokens = readMotionTokens();
      let context: gsap.Context | undefined;
      const createTriggers = () => {
        context?.revert();
        context = gsap.context(() => {
        const media = gsap.matchMedia();

        media.add("(prefers-reduced-motion: no-preference)", () => {
          const statement = document.querySelector<HTMLElement>(".statement");
          const statementLines = gsap.utils.toArray<HTMLElement>(".statement .gsap-reveal-line");
          const accentLine = document.querySelector<HTMLElement>(".statement-accent-line");

          if (statement && statementLines.length > 0) {
            const timeline = gsap.timeline({
              scrollTrigger: {
                trigger: statement,
                start: "top 72%",
              },
            });

            timeline.fromTo(
              statementLines,
              { y: 24, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: tokens.reveal,
                ease: tokens.easeSignature,
                stagger: tokens.staggerLoose,
              },
            );

            if (accentLine) {
              timeline.fromTo(
                accentLine,
                { scaleX: 0, opacity: 0 },
                {
                  scaleX: 1,
                  opacity: 1,
                  duration: tokens.reveal,
                  ease: tokens.easeSignature,
                },
                `>+${tokens.staggerLoose}`,
              );
            }
          }

          gsap.utils.toArray<HTMLElement>(".tab-strip-shell").forEach((element) => {
            gsap.fromTo(
              element,
              { y: 16, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: tokens.reveal,
                ease: tokens.easeSignature,
                scrollTrigger: {
                  trigger: element,
                  start: "top 82%",
                },
              },
            );
          });

          const benefitItems = gsap.utils.toArray<HTMLElement>(".benefits .benefits-reveal-item");

          if (benefitItems.length > 0) {
            gsap.fromTo(
              benefitItems,
              { y: 12, opacity: 0.5 },
              {
                y: 0,
                opacity: 1,
                duration: tokens.reveal,
                stagger: tokens.staggerTight,
                ease: tokens.easeSignature,
              },
            );
          }
        });

        media.add("(prefers-reduced-motion: reduce)", () => {
          gsap.set(".gsap-reveal-line, .statement-accent-line, .tab-strip-shell, .surface-card-shell, .benefits-reveal-item", {
            opacity: 1,
            y: 0,
            clearProps: "transform",
          });
        });

        return () => media.revert();
      });
      };

      createTriggers();
      document.addEventListener("landing-sections-ready", createTriggers);

      cleanup = () => {
        document.removeEventListener("landing-sections-ready", createTriggers);
        context?.revert();
      };
    }

    void mountMotion();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return null;
}
