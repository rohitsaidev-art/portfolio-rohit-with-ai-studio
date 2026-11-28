import { useMemo, useState } from 'react';
import {
  EDITORIAL_MEASURES,
  FONT_FAMILIES,
  TYPOGRAPHY_STYLES,
  computeTypeSizeAtViewport,
  type TypographyStyleSpec,
} from '../../utils/foundationsCatalog';
import { playTick } from '../../utils/soundEngine';
import { CopyTokenButton } from './FoundationDocPrimitives';

const VIEWPORT_PRESETS = [
  { id: 'mobile', label: 'Mobile', widthPx: 375 },
  { id: 'tablet', label: 'Tablet', widthPx: 768 },
  { id: 'desktop', label: 'Desktop', widthPx: 1440 },
] as const;

const FONT_WEIGHTS = [
  { weight: 400, name: 'Regular' },
  { weight: 500, name: 'Medium' },
  { weight: 600, name: 'Semibold' },
  { weight: 700, name: 'Bold' },
] as const;

export function TypographyFoundation() {
  const [viewportId, setViewportId] =
    useState<(typeof VIEWPORT_PRESETS)[number]['id']>('desktop');
  const [readerLargePreview, setReaderLargePreview] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<
    'all' | TypographyStyleSpec['category']
  >('all');
  const [customSpecimenText, setCustomSpecimenText] = useState('');
  const [activeMeasureToken, setActiveMeasureToken] =
    useState<string>('--measure-prose');

  const activeViewport =
    VIEWPORT_PRESETS.find((v) => v.id === viewportId) ?? VIEWPORT_PRESETS[2];

  const visibleStyles = useMemo(
    () =>
      categoryFilter === 'all'
        ? TYPOGRAPHY_STYLES
        : TYPOGRAPHY_STYLES.filter((s) => s.category === categoryFilter),
    [categoryFilter],
  );

  const activeMeasure =
    EDITORIAL_MEASURES.find((m) => m.token === activeMeasureToken) ??
    EDITORIAL_MEASURES[3];

  return (
    <div className="space-y-14">
      {/* 1. Font Families Visual Cards */}
      <section aria-labelledby="type-families-heading" className="space-y-5">
        <div>
          <h2
            id="type-families-heading"
            className="font-display text-[20px] font-semibold tracking-[-0.022em] text-[var(--apple-label-primary)]"
          >
            Font Stacks
          </h2>
          <p className="mt-1 text-[14px] text-[var(--apple-label-secondary)]">
            SF Pro Display for headings ≥ 20pt, SF Pro Text for reading copy and UI controls, and tabular monospace for code and metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {FONT_FAMILIES.map((family) => (
            <div
              key={family.id}
              className="flex flex-col justify-between rounded-[18px] border border-[var(--apple-separator-subtle)] bg-[var(--apple-bg-secondary)] p-5"
            >
              <div>
                <p
                  className="text-[36px] font-semibold leading-none tracking-[-0.03em] text-[var(--apple-label-primary)]"
                  style={{ fontFamily: family.stack }}
                >
                  Aa Bb
                </p>
                <p className="mt-4 text-[14.5px] font-semibold text-[var(--apple-label-primary)]">
                  {family.name}
                </p>
                <p className="mt-1 text-[13px] leading-[1.48] text-[var(--apple-label-secondary)]">
                  {family.role}
                </p>
              </div>
              <div className="mt-4 pt-3">
                <CopyTokenButton
                  value={family.isConvention ? 'font-mono' : `var(${family.token})`}
                  label={family.isConvention ? 'font-mono' : family.token}
                  compact
                />
              </div>
            </div>
          ))}
        </div>

        {/* Clean Weight Strip */}
        <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-4">
          {FONT_WEIGHTS.map((w) => (
            <div
              key={w.weight}
              className="flex items-baseline justify-between border-t border-[var(--apple-separator-subtle)] pt-3"
            >
              <span
                className="font-display text-[24px] text-[var(--apple-label-primary)]"
                style={{ fontWeight: w.weight }}
              >
                Ag
              </span>
              <span className="font-mono text-[12px] tabular-nums text-[var(--apple-label-tertiary)]">
                {w.weight} · {w.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Live Type Scale */}
      <section
        aria-labelledby="type-scale-heading"
        className="space-y-6 border-t border-[var(--apple-separator-subtle)] pt-12"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2
              id="type-scale-heading"
              className="font-display text-[20px] font-semibold tracking-[-0.022em] text-[var(--apple-label-primary)]"
            >
              Type Scale
            </h2>
            <p className="mt-1 text-[14px] text-[var(--apple-label-secondary)]">
              Preview responsive fluid scaling across viewports or test custom copy directly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              role="group"
              aria-label="Preview viewport width"
              className="apple-segmented"
            >
              {VIEWPORT_PRESETS.map((vp) => {
                const active = viewportId === vp.id;
                return (
                  <button
                    key={vp.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      playTick();
                      setViewportId(vp.id);
                    }}
                    className={`apple-segmented-item !min-h-[30px] whitespace-nowrap px-3 text-[12px] ${
                      active
                        ? 'apple-pill-shadow bg-[var(--apple-control-thumb)] text-[var(--apple-label-primary)]'
                        : 'text-[var(--apple-label-secondary)]'
                    }`}
                  >
                    {vp.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              aria-pressed={readerLargePreview}
              onClick={() => {
                playTick();
                setReaderLargePreview((prev) => !prev);
              }}
              className={
                readerLargePreview
                  ? 'apple-btn-primary !min-h-[32px] whitespace-nowrap !px-3.5 !py-1 !text-[12px]'
                  : 'apple-btn-tonal !min-h-[32px] whitespace-nowrap !px-3.5 !py-1 !text-[12px]'
              }
            >
              Reader Large: {readerLargePreview ? 'On' : 'Off'}
            </button>
          </div>
        </div>

        {/* Category Filter + Custom Copy Input */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div
            role="group"
            aria-label="Filter type roles"
            className="apple-segmented self-start overflow-x-auto sm:self-auto"
          >
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'Display & Headings', label: 'Display' },
                { id: 'Editorial Prose', label: 'Prose' },
                { id: 'Interface & Metadata', label: 'Interface' },
              ] as const
            ).map((opt) => {
              const active = categoryFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    playTick();
                    setCategoryFilter(opt.id);
                  }}
                  className={`apple-segmented-item !min-h-[30px] whitespace-nowrap px-3 text-[12px] ${
                    active
                      ? 'apple-pill-shadow bg-[var(--apple-control-thumb)] text-[var(--apple-label-primary)]'
                      : 'text-[var(--apple-label-secondary)]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <input
            type="text"
            value={customSpecimenText}
            onChange={(e) => setCustomSpecimenText(e.target.value)}
            placeholder="Type custom specimen text…"
            aria-label="Custom typography preview text"
            className="apple-input min-h-[36px] w-full rounded-[10px] px-3 py-1.5 text-[13px] sm:max-w-[280px]"
          />
        </div>

        {/* Clean Visual Specimen Rows */}
        <div className="divide-y divide-[var(--apple-separator-subtle)] border-t border-[var(--apple-separator-subtle)]">
          {visibleStyles.map((item) => {
            const computedPx = computeTypeSizeAtViewport(
              item,
              activeViewport.widthPx,
              readerLargePreview,
            );
            const effectiveLh =
              readerLargePreview && item.id === 'body'
                ? 1.64
                : readerLargePreview && item.id === 'callout'
                  ? 1.56
                  : item.lineHeight;
            const previewCopy = customSpecimenText.trim() || item.sample;

            return (
              <div
                key={item.id}
                className="grid grid-cols-1 gap-4 py-6 lg:grid-cols-12 lg:items-baseline"
              >
                <div className="flex items-center justify-between gap-2 lg:col-span-3 lg:flex-col lg:items-start">
                  <div>
                    <p className="text-[14px] font-semibold text-[var(--apple-label-primary)]">
                      {item.role}
                    </p>
                    <p className="mt-0.5 font-mono text-[11.5px] tabular-nums text-[var(--apple-label-tertiary)]">
                      {computedPx}px · {item.weight} · {effectiveLh}
                    </p>
                  </div>
                  <div className="lg:mt-2">
                    <CopyTokenButton
                      value={item.className.replace(/^\./, '')}
                      label={item.className}
                      compact
                    />
                  </div>
                </div>

                <div className="min-w-0 lg:col-span-9">
                  <p
                    className={
                      item.category === 'Display & Headings'
                        ? 'text-[var(--apple-label-primary)]'
                        : 'text-[var(--apple-label-secondary)]'
                    }
                    style={{
                      fontFamily: `var(${item.familyToken})`,
                      fontSize: `${computedPx}px`,
                      fontWeight: item.weight,
                      lineHeight: effectiveLh,
                      letterSpacing: item.letterSpacing,
                      maxWidth: item.id === 'body' ? '60ch' : undefined,
                      textWrap:
                        item.category === 'Display & Headings'
                          ? 'balance'
                          : 'pretty',
                    }}
                  >
                    {previewCopy}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Editorial Reading Measures */}
      <section
        aria-labelledby="type-measures-heading"
        className="space-y-5 border-t border-[var(--apple-separator-subtle)] pt-12"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="type-measures-heading"
              className="font-display text-[20px] font-semibold tracking-[-0.022em] text-[var(--apple-label-primary)]"
            >
              Reading Widths
            </h2>
            <p className="mt-1 text-[14px] text-[var(--apple-label-secondary)]">
              Character-based line lengths keep headlines balanced and long-form essays effortless to scan.
            </p>
          </div>

          <div
            role="group"
            aria-label="Inspect reading width"
            className="apple-segmented self-start sm:self-auto"
          >
            {EDITORIAL_MEASURES.map((m) => {
              const active = activeMeasureToken === m.token;
              return (
                <button
                  key={m.token}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    playTick();
                    setActiveMeasureToken(m.token);
                  }}
                  className={`apple-segmented-item !min-h-[30px] whitespace-nowrap px-3 text-[12px] ${
                    active
                      ? 'apple-pill-shadow bg-[var(--apple-control-thumb)] text-[var(--apple-label-primary)]'
                      : 'text-[var(--apple-label-secondary)]'
                  }`}
                >
                  {m.value}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[18px] border border-[var(--apple-separator-subtle)] bg-[var(--apple-bg-secondary)] p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4">
            <span className="text-[13.5px] font-semibold text-[var(--apple-label-primary)]">
              {activeMeasure.role} · <span className="font-mono text-[var(--apple-link)]">{activeMeasure.value}</span>
            </span>
            <CopyTokenButton
              value={activeMeasure.className.replace(/^\./, '')}
              label={activeMeasure.className}
              compact
            />
          </div>

          <div
            className="border-r border-dashed border-[var(--apple-blue)]/55 pr-4 transition-[max-width] duration-300"
            style={{ maxWidth: activeMeasure.value }}
          >
            {activeMeasure.token === '--measure-display' ||
            activeMeasure.token === '--measure-title' ? (
              <p className="type-title-2 text-[var(--apple-label-primary)]">
                Designing calm software systems for operational clarity at scale.
              </p>
            ) : (
              <p className="type-body text-[var(--apple-label-secondary)]">
                Long-form case studies stay legible when eye travel per line stays predictable. Capping prose at 60ch prevents readers from losing their place when sweeping back to the left edge.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
