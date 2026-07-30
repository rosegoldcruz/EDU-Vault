interface Descriptor {
  name: string;
  description: string;
}

interface DescriptorRowProps {
  items: readonly Descriptor[];
}

/**
 * Centered descriptor row. Collapses to stacked lines on mobile and hides
 * the separator.
 */
export function DescriptorRow({ items }: DescriptorRowProps) {
  return (
    <div className="iv-hero-layers">
      {items.map((item, index) => (
        <span key={item.name}>
          {index > 0 && <span className="iv-hero-layers-separator" aria-hidden="true">·</span>}
          <b>{item.name}</b> — {item.description}
        </span>
      ))}
    </div>
  );
}
