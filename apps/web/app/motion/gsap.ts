"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type GsapRuntime = typeof globalThis & {
  __ironVaultScrollTriggerRegistered__?: boolean;
};

const runtime = globalThis as GsapRuntime;

if (!runtime.__ironVaultScrollTriggerRegistered__) {
  gsap.registerPlugin(ScrollTrigger);
  runtime.__ironVaultScrollTriggerRegistered__ = true;
}

export { gsap, ScrollTrigger };
