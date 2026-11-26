import { useState } from 'react';
import type { ResolvedTheme } from '../../utils/appearance';
import type { VisualPaletteId } from '../../utils/workshopStore';
import { playSuccessChime, playTick } from '../../utils/soundEngine';
import { SFCheckmark, SFChevronRight } from '../SFSymbols';
import { ComponentLibraryView } from './ComponentLibraryView';

export type ComponentsView = 'all' | 'components' | 'interaction-states';

interface ComponentsSectionProps {
  view?: ComponentsView;
  sandboxPalette: VisualPaletteId;
  sandboxTheme: ResolvedTheme;
  onNavigate: (path: string) => void;
}

export function ComponentsSection({
  view = 'all',
  sandboxPalette,
  sandboxTheme,
  onNavigate,
}: ComponentsSectionProps) {
  const showComponents = view === 'all' || view === 'components';
  const showInteractionStates = view === 'all' || view === 'interaction-states';
  const [simulatedLoading, setSimulatedLoading] = useState(false);

  const triggerLoadingPreview = () => {
    playTick();
    setSimulatedLoading(true);
    window.setTimeout(() => {
      setSimulatedLoading(false);
      playSuccessChime();
    }, 1100);
  };

  return (
    <div className="space-y-16">
      {/* Stage 3: Complete Portfolio Component Library (8 Categories · 41 Components) */}
      {showComponents && (
        <ComponentLibraryView
          sandboxPalette={sandboxPalette}
          sandboxTheme={sandboxTheme}
          onNavigate={onNavigate}
        />
      )}

      {/* Module 9: Interaction State Matrix (P0.4 live verification) */}
      {showInteractionStates && (
      <section
        aria-labelledby="ws-states-heading"
        className={view === 'all' ? 'border-t border-[var(--apple-separator)] pt-14' : ''}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="type-caption text-[var(--apple-link)]">
              Module 09 · Standardized States
            </p>
            <h2 id="ws-states-heading" className="type-title-2 mt-1.5">
              Interaction State Matrix
            </h2>
            <p className="type-callout measure-prose mt-2">
              Verify Default, Hover, Pressed, Focus-Visible (Tab into any control), Disabled, and Loading feedback across every interactive primitive.
            </p>
          </div>
          <button
            type="button"
            onClick={triggerLoadingPreview}
            aria-busy={simulatedLoading}
            className="apple-btn-tonal !min-h-[38px] shrink-0 !px-4 !py-1.5 !text-[13px]"
          >
            {simulatedLoading && <span className="apple-spinner" aria-hidden="true" />}
            <span>{simulatedLoading ? 'Testing loading state…' : 'Trigger 1.1s Loading Test'}</span>
          </button>
        </div>

        <div className="mt-8 overflow-x-auto rounded-[24px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)]">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)]">
                <th className="type-caption px-5 py-3.5 text-[var(--apple-label-secondary)]">
                  Primitive
                </th>
                <th className="type-caption px-5 py-3.5 text-[var(--apple-label-secondary)]">
                  Interactive (Default / Hover / Press / Focus)
                </th>
                <th className="type-caption px-5 py-3.5 text-[var(--apple-label-secondary)]">
                  Disabled
                </th>
                <th className="type-caption px-5 py-3.5 text-[var(--apple-label-secondary)]">
                  Loading / Busy
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--apple-separator)]">
              <tr>
                <td className="px-5 py-4">
                  <p className="type-headline text-[14.5px]">Primary Button</p>
                  <p className="font-mono text-[11.5px] text-[var(--apple-label-tertiary)]">
                    .apple-btn-primary
                  </p>
                </td>
                <td className="px-5 py-4">
                  <button
                    type="button"
                    aria-busy={simulatedLoading}
                    className="apple-btn-primary !min-h-[38px] !px-4 !py-1.5 !text-[13.5px]"
                  >
                    {simulatedLoading && <span className="apple-spinner" aria-hidden="true" />}
                    <span>{simulatedLoading ? 'Saving…' : 'Confirm action'}</span>
                  </button>
                </td>
                <td className="px-5 py-4">
                  <button
                    type="button"
                    disabled
                    className="apple-btn-primary !min-h-[38px] !px-4 !py-1.5 !text-[13.5px]"
                  >
                    Disabled
                  </button>
                </td>
                <td className="px-5 py-4">
                  <button
                    type="button"
                    aria-busy="true"
                    data-loading="true"
                    className="apple-btn-primary !min-h-[38px] !px-4 !py-1.5 !text-[13.5px]"
                  >
                    <span className="apple-spinner" aria-hidden="true" />
                    <span>Processing…</span>
                  </button>
                </td>
              </tr>

              <tr>
                <td className="px-5 py-4">
                  <p className="type-headline text-[14.5px]">Tonal Button</p>
                  <p className="font-mono text-[11.5px] text-[var(--apple-label-tertiary)]">
                    .apple-btn-tonal
                  </p>
                </td>
                <td className="px-5 py-4">
                  <button
                    type="button"
                    className="apple-btn-tonal !min-h-[38px] !px-4 !py-1.5 !text-[13.5px]"
                  >
                    <SFCheckmark size={14} className="text-[var(--apple-blue)]" />
                    <span>Copied</span>
                  </button>
                </td>
                <td className="px-5 py-4">
                  <button
                    type="button"
                    disabled
                    className="apple-btn-tonal !min-h-[38px] !px-4 !py-1.5 !text-[13.5px]"
                  >
                    Unavailable
                  </button>
                </td>
                <td className="px-5 py-4">
                  <button
                    type="button"
                    aria-busy="true"
                    data-loading="true"
                    className="apple-btn-tonal !min-h-[38px] !px-4 !py-1.5 !text-[13.5px]"
                  >
                    <span className="apple-spinner" aria-hidden="true" />
                    <span>Syncing…</span>
                  </button>
                </td>
              </tr>

              <tr>
                <td className="px-5 py-4">
                  <p className="type-headline text-[14.5px]">Editorial Link</p>
                  <p className="font-mono text-[11.5px] text-[var(--apple-label-tertiary)]">
                    .apple-link
                  </p>
                </td>
                <td className="px-5 py-4">
                  <a
                    href="#ws-states-heading"
                    onClick={(e) => e.preventDefault()}
                    className="apple-link inline-flex items-center gap-1 text-[14.5px] font-medium text-[var(--apple-link)] hover:underline"
                  >
                    <span>Explore case study</span>
                    <SFChevronRight size={14} />
                  </a>
                </td>
                <td className="px-5 py-4">
                  <span
                    aria-disabled="true"
                    className="apple-link inline-flex items-center gap-1 text-[14.5px] font-medium text-[var(--apple-link)]"
                  >
                    <span>Archived link</span>
                    <SFChevronRight size={14} />
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="type-footnote text-[var(--apple-label-tertiary)]">
                    N/A (links transition via route)
                  </span>
                </td>
              </tr>

              <tr>
                <td className="px-5 py-4">
                  <p className="type-headline text-[14.5px]">Text Input</p>
                  <p className="font-mono text-[11.5px] text-[var(--apple-label-tertiary)]">
                    .apple-input
                  </p>
                </td>
                <td className="px-5 py-4">
                  <input
                    type="text"
                    placeholder="Focus to inspect ring"
                    aria-label="Matrix interactive input"
                    className="apple-input max-w-[230px] rounded-[12px] px-3.5 py-2 text-[13.5px]"
                  />
                </td>
                <td className="px-5 py-4">
                  <input
                    type="text"
                    disabled
                    value="Read-only disabled"
                    aria-label="Matrix disabled input"
                    className="apple-input max-w-[190px] rounded-[12px] px-3.5 py-2 text-[13.5px]"
                  />
                </td>
                <td className="px-5 py-4">
                  <input
                    type="text"
                    aria-invalid="true"
                    defaultValue="Error validation ring"
                    aria-label="Matrix error input"
                    className="apple-input max-w-[190px] rounded-[12px] px-3.5 py-2 text-[13.5px]"
                  />
                </td>
              </tr>

              <tr>
                <td className="px-5 py-4">
                  <p className="type-headline text-[14.5px]">Interactive Card</p>
                  <p className="font-mono text-[11.5px] text-[var(--apple-label-tertiary)]">
                    .apple-card
                  </p>
                </td>
                <td className="px-5 py-4">
                  <button
                    type="button"
                    className="apple-card rounded-[16px] px-4 py-3 text-left text-[13.5px] font-medium text-[var(--apple-label-primary)]"
                  >
                    Hover &amp; press card
                  </button>
                </td>
                <td className="px-5 py-4">
                  <div
                    aria-disabled="true"
                    className="apple-card inline-block rounded-[16px] px-4 py-3 text-[13.5px] font-medium text-[var(--apple-label-primary)]"
                  >
                    Disabled card
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div
                    data-loading="true"
                    aria-busy="true"
                    className="apple-card inline-flex items-center gap-2 rounded-[16px] px-4 py-3 text-[13.5px] font-medium text-[var(--apple-label-primary)]"
                  >
                    <span className="apple-spinner" aria-hidden="true" />
                    <span>Loading card</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      )}
    </div>
  );
}
