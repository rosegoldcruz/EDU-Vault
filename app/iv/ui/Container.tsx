import type { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Shared page container: 100% width, max 1200px, centered, with responsive
 * horizontal padding (16px mobile / 24px tablet / 32px desktop).
 */
export function Container({ children, className = "" }: ContainerProps) {
  return <div className={["iv-container", className].filter(Boolean).join(" ")}>{children}</div>;
}
