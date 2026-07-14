"use client";

import { useEffect, useRef } from "react";
import { CTAButton } from "./CTAButton";
import { OrbitLearning } from "./OrbitLearning";
import { readMotionTokens } from "./motion/tokens";

function afterFirstPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const heroElement = hero;
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    async function mountMotion() {
      await afterFirstPaint();
      if (cancelled) return;

      const { gsap } = await import("./motion/gsap");
      if (cancelled) return;

      const tokens = readMotionTokens();
      const context = gsap.context(() => {
      const copyStage = heroElement.querySelector<HTMLElement>(".hero-copy-stage");
      const visualStage = heroElement.querySelector<HTMLElement>(".hero-visual-stage");

      const motionMedia = gsap.matchMedia();

      motionMedia.add("(prefers-reduced-motion: no-preference)", () => {
        if (copyStage && visualStage) {
          gsap.timeline({
            scrollTrigger: {
              trigger: hero,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          })
            .to(copyStage, { y: -48, scale: 0.94, opacity: 0.2, ease: "none" }, 0)
            .to(visualStage, { y: -64, scale: 1.03, ease: "none" }, 0);
        }

      });

      motionMedia.add("(prefers-reduced-motion: no-preference) and (min-width: 801px)", () => {
        const driftNodes = gsap.utils.toArray<HTMLElement>(".orbit-node");
        driftNodes.forEach((node, index) => {
          const amplitude = 6;
          gsap.fromTo(
            node,
            { y: index % 2 === 0 ? -amplitude : amplitude },
            {
              y: index % 2 === 0 ? amplitude : -amplitude,
              duration: 8 + index * 2,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
            },
          );
        });
      });

      motionMedia.add("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine) and (min-width: 801px)", () => {
        if (!visualStage) return;

        const layers = gsap.utils.toArray<HTMLElement>(".orbit-parallax-layer");
        const movers = layers.map((layer) => ({
          layer,
          max: Number(layer.dataset.parallaxMax),
          xTo: gsap.quickTo(layer, "x", { duration: tokens.reveal, ease: tokens.easeHoverCss }),
          yTo: gsap.quickTo(layer, "y", { duration: tokens.reveal, ease: tokens.easeHoverCss }),
        }));

        const move = (event: PointerEvent) => {
          const rect = visualStage.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
          const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
          movers.forEach((mover) => {
            mover.xTo(x * mover.max);
            mover.yTo(y * mover.max);
          });
        };

        const reset = () => movers.forEach((mover) => {
          mover.xTo(0);
          mover.yTo(0);
        });

        visualStage.addEventListener("pointermove", move, { passive: true });
        visualStage.addEventListener("pointerleave", reset);
        return () => {
          visualStage.removeEventListener("pointermove", move);
          visualStage.removeEventListener("pointerleave", reset);
        };
      });

      motionMedia.add("(prefers-reduced-motion: no-preference) and (max-width: 800px)", () => {
        const driftNodes = gsap.utils.toArray<HTMLElement>(".orbit-node");
        driftNodes.forEach((node, index) => {
          const amplitude = 3;
          gsap.fromTo(
            node,
            { y: index % 2 === 0 ? -amplitude : amplitude },
            {
              y: index % 2 === 0 ? amplitude : -amplitude,
              duration: 8 + index * 2,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
            },
          );
        });
      });

      return () => motionMedia.revert();
    }, heroElement);

      cleanup = () => context.revert();
    }

    void mountMotion();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return (
    <section className="hero shell" id="top" ref={heroRef}>
      <div className="hero-copy-stage">
        <div className="hero-heading-stack">
          <h1>Don’t chase the future.<br /><span>Understand it.<i className="hero-accent-sweep" aria-hidden="true" /></span></h1>
          <div className="hero-heading-motion" aria-hidden="true">
            <span className="hero-heading-motion-line"><span>Don’t chase the future.</span></span>
            <span className="hero-heading-motion-line hero-heading-motion-accent"><span>Understand it.</span></span>
          </div>
        </div>
        <p className="hero-copy">
          Master crypto, blockchain, and DeFi through structured learning, practical labs,
          verified assessments, and onchain-ready skills.
        </p>
        <div className="hero-actions">
          <span className="hero-cta-reveal"><CTAButton href="#academy-experience">Enter Vaulted Academy</CTAButton></span>
          <span className="hero-cta-reveal"><CTAButton href="#curriculum" icon="down" variant="secondary">Explore the Curriculum</CTAButton></span>
        </div>
      </div>

      <div className="hero-visual-stage">
        <OrbitLearning />
      </div>

      <div className="proof-rail" aria-label="Vaulted Academy proof points">
        <span>320+ Structured Lessons</span>
        <span>Beginner to Advanced</span>
        <span>Verified Knowledge Checks</span>
        <span>Progress + Eligible Rewards</span>
      </div>
    </section>
  );
}
