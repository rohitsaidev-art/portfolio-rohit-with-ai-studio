import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Copy,
  EyeOff,
  Layers,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { PROJECTS } from '../data/projects';
import FlexCarousel, {
  type FlexCarouselCurl,
  type FlexCarouselFit,
  type FlexCarouselIntro,
  type FlexCarouselItem,
  type FlexCarouselPreset,
} from '../components/FlexCarousel';
import {
  DEFAULT_LIQUID_LENS_CONFIG,
  type LiquidLensAxis,
  type LiquidLensOpticalConfig,
  type LiquidLensStatus,
} from '../components/LiquidLens';
import {
  LiquidLensLabStage,
  type LiquidLensCardVariant,
} from '../components/LiquidLensLabStage';
import {
  renderCaseStudyCardTexture,
  type CardTextureAspect,
} from '../utils/caseStudyCardTexture';
import { EASE_APPLE } from '../utils/motion';
import { playSuccessChime, playTick } from '../utils/soundEngine';
import { showToast } from '../utils/toast';

type CarouselLabTab = 'flex-carousel' | 'liquid-lens';

type CuratedMoodId = 'editorial-glass' | 'whisper-prism' | 'gallery-liquid';
type LiquidLensMoodId = 'studio-meniscus' | 'prismatic-melt' | 'whisper-edge';

interface FlexCarouselSettings {
  mood: CuratedMoodId | 'custom';
  preset: FlexCarouselPreset;
  intro: FlexCarouselIntro;
  cardMode: 'styled-card' | 'cover-only';
  stageHeight: number;
  cardHeight: number;
  gap: number;
  radius: number;
  fit: FlexCarouselFit;
  lensWidth: number;
  lensHeight: number;
  tilt: number;
  roundness: number;
  bend: number;
  reach: number;
  curl: FlexCarouselCurl;
  dispersion: number;
  liquid: number;
  squeeze: number;
  followCursor: boolean;
  focusOnClick: boolean;
  autoplay: boolean;
  interval: number;
  captions: boolean;
  captureWheel: boolean;
}

interface LiquidLensSettings extends LiquidLensOpticalConfig {
  mood: LiquidLensMoodId | 'custom';
  axis: LiquidLensAxis;
  cardVariant: LiquidLensCardVariant;
  stageHeight: number;
  cardGap: number;
  cardRadius: number;
  autoGlide: boolean;
  glideSpeed: number;
  stepAside: boolean;
  showGuides: boolean;
}

interface CuratedMood {
  id: CuratedMoodId;
  name: string;
  badge?: string;
  description: string;
  values: Omit<FlexCarouselSettings, 'mood'>;
}

interface LiquidLensMood {
  id: LiquidLensMoodId;
  name: string;
  badge?: string;
  description: string;
  values: LiquidLensOpticalConfig;
}

/**
 * Hand-calibrated optical recipes engineered specifically for legible Case Study cards:
 * - Wide, tilt-free (or minimal tilt) clear center lens so the active card stays 100% sharp
 * - Gentle peripheral glass curvature on adjacent neighbor cards
 * - Tasteful, jewel-like spectral chromatic dispersion strictly at the refractive edges
 */
const CURATED_MOODS: readonly CuratedMood[] = [
  {
    id: 'editorial-glass',
    name: 'Editorial Glass',
    badge: 'Recommended',
    description:
      '100% razor-sharp centered card with gentle upward glass curvature and a subtle Leica-like chromatic prism along the outer edges.',
    values: {
      preset: 'arch',
      intro: 'rise',
      cardMode: 'styled-card',
      stageHeight: 620,
      cardHeight: 0.68,
      gap: 20,
      radius: 22,
      fit: 'landscape',
      lensWidth: 0.74,
      lensHeight: 0.82,
      tilt: 0,
      roundness: 0.45,
      bend: 0.16,
      reach: 0.22,
      curl: 'rise',
      dispersion: 0.38,
      liquid: 0.12,
      squeeze: 0.08,
      followCursor: false,
      focusOnClick: true,
      autoplay: false,
      interval: 4.5,
      captions: true,
      captureWheel: false,
    },
  },
  {
    id: 'whisper-prism',
    name: 'Whisper Prism',
    description:
      'Ultra-calm architectural flat stage with an extra-wide clear center window and just a delicate hint of spectral glass shimmer at the edges.',
    values: {
      preset: 'arch',
      intro: 'fade',
      cardMode: 'styled-card',
      stageHeight: 620,
      cardHeight: 0.7,
      gap: 22,
      radius: 22,
      fit: 'landscape',
      lensWidth: 0.8,
      lensHeight: 0.88,
      tilt: 0,
      roundness: 0.35,
      bend: 0.11,
      reach: 0.2,
      curl: 'rise',
      dispersion: 0.28,
      liquid: 0.06,
      squeeze: 0.05,
      followCursor: false,
      focusOnClick: true,
      autoplay: false,
      interval: 4.5,
      captions: true,
      captureWheel: false,
    },
  },
  {
    id: 'gallery-liquid',
    name: 'Gallery Liquid',
    description:
      'Slightly more sculptural refractive sweep and richer edge prism dispersion while keeping the centered case study completely crisp.',
    values: {
      preset: 'ribbon',
      intro: 'bloom',
      cardMode: 'styled-card',
      stageHeight: 620,
      cardHeight: 0.66,
      gap: 18,
      radius: 22,
      fit: 'landscape',
      lensWidth: 0.7,
      lensHeight: 0.84,
      tilt: 10,
      roundness: 0.55,
      bend: 0.22,
      reach: 0.25,
      curl: 'twist',
      dispersion: 0.5,
      liquid: 0.18,
      squeeze: 0.1,
      followCursor: false,
      focusOnClick: true,
      autoplay: false,
      interval: 4.5,
      captions: true,
      captureWheel: false,
    },
  },
];

