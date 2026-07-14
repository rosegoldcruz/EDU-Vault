"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const MAGNETIC_MAX_SHIFT = 6;
const MAGNETIC_RADIUS = 40;
const magneticListeners = new Set<(event: PointerEvent) => void>();
let isListeningForMagnetism = false;

function dispatchMagneticPointer(event: PointerEvent) {
  magneticListeners.forEach((listener) => listener(event));
}

function subscribeToMagneticPointer(listener: (event: PointerEvent) => void) {
  magneticListeners.add(listener);
  if (!isListeningForMagnetism) {
    window.addEventListener("pointermove", dispatchMagneticPointer, { passive: true });
    isListeningForMagnetism = true;
  }

  return () => {
    magneticListeners.delete(listener);
    if (magneticListeners.size === 0 && isListeningForMagnetism) {
      window.removeEventListener("pointermove", dispatchMagneticPointer);
      isListeningForMagnetism = false;
    }
  };
}

function ArrowUpRight() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M4 12 12 4M6 4h6v6" />
    </svg>
  );
}

function ArrowDown() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M8 2v11M3.5 8.5 8 13l4.5-4.5" />
    </svg>
  );
}

type CTAButtonProps = {
  children: ReactNode;
  className?: string;
  href: string;
  icon?: "up-right" | "down";
  size?: "default" | "small";
  variant?: "primary" | "secondary";
};

export function CTAButton({
  children,
  className = "",
  href,
  icon = "up-right",
  size = "default",
  variant = "primary",
}: CTAButtonProps) {
  const magnetRef = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }

    const move = (event: PointerEvent) => {
      const element = magnetRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const nearestX = Math.max(rect.left, Math.min(event.clientX, rect.right));
      const nearestY = Math.max(rect.top, Math.min(event.clientY, rect.bottom));
      const proximity = Math.hypot(event.clientX - nearestX, event.clientY - nearestY);
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      if (proximity > MAGNETIC_RADIUS) {
        setOffset({ x: 0, y: 0 });
        return;
      }

      const pull = 1 - proximity / MAGNETIC_RADIUS;
      const targetX = Math.max(-MAGNETIC_MAX_SHIFT, Math.min(MAGNETIC_MAX_SHIFT, ((event.clientX - centerX) / (rect.width / 2)) * MAGNETIC_MAX_SHIFT * pull));
      const targetY = Math.max(-MAGNETIC_MAX_SHIFT, Math.min(MAGNETIC_MAX_SHIFT, ((event.clientY - centerY) / (rect.height / 2)) * MAGNETIC_MAX_SHIFT * pull));
      setOffset({ x: targetX, y: targetY });
    };

    const unsubscribe = subscribeToMagneticPointer(move);
    return unsubscribe;
  }, []);

  const classes = [
    "button",
    "motion-button",
    `motion-button-${variant}`,
    size === "small" ? "button-small" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <span
      className="motion-button-magnet"
      ref={magnetRef}
      style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}
    >
      <a
        className={classes}
        data-hovered={hovered ? "true" : "false"}
        href={href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          setOffset({ x: 0, y: 0 });
        }}
      >
        <span className="motion-button-label">{children}</span>
        {icon === "down" ? <ArrowDown /> : <ArrowUpRight />}
      </a>
    </span>
  );
}
