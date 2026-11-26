import type { StudioNavDestination } from '../../utils/studioNavigation';
import { playTick } from '../../utils/soundEngine';
import { SFChevronRight } from '../SFSymbols';

interface StudioPlannedSectionProps {
  destination: StudioNavDestination;
  onNavigate: (path: string) => void;
}

export function StudioPlannedSection({
  destination,
  onNavigate,
}: StudioPlannedSectionProps) {
  const handleLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    path: string,
  ) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    playTick();
    onNavigate(path);
  };

  return (
    <div className="max-w-[740px] space-y-10">
      <section aria-labelledby="planned-status-heading" className="space-y-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-label-tertiary)]">
          Planned · Cycle 2 Stage 2+
        </p>
        <h2
          id="planned-status-heading"
          className="type-title-3 text-[var(--apple-label-primary)]"
        >
          Scheduled for an upcoming Portfolio Studio stage
        </h2>
        <p className="type-callout text-[var(--apple-label-secondary)]">
          This destination is established in Stage 1 to lock in the Portfolio Studio information architecture without fabricating incomplete specimens or duplicating existing modules.
        </p>
      </section>

      {destination.plannedScope && destination.plannedScope.length > 0 && (
        <section
          aria-labelledby="planned-scope-heading"
          className="border-t border-[var(--apple-separator)] pt-8"
        >
          <h3
            id="planned-scope-heading"
            className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[var(--apple-label-tertiary)]"
          >
            Planned Scope
          </h3>
          <ul className="mt-4 divide-y divide-[var(--apple-separator-subtle)]">
            {destination.plannedScope.map((item, idx) => (
              <li
                key={item}
                className="flex items-baseline gap-4 py-3 text-[14.5px] leading-[1.52] text-[var(--apple-label-primary)]"
              >
                <span className="tabular-nums font-mono text-[12px] text-[var(--apple-label-tertiary)]">
                  0{idx + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {destination.relatedPaths && destination.relatedPaths.length > 0 && (
        <section
          aria-labelledby="planned-related-heading"
          className="border-t border-[var(--apple-separator)] pt-8"
        >
          <h3
            id="planned-related-heading"
            className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[var(--apple-label-tertiary)]"
          >
            Available Now in the Studio
          </h3>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
            {destination.relatedPaths.map((rel) => (
              <a
                key={rel.path}
                href={rel.path}
                onClick={(e) => handleLinkClick(e, rel.path)}
                className="apple-link inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--apple-link)] hover:underline"
              >
                <span>{rel.label}</span>
                <SFChevronRight size={13} />
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
