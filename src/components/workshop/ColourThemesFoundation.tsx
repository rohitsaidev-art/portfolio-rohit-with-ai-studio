import { useMemo, useState } from 'react';
import { VERIFIED_THEME_PALETTES } from '../../utils/a11yContrast';
import {
  setAppearanceMode,
  type AppearanceMode,
  type ResolvedTheme,
} from '../../utils/appearance';
import {
  COLOR_TOKENS,
  COLOR_TOKEN_GROUP_META,
  copyTextToClipboard,
  evaluateContrastPair,
  getThemeMatrixId,
  getTokenValueForMatrix,
  type ColorTokenSpec,
} from '../../utils/foundationsCatalog';
import { playSuccessChime, playTick } from '../../utils/soundEngine';
import { showToast } from '../../utils/toast';
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
  Check,
  ChevronRight,
  Monitor,
  Moon,
  Sun,
} from 'lucide-react';

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
  { id: 'labelPrimary', label: 'Primary Ink' },
  { id: 'labelSecondary', label: 'Secondary Ink' },
  { id: 'labelTertiary', label: 'Tertiary Ink' },
  { id: 'link', label: 'Editorial Cobalt Link' },
  { id: 'success', label: 'Success' },
  { id: 'warning', label: 'Warning' },
  { id: 'error', label: 'Error' },
  { id: 'buttonText', label: 'Button Label' },
] as const;

const CONTRAST_BG_OPTIONS = [
  { id: 'bgPrimary', label: 'Primary Canvas' },
  { id: 'bgSecondary', label: 'Secondary Band' },
  { id: 'surfaceElevated', label: 'Elevated Surface' },
  { id: 'buttonFill', label: 'Accent Fill' },
] as const;

