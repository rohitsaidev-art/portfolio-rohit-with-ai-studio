import type { ProjectCredits } from '../data/projects';
import { hasProjectCredits } from '../utils/portfolio';

interface ProjectCreditsSectionProps {
  credits?: ProjectCredits;
}

/**
 * Editorial metadata block for genuine project Client, Collaborators, and
 * Tools & Technologies (P1.9).
 *
 * Strictly hides any missing field—and renders nothing at all when no genuine
 * credits data is present on the project.
 */
export function ProjectCreditsSection({ credits }: ProjectCreditsSectionProps) {
  if (!hasProjectCredits(credits) || !credits) {
    return null;
  }

  const client = credits.client?.trim() || '';
  const collaborators = (credits.collaborators ?? []).filter(
    (person) => person.name.trim().length > 0,
  );
  const tools = (credits.tools ?? []).filter((tool) => tool.trim().length > 0);

  const visibleColumns =
    (client ? 1 : 0) +
    (collaborators.length > 0 ? 1 : 0) +
    (tools.length > 0 ? 1 : 0);

  const gridClass =
    visibleColumns >= 3
      ? 'grid-cols-1 sm:grid-cols-3'
      : visibleColumns === 2
        ? 'grid-cols-1 sm:grid-cols-2'
        : 'grid-cols-1';

  return (
    <section
      aria-label="Project credits and tools"
      className="border-b border-[var(--apple-separator)] py-6"
    >
      <dl className={`grid gap-6 ${gridClass}`}>
        {client && (
          <div>
            <dt className="type-caption text-[var(--apple-label-tertiary)]">
              Client
            </dt>
            <dd className="mt-1.5 text-[15px] font-medium tracking-[-0.014em] text-[var(--apple-label-primary)]">
              {client}
            </dd>
          </div>
        )}

        {collaborators.length > 0 && (
          <div>
            <dt className="type-caption text-[var(--apple-label-tertiary)]">
              Collaborators &amp; Teammates
            </dt>
            <dd className="mt-1.5 space-y-1 text-[14.5px] leading-[1.45] tracking-[-0.012em] text-[var(--apple-label-primary)]">
              {collaborators.map((person) => (
                <div key={`${person.name}-${person.role}`}>
                  <span className="font-medium">{person.name}</span>
                  {person.role.trim() && (
                    <span className="text-[var(--apple-label-secondary)]">
                      {' '}
                      · {person.role}
                    </span>
                  )}
                </div>
              ))}
            </dd>
          </div>
        )}

        {tools.length > 0 && (
          <div>
            <dt className="type-caption text-[var(--apple-label-tertiary)]">
              Tools &amp; Technologies
            </dt>
            <dd className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] font-medium tracking-[-0.014em] text-[var(--apple-label-primary)]">
              {tools.map((tool, index) => (
                <span key={tool} className="inline-flex items-center gap-2">
                  {index > 0 && (
                    <span
                      aria-hidden="true"
                      className="font-normal text-[var(--apple-label-tertiary)]"
                    >
                      ·
                    </span>
                  )}
                  <span>{tool}</span>
                </span>
              ))}
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}
