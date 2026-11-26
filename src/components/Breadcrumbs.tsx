interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: readonly BreadcrumbItem[];
  onNavigate: (path: string) => void;
  className?: string;
}

/**
 * Subtle editorial breadcrumb trail (P1.7).
 * Uses semantic <nav aria-label="Breadcrumb"> and <ol> markup with
 * keyboard-accessible .apple-link states and aria-current="page" on the active item.
 */
export function Breadcrumbs({
  items,
  onNavigate,
  className = '',
}: BreadcrumbsProps) {
  if (items.length === 0) return null;

  const handleClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    onNavigate(href);
  };

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="type-footnote flex flex-wrap items-center gap-x-2 gap-y-1 font-normal">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className="select-none text-[var(--apple-label-tertiary)]"
                >
                  /
                </span>
              )}
              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className="font-medium text-[var(--apple-label-primary)]"
                >
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href}
                  onClick={(e) => handleClick(e, item.href!)}
                  className="apple-link rounded-md px-0.5 py-0.5 text-[var(--apple-label-secondary)] hover:text-[var(--apple-link)] hover:underline"
                >
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
