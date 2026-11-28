import { useEffect, useState } from 'react';
import { Check, Copy, RotateCcw } from 'lucide-react';
import {
  BOOK_COVER_PRESETS,
  BOOK_STICKER_ACCENTS,
  DEFAULT_BOOK_CUSTOMIZATION,
  type BookCoverFrame,
  type BookCoverTexture,
  type BookCustomizationConfig,
  type BookFoilStyle,
  type BookPageRuling,
  type BookPaperTone,
  type BookStickerAccent,
} from '../../book/placeholderAssets';
import { AboutJournalBook } from '../AboutJournalBook';
import { playSuccessChime, playTick } from '../../utils/soundEngine';
import { showToast } from '../../utils/toast';

type StageBackdrop = 'auto' | 'light' | 'dark';

const TEXTURE_OPTIONS: readonly { id: BookCoverTexture; label: string }[] = [
  { id: 'leatherette', label: 'Leatherette' },
  { id: 'suede', label: 'Suede' },
  { id: 'linen', label: 'Linen' },
  { id: 'smooth', label: 'Smooth' },
];

const FOIL_OPTIONS: readonly { id: BookFoilStyle; label: string }[] = [
  { id: 'auto', label: 'Auto' },
  { id: 'gold', label: 'Gold' },
  { id: 'copper', label: 'Copper' },
  { id: 'silver', label: 'Silver' },
  { id: 'blind', label: 'Blind' },
];

const FRAME_OPTIONS: readonly { id: BookCoverFrame; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'debossed-rule', label: 'Rule' },
  { id: 'corner-ornaments', label: 'Corners' },
];

const PAPER_OPTIONS: readonly { id: BookPaperTone; label: string; swatch: string }[] = [
  { id: 'warm-cream', label: 'Warm Cream', swatch: '#f8f6f1' },
  { id: 'aged-vellum', label: 'Aged Vellum', swatch: '#f2e6cf' },
  { id: 'crisp-ivory', label: 'Crisp Ivory', swatch: '#fcfcfa' },
];

const RULING_OPTIONS: readonly { id: BookPageRuling; label: string }[] = [
  { id: 'dot-grid', label: 'Dot Grid' },
  { id: 'lined', label: 'Ruled' },
  { id: 'blank', label: 'Blank' },
];

const SIZE_OPTIONS: readonly { value: number; label: string }[] = [
  { value: 196, label: 'Compact' },
  { value: 228, label: 'Standard' },
  { value: 260, label: 'Editorial' },
];

