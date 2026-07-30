"use client";

import { motion } from "motion/react";
import { useMotionTokens } from "./motion/tokens";

export function NavActiveLine() {
  const tokens = useMotionTokens();

  return (
    <motion.span
      className="nav-active-line"
      layoutId="landing-nav-active-line"
      aria-hidden="true"
      transition={tokens ? { duration: tokens.micro, ease: tokens.easeHover } : undefined}
    />
  );
}
