export type StatusVariant = "live" | "active" | "integration" | "planned";

interface StatusItemProps {
  label: string;
  variant: StatusVariant;
}

/**
 * Compact, centered status pill with a semantic color dot.
 * - live: green (deployed / available / verified)
 * - active: amber (active development)
 * - integration: orange (integration in progress)
 * - planned: gray (planned / inactive)
 */
export function StatusItem({ label, variant }: StatusItemProps) {
  return (
    <span className="iv-status-item" data-state={variant} role="listitem">
      <span className="iv-status-dot" aria-hidden="true" data-state={variant} />
      <span>{label}</span>
    </span>
  );
}