function SegmentedRow<T extends string | number>({
  ariaLabel,
  value,
  options,
  onChange,
}: {
  ariaLabel: string;
  value: T;
  options: readonly { id: T; label: string }[];
  onChange: (next: T) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="flex flex-wrap gap-1 rounded-[12px] border border-[var(--apple-separator-subtle)] bg-[var(--apple-bg-secondary)]/85 p-1"
    >
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={String(opt.id)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => {
              if (!active) {
                playTick();
                onChange(opt.id);
              }
            }}
            className={`flex-1 cursor-pointer rounded-[8px] px-2.5 py-1.5 text-[11.5px] font-medium whitespace-nowrap transition-[background-color,color,transform] duration-150 active:scale-[0.97] ${
              active
                ? 'bg-[var(--apple-surface-elevated)] text-[var(--apple-label-primary)] shadow-[0_1px_2px_rgba(0,0,0,0.08)]'
                : 'text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Interactive 3D Journal Book Studio Specimen for the Component Library.
 * Allows customizing cover color (Deep Brown, Fawn, Saddle Tan, Charcoal,
 * Oxblood, Forest, Navy, Raw Linen, or Custom Hex), cover grain, foil ink,
 * debossed frames, sticker styling, paper stock, page ruling, and copy,
 * then copying the exact JSON config to apply directly on the Homepage.
 */
export function InteractiveBookSpecimen() {
  const [config, setConfig] = useState<BookCustomizationConfig>(() => ({
    ...DEFAULT_BOOK_CUSTOMIZATION,
  }));
  const [debouncedConfig, setDebouncedConfig] = useState<BookCustomizationConfig>(config);
  const [stageBackdrop, setStageBackdrop] = useState<StageBackdrop>('auto');
  const [copiedJson, setCopiedJson] = useState(false);

  // Smooth debounce so text typing / custom color dragging never thrashes WebGL texture rebuilds
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedConfig(config);
    }, 180);
    return () => window.clearTimeout(timer);
  }, [config]);

  const updateField = <K extends keyof BookCustomizationConfig>(
    key: K,
    value: BookCustomizationConfig[K],
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleCopyJson = async () => {
    const payload = JSON.stringify(config, null, 2);
    try {
      await navigator.clipboard.writeText(payload);
      playSuccessChime();
      setCopiedJson(true);
      showToast({
        message: 'Copied book customization JSON',
        tone: 'success',
      });
      window.setTimeout(() => setCopiedJson(false), 2000);
    } catch {
      setCopiedJson(false);
    }
  };

  const handleReset = () => {
    playTick();
    setConfig({ ...DEFAULT_BOOK_CUSTOMIZATION });
  };

  const activePresetMeta =
    config.coverColor === 'custom'
      ? { label: `Custom (${config.customCoverHex.toUpperCase()})`, note: 'Custom hex bookbinding finish' }
      : BOOK_COVER_PRESETS.find((p) => p.id === config.coverColor) ?? BOOK_COVER_PRESETS[0];

  const stageBgClass =
    stageBackdrop === 'light'
      ? 'bg-[#faf8f6] text-[#181715]'
      : stageBackdrop === 'dark'
        ? 'bg-[#0b0b0d] text-[#f5f5f7]'
        : 'bg-[var(--apple-bg-secondary)]/65 text-[var(--apple-label-primary)]';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        {/* Live 3D Book Stage */}
        <div
          className={`relative flex min-h-[430px] flex-col items-center justify-between overflow-hidden rounded-[22px] border border-[var(--apple-separator-subtle)] p-5 transition-colors duration-200 xl:col-span-5 ${stageBgClass}`}
        >
          {/* Top bar: Active finish summary + Backdrop preview switcher */}
          <div className="flex w-full items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[12px] font-semibold tracking-[-0.01em]">
                {activePresetMeta.label}
              </p>
              <p className="truncate text-[11px] opacity-60">
                {activePresetMeta.note}
              </p>
            </div>

            <div
              role="radiogroup"
              aria-label="Preview stage surface"
              className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-black/10 bg-black/[0.04] p-0.5 dark:border-white/12 dark:bg-white/[0.06]"
            >
              {(
                [
                  { id: 'auto', label: 'Auto' },
                  { id: 'light', label: 'Light' },
                  { id: 'dark', label: 'Dark' },
                ] as const
              ).map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  role="radio"
                  aria-checked={stageBackdrop === mode.id}
                  onClick={() => {
                    playTick();
                    setStageBackdrop(mode.id);
                  }}
                  className={`cursor-pointer rounded-full px-2 py-0.5 text-[10.5px] font-medium transition-colors ${
                    stageBackdrop === mode.id
                      ? 'bg-[var(--apple-surface-elevated)] text-[var(--apple-label-primary)] shadow-2xs'
                      : 'opacity-65 hover:opacity-100'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive 3D Journal */}
          <div className="my-4 flex flex-1 items-center justify-center">
            <AboutJournalBook
              customization={debouncedConfig}
              caption=""
            />
          </div>

          <p className="text-center text-[11.5px] opacity-65">
            Hover to tilt · Click to open in full 3D spread &amp; flip pages
          </p>
        </div>

        {/* Bookbinding Customizer Controls */}
        <div className="flex flex-col justify-between gap-4 rounded-[22px] border border-[var(--apple-separator-subtle)] bg-[var(--apple-surface-elevated)] p-4 sm:p-5 xl:col-span-7">
          <div className="space-y-4">
            {/* 1. Cover Color Swatches + Custom Hex */}
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <label className="text-[11.5px] font-semibold tracking-[-0.006em] text-[var(--apple-label-primary)]">
                  Cover Shade
                </label>
                <span className="font-mono text-[11px] text-[var(--apple-label-tertiary)]">
                  {activePresetMeta.label}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
                {BOOK_COVER_PRESETS.map((preset) => {
                  const isActive = config.coverColor === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => {
                        playTick();
                        updateField('coverColor', preset.id);
                      }}
                      className={`group flex cursor-pointer items-center gap-2 rounded-[10px] border px-2 py-1.5 text-left transition-[background-color,border-color,transform] duration-150 active:scale-[0.97] ${
                        isActive
                          ? 'border-[var(--apple-blue)] bg-[var(--apple-blue)]/[0.08]'
                          : 'border-[var(--apple-separator-subtle)] bg-[var(--apple-bg-secondary)]/55 hover:border-[var(--apple-separator-strong)]'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full ring-1 ring-black/15 dark:ring-white/15"
                        style={{ backgroundColor: preset.swatch }}
                      >
                        {isActive && (
                          <span className="h-1.5 w-1.5 rounded-full bg-white shadow-xs" />
                        )}
                      </span>
                      <span className="truncate text-[11.5px] font-medium text-[var(--apple-label-primary)]">
                        {preset.label}
                      </span>
                    </button>
                  );
                })}

                {/* Custom Hex Swatch Picker */}
                <label
                  className={`flex cursor-pointer items-center gap-2 rounded-[10px] border px-2 py-1.5 transition-[background-color,border-color] duration-150 ${
                    config.coverColor === 'custom'
                      ? 'border-[var(--apple-blue)] bg-[var(--apple-blue)]/[0.08]'
                      : 'border-[var(--apple-separator-subtle)] bg-[var(--apple-bg-secondary)]/55 hover:border-[var(--apple-separator-strong)]'
                  }`}
                >
                  <input
                    type="color"
                    aria-label="Pick custom book cover color"
                    value={config.customCoverHex}
                    onChange={(e) => {
                      setConfig((prev) => ({
                        ...prev,
                        coverColor: 'custom',
                        customCoverHex: e.target.value,
                      }));
                    }}
                    className="h-4 w-4 shrink-0 cursor-pointer rounded-full border-0 bg-transparent p-0"
                  />
                  <span className="truncate text-[11.5px] font-medium text-[var(--apple-label-primary)]">
                    Custom
                  </span>
                </label>
              </div>
            </div>

            {/* 2. Material Grain + Foil Stamping */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="mb-1.5 text-[11.5px] font-semibold text-[var(--apple-label-primary)]">
                  Cover Material
                </p>
                <SegmentedRow
                  ariaLabel="Cover material grain"
                  value={config.coverTexture}
                  options={TEXTURE_OPTIONS}
                  onChange={(next) => updateField('coverTexture', next)}
                />
              </div>

              <div>
                <p className="mb-1.5 text-[11.5px] font-semibold text-[var(--apple-label-primary)]">
                  Foil &amp; Deboss Ink
                </p>
                <SegmentedRow
                  ariaLabel="Cover foil style"
                  value={config.foilStyle}
                  options={FOIL_OPTIONS}
                  onChange={(next) => updateField('foilStyle', next)}
                />
              </div>
            </div>

            {/* 3. Cover Frame + Size */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="mb-1.5 text-[11.5px] font-semibold text-[var(--apple-label-primary)]">
                  Cover Embossing Frame
                </p>
                <SegmentedRow
                  ariaLabel="Cover border frame"
                  value={config.coverFrame}
                  options={FRAME_OPTIONS}
                  onChange={(next) => updateField('coverFrame', next)}
                />
              </div>

              <div>
                <p className="mb-1.5 text-[11.5px] font-semibold text-[var(--apple-label-primary)]">
                  Book Scale
                </p>
                <SegmentedRow
                  ariaLabel="Book size"
                  value={config.collapsedWidth}
                  options={SIZE_OPTIONS.map((o) => ({ id: o.value, label: o.label }))}
                  onChange={(next) => updateField('collapsedWidth', next)}
                />
              </div>
            </div>

            {/* 4. Paper Stock + Interior Page Ruling */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="mb-1.5 text-[11.5px] font-semibold text-[var(--apple-label-primary)]">
                  Paper Stock
                </p>
                <div
                  role="radiogroup"
                  aria-label="Paper stock tone"
                  className="flex gap-1 rounded-[12px] border border-[var(--apple-separator-subtle)] bg-[var(--apple-bg-secondary)]/85 p-1"
                >
                  {PAPER_OPTIONS.map((opt) => {
                    const active = config.paperTone === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => {
                          if (!active) {
                            playTick();
                            updateField('paperTone', opt.id);
                          }
                        }}
                        className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[8px] px-2 py-1.5 text-[11px] font-medium whitespace-nowrap transition-[background-color,color] duration-150 ${
                          active
                            ? 'bg-[var(--apple-surface-elevated)] text-[var(--apple-label-primary)] shadow-[0_1px_2px_rgba(0,0,0,0.08)]'
                            : 'text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className="h-3 w-3 shrink-0 rounded-full border border-black/15"
                          style={{ backgroundColor: opt.swatch }}
                        />
                        <span>{opt.label.split(' ')[1] ?? opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-[11.5px] font-semibold text-[var(--apple-label-primary)]">
                  Page Ruling
                </p>
                <SegmentedRow
                  ariaLabel="Interior page ruling"
                  value={config.pageRuling}
                  options={RULING_OPTIONS}
                  onChange={(next) => updateField('pageRuling', next)}
                />
              </div>
            </div>

            {/* 5. Cover Name Sticker Controls */}
            <div className="rounded-[14px] border border-[var(--apple-separator-subtle)] bg-[var(--apple-bg-secondary)]/50 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={config.showSticker}
                    onClick={() => {
                      playTick();
                      updateField('showSticker', !config.showSticker);
                    }}
                    className={`relative inline-flex h-[20px] w-[36px] shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${
                      config.showSticker
                        ? 'bg-[var(--apple-blue)]'
                        : 'bg-[var(--apple-separator-strong)]'
                    }`}
                  >
                    <span
                      className={`inline-block h-[16px] w-[16px] rounded-full bg-white shadow-xs transition-transform duration-200 ${
                        config.showSticker ? 'translate-x-[18px]' : 'translate-x-[2px]'
                      }`}
                    />
                  </button>
                  <span className="text-[12px] font-semibold text-[var(--apple-label-primary)]">
                    Name Sticker
                  </span>
                </div>

                {config.showSticker && (
                  <div className="flex items-center gap-1.5">
                    {(Object.keys(BOOK_STICKER_ACCENTS) as BookStickerAccent[]).map(
                      (accentId) => {
                        const accent = BOOK_STICKER_ACCENTS[accentId];
                        const active = config.stickerAccent === accentId;
                        return (
                          <button
                            key={accentId}
                            type="button"
                            title={accent.label}
                            aria-label={`Sticker color ${accent.label}`}
                            aria-pressed={active}
                            onClick={() => {
                              playTick();
                              updateField('stickerAccent', accentId);
                            }}
                            className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95"
                            style={{
                              backgroundColor: accent.hex,
                              boxShadow: active
                                ? `0 0 0 1.5px var(--apple-surface-elevated), 0 0 0 3px ${accent.hex}`
                                : 'inset 0 1px 1px rgba(0,0,0,0.2)',
                            }}
                          >
                            {active && (
                              <span className="h-1.5 w-1.5 rounded-full bg-white" />
                            )}
                          </button>
                        );
                      },
                    )}
                  </div>
                )}
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="book-sticker-name"
                    className="mb-1 block text-[11px] font-medium text-[var(--apple-label-secondary)]"
                  >
                    {config.showSticker ? 'Sticker Name' : 'Cover Monogram'}
                  </label>
                  <input
                    id="book-sticker-name"
                    type="text"
                    maxLength={22}
                    value={config.stickerName}
                    onChange={(e) => updateField('stickerName', e.target.value)}
                    className="w-full rounded-[9px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-2.5 py-1.5 text-[12.5px] text-[var(--apple-label-primary)] outline-none focus:border-[var(--apple-blue)]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="book-cover-caption"
                    className="mb-1 block text-[11px] font-medium text-[var(--apple-label-secondary)]"
                  >
                    Cover Title / Caption
                  </label>
                  <input
                    id="book-cover-caption"
                    type="text"
                    maxLength={32}
                    value={config.coverCaption}
                    onChange={(e) => updateField('coverCaption', e.target.value)}
                    className="w-full rounded-[9px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-2.5 py-1.5 text-[12.5px] text-[var(--apple-label-primary)] outline-none focus:border-[var(--apple-blue)]"
                  />
                </div>
              </div>

              {config.showSticker && (
                <div className="mt-2.5 flex items-center gap-3">
                  <label
                    htmlFor="book-sticker-tilt"
                    className="shrink-0 text-[11px] font-medium text-[var(--apple-label-secondary)]"
                  >
                    Sticker Tilt
                  </label>
                  <input
                    id="book-sticker-tilt"
                    type="range"
                    min={-8}
                    max={8}
                    step={0.5}
                    value={config.stickerRotation}
                    onChange={(e) =>
                      updateField('stickerRotation', Number(e.target.value))
                    }
                    className="h-1.5 flex-1 cursor-pointer accent-[var(--apple-blue)]"
                  />
                  <span className="w-9 text-right font-mono text-[11px] tabular-nums text-[var(--apple-label-tertiary)]">
                    {config.stickerRotation > 0 ? '+' : ''}
                    {config.stickerRotation}°
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Export / Copy Config Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-[var(--apple-separator-subtle)] pt-3.5">
            <p className="text-[11.5px] text-[var(--apple-label-tertiary)]">
              Copy JSON to apply this exact finish on the Home &amp; About pages.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] px-3 py-1.5 text-[12px] font-medium text-[var(--apple-label-secondary)] transition-colors hover:text-[var(--apple-label-primary)] active:scale-[0.97]"
              >
                <RotateCcw size={12.5} strokeWidth={1.8} aria-hidden="true" />
                <span>Reset</span>
              </button>
              <button
                type="button"
                onClick={handleCopyJson}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[var(--apple-blue-fill)] px-3.5 py-1.5 text-[12px] font-medium text-white transition-[opacity,transform] hover:opacity-92 active:scale-[0.97]"
              >
                {copiedJson ? (
                  <>
                    <Check size={13} strokeWidth={2.2} aria-hidden="true" />
                    <span>Copied JSON</span>
                  </>
                ) : (
                  <>
                    <Copy size={12.5} strokeWidth={1.85} aria-hidden="true" />
                    <span>Copy Config</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InteractiveBookSpecimen;
