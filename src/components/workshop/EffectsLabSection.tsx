import { useMemo, useState, type CSSProperties } from 'react';
import { PROJECTS } from '../../data/projects';
import type { ResolvedTheme } from '../../utils/appearance';
import { prefersReducedMotion } from '../../utils/scroll';
import { playSuccessChime, playTick } from '../../utils/soundEngine';
import {
  EFFECT_TRACKS,
  type DecisionStatus,
  type EffectTrackConfig,
  type EffectTrackDefinition,
  type EffectTrackId,
  type VisualPaletteId,
} from '../../utils/workshopStore';
import { ProjectCard } from '../ProjectCard';
import { AudioPlayer } from '../AudioPlayer';
import { CaseStudyPrototype } from '../CaseStudyPrototypes';
import {
  SFCheckmark,
  SFDisplay,
  SFReset,
  SFiPhone,
} from '../SFSymbols';

interface EffectsLabSectionProps {
  sandboxPalette: VisualPaletteId;
  sandboxTheme: ResolvedTheme;
  activeTrackId: EffectTrackId;
  onSelectTrackId: (id: EffectTrackId) => void;
  effectsConfig: Record<EffectTrackId, EffectTrackConfig>;
  onUpdateTrackConfig: (trackId: EffectTrackId, next: EffectTrackConfig) => void;
  onResetTrackConfig: (trackId: EffectTrackId) => void;
  onLogDecision: (payload: {
    subjectType: 'effect-track';
    subjectId: string;
    trackId: EffectTrackId;
    title: string;
    variantLabel: string;
    status: DecisionStatus;
    parameters: Record<string, string | number | boolean>;
    rationale: string;
  }) => void;
  onNavigate: (path: string) => void;
}

type PreviewComponentKind = 'card' | 'audio' | 'prototype' | 'editorial';

const SAMPLE_AUDIO_SEGMENTS = [
  {
    id: 'fx-seg-1',
    num: '01',
    title: 'Surface Calibration',
    text: 'Experimental visual effects remain strictly isolated inside the private Design Workshop preview stage.',
  },
  {
    id: 'fx-seg-2',
    num: '02',
    title: 'Approval Workflow',
    text: 'Approved treatments are captured in the Decision Log for intentional promotion into shared CSS tokens.',
  },
];

/**
 * Generates SVG procedural noise data URI locally (zero external asset requests).
 */
