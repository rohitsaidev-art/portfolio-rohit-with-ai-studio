import { useMemo, useState } from 'react';
import { playTick } from '../../utils/soundEngine';
import {
  DOCUMENTATION_HUB_INDEX,
  searchDocumentationHub,
  type DocMaturity,
} from '../../utils/studioLibraryCatalog';
import { STUDIO_NAV_GROUPS, type StudioGroupId } from '../../utils/studioNavigation';
import { ChevronRight, Search } from 'lucide-react';

interface DocumentationHubSectionProps {
  onNavigate: (path: string) => void;
}

export function DocumentationHubSection({
  onNavigate,
}: DocumentationHubSectionProps) {
  const [query, setQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState<'all' | StudioGroupId>('all');
  const [maturityFilter, setMaturityFilter] = useState<'all' | DocMaturity>('all');

  const results = useMemo(
    () =>
      searchDocumentationHub(DOCUMENTATION_HUB_INDEX, {
        query,
        groupId: groupFilter,
        maturity: maturityFilter,
      }),
    [query, groupFilter, maturityFilter],
  );

  const handleNav = (
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
    <div className="space-y-6">
      {/* Compact Search & Filter Bar */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <label htmlFor="doc-hub-search" className="sr-only">
            Search Studio sections
          </label>
          <Search
            size={14}
            strokeWidth={1.75}
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--apple-label-tertiary)]"
          />
          <input
            id="doc-hub-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sections, components, motion, tokens…"
            className="apple-input min-h-[38px] rounded-[12px] py-1.5 pl-9 pr-3.5 text-[13.5px]"
          />
        </div>

        <select
          id="doc-hub-group"
          aria-label="Filter by Studio group"
          value={groupFilter}
          onChange={(e) => {
            playTick();
            setGroupFilter(e.target.value as 'all' | StudioGroupId);
          }}
          className="apple-input !w-auto min-h-[38px] rounded-[12px] px-3 py-1.5 text-[13px]"
        >
          <option value="all">All Groups</option>
          {STUDIO_NAV_GROUPS.map((g) => (
            <option key={g.id} value={g.id}>
              {g.label}
            </option>
          ))}
        </select>

        <select
          id="doc-hub-maturity"
          aria-label="Filter by status"
          value={maturityFilter}
          onChange={(e) => {
            playTick();
            setMaturityFilter(e.target.value as 'all' | DocMaturity);
          }}
          className="apple-input !w-auto min-h-[38px] rounded-[12px] px-3 py-1.5 text-[13px]"
        >
          <option value="all">All Statuses</option>
          <option value="production">Production</option>
          <option value="experimental">Experimental</option>
          <option value="proposed">Proposed</option>
        </select>
      </div>

      {/* Clean Hairline Index List */}
      {results.length === 0 ? (
        <div className="rounded-[18px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] px-6 py-10 text-center">
          <p className="text-[14.5px] font-medium text-[var(--apple-label-primary)]">
            No sections match “{query}”.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setGroupFilter('all');
              setMaturityFilter('all');
            }}
            className="mt-2.5 text-[13px] font-medium text-[var(--apple-link)] hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="divide-y divide-[var(--apple-separator-subtle)] border-y border-[var(--apple-separator)]">
          {results.map((entry) => (
            <div
              key={entry.id}
              className="group flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 text-[12px] text-[var(--apple-label-tertiary)]">
                  <span>{entry.groupLabel}</span>
                  {entry.maturity !== 'production' && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-medium text-[var(--apple-link)]">
                        {entry.maturity === 'experimental' ? 'Experimental' : 'Proposed'}
                      </span>
                    </>
                  )}
                </div>

                <h3 className="mt-0.5 text-[15.5px] font-semibold text-[var(--apple-label-primary)]">
                  <a
                    href={entry.path}
                    onClick={(e) => handleNav(e, entry.path)}
                    className="transition-colors hover:text-[var(--apple-link)]"
                  >
                    {entry.title}
                  </a>
                </h3>

                <p className="mt-1 max-w-[64ch] text-[13px] text-[var(--apple-label-secondary)]">
                  {entry.summary}
                </p>

                {entry.relatedLinks.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]">
                    {entry.relatedLinks.map((rel) => (
                      <a
                        key={rel.path}
                        href={rel.path}
                        onClick={(e) => handleNav(e, rel.path)}
                        className="text-[var(--apple-link)] hover:underline"
                      >
                        {rel.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <a
                href={entry.path}
                onClick={(e) => handleNav(e, entry.path)}
                aria-label={`Open ${entry.title}`}
                className="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-[var(--apple-label-secondary)] transition-colors hover:text-[var(--apple-label-primary)]"
              >
                <span>Open</span>
                <ChevronRight size={13} strokeWidth={2} aria-hidden="true" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
