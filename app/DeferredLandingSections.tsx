"use client";

import { useEffect } from "react";
import { AmbientBackground } from "./AmbientBackground";
import { LandingMotionController } from "./LandingMotionController";
import { BenefitsChecklist, FAQAccordion, LightSurfaceCardGrid, StatementTabs } from "./LandingSections";

function LandingSectionsReady() {
  useEffect(() => {
    requestAnimationFrame(() => {
      document.dispatchEvent(new Event("landing-sections-ready"));
    });
  }, []);

  return null;
}

export function DeferredTopLandingSections() {
  return (
    <>
      <AmbientBackground />
      <LandingMotionController />
      <StatementTabs />
      <LightSurfaceCardGrid />
      <LandingSectionsReady />
    </>
  );
}

export function DeferredBottomLandingSections() {
  return (
    <>
      <BenefitsChecklist />
      <FAQAccordion />
      <LandingSectionsReady />
    </>
  );
}
