import { useState } from 'react';
import type { ResolvedTheme } from '../../utils/appearance';
import type { VisualPaletteId } from '../../utils/workshopStore';
import {
  INTERACTION_PATTERNS_CATALOG,
  INTERACTION_STATES_REFERENCE,
  type FullInteractionStateId,
} from '../../utils/behaviourCatalog';
import { playSuccessChime, playTick } from '../../utils/soundEngine';
import { Check, ChevronRight } from 'lucide-react';
import type { TocVariant } from '../../utils/portfolio';
import type {
  WorkbenchMode,
  WorkbenchState,
} from '../../utils/workbenchStore';
import {
  ComponentLibraryView,
  type InspectedComponentSummary,
} from './ComponentLibraryView';
import type { ArchiveOriginRect } from './WorkbenchCanvasView';

export type ComponentsView = 'all' | 'components' | 'interaction-states';

interface ComponentsSectionProps {
  view?: ComponentsView;
  sandboxPalette: VisualPaletteId;
  sandboxTheme: ResolvedTheme;
  appliedTocVariant: TocVariant;
  experimentsCount: number;
  workbenchState: WorkbenchState;
  workbenchMode: WorkbenchMode;
  onWorkbenchModeChange: (next: WorkbenchMode) => void;
  onUpdateWorkbenchState: (
    updater: (prev: WorkbenchState) => WorkbenchState,
  ) => void;
  onArchiveSpecimens: (
    ids: readonly string[],
    origins: readonly ArchiveOriginRect[],
  ) => void;
  onNavigate: (path: string) => void;
  onInspectComponentChange?: (item: InspectedComponentSummary | null) => void;
}

