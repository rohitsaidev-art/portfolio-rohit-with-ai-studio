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
  generateEffectTrackCss,
  MATERIAL_SYSTEM_MATRIX,
} from '../../utils/behaviourCatalog';
import {
  Check,
  Monitor,
  RotateCcw,
  Smartphone,
} from 'lucide-react';
import { CopyTokenButton } from './FoundationDocPrimitives';

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
    text: 'Experimental visual effects remain isolated inside the Portfolio Studio preview stage.',
  },
  {
    id: 'fx-seg-2',
    num: '02',
    title: 'Approval Workflow',
    text: 'Approved treatments are captured in the Decision Log before intentional promotion into shared CSS.',
  },
];

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
      const normalized = (config.secondary - 50) / 50;
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
  const [materialFilter, setMaterialFilter] = useState<'all' | 'production' | 'experimental'>('all');
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

  const generatedCss = useMemo(
    () => generateEffectTrackCss(activeTrack, config, sandboxTheme, sandboxPalette),
    [activeTrack, config, sandboxTheme, sandboxPalette],
  );

  const visibleMaterials =
    materialFilter === 'all'
      ? MATERIAL_SYSTEM_MATRIX
      : MATERIAL_SYSTEM_MATRIX.filter((m) => m.status === materialFilter);

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
      `Saved "${activeVariant.label}" as ${status === 'promoted' ? 'Promoted' : status} in Decision Log.`,
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
        className="relative overflow-hidden rounded-[20px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] p-5"
      >
        {isExperimental && experimental.overlayStyle && (
          <div
            aria-hidden="true"
            style={experimental.overlayStyle}
            className="pointer-events-none absolute inset-0 z-10 rounded-[20px]"
          />
        )}

        <div className="relative z-20 mb-4 flex items-center justify-between gap-2 text-[12px]">
          <span
            className={`font-semibold ${
              isExperimental
                ? 'text-[var(--apple-link)]'
                : 'text-[var(--apple-label-primary)]'
            }`}
          >
            {isExperimental ? `Sandbox · ${activeVariant.label}` : 'Baseline'}
          </span>
          <span className="font-mono text-[11px] tabular-nums text-[var(--apple-label-tertiary)]">
            {isExperimental
              ? config.enabled
                ? `${config.intensity}${activeTrack.primaryUnit} · ${config.secondary}${activeTrack.secondaryUnit}`
                : 'Off'
              : 'Live'}
          </span>
        </div>

        {activeTrack.id === 'backdrop-blur' && (
          <div className="relative z-20 mb-4">
            <div
              style={
                isExperimental && experimental.blurBarStyle
                  ? experimental.blurBarStyle
                  : undefined
              }
              className={`flex items-center justify-between rounded-[14px] border border-[var(--apple-separator)] px-3.5 py-2.5 ${
                !isExperimental || !config.enabled
                  ? 'bg-[var(--apple-surface-elevated)] shadow-[var(--shadow-apple-subtle)]'
                  : 'shadow-[var(--shadow-apple-ios-bar)]'
              }`}
            >
              <span className="text-[12.5px] font-medium text-[var(--apple-label-primary)]">
                Sticky Bar Material
              </span>
              <span className="font-mono text-[11px] tabular-nums text-[var(--apple-label-secondary)]">
                {isExperimental && config.enabled
                  ? `${config.intensity}px · ${config.secondary}%`
                  : 'Opaque'}
              </span>
            </div>
          </div>
        )}

        <div
          className="relative z-20 mx-auto w-full transition-[max-width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            maxWidth: viewportMode === 'mobile' ? '345px' : '100%',
          }}
        >
          {previewComponent === 'card' && (
            <div
              style={frameStyle}
              className="overflow-hidden rounded-[22px] bg-[var(--apple-surface-elevated)]"
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
              className="rounded-[22px] bg-[var(--apple-surface-elevated)] p-2"
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
              className="overflow-hidden rounded-[24px]"
            >
              <CaseStudyPrototype kind="mycroharvest" />
            </div>
          )}

          {previewComponent === 'editorial' && (
            <div
              style={frameStyle}
              className="rounded-[20px] bg-[var(--apple-surface-elevated)] p-6"
            >
              <p className="text-[11.5px] font-medium text-[var(--apple-link)]">
                Editorial Surface
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
                className="type-title-3 mt-1.5 text-[var(--apple-label-primary)]"
              >
                Restraint makes visual nuance legible.
              </h4>
              <p className="mt-2 text-[14px] leading-[1.6] text-[var(--apple-label-secondary)]">
                Check whether this treatment adds quiet physical depth without competing with prose or photography.
              </p>
              <div className="mt-4 flex items-center gap-2 border-t border-[var(--apple-separator-subtle)] pt-4">
                <button
                  type="button"
                  onClick={() => playTick()}
                  className="apple-btn-primary !min-h-[34px] !px-4 !py-1 !text-[12.5px]"
                >
                  Inspect Case Study
                </button>
                <button
                  type="button"
                  onClick={() => playTick()}
                  className="apple-btn-tonal !min-h-[34px] !px-3.5 !py-1 !text-[12.5px]"
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
      {/* Top Track Selector + View Controls */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="tablist"
          aria-label="Seven surface and effects exploration tracks"
          className="flex flex-wrap gap-1.5"
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
                className={`min-h-[34px] whitespace-nowrap rounded-full border px-3.5 py-1 text-[12.5px] font-medium transition-colors ${
                  active
                    ? 'border-[var(--apple-label-primary)] bg-[var(--apple-label-primary)] text-[var(--apple-bg)]'
                    : 'border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                }`}
              >
                {track.shortTitle}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="apple-segmented" role="group" aria-label="Comparison layout">
            {(
              [
                { id: 'side-by-side', label: 'Compare' },
                { id: 'focused', label: 'Solo' },
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
                  className={`apple-segmented-item !min-h-[30px] px-3 text-[12px] ${
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
                { id: 'desktop', label: 'Desktop', icon: Monitor },
                { id: 'mobile', label: 'Mobile', icon: Smartphone },
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
                  className={`apple-segmented-item !min-h-[30px] px-2.5 text-[12px] ${
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
      </div>

      {/* Main Split: Controls + Live Stage */}
      <div className="grid grid-cols-1 gap-7 lg:grid-cols-12">
        {/* Compact Control Panel */}
        <aside className="space-y-5 rounded-[18px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-5 lg:col-span-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-[16px] font-semibold text-[var(--apple-label-primary)]">
                {activeTrack.title}
              </h2>
              <p className="mt-1 text-[12.5px] text-[var(--apple-label-secondary)]">
                {activeTrack.summary}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
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
                    ? 'apple-btn-tonal !min-h-[28px] !px-2.5 !py-0.5 !text-[11.5px]'
                    : 'apple-btn-outline !min-h-[28px] !px-2.5 !py-0.5 !text-[11.5px]'
                }
              >
                {config.enabled ? 'On' : 'Off'}
              </button>
              <button
                type="button"
                onClick={() => {
                  playTick();
                  onResetTrackConfig(activeTrack.id);
                }}
                aria-label={`Reset ${activeTrack.title}`}
                title="Reset track"
                className="apple-btn-icon h-7 w-7 bg-[var(--apple-bg-secondary)] text-[var(--apple-label-secondary)]"
              >
                <RotateCcw size={12} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          </div>

          {activeTrack.respectsReducedMotion && reducedMotion && (
            <p
              role="note"
              className="rounded-[12px] bg-[var(--apple-bg-secondary)] px-3 py-2 text-[12px] text-[var(--apple-label-secondary)]"
            >
              Reduced motion is active — parallax is locked to 0px.
            </p>
          )}

          {/* Variants */}
          <div className="space-y-1.5 border-t border-[var(--apple-separator-subtle)] pt-4">
            <p className="text-[11.5px] font-medium text-[var(--apple-label-tertiary)]">
              Treatments
            </p>
            {activeTrack.variants.map((variant) => {
              const selected = variant.id === config.variantId;
              return (
                <button
                  key={variant.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => handleVariantSelect(variant.id)}
                  className={`flex w-full items-center justify-between gap-2 rounded-[12px] border px-3 py-2.5 text-left transition-colors ${
                    selected
                      ? 'border-[var(--apple-blue)] bg-[var(--apple-blue)]/[0.06]'
                      : 'border-[var(--apple-separator-subtle)] bg-[var(--apple-bg-secondary)] hover:border-[var(--apple-separator-strong)]'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[var(--apple-label-primary)]">
                      {variant.label}
                    </p>
                    <p className="truncate text-[11.5px] text-[var(--apple-label-secondary)]">
                      {variant.description}
                    </p>
                  </div>
                  {selected && (
                    <Check size={13} strokeWidth={2} aria-hidden="true" className="shrink-0 text-[var(--apple-blue)]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Sliders */}
          <div className="space-y-3.5 border-t border-[var(--apple-separator-subtle)] pt-4">
            <div>
              <div className="flex items-center justify-between text-[12.5px]">
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
                className="mt-1.5 w-full accent-[var(--apple-blue)]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-[12.5px]">
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
                className="mt-1.5 w-full accent-[var(--apple-blue)]"
              />
            </div>
          </div>

          {/* Specimen Switcher */}
          <div className="border-t border-[var(--apple-separator-subtle)] pt-4">
            <p className="mb-2 text-[11.5px] font-medium text-[var(--apple-label-tertiary)]">
              Preview Specimen
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'card', label: 'Card' },
                  { id: 'editorial', label: 'Editorial' },
                  { id: 'audio', label: 'Audio' },
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

        {/* Live Stage + Decision + Copy CSS */}
        <div className="space-y-4 lg:col-span-8">
          <div
            className={
              compareMode === 'side-by-side'
                ? 'grid grid-cols-1 gap-4 xl:grid-cols-2'
                : 'grid grid-cols-1'
            }
          >
            {compareMode === 'side-by-side' && renderSpecimen(false)}
            {renderSpecimen(true)}
          </div>

          {/* Inline Decision Bar */}
          <div className="rounded-[16px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-4">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <input
                type="text"
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                placeholder={`Note for ${activeVariant.label} (optional)…`}
                aria-label="Decision rationale note"
                className="apple-input min-h-[36px] flex-1 rounded-[10px] px-3 py-1.5 text-[13px]"
              />
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleRecordStatus('exploring')}
                  className="apple-btn-tonal !min-h-[34px] whitespace-nowrap !px-3 !py-1 !text-[12px]"
                >
                  Exploring
                </button>
                <button
                  type="button"
                  onClick={() => handleRecordStatus('approved')}
                  className="apple-btn-primary !min-h-[34px] whitespace-nowrap !px-3.5 !py-1 !text-[12px]"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => handleRecordStatus('rejected')}
                  className="apple-btn-outline !min-h-[34px] whitespace-nowrap !px-3 !py-1 !text-[12px]"
                >
                  Reject
                </button>
              </div>
            </div>
            {feedback && (
              <p role="status" className="mt-2 text-[12.5px] text-[var(--apple-link)]">
                {feedback}
              </p>
            )}
          </div>

          {/* Compact Copyable CSS */}
          <div className="rounded-[16px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12px] font-medium text-[var(--apple-label-tertiary)]">
                Experimental CSS
              </span>
              <CopyTokenButton value={generatedCss} label="Copy CSS" compact />
            </div>
            <pre className="mt-2.5 overflow-x-auto rounded-[12px] bg-[var(--apple-bg-secondary)] p-3 font-mono text-[11.5px] leading-[1.55] text-[var(--apple-label-primary)]">
              <code>{generatedCss}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Scannable Production vs. Experimental Material Grid */}
      <section
        aria-labelledby="ws-material-index-heading"
        className="border-t border-[var(--apple-separator)] pt-10"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 id="ws-material-index-heading" className="type-title-3 text-[var(--apple-label-primary)]">
              Materials Overview
            </h3>
            <p className="mt-1 text-[13.5px] text-[var(--apple-label-secondary)]">
              Live portfolio surfaces alongside experimental sandbox treatments.
            </p>
          </div>

          <div className="apple-segmented shrink-0" role="group" aria-label="Filter materials by status">
            {(
              [
                { id: 'all', label: `All (${MATERIAL_SYSTEM_MATRIX.length})` },
                {
                  id: 'production',
                  label: `Production (${MATERIAL_SYSTEM_MATRIX.filter((m) => m.status === 'production').length})`,
                },
                {
                  id: 'experimental',
                  label: `Experimental (${MATERIAL_SYSTEM_MATRIX.filter((m) => m.status === 'experimental').length})`,
                },
              ] as const
            ).map((item) => {
              const active = materialFilter === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    playTick();
                    setMaterialFilter(item.id);
                  }}
                  className={`apple-segmented-item !min-h-[30px] whitespace-nowrap px-3 text-[12px] ${
                    active
                      ? 'apple-pill-shadow bg-[var(--apple-control-thumb)] text-[var(--apple-label-primary)]'
                      : 'text-[var(--apple-label-secondary)]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          {visibleMaterials.map((mat) => (
            <article
              key={mat.id}
              className="rounded-[16px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-5"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h4 className="text-[14.5px] font-semibold text-[var(--apple-label-primary)]">
                  {mat.name}
                </h4>
                <span
                  className={`shrink-0 text-[11.5px] font-medium ${
                    mat.status === 'experimental'
                      ? 'text-[var(--apple-link)]'
                      : 'text-[var(--apple-label-tertiary)]'
                  }`}
                >
                  {mat.status === 'experimental' ? 'Experimental' : 'Production'}
                </span>
              </div>
              <p className="mt-1 font-mono text-[11px] text-[var(--apple-label-tertiary)]">
                {mat.tokensOrCss}
              </p>
              <p className="mt-2.5 text-[13px] leading-[1.55] text-[var(--apple-label-secondary)]">
                {mat.guidance}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
