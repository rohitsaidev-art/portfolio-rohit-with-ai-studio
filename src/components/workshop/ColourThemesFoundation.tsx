import { useMemo, useState } from 'react';
import {
  VERIFIED_THEME_PALETTES,
  auditThemeContrast,
} from '../../utils/a11yContrast';
import {
  setAppearanceMode,
  type AppearanceMode,
  type ResolvedTheme,
} from '../../utils/appearance';
import {
  COLOR_TOKENS,
  COLOR_TOKEN_GROUP_META,
  evaluateContrastPair,
  getGapsByDomain,
  getThemeMatrixId,
  getTokenValueForMatrix,
  type ColorTokenSpec,
} from '../../utils/foundationsCatalog';
import { playSuccessChime, playTick } from '../../utils/soundEngine';
import {
  useAppearanceMode,
  useResolvedTheme,
  useSystemTheme,
} from '../../utils/useAppearance';
import type {
  DecisionStatus,
  VisualPaletteId,
} from '../../utils/workshopStore';
import {
  SFCheckmark,
  SFChevronRight,
  SFDisplay,
  SFMoon,
  SFSunMax,
} from '../SFSymbols';
import {
  CopyTokenButton,
  DocumentationStandardsPanel,
  FoundationGapsSection,
  FoundationSectionBlock,
} from './FoundationDocPrimitives';

interface ColourThemesFoundationProps {
  sandboxPalette: VisualPaletteId;
  sandboxTheme: ResolvedTheme;
  onChangeSandboxPalette: (palette: VisualPaletteId) => void;
  onChangeSandboxTheme: (theme: ResolvedTheme) => void;
  onLogDecision: (payload: {
    subjectType: 'palette' | 'appearance';
    subjectId: string;
    title: string;
    variantLabel: string;
    status: DecisionStatus;
    parameters: Record<string, string | number | boolean>;
    rationale: string;
  }) => void;
}

const CONTRAST_FG_OPTIONS = [
  { id: 'labelPrimary', token: '--apple-label-primary', label: 'Primary Ink' },
  { id: 'labelSecondary', token: '--apple-label-secondary', label: 'Secondary Ink' },
  { id: 'labelTertiary', token: '--apple-label-tertiary', label: 'Tertiary Ink' },
  { id: 'link', token: '--apple-link', label: 'Interactive Link' },
  { id: 'success', token: '--apple-success', label: 'Semantic Success' },
  { id: 'warning', token: '--apple-warning', label: 'Semantic Warning' },
  { id: 'info', token: '--apple-info', label: 'Semantic Info' },
  { id: 'error', token: '--apple-error', label: 'Validation Error' },
  { id: 'buttonText', token: '#ffffff (Button Text)', label: 'White on Apple Blue' },
] as const;

const CONTRAST_BG_OPTIONS = [
  { id: 'bgPrimary', token: '--apple-bg', label: 'Primary Canvas' },
  { id: 'bgSecondary', token: '--apple-bg-secondary', label: 'Secondary Band' },
  { id: 'surfaceElevated', token: '--apple-surface-elevated', label: 'Elevated Surface' },
  { id: 'buttonFill', token: '--apple-blue-fill', label: 'Primary CTA Fill' },
] as const;

