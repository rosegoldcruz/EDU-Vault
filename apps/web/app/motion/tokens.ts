"use client";

import { useSyncExternalStore } from "react";

export type MotionTokens = {
  easeSignature: string;
  easeHoverCss: string;
  easeHover: [number, number, number, number];
  micro: number;
  reveal: number;
  section: number;
  staggerTight: number;
  staggerLoose: number;
};

function requiredToken(styles: CSSStyleDeclaration, name: string) {
  const value = styles.getPropertyValue(name).trim();
  if (!value) throw new Error(`Missing required motion token: ${name}`);
  return value;
}

function seconds(value: string) {
  if (value.endsWith("ms")) return Number.parseFloat(value) / 1000;
  if (value.endsWith("s")) return Number.parseFloat(value);
  throw new Error(`Motion duration must use ms or s: ${value}`);
}

function cubicBezier(value: string): [number, number, number, number] {
  const points = value.match(/-?\d*\.?\d+/g)?.map(Number);
  if (!points || points.length !== 4) {
    throw new Error(`Motion easing must be a cubic-bezier: ${value}`);
  }
  return [points[0], points[1], points[2], points[3]];
}

export function readMotionTokens(): MotionTokens {
  const styles = getComputedStyle(document.documentElement);
  const easeHoverCss = requiredToken(styles, "--ease-hover");
  return {
    easeSignature: requiredToken(styles, "--ease-signature"),
    easeHoverCss,
    easeHover: cubicBezier(easeHoverCss),
    micro: seconds(requiredToken(styles, "--dur-micro")),
    reveal: seconds(requiredToken(styles, "--dur-reveal")),
    section: seconds(requiredToken(styles, "--dur-section")),
    staggerTight: seconds(requiredToken(styles, "--stagger-tight")),
    staggerLoose: seconds(requiredToken(styles, "--stagger-loose")),
  };
}

export function useMotionTokens() {
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  return hydrated ? readMotionTokens() : null;
}