const LIQUID_LENS_MOODS: readonly LiquidLensMood[] = [
  {
    id: 'studio-meniscus',
    name: 'Studio Meniscus',
    badge: 'Recommended',
    description:
      'Balanced refractive edge glass with a crisp specular lip, clean RGB dispersion split, and smooth outer melting blur while the center stays live.',
    values: {
      ...DEFAULT_LIQUID_LENS_CONFIG,
    },
  },
  {
    id: 'prismatic-melt',
    name: 'Prismatic Melt',
    description:
      'Wider liquid strips with stronger chromatic splitting, expressive meniscus curvature, and a softer molten dissolve toward the frame border.',
    values: {
      stripSize: 0.27,
      refraction: 1.15,
      dispersion: 1.05,
      meltBlur: 22,
      liquidRipple: 0.48,
      glassSheen: 0.58,
      edgeFade: 0.76,
      meniscusCurve: 1.15,
    },
  },
  {
    id: 'whisper-edge',
    name: 'Whisper Edge Glass',
    description:
      'Narrow architectural strips with restrained refraction and gentle frosted blur so the live center deck dominates the viewport.',
    values: {
      stripSize: 0.16,
      refraction: 0.46,
      dispersion: 0.34,
      meltBlur: 10,
      liquidRipple: 0.12,
      glassSheen: 0.28,
      edgeFade: 0.52,
      meniscusCurve: 1.65,
    },
  },
];

const INITIAL_SETTINGS: FlexCarouselSettings = {
  mood: 'editorial-glass',
  ...CURATED_MOODS[0].values,
};

const INITIAL_LENS_SETTINGS: LiquidLensSettings = {
  mood: 'studio-meniscus',
  ...LIQUID_LENS_MOODS[0].values,
  axis: 'auto',
  cardVariant: 'styled-card',
  stageHeight: 560,
  cardGap: 24,
  cardRadius: 22,
  autoGlide: true,
  glideSpeed: 0.85,
  stepAside: false,
  showGuides: false,
};

function getInitialLabTab(): CarouselLabTab {
  if (typeof window === 'undefined') return 'flex-carousel';
  const params = new URLSearchParams(window.location.search);
  return params.get('tab') === 'liquid-lens' ? 'liquid-lens' : 'flex-carousel';
}

interface FlexCarouselLabPageProps {
  onNavigate: (path: string) => void;
}