function LivePaletteSpecimen({
  palette,
  theme,
  title,
  badgeText,
  onSelectForSandbox,
  isSandboxActive,
}: {
  palette: VisualPaletteId;
  theme: ResolvedTheme;
  title: string;
  badgeText: string;
  onSelectForSandbox: () => void;
  isSandboxActive: boolean;
}) {
  const [segment, setSegment] = useState<'overview' | 'swatches'>('overview');
  const coreSwatches = useMemo(() => {
    const coreNames = [
      '--apple-bg',
      '--apple-bg-secondary',
      '--apple-bg-tertiary',
      '--apple-label-primary',
      '--apple-label-secondary',
      '--apple-blue',
    ];
    return coreNames
      .map((name) => COLOR_TOKENS.find((t) => t.token === name))
      .filter((t): t is ColorTokenSpec => Boolean(t));
  }, []);

  return (
    <div
      data-ds-sandbox="true"
      data-ds-palette={palette}
      data-ds-theme={theme}
      className="overflow-hidden rounded-[22px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] transition-colors duration-200"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--apple-separator)] bg-[var(--apple-bg)] px-5 py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--apple-link)]">
            {badgeText}
          </p>
          <h3 className="type-headline mt-0.5 text-[var(--apple-label-primary)]">
            {title}
          </h3>
        </div>
        <button
          type="button"
          onClick={onSelectForSandbox}
          className={
            isSandboxActive
              ? 'apple-btn-tonal !min-h-[32px] !px-3 !py-1 !text-[12px]'
              : 'apple-btn-outline !min-h-[32px] !px-3 !py-1 !text-[12px]'
          }
        >
          {isSandboxActive ? (
            <>
              <SFCheckmark size={12} className="text-[var(--apple-blue)]" />
              <span>Active in Studio</span>
            </>
          ) : (
            <span>Inspect in Studio</span>
          )}
        </button>
      </div>

      <div className="p-5 sm:p-6">
        <div className="apple-card-static rounded-[18px] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="type-caption flex items-center gap-2 text-[var(--apple-label-secondary)]">
              <span>Product Design</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">2025</span>
            </div>
            <div
              className="apple-segmented"
              role="group"
              aria-label={`${title} preview mode`}
            >
              {(['overview', 'swatches'] as const).map((tab) => {
                const active = segment === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      playTick();
                      setSegment(tab);
                    }}
                    className={`apple-segmented-item !min-h-[28px] px-3 text-[12px] ${
                      active
                        ? 'apple-pill-shadow bg-[var(--apple-control-thumb)] text-[var(--apple-label-primary)]'
                        : 'text-[var(--apple-label-secondary)]'
                    }`}
                  >
                    {tab === 'overview' ? 'Specimen' : 'Core Swatches'}
                  </button>
                );
              })}
            </div>
          </div>

          {segment === 'overview' ? (
            <div className="mt-4">
              <h4 className="type-title-3 text-[var(--apple-label-primary)]">
                StallSync Spatial Allocation
              </h4>
              <p className="type-callout mt-2 text-[var(--apple-label-secondary)]">
                Evaluate ink contrast, surface elevation, hairline borders, and Apple Blue action polarity on live portfolio controls.
              </p>

              <div className="mt-4">
                <label
                  className="sr-only"
                  htmlFor={`specimen-input-${palette}-${theme}`}
                >
                  Sample email input
                </label>
                <input
                  id={`specimen-input-${palette}-${theme}`}
                  type="text"
                  readOnly
                  value="hello@aaravsen.design"
                  className="apple-input min-h-[40px] rounded-[12px] px-3.5 py-2 text-[14px]"
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--apple-separator-subtle)] pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => playTick()}
                    className="apple-btn-primary !min-h-[34px] !px-4 !py-1 !text-[13px]"
                  >
                    Primary CTA
                  </button>
                  <button
                    type="button"
                    onClick={() => playTick()}
                    className="apple-btn-tonal !min-h-[34px] !px-3.5 !py-1 !text-[13px]"
                  >
                    Secondary
                  </button>
                </div>
                <span className="inline-flex items-center gap-0.5 text-[13.5px] font-medium text-[var(--apple-link)]">
                  <span>Read case study</span>
                  <SFChevronRight size={13} />
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {coreSwatches.map((swatch) => {
                const hex = getTokenValueForMatrix(swatch, palette, theme);
                return (
                  <div
                    key={swatch.token}
                    className="rounded-[12px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] p-2.5"
                  >
                    <div
                      className="h-9 w-full rounded-[8px] border border-[var(--apple-separator)]"
                      style={{ backgroundColor: hex }}
                    />
                    <p className="mt-2 truncate text-[12px] font-semibold text-[var(--apple-label-primary)]">
                      {swatch.label}
                    </p>
                    <p className="font-mono text-[11px] tabular-nums text-[var(--apple-label-tertiary)]">
                      {hex}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ColourThemesFoundation({
  sandboxPalette,
  sandboxTheme,
  onChangeSandboxPalette,
  onChangeSandboxTheme,
  onLogDecision,
}: ColourThemesFoundationProps) {
  const visitorAppearanceMode = useAppearanceMode();
  const visitorResolvedTheme = useResolvedTheme();
  const osSystemTheme = useSystemTheme();

  const [paletteRationale, setPaletteRationale] = useState(
    'Evaluating Warm Neutral paper canvas vs. Cool Neutral Apple grayscale with Apple Blue preserved.',
  );
  const [loggedFeedback, setLoggedFeedback] = useState<string | null>(null);
  const [activeTokenGroup, setActiveTokenGroup] = useState<
    'all' | ColorTokenSpec['group']
  >('all');
  const [selectedFg, setSelectedFg] =
    useState<(typeof CONTRAST_FG_OPTIONS)[number]['id']>('labelSecondary');
  const [selectedBg, setSelectedBg] =
    useState<(typeof CONTRAST_BG_OPTIONS)[number]['id']>('bgSecondary');

  const activeMatrixId = getThemeMatrixId(sandboxPalette, sandboxTheme);
  const activePaletteObj = useMemo(
    () =>
      VERIFIED_THEME_PALETTES.find((p) => p.id === activeMatrixId) ??
      VERIFIED_THEME_PALETTES[0],
    [activeMatrixId],
  );

  const contrastAuditAll = useMemo(() => auditThemeContrast(), []);
  const activeMatrixChecks = useMemo(
    () => contrastAuditAll.filter((c) => c.theme === activeMatrixId),
    [contrastAuditAll, activeMatrixId],
  );
  const totalPassingPairs = useMemo(
    () => contrastAuditAll.filter((c) => c.passesAA).length,
    [contrastAuditAll],
  );

  const fgHex = activePaletteObj[selectedFg];
  const bgHex = activePaletteObj[selectedBg];
  const fgMeta =
    CONTRAST_FG_OPTIONS.find((o) => o.id === selectedFg) ??
    CONTRAST_FG_OPTIONS[0];
  const bgMeta =
    CONTRAST_BG_OPTIONS.find((o) => o.id === selectedBg) ??
    CONTRAST_BG_OPTIONS[0];
  const liveContrast = useMemo(
    () => evaluateContrastPair(fgHex, bgHex),
    [fgHex, bgHex],
  );

  const filteredGroups = useMemo(
    () =>
      activeTokenGroup === 'all'
        ? COLOR_TOKEN_GROUP_META
        : COLOR_TOKEN_GROUP_META.filter((g) => g.id === activeTokenGroup),
    [activeTokenGroup],
  );

  const recordPaletteDecision = (
    palette: VisualPaletteId,
    status: DecisionStatus,
  ) => {
    playSuccessChime();
    onLogDecision({
      subjectType: 'palette',
      subjectId: `foundation-${palette}`,
      title: 'Visual Foundation Palette',
      variantLabel:
        palette === 'cool'
          ? 'Cool Neutral Grayscale'
          : 'Warm Neutral Beige / Gray',
      status,
      parameters: {
        palette,
        accent: '#0071E3 (preserved)',
        previewTheme: sandboxTheme,
      },
      rationale: paletteRationale,
    });
    setLoggedFeedback(
      `Recorded "${palette === 'cool' ? 'Cool Neutral' : 'Warm Neutral'}" as ${status} in Decision Log (public CSS unchanged).`,
    );
    window.setTimeout(() => setLoggedFeedback(null), 3200);
  };

  return (
    <div className="space-y-16">
      {/* 1. Cool vs Warm Palette Comparison (Preserved P1.2 + Decision Log) */}
      <FoundationSectionBlock
        id="ws-palettes-heading"
        eyebrow="Theme Matrices · P1.2"
        title="Cool Neutral vs. Warm Neutral Palettes"
        summary="Production runs on the Cool Neutral grayscale matrix (Light & Dark). Warm Neutral introduces a restrained editorial stone tint (< 4% saturation) in the isolated Studio sandbox while preserving Apple Blue (#0071E3) across all four matrices."
        isFirst
        actions={
          <div
            className="apple-segmented"
            role="group"
            aria-label="Comparison surface tone"
          >
            {(['light', 'dark'] as const).map((mode) => {
              const active = sandboxTheme === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    playTick();
                    onChangeSandboxTheme(mode);
                  }}
                  className={`apple-segmented-item !min-h-[32px] px-3.5 text-[12.5px] ${
                    active
                      ? 'apple-pill-shadow bg-[var(--apple-control-thumb)] text-[var(--apple-label-primary)]'
                      : 'text-[var(--apple-label-secondary)]'
                  }`}
                >
                  {mode === 'light' ? 'Light Matrices' : 'Dark Matrices'}
                </button>
              );
            })}
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <LivePaletteSpecimen
            palette="cool"
            theme={sandboxTheme}
            badgeText="Production Baseline · Cool Neutral"
            title="Cool Neutral Grayscale"
            isSandboxActive={sandboxPalette === 'cool'}
            onSelectForSandbox={() => {
              playTick();
              onChangeSandboxPalette('cool');
            }}
          />
          <LivePaletteSpecimen
            palette="warm"
            theme={sandboxTheme}
            badgeText="Isolated Sandbox · Warm Candidate"
            title="Warm Neutral Beige / Gray"
            isSandboxActive={sandboxPalette === 'warm'}
            onSelectForSandbox={() => {
              playTick();
              onChangeSandboxPalette('warm');
            }}
          />
        </div>

        {/* Palette Decision Log Bar */}
        <div className="mt-6 border-y border-[var(--apple-separator)] py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex-1">
              <label
                htmlFor="palette-decision-note"
                className="block text-[12px] font-medium text-[var(--apple-label-secondary)]"
              >
                Decision Log evaluation rationale (logs locally · never auto-mutates production tokens)
              </label>
              <input
                id="palette-decision-note"
                type="text"
                value={paletteRationale}
                onChange={(e) => setPaletteRationale(e.target.value)}
                className="apple-input mt-2 min-h-[40px] rounded-[12px] px-3.5 py-2 text-[14px]"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => recordPaletteDecision(sandboxPalette, 'approved')}
                className="apple-btn-primary !min-h-[38px] !px-4 !py-1.5 !text-[13px]"
              >
                Approve {sandboxPalette === 'cool' ? 'Cool' : 'Warm'}
              </button>
              <button
                type="button"
                onClick={() => recordPaletteDecision(sandboxPalette, 'rejected')}
                className="apple-btn-tonal !min-h-[38px] !px-4 !py-1.5 !text-[13px]"
              >
                Reject {sandboxPalette === 'cool' ? 'Cool' : 'Warm'}
              </button>
            </div>
          </div>
          {loggedFeedback && (
            <p
              role="status"
              className="mt-3 text-[13px] font-medium text-[var(--apple-link)]"
            >
              {loggedFeedback}
            </p>
          )}
        </div>
      </FoundationSectionBlock>

      {/* 2. Semantic Colour Token Reference */}
      <FoundationSectionBlock
        id="ws-semantic-tokens-heading"
        eyebrow="Semantic Tokens · Source of Truth"
        title="Semantic Colour Architecture"
        summary={`Inspecting exact values from src/index.css for ${
          sandboxPalette === 'cool' ? 'Cool Neutral' : 'Warm Neutral'
        } · ${
          sandboxTheme === 'light' ? 'Light' : 'Dark'
        }. Copy either the CSS variable reference or the resolved colour value directly.`}
        actions={
          <div
            role="group"
            aria-label="Filter semantic colour category"
            className="apple-segmented"
          >
            {(
              [
                { id: 'all', label: `All (${COLOR_TOKENS.length})` },
                { id: 'surfaces', label: 'Surfaces' },
                { id: 'ink', label: 'Ink' },
                { id: 'controls', label: 'Controls' },
                { id: 'accent-status', label: 'Accent' },
                { id: 'borders', label: 'Borders' },
              ] as const
            ).map((opt) => {
              const active = activeTokenGroup === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    playTick();
                    setActiveTokenGroup(opt.id);
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
        }
      >
        <div className="space-y-12">
          {filteredGroups.map((group) => {
            const tokens = COLOR_TOKENS.filter((t) => t.group === group.id);
            return (
              <div key={group.id}>
                <div className="border-b border-[var(--apple-separator)] pb-3">
                  <h3 className="type-headline text-[var(--apple-label-primary)]">
                    {group.label}
                  </h3>
                  <p className="mt-1 max-w-[66ch] text-[13.5px] text-[var(--apple-label-secondary)]">
                    {group.summary}
                  </p>
                </div>

                <div className="divide-y divide-[var(--apple-separator-subtle)]">
                  {tokens.map((spec) => {
                    const activeVal = getTokenValueForMatrix(
                      spec,
                      sandboxPalette,
                      sandboxTheme,
                    );
                    const lightVal = getTokenValueForMatrix(
                      spec,
                      sandboxPalette,
                      'light',
                    );
                    const darkVal = getTokenValueForMatrix(
                      spec,
                      sandboxPalette,
                      'dark',
                    );
                    return (
                      <div
                        key={spec.token}
                        className="grid grid-cols-1 gap-4 py-4 md:grid-cols-12 md:items-center"
                      >
                        {/* Live Swatch + Name */}
                        <div className="flex items-center gap-3.5 md:col-span-5">
                          <div
                            data-ds-sandbox="true"
                            data-ds-palette={sandboxPalette}
                            data-ds-theme={sandboxTheme}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-[var(--apple-separator)] p-1"
                          >
                            <span
                              className="h-full w-full rounded-[8px] border border-[var(--apple-separator-strong)]"
                              style={{ backgroundColor: activeVal }}
                              aria-hidden="true"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[14.5px] font-medium text-[var(--apple-label-primary)]">
                              {spec.label}
                            </p>
                            <p className="mt-0.5 text-[12.5px] leading-[1.45] text-[var(--apple-label-secondary)]">
                              {spec.usage}
                            </p>
                          </div>
                        </div>

                        {/* Light / Dark Calibration Readout */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-[var(--apple-label-tertiary)] md:col-span-3">
                          <span className="font-mono tabular-nums">
                            L: {lightVal}
                          </span>
                          <span className="font-mono tabular-nums">
                            D: {darkVal}
                          </span>
                        </div>

                        {/* Copyable Token & Value Controls */}
                        <div className="flex flex-wrap items-center gap-2 md:col-span-4 md:justify-end">
                          <CopyTokenButton
                            value={`var(${spec.token})`}
                            label={spec.token}
                            ariaLabel={`Copy CSS variable ${spec.token}`}
                            toastLabel={`var(${spec.token})`}
                            compact
                          />
                          <CopyTokenButton
                            value={activeVal}
                            label={activeVal}
                            ariaLabel={`Copy ${sandboxPalette} ${sandboxTheme} value ${activeVal} for ${spec.token}`}
                            compact
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </FoundationSectionBlock>

      {/* 3. Interactive Foreground × Background Contrast Lab */}
      <FoundationSectionBlock
        id="ws-contrast-heading"
        eyebrow="WCAG 2.2 AA Calibration"
        title="Interactive Foreground & Background Contrast Lab"
        summary={`Every semantic text-to-surface pair across all 4 theme matrices is mathematically verified via sRGB relative luminance (${totalPassingPairs}/${contrastAuditAll.length} audited pairs pass WCAG 2.2 AA ≥ 4.5:1). Test any combination interactively below.`}
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Interactive Controls */}
          <div className="space-y-6 lg:col-span-5">
            <div>
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-label-tertiary)]">
                1. Foreground Token ({sandboxPalette} · {sandboxTheme})
              </p>
              <div
                role="radiogroup"
                aria-label="Select foreground colour token"
                className="mt-2.5 space-y-1.5"
              >
                {CONTRAST_FG_OPTIONS.map((opt) => {
                  const active = selectedFg === opt.id;
                  const hex = activePaletteObj[opt.id];
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => {
                        playTick();
                        setSelectedFg(opt.id);
                      }}
                      className={`apple-link flex w-full items-center justify-between gap-3 rounded-[10px] border px-3 py-2 text-left text-[13px] transition-colors ${
                        active
                          ? 'border-[var(--apple-blue)] bg-[var(--apple-bg-secondary)] font-medium text-[var(--apple-label-primary)]'
                          : 'border-[var(--apple-separator-subtle)] text-[var(--apple-label-secondary)] hover:bg-[var(--apple-bg-secondary)]'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <span
                          className="h-4 w-4 shrink-0 rounded-full border border-[var(--apple-separator-strong)]"
                          style={{ backgroundColor: hex }}
                          aria-hidden="true"
                        />
                        <span className="truncate">{opt.label}</span>
                      </span>
                      <span className="shrink-0 font-mono text-[11.5px] tabular-nums text-[var(--apple-label-tertiary)]">
                        {hex}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-label-tertiary)]">
                2. Surface Background Token
              </p>
              <div
                role="radiogroup"
                aria-label="Select background surface token"
                className="mt-2.5 space-y-1.5"
              >
                {CONTRAST_BG_OPTIONS.map((opt) => {
                  const active = selectedBg === opt.id;
                  const hex = activePaletteObj[opt.id];
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => {
                        playTick();
                        setSelectedBg(opt.id);
                      }}
                      className={`apple-link flex w-full items-center justify-between gap-3 rounded-[10px] border px-3 py-2 text-left text-[13px] transition-colors ${
                        active
                          ? 'border-[var(--apple-blue)] bg-[var(--apple-bg-secondary)] font-medium text-[var(--apple-label-primary)]'
                          : 'border-[var(--apple-separator-subtle)] text-[var(--apple-label-secondary)] hover:bg-[var(--apple-bg-secondary)]'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <span
                          className="h-4 w-4 shrink-0 rounded-[4px] border border-[var(--apple-separator-strong)]"
                          style={{ backgroundColor: hex }}
                          aria-hidden="true"
                        />
                        <span className="truncate">{opt.label}</span>
                      </span>
                      <span className="shrink-0 font-mono text-[11.5px] tabular-nums text-[var(--apple-label-tertiary)]">
                        {hex}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Large Live Contrast Specimen */}
          <div className="flex flex-col justify-between lg:col-span-7">
            <div
              className="rounded-[22px] border border-[var(--apple-separator)] p-7 transition-colors duration-200 sm:p-9"
              style={{ backgroundColor: bgHex, color: fgHex }}
            >
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.08em] opacity-85">
                Live Pairing Specimen
              </p>
              <p className="font-display mt-3 text-[28px] font-semibold leading-[1.15] tracking-[-0.026em]">
                Calibrated contrast preserves calm editorial legibility.
              </p>
              <p className="mt-4 max-w-[54ch] text-[17px] leading-[1.6] tracking-[-0.012em]">
                Normal body text (17px) requires at least 4.5:1 under WCAG 2.2 Level AA, while large headings and non-text UI graphics require at least 3.0:1.
              </p>
              <p className="mt-4 text-[12px] font-semibold tracking-[0em]">
                12px Caption Metadata · 01 · Case Study Index · 2025
              </p>
            </div>

            {/* Measured WCAG Readout */}
            <dl className="mt-5 grid grid-cols-2 gap-4 border-y border-[var(--apple-separator)] py-4 sm:grid-cols-4">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--apple-label-tertiary)]">
                  Contrast Ratio
                </dt>
                <dd className="mt-1 font-mono text-[20px] font-semibold tabular-nums text-[var(--apple-label-primary)]">
                  {liveContrast.formattedRatio}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--apple-label-tertiary)]">
                  AA Normal (4.5:1)
                </dt>
                <dd
                  className={`mt-1.5 text-[13.5px] font-semibold ${
                    liveContrast.aaNormal
                      ? 'text-[var(--apple-success)]'
                      : 'text-[var(--apple-error)]'
                  }`}
                >
                  {liveContrast.aaNormal ? 'Pass' : 'Fail'}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--apple-label-tertiary)]">
                  AA Large (3.0:1)
                </dt>
                <dd
                  className={`mt-1.5 text-[13.5px] font-semibold ${
                    liveContrast.aaLarge
                      ? 'text-[var(--apple-success)]'
                      : 'text-[var(--apple-error)]'
                  }`}
                >
                  {liveContrast.aaLarge ? 'Pass' : 'Fail'}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--apple-label-tertiary)]">
                  AAA Normal (7.0:1)
                </dt>
                <dd className="mt-1.5 text-[13.5px] font-semibold text-[var(--apple-label-primary)]">
                  {liveContrast.aaaNormal ? 'Pass' : 'Below AAA'}
                </dd>
              </div>
            </dl>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[12px] text-[var(--apple-label-secondary)]">
              <span>
                Pair: <code className="font-mono">{fgMeta.token}</code> on{' '}
                <code className="font-mono">{bgMeta.token}</code>
              </span>
              <CopyTokenButton
                value={`color: ${fgHex}; background-color: ${bgHex}; /* ${liveContrast.formattedRatio} ${liveContrast.grade} */`}
                label="Copy CSS pair"
                ariaLabel="Copy foreground and background CSS pair"
                compact
              />
            </div>

            {/* Active Matrix Complete 16-Pair Audit Strip */}
            <div className="mt-6">
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-label-tertiary)]">
                Verified {activeMatrixId} Matrix ({activeMatrixChecks.filter((c) => c.passesAA).length}/{activeMatrixChecks.length} AA Pass)
              </p>
              <div className="mt-2.5 grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
                {activeMatrixChecks.map((check) => (
                  <div
                    key={check.pair}
                    className="flex items-center justify-between border-b border-[var(--apple-separator-subtle)] py-1.5 text-[12px]"
                  >
                    <span className="truncate text-[var(--apple-label-secondary)]">
                      {check.pair}
                    </span>
                    <span className="ml-2 shrink-0 font-mono tabular-nums font-medium text-[var(--apple-label-primary)]">
                      {check.ratio.toFixed(2)}:1
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </FoundationSectionBlock>

      {/* 4. Light, Dark & System Appearance Calibration (Preserved P1.5) */}
      <FoundationSectionBlock
        id="ws-appearance-heading"
        eyebrow="Appearance System · P1.5"
        title="Light, Dark & System Appearance"
        summary="Visitor appearance persists in localStorage (portfolio_appearance_mode) and listens live to prefers-color-scheme when System is active. An inline head script in index.html applies the resolved theme before first paint to prevent flash of unstyled light canvas."
        actions={
          <div className="flex flex-col items-start gap-1.5 lg:items-end">
            <span className="text-[11.5px] text-[var(--apple-label-tertiary)]">
              Site-wide Visitor Preference (OS: {osSystemTheme})
            </span>
            <div
              role="group"
              aria-label="Global site appearance mode"
              className="apple-segmented"
            >
              {(
                [
                  { id: 'light', label: 'Light', icon: SFSunMax },
                  { id: 'system', label: 'System', icon: SFDisplay },
                  { id: 'dark', label: 'Dark', icon: SFMoon },
                ] as const
              ).map((option) => {
                const active = visitorAppearanceMode === option.id;
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      playTick();
                      setAppearanceMode(option.id as AppearanceMode);
                    }}
                    className={`apple-segmented-item !min-h-[32px] px-3.5 text-[12.5px] ${
                      active
                        ? 'apple-pill-shadow bg-[var(--apple-control-thumb)] text-[var(--apple-label-primary)]'
                        : 'text-[var(--apple-label-secondary)]'
                    }`}
                  >
                    <Icon size={13} />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
            <span className="text-[12px] text-[var(--apple-label-tertiary)]">
              Resolved active site theme:{' '}
              <strong className="text-[var(--apple-label-primary)]">
                {visitorResolvedTheme}
              </strong>
            </span>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {(['light', 'dark'] as const).map((mode) => (
            <div
              key={mode}
              data-ds-sandbox="true"
              data-ds-palette={sandboxPalette}
              data-ds-theme={mode}
              className="rounded-[22px] border border-[var(--apple-separator)] bg-[var(--apple-bg)] p-6"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-[var(--apple-link)]">
                  {mode === 'light'
                    ? 'Light Surface Calibration'
                    : 'Dark Surface Calibration'}
                </span>
                <span className="text-[12px] text-[var(--apple-label-tertiary)]">
                  {sandboxPalette === 'cool' ? 'Cool Neutral' : 'Warm Neutral'}
                </span>
              </div>
              <h3 className="type-title-3 mt-2 text-[var(--apple-label-primary)]">
                Three-plane surface luminance stepping
              </h3>
              <p className="type-callout mt-2 text-[var(--apple-label-secondary)]">
                Light mode separates cards from secondary bands via soft ambient shadows, whereas Dark mode steps surface luminance progressively upward (#0B0B0D → #151518 → #1C1C20) with crisp 0.5px specular hairlines.
              </p>
              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-[12px] border border-[var(--apple-separator)] bg-[var(--apple-bg)] p-3">
                  <span className="type-caption block text-[var(--apple-label-primary)]">
                    Base
                  </span>
                  <span className="font-mono text-[11px] text-[var(--apple-label-tertiary)]">
                    --apple-bg
                  </span>
                </div>
                <div className="rounded-[12px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] p-3">
                  <span className="type-caption block text-[var(--apple-label-primary)]">
                    Band
                  </span>
                  <span className="font-mono text-[11px] text-[var(--apple-label-tertiary)]">
                    --apple-bg-secondary
                  </span>
                </div>
                <div className="apple-surface-subtle rounded-[12px] p-3">
                  <span className="type-caption block text-[var(--apple-label-primary)]">
                    Elevated
                  </span>
                  <span className="font-mono text-[11px] text-[var(--apple-label-tertiary)]">
                    --apple-surface-elevated
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </FoundationSectionBlock>

      {/* 5. Consistent Documentation Standards */}
      <DocumentationStandardsPanel
        headingId="ws-colour-standards-heading"
        usageGuidance={[
          'Always reference semantic CSS custom properties (--apple-bg, --apple-label-secondary, --apple-link) instead of raw hex literals so Light, Dark, Print, and Warm themes resolve automatically.',
          'Use --apple-link (#0066cc light / #409cff dark) for interactive text links and eyebrows, and reserve --apple-blue-fill (#0071e3) exclusively for filled primary CTA pills carrying #ffffff text.',
          'Keep tertiary ink (--apple-label-tertiary) for quiet captions, timestamps, and breadcrumbs — never for long body paragraphs.',
        ]}
        doDonts={[
          {
            doText: 'Pair --apple-blue-fill (#0071e3) with pure #ffffff text so primary buttons hold 4.80:1 contrast in both Light and Dark mode.',
            dontText: 'Use --apple-blue (#0a84ff in Dark mode) as a filled button background with white text, which drops contrast below WCAG AA.',
          },
          {
            doText: 'Step surfaces logically across --apple-bg → --apple-bg-secondary → --apple-surface-elevated to communicate hierarchy without heavy borders.',
            dontText: 'Hardcode dark:bg-zinc-900 or arbitrary hex swatches that bypass Warm Neutral and Print stylesheet token overrides.',
          },
        ]}
        accessibilityNotes={[
          'All 64 primary text-to-surface pairs across Cool Light, Cool Dark, Warm Light, and Warm Dark are continuously unit-tested via auditThemeContrast() in src/utils/portfolio.test.ts.',
          'Tertiary ink was calibrated to #6a6a70 (Cool Light) and #666259 (Warm Light) specifically so 12px metadata remains ≥ 4.5:1 even on recessed --apple-bg-secondary surfaces.',
          'Error states never rely on hue alone — invalid fields pair --apple-error borders with aria-invalid="true" and explicit inline error copy.',
        ]}
        responsiveNotes={[
          'Print stylesheets (@media print in src/index.css) automatically force high-contrast light ink (#111111 on #ffffff) even if the visitor browses in Dark mode.',
          'Translucent glass tokens (--apple-surface-glass, --apple-surface-ios-bar) preserve high opacity (84%–92%) so overlaid navigation text remains legible on devices without backdrop-filter acceleration.',
        ]}
      />

      {/* 6. Honest Source-Code Gaps */}
      <FoundationGapsSection
        headingId="ws-colour-gaps-heading"
        gaps={getGapsByDomain('colour-themes')}
      />
    </div>
  );
}