export function ComponentsSection({
  view = 'all',
  sandboxPalette,
  sandboxTheme,
  appliedTocVariant,
  experimentsCount,
  workbenchState,
  workbenchMode,
  onWorkbenchModeChange,
  onUpdateWorkbenchState,
  onArchiveSpecimens,
  onNavigate,
  onInspectComponentChange,
}: ComponentsSectionProps) {
  const showComponents = view === 'all' || view === 'components';
  const showInteractionStates = view === 'all' || view === 'interaction-states';
  const [simulatedLoading, setSimulatedLoading] = useState(false);
  const [selectedStateFilter, setSelectedStateFilter] = useState<
    'all' | FullInteractionStateId
  >('all');
  const [selectedPatternId, setSelectedPatternId] = useState<string>(
    INTERACTION_PATTERNS_CATALOG[0].id,
  );

  const visibleStates =
    selectedStateFilter === 'all'
      ? INTERACTION_STATES_REFERENCE
      : INTERACTION_STATES_REFERENCE.filter((s) => s.id === selectedStateFilter);

  const activePattern =
    INTERACTION_PATTERNS_CATALOG.find((p) => p.id === selectedPatternId) ??
    INTERACTION_PATTERNS_CATALOG[0];

  const triggerLoadingPreview = () => {
    playTick();
    setSimulatedLoading(true);
    window.setTimeout(() => {
      setSimulatedLoading(false);
      playSuccessChime();
    }, 1100);
  };

  return (
    <div className="space-y-12">
      {showComponents && (
        <ComponentLibraryView
          sandboxPalette={sandboxPalette}
          sandboxTheme={sandboxTheme}
          appliedTocVariant={appliedTocVariant}
          experimentsCount={experimentsCount}
          workbenchState={workbenchState}
          workbenchMode={workbenchMode}
          onWorkbenchModeChange={onWorkbenchModeChange}
          onUpdateWorkbenchState={onUpdateWorkbenchState}
          onArchiveSpecimens={onArchiveSpecimens}
          onNavigate={onNavigate}
          onInspectComponentChange={onInspectComponentChange}
        />
      )}

      {showInteractionStates && (
        <>
          {/* Live Interactive State Matrix */}
          <section
            aria-labelledby="ws-states-heading"
            className={view === 'all' ? 'border-t border-[var(--apple-separator)] pt-12' : ''}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 id="ws-states-heading" className="type-title-3 text-[var(--apple-label-primary)]">
                  Live State Matrix
                </h2>
                <p className="mt-1 text-[13.5px] text-[var(--apple-label-secondary)]">
                  Hover, press, or Tab through each control to test interactive feedback.
                </p>
              </div>
              <button
                type="button"
                onClick={triggerLoadingPreview}
                aria-busy={simulatedLoading}
                className="apple-btn-tonal !min-h-[34px] shrink-0 whitespace-nowrap !px-3.5 !py-1 !text-[12.5px]"
              >
                {simulatedLoading && <span className="apple-spinner" aria-hidden="true" />}
                <span>{simulatedLoading ? 'Testing loading…' : 'Test Loading State'}</span>
              </button>
            </div>

            <div
              data-ds-sandbox="true"
              data-ds-palette={sandboxPalette}
              data-ds-theme={sandboxTheme}
              className="mt-5 overflow-x-auto rounded-[18px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)]"
            >
              <table className="w-full min-w-[680px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)]">
                    <th className="px-5 py-3 text-[12px] font-medium text-[var(--apple-label-tertiary)]">
                      Control
                    </th>
                    <th className="px-5 py-3 text-[12px] font-medium text-[var(--apple-label-tertiary)]">
                      Interactive
                    </th>
                    <th className="px-5 py-3 text-[12px] font-medium text-[var(--apple-label-tertiary)]">
                      Disabled
                    </th>
                    <th className="px-5 py-3 text-[12px] font-medium text-[var(--apple-label-tertiary)]">
                      Loading / Error
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--apple-separator-subtle)]">
                  <tr>
                    <td className="px-5 py-4">
                      <p className="text-[13.5px] font-medium text-[var(--apple-label-primary)]">
                        Primary Button
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        aria-busy={simulatedLoading}
                        className="apple-btn-primary !min-h-[36px] !px-4 !py-1.5 !text-[13px]"
                      >
                        {simulatedLoading && <span className="apple-spinner" aria-hidden="true" />}
                        <span>{simulatedLoading ? 'Saving…' : 'Confirm'}</span>
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        disabled
                        className="apple-btn-primary !min-h-[36px] !px-4 !py-1.5 !text-[13px]"
                      >
                        Disabled
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        aria-busy="true"
                        data-loading="true"
                        className="apple-btn-primary !min-h-[36px] !px-4 !py-1.5 !text-[13px]"
                      >
                        <span className="apple-spinner" aria-hidden="true" />
                        <span>Processing…</span>
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td className="px-5 py-4">
                      <p className="text-[13.5px] font-medium text-[var(--apple-label-primary)]">
                        Tonal Button
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        className="apple-btn-tonal !min-h-[36px] !px-4 !py-1.5 !text-[13px]"
                      >
                        <Check size={13} strokeWidth={2} aria-hidden="true" className="text-[var(--apple-blue)]" />
                        <span>Copied</span>
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        disabled
                        className="apple-btn-tonal !min-h-[36px] !px-4 !py-1.5 !text-[13px]"
                      >
                        Unavailable
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        aria-busy="true"
                        data-loading="true"
                        className="apple-btn-tonal !min-h-[36px] !px-4 !py-1.5 !text-[13px]"
                      >
                        <span className="apple-spinner" aria-hidden="true" />
                        <span>Syncing…</span>
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td className="px-5 py-4">
                      <p className="text-[13.5px] font-medium text-[var(--apple-label-primary)]">
                        Link
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <a
                        href="#ws-states-heading"
                        onClick={(e) => e.preventDefault()}
                        className="apple-link inline-flex items-center gap-1 text-[13.5px] font-medium text-[var(--apple-link)] hover:underline"
                      >
                        <span>Explore case study</span>
                        <ChevronRight size={13} strokeWidth={2} aria-hidden="true" />
                      </a>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        aria-disabled="true"
                        className="apple-link inline-flex items-center gap-1 text-[13.5px] font-medium text-[var(--apple-link)]"
                      >
                        <span>Archived link</span>
                        <ChevronRight size={13} strokeWidth={2} aria-hidden="true" />
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[12.5px] text-[var(--apple-label-tertiary)]">—</span>
                    </td>
                  </tr>

                  <tr>
                    <td className="px-5 py-4">
                      <p className="text-[13.5px] font-medium text-[var(--apple-label-primary)]">
                        Text Input
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <input
                        type="text"
                        placeholder="Focus to test ring"
                        aria-label="Matrix interactive input"
                        className="apple-input max-w-[200px] rounded-[10px] px-3 py-1.5 text-[13px]"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <input
                        type="text"
                        disabled
                        value="Disabled field"
                        aria-label="Matrix disabled input"
                        className="apple-input max-w-[175px] rounded-[10px] px-3 py-1.5 text-[13px]"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <input
                        type="text"
                        aria-invalid="true"
                        defaultValue="Invalid input"
                        aria-label="Matrix error input"
                        className="apple-input max-w-[175px] rounded-[10px] px-3 py-1.5 text-[13px]"
                      />
                    </td>
                  </tr>

                  <tr>
                    <td className="px-5 py-4">
                      <p className="text-[13.5px] font-medium text-[var(--apple-label-primary)]">
                        Interactive Card
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        className="apple-card rounded-[12px] px-3.5 py-2.5 text-left text-[13px] font-medium text-[var(--apple-label-primary)]"
                      >
                        Hover &amp; press
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div
                        aria-disabled="true"
                        className="apple-card inline-block rounded-[12px] px-3.5 py-2.5 text-[13px] font-medium text-[var(--apple-label-primary)]"
                      >
                        Disabled card
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div
                        data-loading="true"
                        aria-busy="true"
                        className="apple-card inline-flex items-center gap-2 rounded-[12px] px-3.5 py-2.5 text-[13px] font-medium text-[var(--apple-label-primary)]"
                      >
                        <span className="apple-spinner" aria-hidden="true" />
                        <span>Loading</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Compact 10-State Reference */}
          <section
            aria-labelledby="ws-ten-states-heading"
            className="border-t border-[var(--apple-separator)] pt-10"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2
                  id="ws-ten-states-heading"
                  className="type-title-3 text-[var(--apple-label-primary)]"
                >
                  State Reference
                </h2>
                <p className="mt-1 text-[13.5px] text-[var(--apple-label-secondary)]">
                  Visual cues and accessibility rules across all 10 interactive states.
                </p>
              </div>
            </div>

            <div
              role="group"
              aria-label="Filter interaction states"
              className="mt-5 flex flex-wrap gap-1.5"
            >
              <button
                type="button"
                aria-pressed={selectedStateFilter === 'all'}
                onClick={() => {
                  playTick();
                  setSelectedStateFilter('all');
                }}
                className={`min-h-[32px] whitespace-nowrap rounded-full border px-3 py-1 text-[12px] font-medium transition-colors ${
                  selectedStateFilter === 'all'
                    ? 'border-[var(--apple-label-primary)] bg-[var(--apple-label-primary)] text-[var(--apple-bg)]'
                    : 'border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                }`}
              >
                All ({INTERACTION_STATES_REFERENCE.length})
              </button>
              {INTERACTION_STATES_REFERENCE.map((state) => {
                const active = selectedStateFilter === state.id;
                return (
                  <button
                    key={state.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      playTick();
                      setSelectedStateFilter(state.id);
                    }}
                    className={`min-h-[32px] whitespace-nowrap rounded-full border px-3 py-1 text-[12px] font-medium transition-colors ${
                      active
                        ? 'border-[var(--apple-label-primary)] bg-[var(--apple-label-primary)] text-[var(--apple-bg)]'
                        : 'border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                    }`}
                  >
                    {state.name}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              {visibleStates.map((state) => (
                <article
                  key={state.id}
                  className="rounded-[16px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-5"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-[14.5px] font-semibold text-[var(--apple-label-primary)]">
                      {state.name}
                    </h3>
                    <span className="font-mono text-[11px] text-[var(--apple-label-tertiary)]">
                      {state.tokens[0]}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[13px] leading-[1.55] text-[var(--apple-label-secondary)]">
                    {state.visualTreatment}
                  </p>
                  <p className="mt-2.5 border-t border-[var(--apple-separator-subtle)] pt-2.5 text-[12px] text-[var(--apple-label-tertiary)]">
                    <strong className="font-medium text-[var(--apple-label-primary)]">A11y:</strong>{' '}
                    {state.accessibilityRule}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* Scannable Interaction Patterns */}
          <section
            aria-labelledby="ws-interaction-patterns-heading"
            className="border-t border-[var(--apple-separator)] pt-10"
          >
            <div>
              <h2
                id="ws-interaction-patterns-heading"
                className="type-title-3 text-[var(--apple-label-primary)]"
              >
                Interaction Patterns
              </h2>
              <p className="mt-1 text-[13.5px] text-[var(--apple-label-secondary)]">
                Keyboard, pointer, and touch rules for recurring portfolio interactions.
              </p>
            </div>

            <div
              role="tablist"
              aria-label="Interaction behaviour patterns"
              className="mt-5 flex flex-wrap gap-1.5"
            >
              {INTERACTION_PATTERNS_CATALOG.map((pattern) => {
                const active = pattern.id === activePattern.id;
                return (
                  <button
                    key={pattern.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      playTick();
                      setSelectedPatternId(pattern.id);
                    }}
                    className={`min-h-[34px] whitespace-nowrap rounded-full border px-3.5 py-1 text-[12.5px] font-medium transition-colors ${
                      active
                        ? 'border-[var(--apple-label-primary)] bg-[var(--apple-label-primary)] text-[var(--apple-bg)]'
                        : 'border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                    }`}
                  >
                    {pattern.name}
                  </button>
                );
              })}
            </div>

            <div
              role="tabpanel"
              aria-label={activePattern.name}
              className="mt-5 rounded-[18px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-6"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--apple-separator-subtle)] pb-4">
                <h3 className="text-[16px] font-semibold text-[var(--apple-label-primary)]">
                  {activePattern.name}
                </h3>
                <span className="font-mono text-[11.5px] text-[var(--apple-label-tertiary)]">
                  {activePattern.sourceFiles[0]}
                </span>
              </div>

              <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 text-[13px] md:grid-cols-2">
                <div>
                  <dt className="text-[11.5px] font-medium text-[var(--apple-label-tertiary)]">
                    Trigger &amp; Outcome
                  </dt>
                  <dd className="mt-1 text-[var(--apple-label-primary)]">
                    {activePattern.trigger} → {activePattern.resultingState}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11.5px] font-medium text-[var(--apple-label-tertiary)]">
                    Feedback
                  </dt>
                  <dd className="mt-1 text-[var(--apple-label-secondary)]">
                    {activePattern.feedback}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11.5px] font-medium text-[var(--apple-label-tertiary)]">
                    Keyboard &amp; Touch
                  </dt>
                  <dd className="mt-1 text-[var(--apple-label-secondary)]">
                    {activePattern.keyboard} {activePattern.touch}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11.5px] font-medium text-[var(--apple-label-tertiary)]">
                    Accessibility
                  </dt>
                  <dd className="mt-1 text-[var(--apple-label-secondary)]">
                    {activePattern.accessibility}
                  </dd>
                </div>
              </dl>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