function LivePaletteCard({
  palette,
  theme,
  title,
  subtitle,
  isSandboxActive,
  onSelect,
}: {
  palette: VisualPaletteId;
  theme: ResolvedTheme;
  title: string;
  subtitle: string;
  isSandboxActive: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      data-ds-sandbox="true"
      data-ds-palette={palette}
      data-ds-theme={theme}
      className="overflow-hidden rounded-[20px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] transition-colors duration-200"
    >
      <div className="flex items-center justify-between gap-3 border-b border-[var(--apple-separator-subtle)] bg-[var(--apple-bg)] px-5 py-4">
        <div>
          <h3 className="text-[15px] font-semibold tracking-[-0.015em] text-[var(--apple-label-primary)]">
            {title}
          </h3>
          <p className="text-[12.5px] text-[var(--apple-label-tertiary)]">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onSelect}
          className={
            isSandboxActive
              ? 'apple-btn-tonal !min-h-[30px] whitespace-nowrap !px-3 !py-1 !text-[12px]'
              : 'apple-btn-outline !min-h-[30px] whitespace-nowrap !px-3 !py-1 !text-[12px]'
          }
        >
          {isSandboxActive ? (
            <>
              <Check size={12} strokeWidth={2} aria-hidden="true" className="text-[var(--apple-blue)]" />
              <span>Active</span>
            </>
          ) : (
            <span>Use in Studio</span>
          )}
        </button>
      </div>

      <div className="p-5">
        <div className="apple-card-static rounded-[16px] p-5">
          <p className="text-[12px] text-[var(--apple-label-tertiary)]">
            Product Design · 2025
          </p>
          <h4 className="type-title-3 mt-1.5 text-[var(--apple-label-primary)]">
            StallSync Spatial Allocation
          </h4>
          <p className="mt-2 text-[14px] leading-[1.52] text-[var(--apple-label-secondary)]">
            Quiet neutral surfaces let photography and blue interactive affordances lead without noise.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--apple-separator-subtle)] pt-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => playTick()}
                className="apple-btn-primary !min-h-[32px] !px-3.5 !py-1 !text-[12.5px]"
              >
                Primary
              </button>
              <button
                type="button"
                onClick={() => playTick()}
                className="apple-btn-tonal !min-h-[32px] !px-3 !py-1 !text-[12.5px]"
              >
                Secondary
              </button>
            </div>
            <span className="inline-flex items-center gap-0.5 text-[13px] font-medium text-[var(--apple-link)]">
              <span>Case study</span>
              <ChevronRight size={12} strokeWidth={2} aria-hidden="true" />
            </span>
          </div>
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

  const [paletteNote, setPaletteNote] = useState('');
  const [activeGroup, setActiveGroup] = useState<'all' | ColorTokenSpec['group']>('all');
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

  const fgHex = activePaletteObj[selectedFg];
  const bgHex = activePaletteObj[selectedBg];
  const liveContrast = useMemo(
    () => evaluateContrastPair(fgHex, bgHex),
    [fgHex, bgHex],
  );

  const visibleGroups = useMemo(
    () =>
      activeGroup === 'all'
        ? COLOR_TOKEN_GROUP_META
        : COLOR_TOKEN_GROUP_META.filter((g) => g.id === activeGroup),
    [activeGroup],
  );

  const handleCopySwatch = async (token: string, hex: string) => {
    playTick();
    await copyTextToClipboard(`var(${token})`);
    showToast({ message: `Copied var(${token}) · ${hex}`, tone: 'success', durationMs: 2200 });
  };

  const recordDecision = (status: DecisionStatus) => {
    playSuccessChime();
    onLogDecision({
      subjectType: 'palette',
      subjectId: `foundation-${sandboxPalette}`,
      title: 'Visual Foundation Palette',
      variantLabel:
        sandboxPalette === 'warm'
          ? 'Warm Gallery Paper / Warm Obsidian'
          : 'Cool Porcelain Neutral',
      status,
      parameters: {
        palette: sandboxPalette,
        accent: sandboxTheme === 'dark' ? '#689BFF' : '#1D56C9',
        previewTheme: sandboxTheme,
      },
      rationale:
        paletteNote.trim() ||
        `Evaluated ${sandboxPalette} palette in ${sandboxTheme} mode.`,
    });
    showToast({
      message: `Logged ${sandboxPalette === 'cool' ? 'Cool' : 'Warm'} palette as ${status}`,
      tone: 'success',
      durationMs: 2400,
    });
    setPaletteNote('');
  };

  return (
    <div className="space-y-14">
      {/* 1. Cool vs. Warm Side-by-Side Comparison */}
      <section aria-labelledby="colour-compare-heading" className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="colour-compare-heading"
              className="font-display text-[20px] font-semibold tracking-[-0.022em] text-[var(--apple-label-primary)]"
            >
              Palette Comparison
            </h2>
            <p className="mt-1 text-[14px] text-[var(--apple-label-secondary)]">
              Warm Neutral (Warm Gallery Paper #FAF8F6 / Warm Obsidian #11100E) is active in production; Cool Neutral (#FAFAFC / #0B0B0D) is preserved for sandbox comparison.
            </p>
          </div>

          <div
            className="apple-segmented self-start sm:self-auto"
            role="group"
            aria-label="Compare light or dark matrices"
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
                  className={`apple-segmented-item !min-h-[30px] whitespace-nowrap px-3 text-[12px] ${
                    active
                      ? 'apple-pill-shadow bg-[var(--apple-control-thumb)] text-[var(--apple-label-primary)]'
                      : 'text-[var(--apple-label-secondary)]'
                  }`}
                >
                  {mode === 'light' ? 'Light' : 'Dark'}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <LivePaletteCard
            palette="warm"
            theme={sandboxTheme}
            title="Warm Neutral"
            subtitle="Production default (#FAF8F6 / #11100E)"
            isSandboxActive={sandboxPalette === 'warm'}
            onSelect={() => {
              playTick();
              onChangeSandboxPalette('warm');
            }}
          />
          <LivePaletteCard
            palette="cool"
            theme={sandboxTheme}
            title="Cool Neutral"
            subtitle="Sandbox comparison (#FAFAFC / #0B0B0D)"
            isSandboxActive={sandboxPalette === 'cool'}
            onSelect={() => {
              playTick();
              onChangeSandboxPalette('cool');
            }}
          />
        </div>

        {/* Quiet inline decision bar */}
        <div className="flex flex-col gap-3 border-t border-[var(--apple-separator-subtle)] pt-4 sm:flex-row sm:items-center">
          <input
            type="text"
            value={paletteNote}
            onChange={(e) => setPaletteNote(e.target.value)}
            placeholder={`Optional note for ${sandboxPalette === 'cool' ? 'Cool' : 'Warm'} palette decision…`}
            aria-label="Palette decision rationale"
            className="apple-input min-h-[36px] flex-1 rounded-[10px] px-3 py-1.5 text-[13px]"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => recordDecision('approved')}
              className="apple-btn-primary !min-h-[34px] whitespace-nowrap !px-3.5 !text-[12.5px]"
            >
              Approve {sandboxPalette === 'cool' ? 'Cool' : 'Warm'}
            </button>
            <button
              type="button"
              onClick={() => recordDecision('rejected')}
              className="apple-btn-tonal !min-h-[34px] whitespace-nowrap !px-3.5 !text-[12.5px]"
            >
              Reject
            </button>
          </div>
        </div>
      </section>

      {/* 2. Visual Colour Swatches */}
      <section
        aria-labelledby="colour-swatches-heading"
        className="space-y-6 border-t border-[var(--apple-separator-subtle)] pt-12"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="colour-swatches-heading"
              className="font-display text-[20px] font-semibold tracking-[-0.022em] text-[var(--apple-label-primary)]"
            >
              Colour Swatches
            </h2>
            <p className="mt-1 text-[14px] text-[var(--apple-label-secondary)]">
              Click any swatch to copy its CSS variable ({sandboxPalette === 'cool' ? 'Cool' : 'Warm'} · {sandboxTheme}).
            </p>
          </div>

          <div
            role="group"
            aria-label="Filter colour swatches"
            className="apple-segmented self-start overflow-x-auto sm:self-auto"
          >
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'surfaces', label: 'Surfaces' },
                { id: 'ink', label: 'Ink' },
                { id: 'controls', label: 'Controls' },
                { id: 'accent-status', label: 'Accent' },
                { id: 'borders', label: 'Borders' },
              ] as const
            ).map((opt) => {
              const active = activeGroup === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    playTick();
                    setActiveGroup(opt.id);
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
        </div>

        <div className="space-y-9">
          {visibleGroups.map((group) => {
            const tokens = COLOR_TOKENS.filter((t) => t.group === group.id);
            return (
              <div key={group.id} className="space-y-3.5">
                <h3 className="text-[14px] font-semibold text-[var(--apple-label-primary)]">
                  {group.label}
                </h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {tokens.map((spec) => {
                    const hex = getTokenValueForMatrix(spec, sandboxPalette, sandboxTheme);
                    return (
                      <button
                        key={spec.token}
                        type="button"
                        onClick={() => void handleCopySwatch(spec.token, hex)}
                        className="apple-link group flex flex-col text-left"
                      >
                        <div
                          data-ds-sandbox="true"
                          data-ds-palette={sandboxPalette}
                          data-ds-theme={sandboxTheme}
                          className="h-16 w-full rounded-[12px] border border-[var(--apple-separator)] transition-transform duration-150 group-hover:scale-[1.01]"
                          style={{ backgroundColor: hex }}
                        />
                        <span className="mt-2 truncate text-[13px] font-medium text-[var(--apple-label-primary)] group-hover:underline">
                          {spec.label}
                        </span>
                        <span className="truncate font-mono text-[11px] tabular-nums text-[var(--apple-label-tertiary)]">
                          {hex}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Interactive Contrast Checker */}
      <section
        aria-labelledby="colour-contrast-heading"
        className="space-y-5 border-t border-[var(--apple-separator-subtle)] pt-12"
      >
        <div>
          <h2
            id="colour-contrast-heading"
            className="font-display text-[20px] font-semibold tracking-[-0.022em] text-[var(--apple-label-primary)]"
          >
            Contrast Checker
          </h2>
          <p className="mt-1 text-[14px] text-[var(--apple-label-secondary)]">
            Test any text and surface pairing in the active theme matrix. All production pairs meet WCAG 2.2 AA (≥ 4.5:1).
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <div>
              <label
                htmlFor="contrast-fg-select"
                className="block text-[12.5px] font-medium text-[var(--apple-label-secondary)]"
              >
                Foreground
              </label>
              <select
                id="contrast-fg-select"
                value={selectedFg}
                onChange={(e) => {
                  playTick();
                  setSelectedFg(e.target.value as (typeof CONTRAST_FG_OPTIONS)[number]['id']);
                }}
                className="apple-input mt-1.5 min-h-[38px] rounded-[10px] px-3 py-1.5 text-[13.5px]"
              >
                {CONTRAST_FG_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label} ({activePaletteObj[opt.id]})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="contrast-bg-select"
                className="block text-[12.5px] font-medium text-[var(--apple-label-secondary)]"
              >
                Background
              </label>
              <select
                id="contrast-bg-select"
                value={selectedBg}
                onChange={(e) => {
                  playTick();
                  setSelectedBg(e.target.value as (typeof CONTRAST_BG_OPTIONS)[number]['id']);
                }}
                className="apple-input mt-1.5 min-h-[38px] rounded-[10px] px-3 py-1.5 text-[13.5px]"
              >
                {CONTRAST_BG_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label} ({activePaletteObj[opt.id]})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-baseline justify-between border-t border-[var(--apple-separator-subtle)] pt-4">
              <div>
                <p className="text-[12px] text-[var(--apple-label-tertiary)]">Measured ratio</p>
                <p className="font-mono text-[24px] font-semibold tabular-nums text-[var(--apple-label-primary)]">
                  {liveContrast.formattedRatio}
                </p>
              </div>
              <div className="text-right text-[13px]">
                <p
                  className={
                    liveContrast.aaNormal
                      ? 'font-semibold text-[var(--apple-success)]'
                      : 'font-semibold text-[var(--apple-error)]'
                  }
                >
                  {liveContrast.aaNormal ? 'AA Pass (4.5:1)' : 'Below AA Normal'}
                </p>
                <p className="text-[12px] text-[var(--apple-label-tertiary)]">
                  {liveContrast.aaaNormal ? 'Meets AAA (7.0:1)' : liveContrast.aaLarge ? 'Passes AA Large' : 'Fails AA Large'}
                </p>
              </div>
            </div>
          </div>

          <div
            className="flex flex-col justify-center rounded-[18px] border border-[var(--apple-separator)] p-7 lg:col-span-7"
            style={{ backgroundColor: bgHex, color: fgHex }}
          >
            <p className="font-display text-[24px] font-semibold leading-[1.18] tracking-[-0.024em]">
              Calm legibility across every surface.
            </p>
            <p className="mt-3 max-w-[52ch] text-[15.5px] leading-[1.58]">
              Normal body text requires 4.5:1 contrast under WCAG 2.2 AA; large headings require at least 3.0:1.
            </p>
            <p className="mt-4 font-mono text-[12px] opacity-80">
              {fgHex} on {bgHex}
            </p>
          </div>
        </div>
      </section>

      {/* 4. Global Site Appearance */}
      <section
        aria-labelledby="colour-appearance-heading"
        className="space-y-5 border-t border-[var(--apple-separator-subtle)] pt-12"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="colour-appearance-heading"
              className="font-display text-[20px] font-semibold tracking-[-0.022em] text-[var(--apple-label-primary)]"
            >
              Site Appearance Mode
            </h2>
            <p className="mt-1 text-[14px] text-[var(--apple-label-secondary)]">
              Live portfolio preference (OS: {osSystemTheme} · Active: {visitorResolvedTheme}).
            </p>
          </div>

          <div
            role="group"
            aria-label="Global site appearance mode"
            className="apple-segmented self-start sm:self-auto"
          >
            {(
              [
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'system', label: 'System', icon: Monitor },
                { id: 'dark', label: 'Dark', icon: Moon },
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
                  className={`apple-segmented-item !min-h-[30px] whitespace-nowrap px-3 text-[12px] ${
                    active
                      ? 'apple-pill-shadow bg-[var(--apple-control-thumb)] text-[var(--apple-label-primary)]'
                      : 'text-[var(--apple-label-secondary)]'
                  }`}
                >
                  <Icon size={12} strokeWidth={2} aria-hidden="true" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {(['light', 'dark'] as const).map((mode) => (
            <div
              key={mode}
              data-ds-sandbox="true"
              data-ds-palette={sandboxPalette}
              data-ds-theme={mode}
              className="rounded-[18px] border border-[var(--apple-separator)] bg-[var(--apple-bg)] p-5"
            >
              <p className="text-[13px] font-semibold text-[var(--apple-label-primary)]">
                {mode === 'light' ? 'Light Surfaces' : 'Dark Surfaces'}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2.5">
                <div className="rounded-[10px] border border-[var(--apple-separator)] bg-[var(--apple-bg)] p-3">
                  <span className="text-[12px] font-medium text-[var(--apple-label-primary)]">
                    Base
                  </span>
                </div>
                <div className="rounded-[10px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] p-3">
                  <span className="text-[12px] font-medium text-[var(--apple-label-primary)]">
                    Band
                  </span>
                </div>
                <div className="apple-surface-subtle rounded-[10px] p-3">
                  <span className="text-[12px] font-medium text-[var(--apple-label-primary)]">
                    Elevated
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
