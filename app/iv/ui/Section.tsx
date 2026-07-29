import type { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  alt?: boolean;
  id?: string;
}

/**
 * Shared section wrapper with consistent vertical rhythm.
 * Use `alt` for the paper-background sections.
 */
export function Section({ children, className = "", alt = false, id }: SectionProps) {
  return (
    <section id={id} className={["iv-section", alt && "iv-section-alt", className].filter(Boolean).join(" ")}>
      {children}
    </section>
  );
}
