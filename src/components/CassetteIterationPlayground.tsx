import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  CASSETTE_THEMES,
  CassettePlayer,
  type CassetteChapter,
  type CassettePlayerVariant,
  type CassetteStageMode,
  type CassetteThemeConfig,
} from './CassettePlayer';
import {
  CASSETTE_DEMO_TRACKS,
  getSynthesizedTrackUrl,
} from '../utils/cassetteSynthAudio';
import { AnimatedCheckIcon, AnimatedCopyIcon } from './icons/AnimatedLucide';
import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import { playTap, playTick } from '../utils/soundEngine';
import { showToast } from '../utils/toast';
import { EASE_APPLE } from '../utils/motion';

function SwatchColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-2.5 rounded-[12px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-3 py-2 transition-colors hover:border-[var(--apple-separator-strong)]">
      <span className="text-[12px] font-medium text-[var(--apple-label-secondary)]">
        {label}
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="font-mono text-[11px] uppercase text-[var(--apple-label-tertiary)]">
          {value}
        </span>
        <span className="relative h-5 w-5 overflow-hidden rounded-full border border-[var(--apple-separator-strong)] shadow-xs">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-label={label}
            className="absolute -inset-2 h-9 w-9 cursor-pointer opacity-0"
          />
          <span
            aria-hidden="true"
            className="block h-full w-full"
            style={{ backgroundColor: value }}
          />
        </span>
      </span>
    </label>
  );
}

/**
 * Miniature cassette visual card for the side-by-side theme comparison contact sheet.
 */
function MiniCassetteThemeCard({
  theme,
  selected,
  onSelect,
}: {
  theme: CassetteThemeConfig;
  selected: boolean;
  onSelect: () => void;
}) {
  const isLightShell = theme.shellFinish === 'light';
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`group flex w-full cursor-pointer flex-col rounded-[18px] border p-2.5 text-left transition-[border-color,transform,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98] ${
        selected
          ? 'border-[var(--apple-label-primary)] bg-[var(--apple-surface-elevated)] shadow-[var(--shadow-apple-subtle)]'
          : 'border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)]/65 hover:border-[var(--apple-separator-strong)] hover:bg-[var(--apple-surface-elevated)]'
      }`}
    >
      {/* Mini Stage + Shell */}
      <div
        className="grid aspect-[1.68] w-full place-items-center overflow-hidden rounded-[12px] p-3"
        style={{ backgroundColor: theme.stageBg }}
      >
        <div
          className="relative aspect-[1.58] w-full max-w-[168px] overflow-hidden rounded-[8px] border shadow-md"
          style={{
            backgroundImage: `linear-gradient(165deg, ${theme.shellTop} 0%, ${theme.shellMid} 55%, ${theme.shellBottom} 100%)`,
            borderColor: theme.shellBorder,
          }}
        >
          {/* Mini paper label */}
          <div
            className="absolute top-[11%] right-[9%] bottom-[25%] left-[9%] overflow-hidden rounded-[4px]"
            style={{ backgroundColor: theme.labelBg }}
          >
            <div className="flex items-center justify-between px-1.5 pt-1.5">
              <span
                className="h-1 w-8 rounded-full opacity-80"
                style={{ backgroundColor: theme.labelInk }}
              />
              <span
                className="h-1.5 w-3.5 rounded-full"
                style={{ backgroundColor: theme.labelInk }}
              />
            </div>
            {/* 3-Band Stripe + Reel Window */}
            <div className="relative mt-2 grid h-[38%] grid-rows-3 gap-y-[1.5px]">
              <span style={{ backgroundColor: theme.stripeOne }} />
              <span style={{ backgroundColor: theme.stripeTwo }} />
              <span style={{ backgroundColor: theme.stripeThree }} />
              <div className="absolute inset-x-[20%] inset-y-[-2px] flex items-center justify-between rounded-full bg-[#1b1a18] px-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: theme.reelHubBg }}
                />
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: theme.reelHubBg }}
                />
              </div>
            </div>
          </div>
          {/* Mini bottom trapezoid */}
          <div
            className="absolute right-[28%] bottom-[4%] left-[28%] h-[15%] [clip-path:polygon(13%_0,87%_0,100%_100%,0_100%)]"
            style={{
              backgroundColor: isLightShell
                ? 'rgba(180,174,164,0.75)'
                : 'rgba(110,110,104,0.38)',
            }}
          />
        </div>
      </div>

      {/* Theme Metadata */}
      <div className="mt-2.5 flex items-center justify-between gap-2 px-1">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold tracking-[-0.014em] text-[var(--apple-label-primary)]">
            {theme.name}
          </p>
          <p className="truncate text-[11px] text-[var(--apple-label-tertiary)]">
            {theme.subtitle}
          </p>
        </div>
        <span className="flex shrink-0 items-center -space-x-1" aria-hidden="true">
          <span
            className="h-3 w-3 rounded-full border border-black/15"
            style={{ backgroundColor: theme.stripeOne }}
          />
          <span
            className="h-3 w-3 rounded-full border border-black/15"
            style={{ backgroundColor: theme.stripeTwo }}
          />
          <span
            className="h-3 w-3 rounded-full border border-black/15"
            style={{ backgroundColor: theme.stripeThree }}
          />
        </span>
      </div>
    </button>
  );
}