function SegmentedPicker<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { id: T; label: string }[];
  onChange: (next: T) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[11.5px] font-medium text-[var(--apple-label-secondary)]">
        {label}
      </p>
      <div
        role="radiogroup"
        aria-label={label}
        className="flex flex-wrap gap-1 rounded-[12px] border border-[var(--apple-separator-subtle)] bg-[var(--apple-bg)] p-1"
      >
        {options.map((opt) => {
          const active = opt.id === value;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => {
                playTick();
                onChange(opt.id);
              }}
              className={`flex-1 cursor-pointer whitespace-nowrap rounded-[8px] px-2.5 py-1.5 text-[12px] font-medium transition-[background-color,color,box-shadow] duration-150 ${
                active
                  ? 'bg-[var(--apple-control-thumb)] text-[var(--apple-label-primary)] shadow-xs'
                  : 'text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RangeSlider({
  label,
  value,
  min,
  max,
  step,
  suffix = '',
  displayValue,
  disabled = false,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  displayValue?: string;
  disabled?: boolean;
  onChange: (next: number) => void;
}) {
  const formatted =
    displayValue ??
    (step < 1 ? value.toFixed(step < 0.1 ? 2 : 1) : String(Math.round(value)));

  return (
    <label
      className={`block ${disabled ? 'pointer-events-none opacity-45' : ''}`}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[12px] font-medium text-[var(--apple-label-secondary)]">
          {label}
        </span>
        <span className="font-mono text-[11.5px] tabular-nums text-[var(--apple-label-primary)]">
          {formatted}
          {displayValue ? '' : suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--apple-separator)] accent-[var(--apple-blue)]"
      />
    </label>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => {
        playTick();
        onChange(!checked);
      }}
      className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-[12px] border border-[var(--apple-separator-subtle)] bg-[var(--apple-bg)] px-3 py-2.5 text-left transition-colors duration-150 hover:bg-[var(--apple-control-hover)]"
    >
      <span className="min-w-0">
        <span className="block text-[12.5px] font-medium text-[var(--apple-label-primary)]">
          {label}
        </span>
        {hint && (
          <span className="mt-0.5 block text-[11px] text-[var(--apple-label-tertiary)]">
            {hint}
          </span>
        )}
      </span>
      <span
        aria-hidden="true"
        className={`relative inline-flex h-[22px] w-[38px] shrink-0 items-center rounded-full transition-colors duration-200 ${
          checked ? 'bg-[var(--apple-blue)]' : 'bg-[var(--apple-separator-strong)]'
        }`}
      >
        <span
          className={`inline-block h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            checked ? 'translate-x-[18px]' : 'translate-x-[2px]'
          }`}
        />
      </span>
    </button>
  );
}

export function FlexCarouselLabPage({ onNavigate }: FlexCarouselLabPageProps) {
  const [activeTab, setActiveTab] = useState<CarouselLabTab>(() => getInitialLabTab());

  // Tab 1: FlexCarousel state
  const [settings, setSettings] = useState<FlexCarouselSettings>(INITIAL_SETTINGS);
  const [replayKey, setReplayKey] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [styledTextures, setStyledTextures] = useState<string[] | null>(null);

  // Tab 2: Liquid Lens state
  const [lensSettings, setLensSettings] = useState<LiquidLensSettings>(INITIAL_LENS_SETTINGS);
  const [showLensAdvanced, setShowLensAdvanced] = useState(false);
  const [lensStatus, setLensStatus] = useState<LiquidLensStatus>('active');

  const [copied, setCopied] = useState(false);

  const handleTabSwitch = (nextTab: CarouselLabTab) => {
    if (nextTab === activeTab) return;
    playTick();
    setActiveTab(nextTab);
    setCopied(false);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (nextTab === 'liquid-lens') {
        url.searchParams.set('tab', 'liquid-lens');
      } else {
        url.searchParams.delete('tab');
      }
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  };

  const textureAspect: CardTextureAspect =
    settings.fit === 'portrait'
      ? 'portrait'
      : settings.fit === 'square'
        ? 'square'
        : 'landscape';

  // Render crisp high-DPI Case Study Card textures calibrated for FlexCarousel's WebGL shader
  useEffect(() => {
    if (activeTab !== 'flex-carousel' || settings.cardMode !== 'styled-card') {
      setStyledTextures(null);
      return;
    }

    let cancelled = false;
    const createdUrls: string[] = [];

    Promise.all(
      PROJECTS.map((project) =>
        renderCaseStudyCardTexture(project, textureAspect),
      ),
    ).then((urls) => {
      if (cancelled) {
        urls.forEach((u) => {
          if (u.startsWith('blob:')) URL.revokeObjectURL(u);
        });
        return;
      }
      urls.forEach((u) => {
        if (u.startsWith('blob:')) createdUrls.push(u);
      });
      setStyledTextures(urls);
    });

    return () => {
      cancelled = true;
      createdUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [activeTab, settings.cardMode, textureAspect]);

  const carouselItems: FlexCarouselItem[] = useMemo(() => {
    return PROJECTS.map((project, idx) => ({
      src:
        settings.cardMode === 'styled-card' && styledTextures?.[idx]
          ? styledTextures[idx]
          : project.coverImage,
      alt: project.coverAlt,
      title: project.title,
      subtitle: `${project.industry} · ${project.year}`,
    }));
  }, [settings.cardMode, styledTextures]);

  const activeProject = PROJECTS[activeIndex] ?? PROJECTS[0];

  const update = <K extends keyof FlexCarouselSettings>(
    key: K,
    value: FlexCarouselSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, mood: 'custom', [key]: value }));
  };

  const applyMood = (mood: CuratedMood) => {
    playTick();
    setSettings((prev) => ({
      ...mood.values,
      cardMode: prev.cardMode,
      mood: mood.id,
    }));
  };

  const updateLens = <K extends keyof LiquidLensSettings>(
    key: K,
    value: LiquidLensSettings[K],
  ) => {
    setLensSettings((prev) => ({ ...prev, mood: 'custom', [key]: value }));
  };

  const applyLensMood = (mood: LiquidLensMood) => {
    playTick();
    setLensSettings((prev) => ({
      ...prev,
      ...mood.values,
      mood: mood.id,
    }));
  };

  const lensOpticalConfig = useMemo<LiquidLensOpticalConfig>(
    () => ({
      stripSize: lensSettings.stripSize,
      refraction: lensSettings.refraction,
      dispersion: lensSettings.dispersion,
      meltBlur: lensSettings.meltBlur,
      liquidRipple: lensSettings.liquidRipple,
      glassSheen: lensSettings.glassSheen,
      edgeFade: lensSettings.edgeFade,
      meniscusCurve: lensSettings.meniscusCurve,
    }),
    [
      lensSettings.stripSize,
      lensSettings.refraction,
      lensSettings.dispersion,
      lensSettings.meltBlur,
      lensSettings.liquidRipple,
      lensSettings.glassSheen,
      lensSettings.edgeFade,
      lensSettings.meniscusCurve,
    ],
  );

  const handleReset = () => {
    playTick();
    if (activeTab === 'liquid-lens') {
      setLensSettings(INITIAL_LENS_SETTINGS);
      showToast({
        message: 'Restored Studio Meniscus Liquid Lens defaults',
        tone: 'info',
      });
      return;
    }
    setSettings(INITIAL_SETTINGS);
    setReplayKey((k) => k + 1);
    showToast({
      message: 'Restored Editorial Glass calibrated defaults',
      tone: 'info',
    });
  };

  const exportedSettingsJson = useMemo(() => {
    if (activeTab === 'liquid-lens') {
      const { mood: _mood, ...exportable } = lensSettings;
      return JSON.stringify(exportable, null, 2);
    }
    const { mood: _mood, ...exportable } = settings;
    return JSON.stringify(exportable, null, 2);
  }, [activeTab, settings, lensSettings]);

  const handleCopySettings = async () => {
    try {
      await navigator.clipboard.writeText(exportedSettingsJson);
      playSuccessChime();
      setCopied(true);
      showToast({
        message:
          activeTab === 'liquid-lens'
            ? 'Copied Liquid Lens optical settings to clipboard'
            : 'Copied exact FlexCarousel settings to clipboard',
        tone: 'success',
      });
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      showToast({
        message: 'Could not copy automatically — select from Fine-tune settings',
        tone: 'info',
      });
    }
  };

  return (
    <div className="bg-[var(--apple-bg)] pb-24">
      {/* Compact Header + Tab Switcher */}
      <section className="mx-auto max-w-[1160px] px-5 pt-10 sm:px-8 sm:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE_APPLE }}
        >
          {/* Lab Effect Tab Bar */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div
              role="tablist"
              aria-label="Carousel Lab experiments"
              className="inline-flex items-center gap-1 rounded-[12px] border border-[var(--apple-separator-subtle)] bg-[var(--apple-bg-secondary)] p-1"
            >
              {(
                [
                  { id: 'flex-carousel', label: 'FlexCarousel' },
                  { id: 'liquid-lens', label: 'Liquid Lens' },
                ] as const
              ).map((tab) => {
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    id={`lab-tab-${tab.id}`}
                    aria-selected={isSelected}
                    aria-controls={`lab-panel-${tab.id}`}
                    onClick={() => handleTabSwitch(tab.id)}
                    className={`relative cursor-pointer whitespace-nowrap rounded-[8px] px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-150 ${
                      isSelected
                        ? 'text-[var(--apple-label-primary)]'
                        : 'text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                    }`}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="carousel-lab-active-tab"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                        className="absolute inset-0 rounded-[8px] bg-[var(--apple-control-thumb)] shadow-xs"
                        aria-hidden="true"
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {activeTab === 'flex-carousel' ? (
                <button
                  type="button"
                  onClick={() => {
                    playTick();
                    setReplayKey((k) => k + 1);
                  }}
                  className="apple-btn-outline !min-h-[36px] !px-3.5 !text-[12.5px]"
                >
                  <Sparkles size={13.5} strokeWidth={1.8} aria-hidden="true" />
                  <span>Replay Intro</span>
                </button>
              ) : (
                <button
                  type="button"
                  aria-pressed={lensSettings.stepAside}
                  onClick={() => {
                    playTick();
                    updateLens('stepAside', !lensSettings.stepAside);
                  }}
                  className="apple-btn-outline !min-h-[36px] !px-3.5 !text-[12.5px]"
                >
                  <EyeOff size={13.5} strokeWidth={1.8} aria-hidden="true" />
                  <span>{lensSettings.stepAside ? 'Restore Lens' : 'Step Aside'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleReset}
                className="apple-btn-outline !min-h-[36px] !px-3.5 !text-[12.5px]"
              >
                <RotateCcw size={13.5} strokeWidth={1.8} aria-hidden="true" />
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={handleCopySettings}
                className="apple-btn-primary !min-h-[36px] !px-4 !text-[12.5px]"
              >
                {copied ? (
                  <>
                    <Check size={14} strokeWidth={2} aria-hidden="true" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={13.5} strokeWidth={1.8} aria-hidden="true" />
                    <span>Copy Settings</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {activeTab === 'flex-carousel' ? (
            <div>
              <p className="inline-flex items-center gap-1.5 text-[12px] font-medium tracking-[0.01em] text-[var(--apple-link)]">
                <SlidersHorizontal size={13.5} strokeWidth={1.9} aria-hidden="true" />
                <span>FlexCarousel · Calibrated for Legibility</span>
              </p>
              <h1 className="font-display mt-1.5 text-[28px] font-semibold leading-[1.12] tracking-[-0.028em] text-[var(--apple-label-primary)] sm:text-[34px]">
                Case Study Cards &amp; Liquid Glass Preview
              </h1>
              <p className="mt-1.5 max-w-[62ch] text-[14.5px] leading-[1.5] text-[var(--apple-label-secondary)]">
                Pre-tuned so the centered case study stays razor-sharp while adjacent cards glide through subtle chromatic prism glass. Pick a preset below or tweak the essentials.
              </p>
            </div>
          ) : (
            <div>
              <p className="inline-flex items-center gap-1.5 text-[12px] font-medium tracking-[0.01em] text-[var(--apple-link)]">
                <Layers size={13.5} strokeWidth={1.9} aria-hidden="true" />
                <span>Liquid Lens · Two-Pass WebGL2 Edge Refraction</span>
              </p>
              <h1 className="font-display mt-1.5 text-[28px] font-semibold leading-[1.12] tracking-[-0.028em] text-[var(--apple-label-primary)] sm:text-[34px]">
                Edge Liquid Glass &amp; Live Center Deck
              </h1>
              <p className="mt-1.5 max-w-[64ch] text-[14.5px] leading-[1.5] text-[var(--apple-label-secondary)]">
                Two strips of refractive liquid glass sit at the screen edges, mirroring each card&apos;s baked texture into a WebGL2 framebuffer to bend, split RGB dispersion, and melt outer cards while the real DOM center stays clear and interactive.
              </p>
            </div>
          )}
        </motion.div>
      </section>

      {/* ====================================================================
          TAB 1: FLEXCAROUSEL
         ==================================================================== */}
      {activeTab === 'flex-carousel' && (
        <div
          id="lab-panel-flex-carousel"
          role="tabpanel"
          aria-labelledby="lab-tab-flex-carousel"
        >
          {/* Full-Bleed Live FlexCarousel Stage */}
          <section className="mt-7 border-y border-[var(--apple-separator-subtle)] bg-[var(--apple-bg-secondary)]/55">
            <div
              className="relative mx-auto w-full max-w-[1440px]"
              style={{ height: `${settings.stageHeight}px` }}
            >
              <FlexCarousel
                key={replayKey}
                items={carouselItems}
                preset={settings.preset}
                intro={settings.intro}
                cardHeight={settings.cardHeight}
                gap={settings.gap}
                radius={settings.radius}
                fit={settings.fit}
                lensWidth={settings.lensWidth}
                lensHeight={settings.lensHeight}
                tilt={settings.tilt}
                roundness={settings.roundness}
                bend={settings.bend}
                reach={settings.reach}
                curl={settings.curl}
                dispersion={settings.dispersion}
                liquid={settings.liquid}
                squeeze={settings.squeeze}
                followCursor={settings.followCursor}
                focusOnClick={settings.focusOnClick}
                autoplay={settings.autoplay}
                interval={settings.interval}
                captions={settings.captions}
                captureWheel={settings.captureWheel}
                onChange={(index) => setActiveIndex(index)}
              />

              {/* Subtle bottom-right active project quick-open pill */}
              {activeProject && (
                <div className="pointer-events-none absolute right-5 bottom-4 z-10 flex items-center gap-2 sm:right-8">
                  <a
                    href={`/work/${activeProject.slug}`}
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                      e.preventDefault();
                      onNavigate(`/work/${activeProject.slug}`);
                    }}
                    className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)]/90 px-3 py-1.5 text-[12px] font-medium text-[var(--apple-label-primary)] shadow-xs backdrop-blur-md transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.97]"
                  >
                    <span>Open {activeProject.title}</span>
                    <ArrowUpRight size={13} strokeWidth={2} aria-hidden="true" />
                  </a>
                </div>
              )}
            </div>
          </section>

          {/* Curated One-Click Mood Recipes */}
          <section className="mx-auto mt-8 max-w-[1160px] px-5 sm:px-8">
            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
              {CURATED_MOODS.map((mood) => {
                const active = settings.mood === mood.id;
                return (
                  <button
                    key={mood.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => applyMood(mood)}
                    className={`cursor-pointer rounded-[18px] border p-4 text-left transition-[border-color,background-color,box-shadow,transform] duration-150 active:scale-[0.99] ${
                      active
                        ? 'border-[var(--apple-blue)] bg-[var(--apple-surface-elevated)] shadow-xs'
                        : 'border-[var(--apple-separator-subtle)] bg-[var(--apple-bg-secondary)] hover:border-[var(--apple-separator)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[14px] font-semibold tracking-[-0.015em] text-[var(--apple-label-primary)]">
                        {mood.name}
                      </span>
                      {mood.badge && (
                        <span className="text-[11px] font-medium text-[var(--apple-blue)]">
                          {mood.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-[12.5px] leading-[1.48] text-[var(--apple-label-secondary)]">
                      {mood.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Essential Controls */}
            <div className="mt-5 rounded-[20px] border border-[var(--apple-separator-subtle)] bg-[var(--apple-bg-secondary)] p-5">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-center">
                <div className="space-y-4 md:col-span-4">
                  <SegmentedPicker
                    label="Card Style"
                    value={settings.cardMode}
                    options={[
                      { id: 'styled-card', label: 'Case Study Cards' },
                      { id: 'cover-only', label: 'Clean Cover Art' },
                    ]}
                    onChange={(v) => update('cardMode', v)}
                  />
                  <ToggleRow
                    label="Autoplay"
                    hint="Gently glide through case studies"
                    checked={settings.autoplay}
                    onChange={(v) => update('autoplay', v)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-8">
                  <RangeSlider
                    label="Chromatic Dispersion"
                    value={settings.dispersion}
                    min={0}
                    max={0.8}
                    step={0.02}
                    onChange={(v) => update('dispersion', v)}
                  />
                  <RangeSlider
                    label="Edge Glass Curve"
                    value={settings.bend}
                    min={0}
                    max={0.45}
                    step={0.01}
                    onChange={(v) => update('bend', v)}
                  />
                  <RangeSlider
                    label="Card Size"
                    value={settings.cardHeight}
                    min={0.5}
                    max={0.85}
                    step={0.01}
                    onChange={(v) => update('cardHeight', v)}
                  />
                  <RangeSlider
                    label="Clear Center Window"
                    value={settings.lensWidth}
                    min={0.55}
                    max={0.95}
                    step={0.02}
                    onChange={(v) => update('lensWidth', v)}
                  />
                </div>
              </div>

              {/* Collapsible Advanced Fine-Tuning */}
              <div className="mt-5 border-t border-[var(--apple-separator-subtle)] pt-4">
                <button
                  type="button"
                  aria-expanded={showAdvanced}
                  onClick={() => {
                    playTick();
                    setShowAdvanced((prev) => !prev);
                  }}
                  className="inline-flex cursor-pointer items-center gap-1.5 text-[12.5px] font-medium text-[var(--apple-label-secondary)] transition-colors hover:text-[var(--apple-label-primary)]"
                >
                  <ChevronDown
                    size={15}
                    strokeWidth={2}
                    aria-hidden="true"
                    className={`transition-transform duration-200 ${
                      showAdvanced ? 'rotate-180' : ''
                    }`}
                  />
                  <span>
                    {showAdvanced
                      ? 'Hide advanced optical parameters & JSON'
                      : 'Fine-tune advanced optical parameters & JSON'}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {showAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.24, ease: EASE_APPLE }}
                      className="overflow-hidden"
                    >
                      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
                        <div className="space-y-3.5">
                          <SegmentedPicker
                            label="Aspect Fit"
                            value={settings.fit}
                            options={[
                              { id: 'landscape', label: 'Landscape' },
                              { id: 'square', label: 'Square' },
                              { id: 'portrait', label: 'Portrait' },
                              { id: 'natural', label: 'Natural' },
                            ]}
                            onChange={(v) => update('fit', v)}
                          />
                          <SegmentedPicker
                            label="Intro Animation"
                            value={settings.intro}
                            options={[
                              { id: 'rise', label: 'Rise' },
                              { id: 'bloom', label: 'Bloom' },
                              { id: 'spin', label: 'Spin' },
                              { id: 'deal', label: 'Deal' },
                              { id: 'fade', label: 'Fade' },
                            ]}
                            onChange={(v) => {
                              update('intro', v);
                              setReplayKey((k) => k + 1);
                            }}
                          />
                          <RangeSlider
                            label="Stage Height"
                            value={settings.stageHeight}
                            min={440}
                            max={740}
                            step={10}
                            suffix="px"
                            onChange={(v) => update('stageHeight', v)}
                          />
                          <RangeSlider
                            label="Gap"
                            value={settings.gap}
                            min={0}
                            max={48}
                            step={1}
                            suffix="px"
                            onChange={(v) => update('gap', v)}
                          />
                          <RangeSlider
                            label="Corner Radius"
                            value={settings.radius}
                            min={0}
                            max={36}
                            step={1}
                            suffix="px"
                            onChange={(v) => update('radius', v)}
                          />
                        </div>

                        <div className="space-y-3.5">
                          <SegmentedPicker
                            label="Curl Direction"
                            value={settings.curl}
                            options={[
                              { id: 'rise', label: 'Rise' },
                              { id: 'twist', label: 'Twist' },
                            ]}
                            onChange={(v) => update('curl', v)}
                          />
                          <RangeSlider
                            label="Lens Height"
                            value={settings.lensHeight}
                            min={0.4}
                            max={1.4}
                            step={0.02}
                            onChange={(v) => update('lensHeight', v)}
                          />
                          <RangeSlider
                            label="Tilt Angle"
                            value={settings.tilt}
                            min={-45}
                            max={45}
                            step={1}
                            suffix="°"
                            onChange={(v) => update('tilt', v)}
                          />
                          <RangeSlider
                            label="Lens Roundness"
                            value={settings.roundness}
                            min={0}
                            max={1}
                            step={0.01}
                            onChange={(v) => update('roundness', v)}
                          />
                          <RangeSlider
                            label="Refraction Reach"
                            value={settings.reach}
                            min={0.05}
                            max={0.6}
                            step={0.01}
                            onChange={(v) => update('reach', v)}
                          />
                          <RangeSlider
                            label="Liquid Ripple"
                            value={settings.liquid}
                            min={0}
                            max={0.6}
                            step={0.01}
                            onChange={(v) => update('liquid', v)}
                          />
                          <RangeSlider
                            label="Edge Squeeze"
                            value={settings.squeeze}
                            min={0}
                            max={0.5}
                            step={0.01}
                            onChange={(v) => update('squeeze', v)}
                          />
                        </div>

                        <div className="flex flex-col gap-2.5">
                          <ToggleRow
                            label="Show Captions & Counter"
                            checked={settings.captions}
                            onChange={(v) => update('captions', v)}
                          />
                          <ToggleRow
                            label="Focus on Click"
                            checked={settings.focusOnClick}
                            onChange={(v) => update('focusOnClick', v)}
                          />
                          <ToggleRow
                            label="Follow Cursor"
                            checked={settings.followCursor}
                            onChange={(v) => update('followCursor', v)}
                          />
                          <ToggleRow
                            label="Capture Vertical Wheel"
                            checked={settings.captureWheel}
                            onChange={(v) => update('captureWheel', v)}
                          />
                          <RangeSlider
                            label="Autoplay Interval"
                            value={settings.interval}
                            min={2}
                            max={10}
                            step={0.5}
                            suffix="s"
                            disabled={!settings.autoplay}
                            onChange={(v) => update('interval', v)}
                          />

                          <pre className="mt-2 max-h-[160px] overflow-auto rounded-[12px] border border-[var(--apple-separator-subtle)] bg-[var(--apple-bg)] p-3 font-mono text-[11px] leading-[1.45] text-[var(--apple-label-secondary)] select-all">
                            {exportedSettingsJson}
                          </pre>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ====================================================================
          TAB 2: LIQUID LENS (Two-Pass WebGL2 Edge Refraction + Live DOM Deck)
         ==================================================================== */}
      {activeTab === 'liquid-lens' && (
        <div
          id="lab-panel-liquid-lens"
          role="tabpanel"
          aria-labelledby="lab-tab-liquid-lens"
        >
          {/* Full-Bleed Live Liquid Lens Deck Stage */}
          <section className="mt-7 border-y border-[var(--apple-separator-subtle)] bg-[var(--apple-bg-secondary)]">
            <LiquidLensLabStage
              axis={lensSettings.axis}
              cardVariant={lensSettings.cardVariant}
              stageHeight={lensSettings.stageHeight}
              cardGap={lensSettings.cardGap}
              cardRadius={lensSettings.cardRadius}
              autoGlide={lensSettings.autoGlide}
              glideSpeed={lensSettings.glideSpeed}
              stepAside={lensSettings.stepAside}
              showGuides={lensSettings.showGuides}
              opticalConfig={lensOpticalConfig}
              onNavigate={onNavigate}
              onStatusChange={setLensStatus}
            />
          </section>

          {/* Graceful Fallback Notice ONLY if browser lacks WebGL2, lost context, or prefers-reduced-motion */}
          {(lensStatus === 'disabled-reduced-motion' ||
            lensStatus === 'unsupported-webgl2' ||
            lensStatus === 'context-lost') && (
            <section className="mx-auto mt-5 max-w-[1160px] px-5 sm:px-8">
              <p className="rounded-[14px] border border-[var(--apple-separator-subtle)] bg-[var(--apple-bg-secondary)] px-4 py-3 text-[13px] text-[var(--apple-label-secondary)]">
                {lensStatus === 'disabled-reduced-motion'
                  ? 'Reduced motion is enabled on your system, so the Liquid Lens did not mount and the live deck renders unchanged.'
                  : lensStatus === 'unsupported-webgl2'
                    ? 'WebGL2 is unavailable in this browser context, so the Liquid Lens stayed unmounted and the deck renders cleanly in pure DOM.'
                    : 'The WebGL2 context was lost, so the Liquid Lens safely unmounted and left the live deck intact.'}
              </p>
            </section>
          )}

          {/* Curated One-Click Optical Presets */}
          <section className="mx-auto mt-8 max-w-[1160px] px-5 sm:px-8">
            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
              {LIQUID_LENS_MOODS.map((mood) => {
                const active = lensSettings.mood === mood.id;
                return (
                  <button
                    key={mood.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => applyLensMood(mood)}
                    className={`cursor-pointer rounded-[18px] border p-4 text-left transition-[border-color,background-color,box-shadow,transform] duration-150 active:scale-[0.99] ${
                      active
                        ? 'border-[var(--apple-blue)] bg-[var(--apple-surface-elevated)] shadow-xs'
                        : 'border-[var(--apple-separator-subtle)] bg-[var(--apple-bg-secondary)] hover:border-[var(--apple-separator)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[14px] font-semibold tracking-[-0.015em] text-[var(--apple-label-primary)]">
                        {mood.name}
                      </span>
                      {mood.badge && (
                        <span className="text-[11px] font-medium text-[var(--apple-blue)]">
                          {mood.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-[12.5px] leading-[1.48] text-[var(--apple-label-secondary)]">
                      {mood.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Essential Liquid Lens Variables */}
            <div className="mt-5 rounded-[20px] border border-[var(--apple-separator-subtle)] bg-[var(--apple-bg-secondary)] p-5">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-center">
                <div className="space-y-4 md:col-span-4">
                  <SegmentedPicker
                    label="Glass Strip Axis"
                    value={lensSettings.axis}
                    options={[
                      { id: 'auto', label: 'Auto' },
                      { id: 'horizontal', label: 'Left / Right' },
                      { id: 'vertical', label: 'Top / Bottom' },
                    ]}
                    onChange={(v) => updateLens('axis', v)}
                  />
                  <SegmentedPicker
                    label="Card Texture Variant"
                    value={lensSettings.cardVariant}
                    options={[
                      { id: 'styled-card', label: 'Case Study Cards' },
                      { id: 'cover-only', label: 'Clean Cover Art' },
                    ]}
                    onChange={(v) => updateLens('cardVariant', v)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-8">
                  <RangeSlider
                    label="Glass Strip Depth"
                    value={lensSettings.stripSize}
                    min={0.08}
                    max={0.36}
                    step={0.01}
                    displayValue={`${Math.round(lensSettings.stripSize * 100)}%`}
                    onChange={(v) => updateLens('stripSize', v)}
                  />
                  <RangeSlider
                    label="Refraction Bend"
                    value={lensSettings.refraction}
                    min={0}
                    max={1.4}
                    step={0.02}
                    onChange={(v) => updateLens('refraction', v)}
                  />
                  <RangeSlider
                    label="Chromatic Dispersion"
                    value={lensSettings.dispersion}
                    min={0}
                    max={1.4}
                    step={0.02}
                    onChange={(v) => updateLens('dispersion', v)}
                  />
                  <RangeSlider
                    label="Outer Melt Blur"
                    value={lensSettings.meltBlur}
                    min={0}
                    max={28}
                    step={1}
                    suffix="px"
                    onChange={(v) => updateLens('meltBlur', v)}
                  />
                </div>
              </div>

              {/* Collapsible Advanced Optical Variables & Live JSON */}
              <div className="mt-5 border-t border-[var(--apple-separator-subtle)] pt-4">
                <button
                  type="button"
                  aria-expanded={showLensAdvanced}
                  onClick={() => {
                    playTick();
                    setShowLensAdvanced((prev) => !prev);
                  }}
                  className="inline-flex cursor-pointer items-center gap-1.5 text-[12.5px] font-medium text-[var(--apple-label-secondary)] transition-colors hover:text-[var(--apple-label-primary)]"
                >
                  <ChevronDown
                    size={15}
                    strokeWidth={2}
                    aria-hidden="true"
                    className={`transition-transform duration-200 ${
                      showLensAdvanced ? 'rotate-180' : ''
                    }`}
                  />
                  <span>
                    {showLensAdvanced
                      ? 'Hide advanced shader variables & JSON'
                      : 'Fine-tune advanced shader variables & JSON'}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {showLensAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.24, ease: EASE_APPLE }}
                      className="overflow-hidden"
                    >
                      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
                        <div className="space-y-3.5">
                          <RangeSlider
                            label="Liquid Meniscus Ripple"
                            value={lensSettings.liquidRipple}
                            min={0}
                            max={1}
                            step={0.02}
                            onChange={(v) => updateLens('liquidRipple', v)}
                          />
                          <RangeSlider
                            label="Glass Lip Sheen"
                            value={lensSettings.glassSheen}
                            min={0}
                            max={1}
                            step={0.02}
                            onChange={(v) => updateLens('glassSheen', v)}
                          />
                          <RangeSlider
                            label="Meniscus Curve"
                            value={lensSettings.meniscusCurve}
                            min={0.6}
                            max={2.8}
                            step={0.05}
                            onChange={(v) => updateLens('meniscusCurve', v)}
                          />
                          <RangeSlider
                            label="Outer Edge Dissolve"
                            value={lensSettings.edgeFade}
                            min={0}
                            max={1}
                            step={0.02}
                            onChange={(v) => updateLens('edgeFade', v)}
                          />
                        </div>

                        <div className="space-y-3.5">
                          <RangeSlider
                            label="Stage Height"
                            value={lensSettings.stageHeight}
                            min={460}
                            max={700}
                            step={10}
                            suffix="px"
                            disabled={lensSettings.axis === 'vertical'}
                            onChange={(v) => updateLens('stageHeight', v)}
                          />
                          <RangeSlider
                            label="Card Gap"
                            value={lensSettings.cardGap}
                            min={12}
                            max={44}
                            step={1}
                            suffix="px"
                            onChange={(v) => updateLens('cardGap', v)}
                          />
                          <RangeSlider
                            label="Card Corner Radius"
                            value={lensSettings.cardRadius}
                            min={0}
                            max={36}
                            step={1}
                            suffix="px"
                            onChange={(v) => updateLens('cardRadius', v)}
                          />
                          <RangeSlider
                            label="Auto-Glide Speed"
                            value={lensSettings.glideSpeed}
                            min={0.2}
                            max={2.4}
                            step={0.05}
                            suffix="×"
                            disabled={!lensSettings.autoGlide}
                            onChange={(v) => updateLens('glideSpeed', v)}
                          />
                        </div>

                        <div className="flex flex-col gap-2.5">
                          <ToggleRow
                            label="Auto-Glide Deck"
                            hint="Continuously slide cards under the liquid strips"
                            checked={lensSettings.autoGlide}
                            onChange={(v) => updateLens('autoGlide', v)}
                          />
                          <ToggleRow
                            label="Step Aside"
                            hint="Fade out lens & pause WebGL loop cleanly"
                            checked={lensSettings.stepAside}
                            onChange={(v) => updateLens('stepAside', v)}
                          />
                          <ToggleRow
                            label="Show Strip Guides"
                            hint="Visualize where the clear center meets the glass"
                            checked={lensSettings.showGuides}
                            onChange={(v) => updateLens('showGuides', v)}
                          />

                          <pre className="mt-1 max-h-[146px] overflow-auto rounded-[12px] border border-[var(--apple-separator-subtle)] bg-[var(--apple-bg)] p-3 font-mono text-[11px] leading-[1.45] text-[var(--apple-label-secondary)] select-all">
                            {exportedSettingsJson}
                          </pre>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default FlexCarouselLabPage;
