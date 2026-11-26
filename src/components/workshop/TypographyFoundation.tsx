import { useMemo, useState } from 'react';
import {
  EDITORIAL_MEASURES,
  FONT_FAMILIES,
  TYPOGRAPHY_STYLES,
  computeTypeSizeAtViewport,
  getGapsByDomain,
  type TypographyStyleSpec,
} from '../../utils/foundationsCatalog';
import { playTick } from '../../utils/soundEngine';
import {
  CopyTokenButton,
  DocumentationStandardsPanel,
  FoundationGapsSection,
  FoundationSectionBlock,
} from './FoundationDocPrimitives';

const VIEWPORT_PRESETS = [
  { id: 'mobile', label: 'Mobile · 375px', widthPx: 375 },
  { id: 'tablet', label: 'Tablet · 768px', widthPx: 768 },
  { id: 'desktop', label: 'Desktop · 1440px', widthPx: 1440 },
] as const;

const FONT_WEIGHTS = [
  { weight: 400, name: 'Regular', usage: 'Editorial body prose (.type-body), leads (.type-lead), callouts, primary buttons.' },
  { weight: 500, name: 'Medium', usage: 'Footnotes (.type-footnote), tonal buttons, segmented controls, navigation links.' },
  { weight: 600, name: 'Semibold', usage: 'All display headings (h1–h4), eyebrows (.type-eyebrow), captions (.type-caption), active nav states.' },
  { weight: 700, name: 'Bold', usage: 'Loaded in Inter fallback stylesheet; reserved for strong inline emphasis or numeric callouts.' },
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
    <div className="space-y-16">
      {/* 1. Font Families & Available Weights */}
      <FoundationSectionBlock
        id="ws-font-families-heading"
        eyebrow="Optical Type Stacks"
        title="Font Families & Available Weights"
        summary="Typography splits across two optical stacks matching Apple Human Interface Guidelines: SF Pro Display for headings ≥ 20pt and SF Pro Text for reading copy and controls < 20pt, backed by optical-sized Inter (opsz 14..32) from index.html."
        isFirst
      >
        <div className="divide-y divide-[var(--apple-separator)] border-y border-[var(--apple-separator)]">
          {FONT_FAMILIES.map((family) => (
            <div
              key={family.id}
              className="grid grid-cols-1 gap-6 py-7 lg:grid-cols-12"
            >
              <div className="lg:col-span-5">
                <div className="flex flex-wrap items-baseline gap-2">
                  <h3 className="type-headline text-[var(--apple-label-primary)]">
                    {family.name}
                  </h3>
                  {family.isConvention && (
                    <span className="text-[11.5px] text-[var(--apple-label-tertiary)]">
                      Retained Tailwind convention
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-[13.5px] leading-[1.52] text-[var(--apple-label-secondary)]">
                  {family.role}
                </p>
                <p className="mt-2 text-[12.5px] leading-[1.5] text-[var(--apple-label-tertiary)]">
                  {family.notes}
                </p>
                <div className="mt-3.5 flex flex-wrap items-center gap-2">
                  {family.isConvention ? (
                    <CopyTokenButton value="font-mono" label="font-mono" compact />
                  ) : (
                    <CopyTokenButton
                      value={`var(${family.token})`}
                      label={family.token}
                      compact
                    />
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-between lg:col-span-7">
                <p
                  className="text-[30px] font-semibold leading-[1.16] tracking-[-0.024em] text-[var(--apple-label-primary)] sm:text-[34px]"
                  style={{ fontFamily: family.stack }}
                >
                  Aa Bb Cc · 0123456789
                </p>
                <p
                  className="mt-2.5 text-[15px] leading-[1.55] text-[var(--apple-label-secondary)]"
                  style={{ fontFamily: family.stack }}
                >
                  Restrained typography carries editorial hierarchy without decorative borders or heavy chrome.
                </p>
                <p className="mt-3 font-mono text-[11.5px] text-[var(--apple-label-tertiary)]">
                  {family.weightsLoaded}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Weight Scale Strip */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FONT_WEIGHTS.map((w) => (
            <div
              key={w.weight}
              className="border-t border-[var(--apple-separator)] pt-4"
            >
              <div className="flex items-baseline justify-between">
                <span
                  className="font-display text-[28px] leading-none text-[var(--apple-label-primary)]"
                  style={{ fontWeight: w.weight }}
                >
                  Ag
                </span>
                <span className="font-mono text-[12px] tabular-nums text-[var(--apple-label-tertiary)]">
                  {w.weight} · {w.name}
                </span>
              </div>
              <p className="mt-2.5 text-[12.5px] leading-[1.5] text-[var(--apple-label-secondary)]">
                {w.usage}
              </p>
            </div>
          ))}
        </div>
      </FoundationSectionBlock>

      {/* 2. Complete Dynamic Type Hierarchy + Interactive Responsive & Reader Size Simulator */}
      <FoundationSectionBlock
        id="ws-type-heading"
        eyebrow="Apple Dynamic Type Scale · Module 01"
        title="Complete Typographic Hierarchy"
        summary="Every production .type-* class rendered from src/index.css. Switch simulated viewport width to inspect fluid clamp() scaling or toggle Reader Comfort Large mode (html[data-reader-size='large']) to see body and lead adjustments live."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div
              role="group"
              aria-label="Simulate viewport width for responsive type scale"
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
                    className={`apple-segmented-item !min-h-[30px] px-3 text-[12px] ${
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
                  ? 'apple-btn-primary !min-h-[34px] !px-3.5 !py-1 !text-[12px]'
                  : 'apple-btn-tonal !min-h-[34px] !px-3.5 !py-1 !text-[12px]'
              }
            >
              Reader Size: {readerLargePreview ? 'Large' : 'Default'}
            </button>
          </div>
        }
      >
        {/* Filter + Live Custom Text Input */}
        <div className="flex flex-col gap-4 border-b border-[var(--apple-separator)] pb-6 md:flex-row md:items-center md:justify-between">
          <div
            role="group"
            aria-label="Filter typographic category"
            className="apple-segmented"
          >
            {(
              [
                { id: 'all', label: `All (${TYPOGRAPHY_STYLES.length})` },
                { id: 'Display & Headings', label: 'Display & Headings' },
                { id: 'Editorial Prose', label: 'Editorial Prose' },
                { id: 'Interface & Metadata', label: 'Interface & Metadata' },
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
                  className={`apple-segmented-item !min-h-[30px] px-3 text-[12px] ${
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

          <div className="w-full md:max-w-[300px]">
            <label htmlFor="type-specimen-override" className="sr-only">
              Type custom specimen preview text
            </label>
            <input
              id="type-specimen-override"
              type="text"
              value={customSpecimenText}
              onChange={(e) => setCustomSpecimenText(e.target.value)}
              placeholder="Type custom text to test scale…"
              className="apple-input min-h-[36px] rounded-[10px] px-3 py-1.5 text-[13px]"
            />
          </div>
        </div>

        {/* Hairline-Divided Type Specimen List */}
        <div className="divide-y divide-[var(--apple-separator)]">
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
              <article
                key={item.id}
                className="grid grid-cols-1 gap-6 py-8 lg:grid-cols-12"
              >
                {/* Token & Metric Specs */}
                <div className="space-y-2 lg:col-span-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="type-headline text-[var(--apple-label-primary)]">
                      {item.role}
                    </h3>
                    <span className="font-mono text-[12px] font-semibold tabular-nums text-[var(--apple-link)]">
                      {computedPx}px
                    </span>
                  </div>

                  <p className="text-[12.5px] leading-[1.5] text-[var(--apple-label-secondary)]">
                    {item.whenToUse}
                  </p>

                  <dl className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1 font-mono text-[11px] tabular-nums text-[var(--apple-label-tertiary)]">
                    <div>
                      <dt className="inline">Family: </dt>
                      <dd className="inline text-[var(--apple-label-secondary)]">
                        {item.opticalFamily}
                      </dd>
                    </div>
                    <div>
                      <dt className="inline">Weight: </dt>
                      <dd className="inline text-[var(--apple-label-secondary)]">
                        {item.weight}
                      </dd>
                    </div>
                    <div>
                      <dt className="inline">LH: </dt>
                      <dd className="inline text-[var(--apple-label-secondary)]">
                        {effectiveLh}
                      </dd>
                    </div>
                    <div>
                      <dt className="inline">Track: </dt>
                      <dd className="inline text-[var(--apple-label-secondary)]">
                        {item.letterSpacing}
                      </dd>
                    </div>
                  </dl>

                  <p className="font-mono text-[11px] text-[var(--apple-label-tertiary)]">
                    Size: {item.sizeCss}
                  </p>

                  {item.readerLargeOverride && (
                    <p className="text-[11.5px] text-[var(--apple-label-tertiary)]">
                      Reader Large: <span className="font-mono">{item.readerLargeOverride}</span>
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-1.5 pt-2">
                    <CopyTokenButton
                      value={item.className.replace(/^\./, '')}
                      label={item.className}
                      ariaLabel={`Copy class name ${item.className}`}
                      compact
                    />
                    <CopyTokenButton
                      value={`font-size: var(${item.sizeToken}); line-height: var(${item.lineHeightToken}); letter-spacing: var(${item.letterSpacingToken});`}
                      label="Copy CSS"
                      ariaLabel={`Copy CSS tokens for ${item.role}`}
                      toastLabel={`${item.role} CSS tokens`}
                      compact
                    />
                  </div>
                </div>

                {/* Live Rendered Specimen */}
                <div className="flex min-w-0 flex-col justify-center lg:col-span-8">
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
                  {item.defaultMeasure && (
                    <p className="mt-3 text-[11.5px] text-[var(--apple-label-tertiary)]">
                      Recommended measure:{' '}
                      <code className="font-mono">{item.defaultMeasure}</code>
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </FoundationSectionBlock>

      {/* 3. Editorial Reading Measures Interactive Ruler */}
      <FoundationSectionBlock
        id="ws-measures-heading"
        eyebrow="Editorial Line-Length Discipline"
        title="Reading Widths & Vertical Paragraph Rhythm"
        summary="Line lengths are governed by character-based measure tokens (20ch to 60ch) rather than arbitrary pixel boxes, paired with .prose-stack (1.25rem) vertical rhythm between consecutive paragraphs."
        actions={
          <div
            role="group"
            aria-label="Inspect editorial reading measure"
            className="apple-segmented"
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
                  className={`apple-segmented-item !min-h-[30px] px-3 text-[12px] ${
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
        }
      >
        <div className="space-y-6">
          {/* Interactive Measure Specimen */}
          <div className="rounded-[20px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--apple-separator)] pb-4">
              <div>
                <p className="text-[12px] font-semibold text-[var(--apple-label-primary)]">
                  {activeMeasure.role} ·{' '}
                  <span className="font-mono text-[var(--apple-link)]">
                    {activeMeasure.value}
                  </span>
                </p>
                <p className="mt-0.5 text-[12.5px] text-[var(--apple-label-secondary)]">
                  {activeMeasure.rationale}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <CopyTokenButton
                  value={activeMeasure.className.replace(/^\./, '')}
                  label={activeMeasure.className}
                  compact
                />
                <CopyTokenButton
                  value={`var(${activeMeasure.token})`}
                  label={activeMeasure.token}
                  compact
                />
              </div>
            </div>

            <div className="mt-6">
              <div
                className="border-r border-dashed border-[var(--apple-blue)]/50 pr-4 transition-[max-width] duration-300"
                style={{ maxWidth: activeMeasure.value }}
              >
                {activeMeasure.token === '--measure-display' ||
                activeMeasure.token === '--measure-title' ? (
                  <p className="type-title-2 text-[var(--apple-label-primary)]">
                    Designing calm software systems for operational clarity at scale.
                  </p>
                ) : (
                  <div className="prose-stack type-body">
                    <p>
                      Long-form editorial interfaces stay legible when eye travel per line remains predictable. Capping sustained narrative prose at 60ch prevents readers from losing their place when sweeping back to the left margin.
                    </p>
                    <p>
                      Consecutive paragraphs inside <code className="font-mono text-[13px]">.prose-stack</code> separate by <code className="font-mono text-[13px]">1.25rem</code> (20px) so chapter flow breathes without excessive vertical fragmentation.
                    </p>
                  </div>
                )}
              </div>
              <p className="mt-3 font-mono text-[11px] text-[var(--apple-label-tertiary)]">
                Dashed guide marks exact {activeMeasure.value} boundary ({activeMeasure.token}).
              </p>
            </div>
          </div>

          {/* Comparative Ruler of All 4 Measures */}
          <div className="divide-y divide-[var(--apple-separator-subtle)] border-y border-[var(--apple-separator)]">
            {EDITORIAL_MEASURES.map((m) => (
              <div
                key={m.token}
                className="grid grid-cols-1 gap-3 py-3.5 sm:grid-cols-12 sm:items-center"
              >
                <div className="sm:col-span-4">
                  <p className="text-[13.5px] font-medium text-[var(--apple-label-primary)]">
                    {m.role}
                  </p>
                  <p className="font-mono text-[11.5px] text-[var(--apple-label-tertiary)]">
                    {m.className} · {m.value}
                  </p>
                </div>
                <div className="sm:col-span-8">
                  <div
                    className="h-2.5 rounded-full bg-[var(--apple-blue)]/70"
                    style={{
                      width: `${Math.round((parseInt(m.value, 10) / 60) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </FoundationSectionBlock>

      {/* 4. Consistent Documentation Standards */}
      <DocumentationStandardsPanel
        headingId="ws-typography-standards-heading"
        usageGuidance={[
          'Follow one strict optical sizing boundary: ≥ 20pt roles (h1–h3, .type-display, .type-title-1–3, .type-lead) use SF Pro Display; < 20pt roles (base h4, .type-headline, .type-body–caption) use SF Pro Text.',
          'Use one .type-display statement per portfolio landing hero and .type-title-1 for all secondary page H1 titles.',
          'Always pair numeric counters, dates, contrast readouts, and timelines with .tabular-nums so digits align cleanly without horizontal jitter.',
          'Keep headings in sentence case with text-wrap: balance; reserve uppercase tracking exclusively for quiet 10.5px–11.5px architectural group labels.',
        ]}
        doDonts={[
          {
            doText: 'Apply semantic scale classes (.type-title-2, .type-body, .type-callout) so Reader Comfort Large mode scales editorial copy automatically.',
            dontText: 'Hardcode fixed pixel sizes like text-[17px] on long-form case study paragraphs, which prevents html[data-reader-size="large"] from enlarging reading copy.',
          },
          {
            doText: 'Constrain body paragraphs with .measure-prose (60ch) inside wide 1160px containers.',
            dontText: 'Allow paragraphs to span the full 1160px container width (95+ characters per line), which degrades scanning speed.',
          },
        ]}
        accessibilityNotes={[
          'All font-size tokens use rem units rooted at 16px so browser zoom and user OS text-size preferences scale proportionally.',
          'Reader Comfort mode (Global Preferences → Text Size: Large) enlarges .type-body (17px → 19px), .type-callout (15.5px → 17px), .type-lead, and .type-footnote without breaking grid alignment.',
          'Semantic heading levels (h1 → h2 → h3 → h4) must follow document outline order; use .type-* classes when visual size differs from semantic level.',
        ]}
        responsiveNotes={[
          'Five display/editorial roles (.type-display, .type-title-1, .type-title-2, .type-title-3, .type-lead) scale fluidly via CSS clamp() without abrupt breakpoint jumps.',
          'Body copy (.type-body at 17px), callouts (15.5px), footnotes (13px), and captions (12px) remain steady across mobile and desktop for predictable reading ergonomics.',
        ]}
      />

      {/* 5. Honest Source-Code Gaps */}
      <FoundationGapsSection
        headingId="ws-typography-gaps-heading"
        gaps={getGapsByDomain('typography')}
      />
    </div>
  );
}
