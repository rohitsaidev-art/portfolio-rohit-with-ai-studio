import { useState } from 'react';
import type { ResolvedTheme } from '../../utils/appearance';
import { playTick } from '../../utils/soundEngine';
import {
  PAGE_TEMPLATES_CATALOG,
  type PageTemplateBlueprint,
} from '../../utils/studioLibraryCatalog';
import type { VisualPaletteId } from '../../utils/workshopStore';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { CopyTokenButton } from './FoundationDocPrimitives';

interface PageTemplatesSectionProps {
  sandboxPalette: VisualPaletteId;
  sandboxTheme: ResolvedTheme;
}

export function PageTemplatesSection({
  sandboxPalette,
  sandboxTheme,
}: PageTemplatesSectionProps) {
  const [selectedId, setSelectedId] = useState<PageTemplateBlueprint['id']>(
    PAGE_TEMPLATES_CATALOG[0].id,
  );
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [focusedBandOrder, setFocusedBandOrder] = useState<string>('01');

  const activeTemplate =
    PAGE_TEMPLATES_CATALOG.find((t) => t.id === selectedId) ??
    PAGE_TEMPLATES_CATALOG[0];

  const activeBand =
    activeTemplate.sectionHierarchy.find((b) => b.order === focusedBandOrder) ??
    activeTemplate.sectionHierarchy[0];

  const previewWidth =
    viewport === 'mobile' ? '375px' : viewport === 'tablet' ? '680px' : '100%';

  return (
    <div className="space-y-8">
      {/* Route Tabs + Viewport Switch */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="tablist"
          aria-label="Portfolio page templates"
          className="flex flex-wrap gap-1.5"
        >
          {PAGE_TEMPLATES_CATALOG.map((tpl) => {
            const active = tpl.id === activeTemplate.id;
            return (
              <button
                key={tpl.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  playTick();
                  setSelectedId(tpl.id);
                  setFocusedBandOrder(tpl.sectionHierarchy[0].order);
                }}
                className={`min-h-[34px] whitespace-nowrap rounded-full border px-3.5 py-1 text-[12.5px] font-medium transition-colors ${
                  active
                    ? 'border-[var(--apple-label-primary)] bg-[var(--apple-label-primary)] text-[var(--apple-bg)]'
                    : 'border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                }`}
              >
                {tpl.name}
              </button>
            );
          })}
        </div>

        <div className="apple-segmented shrink-0" role="group" aria-label="Template preview viewport">
          {(
            [
              { id: 'desktop', label: 'Desktop', icon: Monitor },
              { id: 'tablet', label: 'Tablet', icon: Tablet },
              { id: 'mobile', label: 'Mobile', icon: Smartphone },
            ] as const
          ).map((vp) => {
            const active = viewport === vp.id;
            const Icon = vp.icon;
            return (
              <button
                key={vp.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  playTick();
                  setViewport(vp.id);
                }}
                className={`apple-segmented-item !min-h-[30px] whitespace-nowrap px-2.5 text-[12px] ${
                  active
                    ? 'apple-pill-shadow bg-[var(--apple-control-thumb)] text-[var(--apple-label-primary)]'
                    : 'text-[var(--apple-label-secondary)]'
                }`}
              >
                <Icon size={12} strokeWidth={2} aria-hidden="true" />
                <span>{vp.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Split: Interactive Wireframe + Clean Band & Route Inspector */}
      <div className="grid grid-cols-1 gap-7 lg:grid-cols-12">
        {/* Interactive Structural Wireframe */}
        <div className="lg:col-span-7">
          <div
            data-ds-sandbox="true"
            data-ds-palette={sandboxPalette}
            data-ds-theme={sandboxTheme}
            className="overflow-x-auto rounded-[20px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] p-5 sm:p-6"
          >
            <div className="mb-3.5 flex items-center justify-between gap-2 text-[12px] text-[var(--apple-label-tertiary)]">
              <span className="font-mono text-[var(--apple-label-secondary)]">
                {activeTemplate.routePattern}
              </span>
              <span>Select a band to inspect</span>
            </div>

            <div
              style={{ maxWidth: previewWidth }}
              className="mx-auto w-full space-y-2 rounded-[16px] border border-[var(--apple-separator)] bg-[var(--apple-bg)] p-3.5 transition-[max-width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            >
              {activeTemplate.sectionHierarchy.map((band) => {
                const selected = band.order === activeBand.order;
                return (
                  <button
                    key={band.order}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      playTick();
                      setFocusedBandOrder(band.order);
                    }}
                    className={`flex w-full flex-col rounded-[12px] border p-3.5 text-left transition-colors ${
                      selected
                        ? 'border-[var(--apple-blue)] bg-[var(--apple-blue)]/[0.06]'
                        : 'border-[var(--apple-separator-subtle)] bg-[var(--apple-bg-secondary)] hover:border-[var(--apple-separator-strong)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13.5px] font-semibold text-[var(--apple-label-primary)]">
                        <span className="mr-2 font-mono text-[11.5px] tabular-nums text-[var(--apple-link)]">
                          {band.order}
                        </span>
                        {band.name}
                      </span>
                      <span className="shrink-0 font-mono text-[11px] text-[var(--apple-label-tertiary)]">
                        {band.spacing}
                      </span>
                    </div>
                    <p className="mt-1 text-[12.5px] text-[var(--apple-label-secondary)]">
                      {band.layoutRole}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Focused Band & Route Details */}
        <aside className="space-y-6 lg:col-span-5">
          {/* Active Band Card */}
          <div className="rounded-[18px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-5">
            <p className="text-[12px] font-medium text-[var(--apple-link)]">
              Section {activeBand.order}
            </p>
            <h3 className="mt-0.5 text-[18px] font-semibold text-[var(--apple-label-primary)]">
              {activeBand.name}
            </h3>

            <dl className="mt-4 space-y-3.5 border-t border-[var(--apple-separator-subtle)] pt-4 text-[13px]">
              <div>
                <dt className="text-[11.5px] font-medium text-[var(--apple-label-tertiary)]">
                  Components
                </dt>
                <dd className="mt-0.5 text-[var(--apple-label-primary)]">
                  {activeBand.componentComposition}
                </dd>
              </div>
              <div>
                <dt className="text-[11.5px] font-medium text-[var(--apple-label-tertiary)]">
                  Typography
                </dt>
                <dd className="mt-0.5 text-[var(--apple-label-secondary)]">
                  {activeBand.typography}
                </dd>
              </div>
              <div>
                <dt className="text-[11.5px] font-medium text-[var(--apple-label-tertiary)]">
                  Spacing
                </dt>
                <dd className="mt-0.5 font-mono text-[12px] text-[var(--apple-label-primary)]">
                  {activeBand.spacing}
                </dd>
              </div>
            </dl>
          </div>

          {/* Concise Route Overview */}
          <div className="space-y-4 border-t border-[var(--apple-separator)] pt-5 text-[13px]">
            <div>
              <h4 className="font-semibold text-[var(--apple-label-primary)]">
                Layout &amp; Responsive Rules
              </h4>
              <p className="mt-1 leading-[1.6] text-[var(--apple-label-secondary)]">
                {activeTemplate.containerSpec}
              </p>
            </div>

            <div className="space-y-1 text-[12.5px] text-[var(--apple-label-secondary)]">
              <p>
                <strong className="font-medium text-[var(--apple-label-primary)]">Desktop:</strong>{' '}
                {activeTemplate.breakpoints.desktop}
              </p>
              <p>
                <strong className="font-medium text-[var(--apple-label-primary)]">Tablet:</strong>{' '}
                {activeTemplate.breakpoints.tablet}
              </p>
              <p>
                <strong className="font-medium text-[var(--apple-label-primary)]">Mobile:</strong>{' '}
                {activeTemplate.breakpoints.mobile}
              </p>
            </div>

            <div className="pt-1">
              <CopyTokenButton
                value={activeTemplate.sourceFile}
                label={activeTemplate.sourceFile}
                compact
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
