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

      const { gsap, ScrollTrigger } = await import("./motion/gsap");
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

          gsap.utils.toArray<HTMLElement>(".surface-card-shell").forEach((element, index) => {
            gsap.fromTo(
              element,
              { y: 16, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: tokens.reveal,
                delay: index * tokens.staggerTight,
                ease: tokens.easeSignature,
                scrollTrigger: {
                  trigger: ".surface-card-grid",
                  start: "top 78%",
                },
              },
            );
          });

          const benefits = document.querySelector<HTMLElement>(".benefits");
          const benefitHeadline = document.querySelector<HTMLElement>(".benefits-headline");
          const benefitList = document.querySelector<HTMLElement>(".benefits-list");
          const benefitItems = gsap.utils.toArray<HTMLElement>(".benefits .benefits-reveal-item");

          if (benefits && benefitHeadline && benefitList && benefitItems.length > 0) {
            media.add("(min-width: 801px)", () => {
              ScrollTrigger.create({
                trigger: benefits,
                start: "top 94px",
                endTrigger: benefitList,
                end: "bottom top+=94px",
                pin: benefitHeadline,
                invalidateOnRefresh: true,
              });
            });

            gsap.fromTo(
              benefitItems,
              { y: 16, opacity: 0.22 },
              {
                y: 0,
                opacity: 1,
                stagger: 0.25,
                ease: "none",
                scrollTrigger: {
                  trigger: benefitList,
                  start: "top 72%",
                  end: "bottom 54%",
                  scrub: true,
                },
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