/**
 * Interactive Cassette Player Iteration Playground embedded inside the Notes page.
 * Allows iterating through 8 color/material themes, customizing every shell/label/stripe
 * color live, switching playable synthesized analog tracks, and copying theme JSON.
 */
export function CassetteIterationPlayground() {
  const [activeThemeId, setActiveThemeId] = useState<string>(CASSETTE_THEMES[2].id);
  const [customTheme, setCustomTheme] = useState<CassetteThemeConfig>(CASSETTE_THEMES[2]);
  const [variant, setVariant] = useState<CassettePlayerVariant>('v2');
  const [isOutOfContext, setIsOutOfContext] = useState<boolean>(true);
  const [stageMode, setStageMode] = useState<CassetteStageMode>('themed');
  const [activeTrackId, setActiveTrackId] = useState<string>(CASSETTE_DEMO_TRACKS[0].id);
  const [trackTitle, setTrackTitle] = useState<string>(CASSETTE_DEMO_TRACKS[0].trackTitle);
  const [archiveLabel, setArchiveLabel] = useState<string>(
    CASSETTE_DEMO_TRACKS[0].archiveLabel,
  );
  const [sideLabel, setSideLabel] = useState<string>(CASSETTE_DEMO_TRACKS[0].sideLabel);
  const [catalogueNumber, setCatalogueNumber] = useState<string>(
    CASSETTE_DEMO_TRACKS[0].catalogueNumber,
  );
  const [showCustomControls, setShowCustomControls] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const activeTrack = useMemo(
    () =>
      CASSETTE_DEMO_TRACKS.find((t) => t.id === activeTrackId) ??
      CASSETTE_DEMO_TRACKS[0],
    [activeTrackId],
  );

  const synthesizedAudioUrl = useMemo(
    () => getSynthesizedTrackUrl(activeTrack),
    [activeTrack],
  );

  const handleSelectTheme = (theme: CassetteThemeConfig) => {
    playTick();
    setActiveThemeId(theme.id);
    setCustomTheme({ ...theme });
  };

  const handleSelectTrack = (trackId: string) => {
    const next = CASSETTE_DEMO_TRACKS.find((t) => t.id === trackId);
    if (!next) return;
    playTick();
    setActiveTrackId(next.id);
    setTrackTitle(next.trackTitle);
    setArchiveLabel(next.archiveLabel);
    setSideLabel(next.sideLabel);
    setCatalogueNumber(next.catalogueNumber);
  };

  const updateThemeField = <K extends keyof CassetteThemeConfig>(
    key: K,
    value: CassetteThemeConfig[K],
  ) => {
    setCustomTheme((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetTheme = () => {
    const base =
      CASSETTE_THEMES.find((t) => t.id === activeThemeId) ?? CASSETTE_THEMES[0];
    playTick();
    setCustomTheme({ ...base });
    setStageMode('themed');
  };

  const handleJumpToSpeaker = (chapter: CassetteChapter | null) => {
    setIsOutOfContext(false);
    if (chapter) {
      showToast(`Jumped to ${chapter.num} · ${chapter.title}`);
    } else {
      showToast(`Jumped to active speaker · ${trackTitle}`);
    }
  };

  const handleCopyThemeJson = async () => {
    playTap();
    const payload = JSON.stringify(
      {
        variant,
        theme: customTheme,
        stageMode,
        label: {
          trackTitle,
          archiveLabel,
          sideLabel,
          catalogueNumber,
        },
      },
      null,
      2,
    );
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      showToast('Cassette theme JSON copied to clipboard');
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      showToast('Could not copy automatically — select theme values manually');
    }
  };

  return (
    <section
      aria-label="Cassette player iteration playground"
      className="border-y border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)]/55 py-12 sm:py-16"
    >
      <div className="mx-auto max-w-[1160px] px-5 sm:px-8">
        {/* Playground Header Row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="type-eyebrow text-[var(--apple-label-secondary)]">
              Interactive Study · Tactile Audio Deck
            </p>
            <h2 className="type-title-2 mt-2">
              Cassette Player Iteration Playground
            </h2>
            <p className="type-callout mt-2 max-w-[58ch] text-[var(--apple-label-secondary)]">
              Press play, scrub the tape head, rewind the spools, and compare 8 color &amp; shell finish iterations live—or dial in custom label and stripe tokens.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Deck Version Switcher (v1 Classic vs v2 Editorial) */}
            <div
              role="group"
              aria-label="Cassette deck version"
              className="inline-flex min-h-[36px] items-center gap-0.5 rounded-full border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-0.5"
            >
              {(
                [
                  { id: 'v2', label: 'v2 · Editorial' },
                  { id: 'v1', label: 'v1 · Classic' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={variant === item.id}
                  onClick={() => {
                    if (variant !== item.id) {
                      playTick();
                      setVariant(item.id);
                    }
                  }}
                  className={`cursor-pointer rounded-full px-3 py-1 text-[12.5px] font-medium transition-[background-color,color,transform] duration-150 active:scale-[0.97] ${
                    variant === item.id
                      ? 'bg-[var(--apple-label-primary)] text-[var(--apple-bg)] shadow-2xs'
                      : 'text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                playTick();
                setShowCustomControls((prev) => !prev);
              }}
              aria-expanded={showCustomControls}
              className={`inline-flex min-h-[36px] cursor-pointer items-center gap-2 rounded-full border px-3.5 text-[13px] font-medium transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.97] ${
                showCustomControls
                  ? 'border-[var(--apple-label-primary)] bg-[var(--apple-surface-elevated)] text-[var(--apple-label-primary)]'
                  : 'border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] text-[var(--apple-label-secondary)] hover:border-[var(--apple-separator-strong)] hover:text-[var(--apple-label-primary)]'
              }`}
            >
              <SlidersHorizontal size={14} strokeWidth={1.8} aria-hidden="true" />
              <span>{showCustomControls ? 'Hide Palette Tweaker' : 'Customize Colors'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyThemeJson}
              className="inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-full border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-3.5 text-[13px] font-medium text-[var(--apple-label-primary)] transition-[border-color,transform] duration-150 hover:border-[var(--apple-separator-strong)] active:scale-[0.97]"
            >
              {copied ? (
                <AnimatedCheckIcon size={14} strokeWidth={2} active />
              ) : (
                <AnimatedCopyIcon size={14} strokeWidth={1.85} />
              )}
              <span>{copied ? 'Copied JSON' : 'Copy Theme'}</span>
            </button>
          </div>
        </div>

        {/* Main Playable Deck + Quick Bar */}
        <div className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className={showCustomControls ? 'lg:col-span-7' : 'lg:col-span-12'}>
            <CassettePlayer
              variant={variant}
              archiveLabel={archiveLabel}
              audioSrc={synthesizedAudioUrl}
              catalogueNumber={catalogueNumber}
              chapters={activeTrack.chapters}
              isOutOfContext={variant === 'v2' && isOutOfContext}
              onJumpToSpeaker={handleJumpToSpeaker}
              onPlaybackChange={setIsPlaying}
              sideLabel={sideLabel}
              stageMode={stageMode}
              theme={customTheme}
              trackTitle={trackTitle}
            />

            {/* Quick Track & Stage Bar below deck */}
            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-4 py-3">
              {/* Synthesized Tape Switcher */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--apple-label-tertiary)]">
                  Tape
                </span>
                {CASSETTE_DEMO_TRACKS.map((track) => {
                  const selected = track.id === activeTrackId;
                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => handleSelectTrack(track.id)}
                      className={`cursor-pointer rounded-full px-3 py-1 text-[12.5px] font-medium transition-[background-color,color,transform] duration-150 active:scale-[0.97] ${
                        selected
                          ? 'border border-[var(--apple-separator-strong)] bg-[var(--apple-bg-secondary)] text-[var(--apple-label-primary)]'
                          : 'border border-transparent text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                      }`}
                    >
                      {track.trackTitle}
                    </button>
                  );
                })}
              </div>

              {/* Stage Backdrop Mode + v2 Target Context + Status */}
              <div className="flex flex-wrap items-center gap-2">
                {variant === 'v2' && (
                  <button
                    type="button"
                    aria-pressed={isOutOfContext}
                    onClick={() => {
                      playTick();
                      setIsOutOfContext((prev) => !prev);
                    }}
                    className={`cursor-pointer rounded-full border px-2.5 py-0.5 text-[11.5px] font-medium transition-[background-color,border-color,color] duration-150 ${
                      isOutOfContext
                        ? 'border-[var(--apple-blue)]/45 bg-[var(--apple-blue)]/10 text-[var(--apple-blue)]'
                        : 'border-[var(--apple-separator)] text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                    }`}
                  >
                    {isOutOfContext ? 'Target: Out of context' : 'Target: On-track'}
                  </button>
                )}
                <span className="hidden text-[12px] text-[var(--apple-label-tertiary)] sm:inline">
                  {isPlaying ? 'Playing tape' : activeTrack.vibe}
                </span>
                <span className="hidden text-[var(--apple-separator-strong)] sm:inline">
                  ·
                </span>
                <div
                  role="group"
                  aria-label="Stage backdrop style"
                  className="inline-flex items-center gap-0.5 rounded-full border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)]/70 p-0.5"
                >
                  {(
                    [
                      { id: 'themed', label: 'Themed' },
                      { id: 'surface', label: 'Card' },
                      { id: 'transparent', label: 'Open' },
                    ] as const
                  ).map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => {
                        playTick();
                        setStageMode(mode.id);
                      }}
                      className={`cursor-pointer rounded-full px-2.5 py-0.5 text-[11.5px] font-medium transition-colors ${
                        stageMode === mode.id
                          ? 'bg-[var(--apple-surface-elevated)] text-[var(--apple-label-primary)] shadow-xs'
                          : 'text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Live Color, Finish & Label Tweaker Drawer (shown on demand) */}
          {showCustomControls && (
            <motion.aside
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, ease: EASE_APPLE }}
              aria-label="Customize cassette colors and label"
              className="flex flex-col justify-between gap-4 rounded-[24px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-5 lg:col-span-5"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13.5px] font-semibold text-[var(--apple-label-primary)]">
                      Color &amp; Material Tokens
                    </p>
                    <p className="text-[12px] text-[var(--apple-label-tertiary)]">
                      Based on {customTheme.name}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetTheme}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-[var(--apple-separator)] px-2.5 py-1 text-[11.5px] font-medium text-[var(--apple-label-secondary)] transition-colors hover:border-[var(--apple-separator-strong)] hover:text-[var(--apple-label-primary)]"
                  >
                    <RotateCcw size={12} aria-hidden="true" />
                    Reset
                  </button>
                </div>

                {/* Hardware Finish Switch */}
                <div className="flex items-center justify-between rounded-[12px] border border-[var(--apple-separator)] px-3 py-2">
                  <span className="text-[12px] font-medium text-[var(--apple-label-secondary)]">
                    Hardware Finish
                  </span>
                  <div className="inline-flex items-center gap-1 rounded-full bg-[var(--apple-bg-secondary)] p-0.5">
                    {(['dark', 'light'] as const).map((finish) => (
                      <button
                        key={finish}
                        type="button"
                        onClick={() => {
                          playTick();
                          updateThemeField('shellFinish', finish);
                        }}
                        className={`cursor-pointer rounded-full px-2.5 py-0.5 text-[11.5px] font-medium capitalize transition-colors ${
                          customTheme.shellFinish === finish
                            ? 'bg-[var(--apple-surface-elevated)] text-[var(--apple-label-primary)] shadow-xs'
                            : 'text-[var(--apple-label-secondary)]'
                        }`}
                      >
                        {finish}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Pickers */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <SwatchColorInput
                    label="Stage"
                    value={customTheme.stageBg}
                    onChange={(v) => updateThemeField('stageBg', v)}
                  />
                  <SwatchColorInput
                    label="Shell Top"
                    value={customTheme.shellTop}
                    onChange={(v) => updateThemeField('shellTop', v)}
                  />
                  <SwatchColorInput
                    label="Shell Mid"
                    value={customTheme.shellMid}
                    onChange={(v) => updateThemeField('shellMid', v)}
                  />
                  <SwatchColorInput
                    label="Shell Base"
                    value={customTheme.shellBottom}
                    onChange={(v) => updateThemeField('shellBottom', v)}
                  />
                  <SwatchColorInput
                    label="Label Paper"
                    value={customTheme.labelBg}
                    onChange={(v) => updateThemeField('labelBg', v)}
                  />
                  <SwatchColorInput
                    label="Label Ink"
                    value={customTheme.labelInk}
                    onChange={(v) => updateThemeField('labelInk', v)}
                  />
                  <SwatchColorInput
                    label="Stripe 1"
                    value={customTheme.stripeOne}
                    onChange={(v) => updateThemeField('stripeOne', v)}
                  />
                  <SwatchColorInput
                    label="Stripe 2"
                    value={customTheme.stripeTwo}
                    onChange={(v) => updateThemeField('stripeTwo', v)}
                  />
                  <SwatchColorInput
                    label="Stripe 3"
                    value={customTheme.stripeThree}
                    onChange={(v) => updateThemeField('stripeThree', v)}
                  />
                  <SwatchColorInput
                    label="Reel Hub"
                    value={customTheme.reelHubBg}
                    onChange={(v) => updateThemeField('reelHubBg', v)}
                  />
                </div>

                {/* Editable Label Typography */}
                <div className="border-t border-[var(--apple-separator)] pt-3.5">
                  <p className="mb-2 text-[12px] font-semibold text-[var(--apple-label-secondary)]">
                    Cassette Label Copy
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={trackTitle}
                      onChange={(e) => setTrackTitle(e.target.value)}
                      placeholder="Track title"
                      aria-label="Track title"
                      className="col-span-2 rounded-[10px] border border-[var(--apple-separator)] bg-[var(--apple-bg)] px-3 py-1.5 text-[13px] text-[var(--apple-label-primary)] focus:border-[var(--apple-separator-strong)] focus:outline-none"
                    />
                    <input
                      type="text"
                      value={archiveLabel}
                      onChange={(e) => setArchiveLabel(e.target.value)}
                      placeholder="Archive label"
                      aria-label="Archive label"
                      className="rounded-[10px] border border-[var(--apple-separator)] bg-[var(--apple-bg)] px-3 py-1.5 font-mono text-[12px] text-[var(--apple-label-primary)] focus:border-[var(--apple-separator-strong)] focus:outline-none"
                    />
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        value={sideLabel}
                        onChange={(e) => setSideLabel(e.target.value)}
                        placeholder="Side A"
                        aria-label="Side label"
                        className="rounded-[10px] border border-[var(--apple-separator)] bg-[var(--apple-bg)] px-2.5 py-1.5 font-mono text-[12px] text-[var(--apple-label-primary)] focus:border-[var(--apple-separator-strong)] focus:outline-none"
                      />
                      <input
                        type="text"
                        value={catalogueNumber}
                        onChange={(e) => setCatalogueNumber(e.target.value)}
                        placeholder="200769"
                        aria-label="Catalogue number"
                        className="rounded-[10px] border border-[var(--apple-separator)] bg-[var(--apple-bg)] px-2.5 py-1.5 font-mono text-[12px] text-[var(--apple-label-primary)] focus:border-[var(--apple-separator-strong)] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </div>

        {/* 8-Theme Visual Contact Sheet — Click Any Iteration to Load */}
        <div className="mt-7">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-mono text-[11.5px] font-medium uppercase tracking-[0.08em] text-[var(--apple-label-tertiary)]">
              Color &amp; Material Iterations ({CASSETTE_THEMES.length})
            </p>
            <p className="text-[12px] text-[var(--apple-label-tertiary)]">
              Click any edition to load onto the live deck
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CASSETTE_THEMES.map((theme) => (
              <MiniCassetteThemeCard
                key={theme.id}
                theme={theme}
                selected={activeThemeId === theme.id}
                onSelect={() => handleSelectTheme(theme)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