function buildGrainDataUri(variantId: string): string {
  const baseFreq =
    variantId === 'ceramic-matte'
      ? '0.92'
      : variantId === 'warm-fiber'
        ? '0.52'
        : '0.78';
  const octaves = variantId === 'warm-fiber' ? '2' : '3';
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='${baseFreq}' numOctaves='${octaves}' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='1'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/**
 * Computes strictly local inline CSS for the experimental stage ONLY.
 * Never mutates global CSS variables, :root, or public pages.
 */
function computeExperimentalVisuals(
  track: EffectTrackDefinition,
  config: EffectTrackConfig,
  theme: ResolvedTheme,
  palette: VisualPaletteId,
  reducedMotion: boolean,
): {
  stageStyle: CSSProperties;
  overlayStyle: CSSProperties | null;
  surfaceFrameStyle: CSSProperties;
  parallaxOffsetPx: number;
  blurBarStyle: CSSProperties | null;
} {
  if (!config.enabled) {
    return {
      stageStyle: {},
      overlayStyle: null,
      surfaceFrameStyle: {},
      parallaxOffsetPx: 0,
      blurBarStyle: null,
    };
  }

  const isDark = theme === 'dark';
  const isWarm = palette === 'warm';

  switch (track.id) {
    case 'organic-texture': {
      const opacity = config.intensity / 100;
      return {
        stageStyle: {},
        overlayStyle: {
          backgroundImage: buildGrainDataUri(config.variantId),
          backgroundSize: `${config.secondary}px ${config.secondary}px`,
          opacity,
          mixBlendMode: isDark ? 'screen' : 'multiply',
        },
        surfaceFrameStyle: {},
        parallaxOffsetPx: 0,
        blurBarStyle: null,
      };
    }

    case 'screen-edge-glow': {
      const alpha = config.intensity / 100;
      const spread = config.secondary;
      let bg = '';
      if (config.variantId === 'top-specular') {
        const tint = isDark
          ? `rgba(255, 255, 255, ${(alpha * 0.55).toFixed(3)})`
          : isWarm
            ? `rgba(218, 198, 168, ${(alpha * 0.85).toFixed(3)})`
            : `rgba(148, 163, 184, ${(alpha * 0.7).toFixed(3)})`;
        bg = `radial-gradient(110% ${spread}% at 50% 0%, ${tint}, transparent 76%)`;
      } else if (config.variantId === 'perimeter-frame') {
        const edge = isDark
          ? `rgba(0, 0, 0, ${(alpha * 1.9).toFixed(3)})`
          : `rgba(29, 29, 31, ${(alpha * 0.6).toFixed(3)})`;
        return {
          stageStyle: {},
          overlayStyle: {
            boxShadow: `inset 0 0 ${Math.round(spread * 1.6)}px ${edge}`,
          },
          surfaceFrameStyle: {},
          parallaxOffsetPx: 0,
          blurBarStyle: null,
        };
      } else {
        const blue = isDark
          ? `rgba(10, 132, 255, ${(alpha * 0.85).toFixed(3)})`
          : `rgba(0, 113, 227, ${(alpha * 0.65).toFixed(3)})`;
        bg = `radial-gradient(95% ${spread}% at 50% 0%, ${blue}, transparent 74%)`;
      }
      return {
        stageStyle: {},
        overlayStyle: { backgroundImage: bg },
        surfaceFrameStyle: {},
        parallaxOffsetPx: 0,
        blurBarStyle: null,
      };
    }

    case 'directional-gradient': {
      const alpha = config.intensity / 100;
      const angle = config.secondary;
      const tintA = isDark
        ? `rgba(255, 255, 255, ${(alpha * 0.4).toFixed(3)})`
        : isWarm
          ? `rgba(214, 202, 184, ${(alpha * 1.15).toFixed(3)})`
          : `rgba(205, 213, 226, ${(alpha * 0.95).toFixed(3)})`;
      const tintB = isDark
        ? `rgba(10, 132, 255, ${(alpha * 0.35).toFixed(3)})`
        : `rgba(0, 113, 227, ${(alpha * 0.35).toFixed(3)})`;

      const backgroundImage =
        config.variantId === 'radial-halo'
          ? `radial-gradient(85% 70% at 72% 18%, ${tintB}, transparent 68%), linear-gradient(${angle}deg, ${tintA}, transparent 65%)`
          : config.variantId === 'horizon-wash'
            ? `linear-gradient(180deg, transparent 42%, ${tintA} 100%)`
            : `linear-gradient(${angle}deg, ${tintA} 0%, transparent 62%)`;

      return {
        stageStyle: { backgroundImage },
        overlayStyle: null,
        surfaceFrameStyle: {},
        parallaxOffsetPx: 0,
        blurBarStyle: null,
      };
    }

    case 'backdrop-blur': {
      const blurPx = config.intensity;
      const bgAlpha = config.secondary / 100;
      const rgb = isDark
        ? isWarm
          ? '33, 31, 27'
          : '28, 28, 32'
        : isWarm
          ? '254, 253, 249'
          : '255, 255, 255';
      return {
        stageStyle: {},
        overlayStyle: null,
        surfaceFrameStyle: {},
        parallaxOffsetPx: 0,
        blurBarStyle: {
          backgroundColor: `rgba(${rgb}, ${bgAlpha.toFixed(2)})`,
          backdropFilter: `saturate(180%) blur(${blurPx}px)`,
          WebkitBackdropFilter: `saturate(180%) blur(${blurPx}px)`,
        },
      };
    }

    case 'subtle-parallax': {
      if (reducedMotion) {
        return {
          stageStyle: {},
          overlayStyle: null,
          surfaceFrameStyle: {},
          parallaxOffsetPx: 0,
          blurBarStyle: null,
        };
      }
      const normalized = (config.secondary - 50) / 50; // -1..1
      const multiplier =
        config.variantId === 'ambient-plate'
          ? 0.6
          : config.variantId === 'caption-parallax'
            ? 0.85
            : 1;
      const offset = Math.round(normalized * config.intensity * multiplier);
      return {
        stageStyle: {},
        overlayStyle: null,
        surfaceFrameStyle: {},
        parallaxOffsetPx: offset,
        blurBarStyle: null,
      };
    }

    case 'layered-shadows': {
      const scale = config.intensity / 100;
      const lift = config.secondary;
      const shadowColor = isDark ? '0, 0, 0' : isWarm ? '44, 36, 24' : '15, 18, 24';
      const ringColor = isDark
        ? 'rgba(255, 255, 255, 0.11)'
        : 'rgba(0, 0, 0, 0.055)';
      const topSpec = isDark
        ? 'rgba(255, 255, 255, 0.09)'
        : 'rgba(255, 255, 255, 0.92)';

      let boxShadow = '';
      if (config.variantId === 'contact-crisp') {
        boxShadow = `inset 0 1px 0 ${topSpec}, 0 0 0 0.5px ${ringColor}, 0 1px 2px rgba(${shadowColor}, ${(0.08 * scale).toFixed(3)}), 0 ${Math.round(lift * 0.45)}px ${Math.round(lift * 1.1)}px -2px rgba(${shadowColor}, ${(0.07 * scale).toFixed(3)})`;
      } else if (config.variantId === 'floating-sheet') {
        boxShadow = `inset 0 1px 0 ${topSpec}, 0 0 0 0.5px ${ringColor}, 0 ${Math.round(lift * 0.4)}px ${Math.round(lift)}px -4px rgba(${shadowColor}, ${(0.1 * scale).toFixed(3)}), 0 ${lift}px ${Math.round(lift * 2.5)}px -12px rgba(${shadowColor}, ${(0.18 * scale).toFixed(3)})`;
      } else {
        boxShadow = `inset 0 1px 0 ${topSpec}, 0 0 0 0.5px ${ringColor}, 0 2px 6px rgba(${shadowColor}, ${(0.05 * scale).toFixed(3)}), 0 ${Math.round(lift * 0.65)}px ${Math.round(lift * 1.7)}px -6px rgba(${shadowColor}, ${(0.09 * scale).toFixed(3)}), 0 ${Math.round(lift * 1.35)}px ${Math.round(lift * 2.8)}px -16px rgba(${shadowColor}, ${(0.11 * scale).toFixed(3)})`;
      }

      return {
        stageStyle: {},
        overlayStyle: null,
        surfaceFrameStyle: { boxShadow },
        parallaxOffsetPx: 0,
        blurBarStyle: null,
      };
    }

    case 'borders-hairlines': {
      const borderAlpha = config.intensity / 100;
      const specAlpha = (config.secondary / 100) * (isDark ? 0.22 : 0.95);
      const borderRgb = isDark
        ? isWarm
          ? '244, 238, 226'
          : '255, 255, 255'
        : isWarm
          ? '46, 38, 24'
          : '0, 0, 0';
      const specColor = `rgba(255, 255, 255, ${specAlpha.toFixed(3)})`;

      if (config.variantId === 'top-specular-bevel') {
        return {
          stageStyle: {},
          overlayStyle: null,
          surfaceFrameStyle: {
            border: `1px solid rgba(${borderRgb}, ${borderAlpha.toFixed(3)})`,
            boxShadow: `inset 0 1px 0 ${specColor}, 0 8px 24px -10px rgba(0,0,0,${isDark ? '0.5' : '0.08'})`,
          },
          parallaxOffsetPx: 0,
          blurBarStyle: null,
        };
      }
      if (config.variantId === 'inset-recess') {
        return {
          stageStyle: {},
          overlayStyle: null,
          surfaceFrameStyle: {
            border: `1px solid rgba(${borderRgb}, ${borderAlpha.toFixed(3)})`,
            boxShadow: `inset 0 0 0 3px rgba(${borderRgb}, ${(borderAlpha * 0.28).toFixed(3)}), inset 0 1px 0 ${specColor}`,
          },
          parallaxOffsetPx: 0,
          blurBarStyle: null,
        };
      }
      return {
        stageStyle: {},
        overlayStyle: null,
        surfaceFrameStyle: {
          border: `1px solid rgba(${borderRgb}, ${borderAlpha.toFixed(3)})`,
          boxShadow: 'none',
        },
        parallaxOffsetPx: 0,
        blurBarStyle: null,
      };
    }
  }
}

export function EffectsLabSection({
  sandboxPalette,
  sandboxTheme,
  activeTrackId,
  onSelectTrackId,
  effectsConfig,
  onUpdateTrackConfig,
  onResetTrackConfig,
  onLogDecision,
  onNavigate,
}: EffectsLabSectionProps) {
  const [compareMode, setCompareMode] = useState<'side-by-side' | 'focused'>('side-by-side');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>('desktop');
  const [previewComponent, setPreviewComponent] = useState<PreviewComponentKind>('card');
  const [rationale, setRationale] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const reducedMotion = prefersReducedMotion();
  const activeTrack =
    EFFECT_TRACKS.find((t) => t.id === activeTrackId) ?? EFFECT_TRACKS[0];
  const config = effectsConfig[activeTrack.id];
  const activeVariant =
    activeTrack.variants.find((v) => v.id === config.variantId) ??
    activeTrack.variants[0];

  const experimental = useMemo(
    () =>
      computeExperimentalVisuals(
        activeTrack,
        config,
        sandboxTheme,
        sandboxPalette,
        reducedMotion,
      ),
    [activeTrack, config, sandboxTheme, sandboxPalette, reducedMotion],
  );

  const handleVariantSelect = (variantId: string) => {
    const chosen = activeTrack.variants.find((v) => v.id === variantId);
    if (!chosen) return;
    playTick();
    onUpdateTrackConfig(activeTrack.id, {
      enabled: true,
      variantId: chosen.id,
      intensity: chosen.defaults.intensity,
      secondary: chosen.defaults.secondary,
    });
  };

  const handleRecordStatus = (status: DecisionStatus) => {
    playSuccessChime();
    onLogDecision({
      subjectType: 'effect-track',
      subjectId: activeTrack.id,
      trackId: activeTrack.id,
      title: activeTrack.title,
      variantLabel: activeVariant.label,
      status,
      parameters: {
        enabled: config.enabled,
        variant: activeVariant.id,
        [activeTrack.primarySliderLabel]: `${config.intensity}${activeTrack.primaryUnit}`,
        [activeTrack.secondarySliderLabel]: `${config.secondary}${activeTrack.secondaryUnit}`,
      },
      rationale:
        rationale.trim() ||
        `${activeVariant.label} evaluated against ${activeTrack.baselineLabel} (${activeTrack.primarySliderLabel}: ${config.intensity}${activeTrack.primaryUnit}).`,
    });
    setFeedback(
      `Saved "${activeVariant.label}" as ${status === 'promoted' ? 'Promoted to Production' : status} in Decision Log. Public portfolio CSS remains unchanged.`,
    );
    window.setTimeout(() => setFeedback(null), 3500);
  };

  const renderSpecimen = (isExperimental: boolean) => {
    const frameStyle = isExperimental ? experimental.surfaceFrameStyle : {};
    const parallaxOffset = isExperimental ? experimental.parallaxOffsetPx : 0;

    return (
      <div
        data-ds-sandbox="true"
        data-ds-palette={sandboxPalette}
        data-ds-theme={sandboxTheme}
        style={isExperimental ? experimental.stageStyle : undefined}
        className="relative overflow-hidden rounded-[24px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] p-5 sm:p-6"
      >
        {/* Experimental overlay layer (grain / perimeter wash) */}
        {isExperimental && experimental.overlayStyle && (
          <div
            aria-hidden="true"
            style={experimental.overlayStyle}
            className="pointer-events-none absolute inset-0 z-10 rounded-[24px]"
          />
        )}

        {/* Stage Label */}
        <div className="relative z-20 mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[12px]">
            <span
              className={`font-semibold ${
                isExperimental
                  ? 'text-[var(--apple-link)]'
                  : 'text-[var(--apple-label-primary)]'
              }`}
            >
              {isExperimental ? `NOT LIVE · ${activeVariant.label}` : `Production Baseline · ${activeTrack.baselineLabel}`}
            </span>
          </div>
          <span className="type-caption font-normal tabular-nums text-[var(--apple-label-tertiary)]">
            {isExperimental
              ? config.enabled
                ? `${config.intensity}${activeTrack.primaryUnit} · ${config.secondary}${activeTrack.secondaryUnit}`
                : 'Disabled (matches baseline)'
              : 'Live Portfolio'}
          </span>
        </div>

        {/* Optional Backdrop Blur floating bar overlay when Track 4 is active */}
        {activeTrack.id === 'backdrop-blur' && (
          <div className="relative z-20 mb-4">
            <div
              style={
                isExperimental && experimental.blurBarStyle
                  ? experimental.blurBarStyle
                  : undefined
              }
              className={`flex items-center justify-between rounded-[18px] border border-[var(--apple-separator)] px-4 py-3 ${
                !isExperimental || !config.enabled
                  ? 'bg-[var(--apple-surface-elevated)] shadow-[var(--shadow-apple-subtle)]'
                  : 'shadow-[var(--shadow-apple-ios-bar)]'
              }`}
            >
              <span className="type-footnote font-semibold text-[var(--apple-label-primary)]">
                Sticky Control Material Preview
              </span>
              <span className="type-caption tabular-nums text-[var(--apple-label-secondary)]">
                {isExperimental && config.enabled
                  ? `blur(${config.intensity}px) · ${config.secondary}%`
                  : 'Opaque baseline'}
              </span>
            </div>
          </div>
        )}

        {/* Viewport Container (Desktop vs Mobile 375px) */}
        <div
          className="relative z-20 mx-auto w-full transition-[max-width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            maxWidth: viewportMode === 'mobile' ? '345px' : '100%',
          }}
        >
          {previewComponent === 'card' && (
            <div
              style={frameStyle}
              className="overflow-hidden rounded-[24px] bg-[var(--apple-surface-elevated)]"
            >
              <div className="overflow-hidden">
                <div
                  style={
                    parallaxOffset !== 0
                      ? {
                          transform: `translate3d(0, ${parallaxOffset}px, 0) scale(1.06)`,
                          transition: 'transform 180ms ease-out',
                        }
                      : undefined
                  }
                >
                  <ProjectCard
                    project={PROJECTS[0]}
                    onNavigate={onNavigate}
                    variant="standard"
                    index={0}
                    mediaClassName="aspect-[16/10]"
                  />
                </div>
              </div>
            </div>
          )}

          {previewComponent === 'audio' && (
            <div
              style={frameStyle}
              className="rounded-[24px] bg-[var(--apple-surface-elevated)] p-2"
            >
              <AudioPlayer
                title="Surface Study Narration"
                segments={SAMPLE_AUDIO_SEGMENTS}
              />
            </div>
          )}

          {previewComponent === 'prototype' && (
            <div
              style={frameStyle}
              className="overflow-hidden rounded-[28px]"
            >
              <CaseStudyPrototype kind="mycroharvest" />
            </div>
          )}

          {previewComponent === 'editorial' && (
            <div
              style={frameStyle}
              className="rounded-[24px] bg-[var(--apple-surface-elevated)] p-6 sm:p-7"
            >
              <p className="type-caption text-[var(--apple-link)]">
                02 · Editorial Surface Specimen
              </p>
              <h4
                style={
                  parallaxOffset !== 0
                    ? {
                        transform: `translate3d(0, ${Math.round(parallaxOffset * -0.4)}px, 0)`,
                        transition: 'transform 180ms ease-out',
                      }
                    : undefined
                }
                className="type-title-3 mt-2 text-[var(--apple-label-primary)]"
              >
                Restraint makes visual nuance legible.
              </h4>
              <p className="type-callout mt-2.5 text-[var(--apple-label-secondary)]">
                Evaluate whether this surface treatment adds quiet physical poise without distracting from case study prose or photography.
              </p>
              <div className="mt-5 flex items-center gap-2.5 border-t border-[var(--apple-separator-subtle)] pt-4">
                <button
                  type="button"
                  onClick={() => playTick()}
                  className="apple-btn-primary !min-h-[34px] !px-4 !py-1 !text-[13px]"
                >
                  Inspect Case Study
                </button>
                <button
                  type="button"
                  onClick={() => playTick()}
                  className="apple-btn-tonal !min-h-[34px] !px-3.5 !py-1 !text-[13px]"
                >
                  Copy Link
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="type-caption text-[var(--apple-link)]">
            P1.3 · Isolated Surface &amp; Effects Exploration Lab
          </p>
          <h2 className="type-title-2 mt-1.5">
            Explore, compare, and calibrate visual treatments safely.
          </h2>
          <p className="type-callout measure-prose mt-2">
            Every slider and experimental preview below is strictly sandboxed inside <code className="font-mono text-[13px]">/design-system</code>. Nothing here modifies the live public portfolio.
          </p>
        </div>

        {/* Comparison & Viewport Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="apple-segmented" role="group" aria-label="Comparison layout">
            {(
              [
                { id: 'side-by-side', label: 'Side-by-Side' },
                { id: 'focused', label: 'Experimental Only' },
              ] as const
            ).map((mode) => {
              const active = compareMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    playTick();
                    setCompareMode(mode.id);
                  }}
                  className={`apple-segmented-item !min-h-[32px] px-3.5 text-[12.5px] ${
                    active
                      ? 'apple-pill-shadow bg-[var(--apple-control-thumb)] text-[var(--apple-label-primary)]'
                      : 'text-[var(--apple-label-secondary)]'
                  }`}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>

          <div className="apple-segmented" role="group" aria-label="Preview viewport size">
            {(
              [
                { id: 'desktop', label: 'Desktop', icon: SFDisplay },
                { id: 'mobile', label: 'Mobile', icon: SFiPhone },
              ] as const
            ).map((vp) => {
              const active = viewportMode === vp.id;
              const Icon = vp.icon;
              return (
                <button
                  key={vp.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    playTick();
                    setViewportMode(vp.id);
                  }}
                  className={`apple-segmented-item !min-h-[32px] px-3 text-[12.5px] ${
                    active
                      ? 'apple-pill-shadow bg-[var(--apple-control-thumb)] text-[var(--apple-label-primary)]'
                      : 'text-[var(--apple-label-secondary)]'
                  }`}
                >
                  <Icon size={13} />
                  <span>{vp.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 7 Exploration Track Selector Rail */}
      <div
        role="tablist"
        aria-label="Seven surface and effects exploration tracks"
        className="flex flex-wrap gap-2"
      >
        {EFFECT_TRACKS.map((track) => {
          const active = track.id === activeTrack.id;
          return (
            <button
              key={track.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                playTick();
                onSelectTrackId(track.id);
              }}
              className={`inline-flex min-h-[38px] items-center gap-2 rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors ${
                active
                  ? 'border-[var(--apple-blue-fill)] bg-[var(--apple-blue-fill)] text-white'
                  : 'border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
              }`}
            >
              <span className="tabular-nums opacity-75">{track.order}</span>
              <span>{track.shortTitle}</span>
            </button>
          );
        })}
      </div>

      {/* Active Track Controls + Live Stage */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Control Panel */}
        <aside className="space-y-6 rounded-[24px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-6 lg:col-span-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="type-caption text-[var(--apple-link)]">
                Track {activeTrack.order} · NOT LIVE
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-pressed={config.enabled}
                  onClick={() => {
                    playTick();
                    onUpdateTrackConfig(activeTrack.id, {
                      ...config,
                      enabled: !config.enabled,
                    });
                  }}
                  className={
                    config.enabled
                      ? 'apple-btn-tonal !min-h-[28px] !px-2.5 !py-0.5 !text-[12px]'
                      : 'apple-btn-outline !min-h-[28px] !px-2.5 !py-0.5 !text-[12px]'
                  }
                >
                  {config.enabled ? 'Enabled' : 'Disabled'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playTick();
                    onResetTrackConfig(activeTrack.id);
                  }}
                  aria-label={`Reset ${activeTrack.title}`}
                  title="Reset track to default parameters"
                  className="apple-btn-icon h-7 w-7 bg-[var(--apple-bg-secondary)] text-[var(--apple-label-secondary)]"
                >
                  <SFReset size={13} />
                </button>
              </div>
            </div>

            <h3 className="type-title-3 mt-2 text-[var(--apple-label-primary)]">
              {activeTrack.title}
            </h3>
            <p className="type-footnote mt-1.5 font-normal text-[var(--apple-label-secondary)]">
              {activeTrack.summary}
            </p>
          </div>

          {activeTrack.respectsReducedMotion && reducedMotion && (
            <div
              role="note"
              className="rounded-[14px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] px-3.5 py-2.5 text-[12.5px] text-[var(--apple-label-secondary)]"
            >
              <strong className="font-semibold text-[var(--apple-label-primary)]">
                prefers-reduced-motion is active:
              </strong>{' '}
              Parallax displacement is automatically neutralized to 0px.
            </div>
          )}

          {/* Tasteful Alternative Selector */}
          <div className="space-y-2 border-t border-[var(--apple-separator-subtle)] pt-5">
            <p className="type-caption text-[var(--apple-label-tertiary)]">
              Candidate Treatments
            </p>
            {activeTrack.variants.map((variant) => {
              const selected = variant.id === config.variantId;
              return (
                <button
                  key={variant.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => handleVariantSelect(variant.id)}
                  className={`flex w-full flex-col rounded-[16px] border p-3.5 text-left transition-colors ${
                    selected
                      ? 'border-[var(--apple-blue)] bg-[var(--apple-blue)]/[0.06]'
                      : 'border-[var(--apple-separator-subtle)] bg-[var(--apple-bg-secondary)] hover:border-[var(--apple-separator-strong)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13.5px] font-semibold text-[var(--apple-label-primary)]">
                      {variant.label}
                    </span>
                    {selected && (
                      <SFCheckmark size={13} className="text-[var(--apple-blue)]" />
                    )}
                  </div>
                  <span className="type-footnote mt-1 font-normal text-[var(--apple-label-secondary)]">
                    {variant.description}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Interactive Intensity & Secondary Sliders */}
          <div className="space-y-4 border-t border-[var(--apple-separator-subtle)] pt-5">
            <div>
              <div className="flex items-center justify-between text-[13px]">
                <label
                  htmlFor={`slider-primary-${activeTrack.id}`}
                  className="font-medium text-[var(--apple-label-primary)]"
                >
                  {activeTrack.primarySliderLabel}
                </label>
                <span className="font-mono tabular-nums text-[var(--apple-link)]">
                  {config.intensity}
                  {activeTrack.primaryUnit}
                </span>
              </div>
              <input
                id={`slider-primary-${activeTrack.id}`}
                type="range"
                min={activeTrack.primaryMin}
                max={activeTrack.primaryMax}
                step={activeTrack.primaryStep}
                value={config.intensity}
                disabled={!config.enabled}
                onChange={(e) =>
                  onUpdateTrackConfig(activeTrack.id, {
                    ...config,
                    intensity: Number(e.target.value),
                  })
                }
                className="mt-2 w-full accent-[var(--apple-blue)]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-[13px]">
                <label
                  htmlFor={`slider-secondary-${activeTrack.id}`}
                  className="font-medium text-[var(--apple-label-primary)]"
                >
                  {activeTrack.secondarySliderLabel}
                </label>
                <span className="font-mono tabular-nums text-[var(--apple-link)]">
                  {config.secondary}
                  {activeTrack.secondaryUnit}
                </span>
              </div>
              <input
                id={`slider-secondary-${activeTrack.id}`}
                type="range"
                min={activeTrack.secondaryMin}
                max={activeTrack.secondaryMax}
                step={activeTrack.secondaryStep}
                value={config.secondary}
                disabled={!config.enabled}
                onChange={(e) =>
                  onUpdateTrackConfig(activeTrack.id, {
                    ...config,
                    secondary: Number(e.target.value),
                  })
                }
                className="mt-2 w-full accent-[var(--apple-blue)]"
              />
            </div>
          </div>

          {/* Preview Component Switcher */}
          <div className="border-t border-[var(--apple-separator-subtle)] pt-5">
            <p className="type-caption mb-2 text-[var(--apple-label-tertiary)]">
              Production Specimen
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'card', label: 'Case Card' },
                  { id: 'editorial', label: 'Editorial Surface' },
                  { id: 'audio', label: 'AudioPlayer' },
                  { id: 'prototype', label: 'Prototype' },
                ] as const
              ).map((comp) => {
                const active = previewComponent === comp.id;
                return (
                  <button
                    key={comp.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      playTick();
                      setPreviewComponent(comp.id);
                    }}
                    className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
                      active
                        ? 'bg-[var(--apple-label-primary)] text-[var(--apple-bg)]'
                        : 'bg-[var(--apple-bg-secondary)] text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                    }`}
                  >
                    {comp.label}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Live Comparison Stage + Approval Workflow Bar */}
        <div className="space-y-5 lg:col-span-8">
          <div
            className={
              compareMode === 'side-by-side'
                ? 'grid grid-cols-1 gap-5 xl:grid-cols-2'
                : 'grid grid-cols-1'
            }
          >
            {compareMode === 'side-by-side' && renderSpecimen(false)}
            {renderSpecimen(true)}
          </div>

          {/* P1.4 Direct Visual Approval Bar */}
          <div className="rounded-[22px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="type-caption text-[var(--apple-link)]">
                Approval Workflow · EXPLORE → COMPARE → APPROVE / REJECT → IMPLEMENT
              </p>
              <span className="type-footnote font-normal text-[var(--apple-label-tertiary)]">
                Context: {sandboxPalette === 'cool' ? 'Cool' : 'Warm'} · {sandboxTheme}
              </span>
            </div>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="text"
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                placeholder={`Rationale for ${activeVariant.label} (optional)…`}
                aria-label="Decision rationale note"
                className="apple-input min-h-[40px] flex-1 rounded-[12px] px-3.5 py-2 text-[14px]"
              />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRecordStatus('exploring')}
                  className="apple-btn-tonal !min-h-[38px] !px-3.5 !py-1.5 !text-[12.5px]"
                >
                  Log Exploring
                </button>
                <button
                  type="button"
                  onClick={() => handleRecordStatus('approved')}
                  className="apple-btn-primary !min-h-[38px] !px-4 !py-1.5 !text-[12.5px]"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => handleRecordStatus('rejected')}
                  className="apple-btn-outline !min-h-[38px] !px-3.5 !py-1.5 !text-[12.5px]"
                >
                  Reject
                </button>
              </div>
            </div>

            {feedback && (
              <p role="status" className="type-footnote mt-3 text-[var(--apple-link)]">
                {feedback}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
