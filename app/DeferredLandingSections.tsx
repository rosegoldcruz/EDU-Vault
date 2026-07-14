"use client";

import { lazy, Suspense, useEffect, useState } from "react";
import { AmbientBackground } from "./AmbientBackground";
import { LandingMotionController } from "./LandingMotionController";

const StatementTabs = lazy(() => import("./LandingSections").then((module) => ({ default: module.StatementTabs })));
const LightSurfaceCardGrid = lazy(() => import("./LandingSections").then((module) => ({ default: module.LightSurfaceCardGrid })));
const BenefitsChecklist = lazy(() => import("./LandingSections").then((module) => ({ default: module.BenefitsChecklist })));
const FAQAccordion = lazy(() => import("./LandingSections").then((module) => ({ default: module.FAQAccordion })));

function LandingSectionsReady() {
  useEffect(() => {
    requestAnimationFrame(() => {
      document.dispatchEvent(new Event("landing-sections-ready"));
    });
  }, []);

  return null;
}

function afterIdle(callback: () => void) {
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    callback();
  };
  const timeoutId = globalThis.setTimeout(run, 4600);
  const options = { passive: true, once: true };
  window.addEventListener("wheel", run, options);
  window.addEventListener("touchmove", run, options);
  window.addEventListener("keydown", run, { once: true });

  return () => {
    globalThis.clearTimeout(timeoutId);
    window.removeEventListener("wheel", run);
    window.removeEventListener("touchmove", run);
    window.removeEventListener("keydown", run);
  };
}

function useDeferredReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => afterIdle(() => setReady(true)), []);

  return ready;
}

export function DeferredTopLandingSections() {
  const ready = useDeferredReady();

  if (!ready) return null;

  return (
    <Suspense fallback={null}>
      <AmbientBackground />
      <LandingMotionController />
      <StatementTabs />
      <LightSurfaceCardGrid />
      <LandingSectionsReady />
    </Suspense>
  );
}

export function DeferredBottomLandingSections() {
  const ready = useDeferredReady();

  if (!ready) return null;

  return (
    <Suspense fallback={null}>
      <BenefitsChecklist />
      <FAQAccordion />
      <LandingSectionsReady />
    </Suspense>
  );
}
