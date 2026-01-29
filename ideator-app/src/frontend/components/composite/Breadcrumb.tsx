interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-[var(--text-tertiary)]">/</span>}
            {isLast || !item.onClick ? (
              <span className={isLast ? 'text-[var(--accent-nav)]' : 'text-[var(--text-secondary)]'}>
                {item.label}
              </span>
            ) : (
              <button
                onClick={item.onClick}
                className="text-[var(--text-secondary)] hover:text-[var(--accent-nav)] transition-colors"
              >
                {item.label}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}
