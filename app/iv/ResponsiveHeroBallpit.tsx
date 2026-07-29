"use client";

import { useEffect, useState } from "react";
import Ballpit from "@/components/Ballpit";

const DESKTOP_COUNT = 33;
const MOBILE_COUNT = 28;
const DESKTOP_MIN_SIZE = 0.37;
const DESKTOP_MAX_SIZE = 1.47;
const DESKTOP_BASE_SIZE = 1.07;
const MOBILE_SCALE = 0.56;
const MOBILE_BREAKPOINT = 767;

export function ResponsiveHeroBallpit() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const onChange = () => setIsMobile(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return (
    <Ballpit
      key={isMobile ? "mobile" : "desktop"}
      count={isMobile ? MOBILE_COUNT : DESKTOP_COUNT}
      gravity={0}
      friction={0.998}
      wallBounce={0.7}
      maxVelocity={0.22}
      followCursor
      colors={[0x760cbc, 0x56e628, 0x42106a, 0x2b8f15, 0x9d4edd, 0x7ef955]}
      ambientColor={0xffffff}
      ambientIntensity={0.55}
      lightIntensity={280}
      minSize={isMobile ? DESKTOP_MIN_SIZE * MOBILE_SCALE : DESKTOP_MIN_SIZE}
      maxSize={isMobile ? DESKTOP_MAX_SIZE * MOBILE_SCALE : DESKTOP_MAX_SIZE}
      size0={isMobile ? DESKTOP_BASE_SIZE * MOBILE_SCALE : DESKTOP_BASE_SIZE}
      materialParams={{
        metalness: 0.75,
        roughness: 0.22,
        clearcoat: 0.9,
        clearcoatRoughness: 0.1,
      }}
    />
  );
}
