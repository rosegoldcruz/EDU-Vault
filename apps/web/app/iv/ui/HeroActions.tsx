interface HeroActionsProps {
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
}

/**
 * Centered CTA group. Stacks vertically on narrow screens and stays in a
 * single balanced row on desktop/tablet.
 */
export function HeroActions({ primaryHref, primaryLabel, secondaryHref, secondaryLabel }: HeroActionsProps) {
  return (
    <div className="iv-hero-actions">
      <a className="iv-btn" href={primaryHref}>
        {primaryLabel}
      </a>
      <a className="iv-btn iv-btn-ghost" href={secondaryHref}>
        {secondaryLabel}
      </a>
    </div>
  );
}
