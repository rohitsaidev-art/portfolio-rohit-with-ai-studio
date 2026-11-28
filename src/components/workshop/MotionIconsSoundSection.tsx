import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { AnimateIcon } from '@animate-ui/react/icons';
import { Bell } from '../animate-ui/icons/bell';
import { BellRing } from '../animate-ui/icons/bell-ring';
import { Volume2 } from '../animate-ui/icons/volume-2';
import { Sparkles } from '../animate-ui/icons/sparkles';
import { Check } from '../animate-ui/icons/check';
import { Send } from '../animate-ui/icons/send';
import { Compass } from '../animate-ui/icons/compass';
import { Settings } from '../animate-ui/icons/settings';
import { Heart } from '../animate-ui/icons/heart';
import { AnimatedMuteIcon } from '../icons/MuteToggle';
import type { ResolvedTheme } from '../../utils/appearance';
import type { VisualPaletteId } from '../../utils/workshopStore';
import {
  ICON_SIZE_SCALE,
  MOTION_PLAYGROUND_SPECIMENS,
  MOTION_VOCABULARY,
  type MotionSpecimenId,
  type PlaygroundEasingId,
} from '../../utils/behaviourCatalog';
import {
  EASE_APPLE,
  EASE_OUT_EXPO,
  SPRING_GENTLE,
  SPRING_SEGMENT,
  SPRING_TACTILE,
} from '../../utils/motion';
import { prefersReducedMotion } from '../../utils/scroll';
import {
  playBellChime,
  playPauseTone,
  playSkipTick,
  playStartChime,
  playSuccessChime,
  playTap,
  playTick,
  setSoundEnabled,
  toggleSoundEnabled,
} from '../../utils/soundEngine';
import { showToast } from '../../utils/toast';
import { useSoundEnabled } from '../../utils/useSoundEnabled';
import {
  ArrowUp,
  ArrowUpRight,
  AudioWaveform as LucideWaveform,
  Box,
  Check as LucideCheck,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Eye,
  FileText,
  Gauge,
  Hand,
  Headphones,
  HelpCircle,
  Layers,
  Leaf,
  List,
  Maximize2,
  Menu,
  Monitor,
  Moon,
  PanelLeft,
  Pause,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Sparkles as LucideSparkles,
  Sun,
  Target,
  Upload,
  Volume2 as LucideVolume2,
  VolumeX,
  X,
} from 'lucide-react';
import { SkipBack15Icon, SkipForward15Icon } from '../icons/AudioSkipIcons';
import { CopyTokenButton } from './FoundationDocPrimitives';

const LUCIDE_CATALOG = [
  { name: 'Play', render: () => <Play size={18} strokeWidth={1.75} aria-hidden="true" /> },
  { name: 'Pause', render: () => <Pause size={18} strokeWidth={1.75} aria-hidden="true" /> },
  { name: 'SkipBack15Icon', render: () => <SkipBack15Icon size={20} /> },
  { name: 'SkipForward15Icon', render: () => <SkipForward15Icon size={20} /> },
  { name: 'AudioWaveform', render: () => <LucideWaveform size={18} strokeWidth={1.75} aria-hidden="true" /> },
  { name: 'Headphones', render: () => <Headphones size={18} strokeWidth={1.75} aria-hidden="true" /> },
  { name: 'Volume2', render: () => <LucideVolume2 size={18} strokeWidth={1.75} aria-hidden="true" /> },
  { name: 'VolumeX', render: () => <VolumeX size={18} strokeWidth={1.75} aria-hidden="true" /> },
  { name: 'ChevronLeft', render: () => <ChevronLeft size={16} strokeWidth={1.75} aria-hidden="true" /> },
  { name: 'ChevronRight', render: () => <ChevronRight size={16} strokeWidth={1.75} aria-hidden="true" /> },
  { name: 'ChevronDown', render: () => <ChevronDown size={16} strokeWidth={1.75} aria-hidden="true" /> },
  { name: 'ArrowUp', render: () => <ArrowUp size={16} strokeWidth={1.75} aria-hidden="true" /> },
  { name: 'ArrowUpRight', render: () => <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" /> },
  { name: 'Maximize2', render: () => <Maximize2 size={16} strokeWidth={1.75} aria-hidden="true" /> },
  { name: 'Check', render: () => <LucideCheck size={16} strokeWidth={1.75} aria-hidden="true" /> },
  { name: 'CheckCircle2', render: () => <CheckCircle2 size={18} strokeWidth={1.75} aria-hidden="true" /> },
  { name: 'Copy', render: () => <Copy size={16} strokeWidth={1.75} aria-hidden="true" /> },
  { name: 'X', render: () => <X size={16} strokeWidth={1.75} aria-hidden="true" /> },
  { name: 'Menu', render: () => <Menu size={18} strokeWidth={1.75} aria-hidden="true" /> },
  { name: 'List', render: () => <List size={18} strokeWidth={1.75} aria-hidden="true" /> },
  { name: 'PanelLeft', render: () => <PanelLeft size={18} strokeWidth={1.75} aria-hidden="true" /> },
  { name: 'SlidersHorizontal', render: () => <SlidersHorizontal size={18} strokeWidth={1.75} aria-hidden="true" /> },
  { name: 'Hand', render: () => <Hand size={18} strokeWidth={1.75} aria-hidden="true" /> },
  { name: 'ShieldCheck', render: () => <ShieldCheck size={18} strokeWidth={1.75} aria-hidden="true" /> },
  { name: 'Leaf', render: () => <Leaf size={18} strokeWidth={1.75} aria-hidden="true" /> },
  { name: 'FileText', render: () => <FileText size={16} strokeWidth={1.75} aria-hidden="true" /> },
  { name: 'Target', render: () => <Target size={16} strokeWidth={1.75} aria-hidden="true" /> },
  { name: 'Eye', render: () => <Eye size={16} strokeWidth={1.75} aria-hidden="true" /> },
  { name: 'Layers', render: () => <Layers size={16} strokeWidth={1.75} aria-hidden="true" /> },
  { name: 'Gauge', render: () => <Gauge size={16} strokeWidth={1.75} aria-hidden="true" /> },
  { name: 'Sparkles', render: () => <LucideSparkles size={16} strokeWidth={1.75} aria-hidden="true" /> },
  { name: 'Box', render: () => <Box size={16} strokeWidth={1.75} aria-hidden="true" /> },
  { name: 'Sun', render: () => <Sun size={16} strokeWidth={1.75} aria-hidden="true" /> },
  { name: 'Moon', render: () => <Moon size={16} strokeWidth={1.75} aria-hidden="true" /> },
  { name: 'Monitor', render: () => <Monitor size={16} strokeWidth={1.75} aria-hidden="true" /> },
  { name: 'Smartphone', render: () => <Smartphone size={16} strokeWidth={1.75} aria-hidden="true" /> },
  { name: 'HelpCircle', render: () => <HelpCircle size={16} strokeWidth={1.75} aria-hidden="true" /> },
  { name: 'Download', render: () => <Download size={16} strokeWidth={1.75} aria-hidden="true" /> },
  { name: 'Upload', render: () => <Upload size={16} strokeWidth={1.75} aria-hidden="true" /> },
  { name: 'RotateCcw', render: () => <RotateCcw size={16} strokeWidth={1.75} aria-hidden="true" /> },
] as const;

const ANIMATED_ICONS = [
  { id: 'bell', name: 'Bell', sound: playBellChime, render: () => <Bell size={22} /> },
  { id: 'bell-ring', name: 'Bell Ring', sound: playBellChime, render: () => <BellRing size={22} /> },
  { id: 'volume-2', name: 'Volume', sound: playStartChime, render: () => <Volume2 size={22} /> },
  { id: 'sparkles', name: 'Sparkles', sound: playSuccessChime, render: () => <Sparkles size={22} /> },
  { id: 'check', name: 'Check', sound: playSuccessChime, render: () => <Check size={22} /> },
  { id: 'send', name: 'Send', sound: playTap, render: () => <Send size={22} /> },
  { id: 'compass', name: 'Compass', sound: playTick, render: () => <Compass size={22} /> },
  { id: 'settings', name: 'Settings', sound: playTick, render: () => <Settings size={22} /> },
  { id: 'heart', name: 'Heart', sound: playTap, render: () => <Heart size={22} /> },
] as const;

const MOTION_CURVES = [
  {
    id: 'ease-apple',
    name: 'EASE_APPLE',
    spec: 'cubic-bezier(0.22, 1, 0.36, 1) · 440ms',
    usage: 'Route entries, sheets, reveals',
    path: 'M 4 56 C 18 4, 29 4, 96 4',
    transition: { duration: 0.44, ease: EASE_APPLE },
  },
  {
    id: 'ease-out-expo',
    name: 'EASE_OUT_EXPO',
    spec: 'cubic-bezier(0.16, 1, 0.3, 1) · 320ms',
    usage: 'Snappy micro-feedback & drawers',
    path: 'M 4 56 C 14 4, 24 4, 96 4',
    transition: { duration: 0.32, ease: EASE_OUT_EXPO },
  },
  {
    id: 'spring-segment',
    name: 'SPRING_SEGMENT',
    spec: '420 / 36 / 0.72',
    usage: 'Segmented thumb & active nav underline',
    path: 'M 4 56 C 20 8, 42 2, 96 4',
    transition: SPRING_SEGMENT,
  },
  {
    id: 'spring-tactile',
    name: 'SPRING_TACTILE',
    spec: '480 / 34 / 0.68',
    usage: 'Direct press detents & recovery',
    path: 'M 4 56 C 16 10, 36 1, 96 4',
    transition: SPRING_TACTILE,
  },
  {
    id: 'spring-gentle',
    name: 'SPRING_GENTLE',
    spec: '280 / 30 / 0.85',
    usage: 'Showcase panels & progress tracks',
    path: 'M 4 56 C 28 16, 54 4, 96 4',
    transition: SPRING_GENTLE,
  },
] as const;

const PLAYGROUND_EASINGS: readonly {
  id: PlaygroundEasingId;
  label: string;
  cssValue: string;
  codeToken: string;
}[] = [
  { id: 'ease-apple', label: 'EASE_APPLE', cssValue: 'cubic-bezier(0.22, 1, 0.36, 1)', codeToken: 'EASE_APPLE' },
  { id: 'ease-out-expo', label: 'EASE_OUT_EXPO', cssValue: 'cubic-bezier(0.16, 1, 0.3, 1)', codeToken: 'EASE_OUT_EXPO' },
  { id: 'spring-segment', label: 'SPRING_SEGMENT', cssValue: 'spring(420, 36, 0.72)', codeToken: 'SPRING_SEGMENT' },
  { id: 'spring-tactile', label: 'SPRING_TACTILE', cssValue: 'spring(480, 34, 0.68)', codeToken: 'SPRING_TACTILE' },
  { id: 'spring-gentle', label: 'SPRING_GENTLE', cssValue: 'spring(280, 30, 0.85)', codeToken: 'SPRING_GENTLE' },
  { id: 'linear', label: 'Linear', cssValue: 'linear', codeToken: '"linear"' },
] as const;

const SOUND_CUES = [
  { id: 'tick', name: 'Detent Tick', trigger: 'Segmented switch & filters', play: playTick },
  { id: 'tap', name: 'Surface Tap', trigger: 'Modals & lightbox open', play: playTap },
  { id: 'start', name: 'Play Chime', trigger: 'Audio playback start', play: playStartChime },
  { id: 'pause', name: 'Pause Tone', trigger: 'Audio pause & dismiss', play: playPauseTone },
  { id: 'skip-back', name: 'Skip −15s', trigger: 'Audio rewind', play: () => playSkipTick('back') },
  { id: 'skip-fwd', name: 'Skip +15s', trigger: 'Audio forward', play: () => playSkipTick('forward') },
  { id: 'bell', name: 'Bell Chime', trigger: 'Notification cue', play: playBellChime },
  { id: 'success', name: 'Success Chord', trigger: 'Copy & form submit', play: playSuccessChime },
] as const;

function resolvePlaygroundTransition(
  easingId: PlaygroundEasingId,
  durationMs: number,
  delayMs: number,
  reduced: boolean,
) {
  if (reduced) {
    return { duration: 0.01, delay: 0 };
  }
  const delay = delayMs / 1000;
  const duration = durationMs / 1000;
  switch (easingId) {
    case 'ease-apple':
      return { duration, delay, ease: EASE_APPLE };
    case 'ease-out-expo':
      return { duration, delay, ease: EASE_OUT_EXPO };
    case 'spring-segment':
      return { ...SPRING_SEGMENT, delay };
    case 'spring-tactile':
      return { ...SPRING_TACTILE, delay };
    case 'spring-gentle':
      return { ...SPRING_GENTLE, delay };
    case 'linear':
      return { duration, delay, ease: 'linear' as const };
  }
}

export type MotionIconsSoundView = 'all' | 'motion' | 'icons-sound';

interface MotionIconsSoundSectionProps {
  view?: MotionIconsSoundView;
  sandboxPalette?: VisualPaletteId;
  sandboxTheme?: ResolvedTheme;
}

export function MotionIconsSoundSection({
  view = 'all',
  sandboxPalette = 'warm',
  sandboxTheme = 'light',
}: MotionIconsSoundSectionProps = {}) {
  const showMotion = view === 'all' || view === 'motion';
  const showIconsSound = view === 'all' || view === 'icons-sound';
  const [iconTrigger, setIconTrigger] = useState<'hover' | 'tap' | 'loop'>('hover');
  const [iconSearch, setIconSearch] = useState('');
  const [runnerSide, setRunnerSide] = useState<'left' | 'right'>('left');
  const [lastSound, setLastSound] = useState<string | null>(null);
  const soundOn = useSoundEnabled();
  const osReducedMotion = prefersReducedMotion();

  // Interactive Motion Playground state
  const [specimenId, setSpecimenId] = useState<MotionSpecimenId>('popover-drawer');
  const activeSpecimen =
    MOTION_PLAYGROUND_SPECIMENS.find((s) => s.id === specimenId) ??
    MOTION_PLAYGROUND_SPECIMENS[0];
  const [durationMs, setDurationMs] = useState<number>(activeSpecimen.baseline.durationMs);
  const [easingId, setEasingId] = useState<PlaygroundEasingId>(activeSpecimen.baseline.easingId);
  const [delayMs, setDelayMs] = useState<number>(activeSpecimen.baseline.delayMs);
  const [distancePx, setDistancePx] = useState<number>(activeSpecimen.baseline.distancePx);
  const [compareBeforeAfter, setCompareBeforeAfter] = useState<boolean>(true);
  const [reducedPreview, setReducedPreview] = useState<boolean>(osReducedMotion);
  const [playTickKey, setPlayTickKey] = useState<number>(0);

  const effectiveReduced = osReducedMotion || reducedPreview;

  const filteredSymbols = useMemo(() => {
    const q = iconSearch.trim().toLowerCase();
    if (!q) return LUCIDE_CATALOG;
    return LUCIDE_CATALOG.filter((s) => s.name.toLowerCase().includes(q));
  }, [iconSearch]);

  const handleCopySymbol = async (name: string) => {
    try {
      await navigator.clipboard.writeText(name);
    } catch {
      // Clipboard fallback ignored
    }
    playTick();
    showToast({ message: `Copied icon "${name}"`, tone: 'success' });
  };

  const handleSelectSpecimen = (nextId: MotionSpecimenId) => {
    const found = MOTION_PLAYGROUND_SPECIMENS.find((s) => s.id === nextId);
    if (!found) return;
    playTick();
    setSpecimenId(nextId);
    setDurationMs(found.baseline.durationMs);
    setEasingId(found.baseline.easingId);
    setDelayMs(found.baseline.delayMs);
    setDistancePx(found.baseline.distancePx);
    setPlayTickKey((k) => k + 1);
  };

  const handleResetPlayground = () => {
    playTick();
    setDurationMs(activeSpecimen.baseline.durationMs);
    setEasingId(activeSpecimen.baseline.easingId);
    setDelayMs(activeSpecimen.baseline.delayMs);
    setDistancePx(activeSpecimen.baseline.distancePx);
    setReducedPreview(osReducedMotion);
    setPlayTickKey((k) => k + 1);
  };

  const playgroundSnippet = useMemo(() => {
    const easingEntry =
      PLAYGROUND_EASINGS.find((e) => e.id === easingId) ?? PLAYGROUND_EASINGS[0];
    const isSpring = easingId.startsWith('spring-');
    if (effectiveReduced) {
      return `transition={{ duration: 0.01 }} // reduced motion: 0px offset`;
    }
    if (isSpring) {
      return `initial={{ opacity: 0, y: ${distancePx} }}\nanimate={{ opacity: 1, y: 0 }}\ntransition={{ ...${easingEntry.codeToken}, delay: ${(delayMs / 1000).toFixed(2)} }}`;
    }
    return `transition: transform ${durationMs}ms ${easingEntry.cssValue} ${delayMs}ms, opacity ${durationMs}ms ${easingEntry.cssValue} ${delayMs}ms;`;
  }, [delayMs, distancePx, durationMs, easingId, effectiveReduced]);

  const renderPlaygroundCard = (
    mode: 'baseline' | 'candidate',
    params: {
      durationMs: number;
      easingId: PlaygroundEasingId;
      delayMs: number;
      distancePx: number;
    },
  ) => {
    const transition = resolvePlaygroundTransition(
      params.easingId,
      params.durationMs,
      params.delayMs,
      effectiveReduced,
    );
    const yOffset = effectiveReduced ? 0 : params.distancePx;

    return (
      <div
        data-ds-sandbox="true"
        data-ds-palette={sandboxPalette}
        data-ds-theme={sandboxTheme}
        className="rounded-[18px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] p-4 sm:p-5"
      >
        <div className="mb-3.5 flex items-center justify-between gap-2">
          <span
            className={`text-[12px] font-semibold ${
              mode === 'candidate'
                ? 'text-[var(--apple-link)]'
                : 'text-[var(--apple-label-primary)]'
            }`}
          >
            {mode === 'candidate' ? 'Candidate' : 'Baseline'}
          </span>
          <span className="font-mono text-[11px] tabular-nums text-[var(--apple-label-tertiary)]">
            {effectiveReduced
              ? 'Reduced · 10ms'
              : `${params.durationMs}ms · ${params.distancePx}px`}
          </span>
        </div>

        <div className="flex min-h-[140px] items-center justify-center rounded-[14px] border border-[var(--apple-separator-subtle)] bg-[var(--apple-bg)] p-4">
          {specimenId === 'button-press' && (
            <motion.button
              key={`${mode}-btn-${playTickKey}`}
              type="button"
              initial={effectiveReduced ? { opacity: 0.7 } : { scale: 0.94, y: yOffset }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              whileTap={effectiveReduced ? undefined : { scale: 0.96 }}
              transition={transition}
              onClick={() => {
                playTick();
                setPlayTickKey((k) => k + 1);
              }}
              className="apple-btn-primary !min-h-[38px] !px-5 !text-[13px]"
            >
              Confirm Action
            </motion.button>
          )}

          {specimenId === 'popover-drawer' && (
            <motion.div
              key={`${mode}-pop-${playTickKey}`}
              initial={effectiveReduced ? { opacity: 0 } : { opacity: 0, y: yOffset, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={transition}
              className="w-full max-w-[240px] rounded-[14px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-3.5 shadow-[var(--shadow-apple-card)]"
            >
              <p className="text-[13px] font-semibold text-[var(--apple-label-primary)]">
                Preferences Sheet
              </p>
              <p className="mt-1 text-[12px] text-[var(--apple-label-secondary)]">
                Anchored reveal with zero layout shift.
              </p>
            </motion.div>
          )}

          {specimenId === 'accordion-disclosure' && (
            <motion.div
              key={`${mode}-acc-${playTickKey}`}
              initial={effectiveReduced ? { opacity: 0 } : { opacity: 0, y: -yOffset * 0.5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={transition}
              className="w-full max-w-[260px] rounded-[14px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-3.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-[var(--apple-label-primary)]">
                  Case Study Notes
                </span>
                <ChevronDown size={13} strokeWidth={2} aria-hidden="true" className="rotate-180 text-[var(--apple-label-tertiary)]" />
              </div>
              <p className="mt-2 border-t border-[var(--apple-separator-subtle)] pt-2 text-[12px] text-[var(--apple-label-secondary)]">
                Expanded body revealed along the compositor layer.
              </p>
            </motion.div>
          )}

          {specimenId === 'toast-notification' && (
            <motion.div
              key={`${mode}-toast-${playTickKey}`}
              initial={effectiveReduced ? { opacity: 0 } : { opacity: 0, y: yOffset }}
              animate={{ opacity: 1, y: 0 }}
              transition={transition}
              className="apple-ios-bar inline-flex items-center gap-2 rounded-full border border-[var(--apple-separator)] px-4 py-2 text-[12.5px] font-medium text-[var(--apple-label-primary)]"
            >
              <LucideCheck size={13} strokeWidth={2} aria-hidden="true" className="text-[var(--apple-blue)]" />
              <span>Copied to clipboard</span>
            </motion.div>
          )}

          {specimenId === 'section-reveal' && (
            <motion.div
              key={`${mode}-sec-${playTickKey}`}
              initial={effectiveReduced ? { opacity: 0 } : { opacity: 0, y: yOffset }}
              animate={{ opacity: 1, y: 0 }}
              transition={transition}
              className="w-full max-w-[260px] space-y-1 text-left"
            >
              <p className="text-[11px] font-medium text-[var(--apple-link)]">01 · Section</p>
              <p className="text-[14px] font-semibold text-[var(--apple-label-primary)]">
                Calm, short-distance entrance.
              </p>
              <p className="text-[12px] text-[var(--apple-label-secondary)]">
                Legible immediately without sweeping travel.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-12">
      {/* ── MOTION VIEW ─────────────────────────────────────────────────── */}
      {showMotion && (
        <>
          {/* Interactive Motion Playground (Lead Visual) */}
          <section aria-labelledby="ws-motion-playground-heading">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div
                role="tablist"
                aria-label="Motion playground specimens"
                className="flex flex-wrap gap-1.5"
              >
                {MOTION_PLAYGROUND_SPECIMENS.map((spec) => {
                  const active = spec.id === specimenId;
                  return (
                    <button
                      key={spec.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => handleSelectSpecimen(spec.id)}
                      className={`min-h-[34px] whitespace-nowrap rounded-full border px-3.5 py-1 text-[12.5px] font-medium transition-colors ${
                        active
                          ? 'border-[var(--apple-label-primary)] bg-[var(--apple-label-primary)] text-[var(--apple-bg)]'
                          : 'border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                      }`}
                    >
                      {spec.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  aria-pressed={compareBeforeAfter}
                  onClick={() => {
                    playTick();
                    setCompareBeforeAfter((v) => !v);
                    setPlayTickKey((k) => k + 1);
                  }}
                  className={
                    compareBeforeAfter
                      ? 'apple-btn-tonal !min-h-[34px] whitespace-nowrap !px-3 !py-1 !text-[12px]'
                      : 'apple-btn-outline !min-h-[34px] whitespace-nowrap !px-3 !py-1 !text-[12px]'
                  }
                >
                  {compareBeforeAfter ? 'Side-by-Side' : 'Single View'}
                </button>
                <button
                  type="button"
                  aria-pressed={reducedPreview}
                  onClick={() => {
                    playTick();
                    setReducedPreview((v) => !v);
                    setPlayTickKey((k) => k + 1);
                  }}
                  className={
                    reducedPreview
                      ? 'apple-btn-primary !min-h-[34px] whitespace-nowrap !px-3 !py-1 !text-[12px]'
                      : 'apple-btn-outline !min-h-[34px] whitespace-nowrap !px-3 !py-1 !text-[12px]'
                  }
                >
                  {reducedPreview ? 'Reduced Motion: On' : 'Reduced Motion'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playTick();
                    setPlayTickKey((k) => k + 1);
                  }}
                  className="apple-btn-primary !min-h-[34px] whitespace-nowrap !px-3.5 !py-1 !text-[12px]"
                >
                  <Play size={11} strokeWidth={2} fill="currentColor" aria-hidden="true" />
                  <span>Replay</span>
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Compact Controls */}
              <div className="space-y-4 rounded-[18px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-5 lg:col-span-4">
                <div className="flex items-center justify-between gap-2">
                  <h2
                    id="ws-motion-playground-heading"
                    className="text-[15px] font-semibold text-[var(--apple-label-primary)]"
                  >
                    {activeSpecimen.label}
                  </h2>
                  <button
                    type="button"
                    onClick={handleResetPlayground}
                    aria-label="Reset motion parameters"
                    title="Reset to baseline"
                    className="apple-btn-icon h-7 w-7 bg-[var(--apple-bg-secondary)] text-[var(--apple-label-secondary)]"
                  >
                    <RotateCcw size={12} strokeWidth={2} aria-hidden="true" />
                  </button>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <div className="flex items-center justify-between text-[12.5px]">
                      <label htmlFor="motion-pg-duration" className="font-medium text-[var(--apple-label-primary)]">
                        Duration
                      </label>
                      <span className="font-mono tabular-nums text-[var(--apple-link)]">
                        {durationMs}ms
                      </span>
                    </div>
                    <input
                      id="motion-pg-duration"
                      type="range"
                      min={80}
                      max={700}
                      step={20}
                      value={durationMs}
                      disabled={easingId.startsWith('spring-') || effectiveReduced}
                      onChange={(e) => {
                        setDurationMs(Number(e.target.value));
                        setPlayTickKey((k) => k + 1);
                      }}
                      className="mt-1.5 w-full accent-[var(--apple-blue)]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="motion-pg-easing"
                      className="block text-[12.5px] font-medium text-[var(--apple-label-primary)]"
                    >
                      Curve
                    </label>
                    <select
                      id="motion-pg-easing"
                      value={easingId}
                      disabled={effectiveReduced}
                      onChange={(e) => {
                        playTick();
                        setEasingId(e.target.value as PlaygroundEasingId);
                        setPlayTickKey((k) => k + 1);
                      }}
                      className="apple-input mt-1 w-full rounded-[10px] px-3 py-1.5 text-[12.5px]"
                    >
                      {PLAYGROUND_EASINGS.map((ease) => (
                        <option key={ease.id} value={ease.id}>
                          {ease.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[12.5px]">
                      <label htmlFor="motion-pg-delay" className="font-medium text-[var(--apple-label-primary)]">
                        Delay
                      </label>
                      <span className="font-mono tabular-nums text-[var(--apple-link)]">
                        {delayMs}ms
                      </span>
                    </div>
                    <input
                      id="motion-pg-delay"
                      type="range"
                      min={0}
                      max={300}
                      step={20}
                      value={delayMs}
                      disabled={effectiveReduced}
                      onChange={(e) => {
                        setDelayMs(Number(e.target.value));
                        setPlayTickKey((k) => k + 1);
                      }}
                      className="mt-1.5 w-full accent-[var(--apple-blue)]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[12.5px]">
                      <label htmlFor="motion-pg-distance" className="font-medium text-[var(--apple-label-primary)]">
                        Offset
                      </label>
                      <span className="font-mono tabular-nums text-[var(--apple-link)]">
                        {distancePx}px
                      </span>
                    </div>
                    <input
                      id="motion-pg-distance"
                      type="range"
                      min={0}
                      max={32}
                      step={2}
                      value={distancePx}
                      disabled={effectiveReduced}
                      onChange={(e) => {
                        setDistancePx(Number(e.target.value));
                        setPlayTickKey((k) => k + 1);
                      }}
                      className="mt-1.5 w-full accent-[var(--apple-blue)]"
                    />
                  </div>
                </div>
              </div>

              {/* Side-by-Side Stage + Copyable Snippet */}
              <div className="space-y-4 lg:col-span-8">
                <div
                  className={
                    compareBeforeAfter
                      ? 'grid grid-cols-1 gap-4 xl:grid-cols-2'
                      : 'grid grid-cols-1'
                  }
                >
                  {compareBeforeAfter &&
                    renderPlaygroundCard('baseline', activeSpecimen.baseline)}
                  {renderPlaygroundCard('candidate', {
                    durationMs,
                    easingId,
                    delayMs,
                    distancePx,
                  })}
                </div>

                <div className="flex items-center justify-between gap-3 rounded-[14px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-4 py-3">
                  <code className="truncate font-mono text-[12px] text-[var(--apple-label-secondary)]">
                    {playgroundSnippet.replace(/\n/g, ' · ')}
                  </code>
                  <CopyTokenButton value={playgroundSnippet} label="Copy" compact />
                </div>
              </div>
            </div>
          </section>

          {/* Live Easing Curves */}
          <section
            aria-labelledby="ws-curves-heading"
            className="border-t border-[var(--apple-separator)] pt-10"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 id="ws-curves-heading" className="type-title-3 text-[var(--apple-label-primary)]">
                  Easing Curves &amp; Springs
                </h2>
                <p className="mt-1 text-[13.5px] text-[var(--apple-label-secondary)]">
                  Compare all five motion curves side-by-side.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  playTick();
                  setRunnerSide((prev) => (prev === 'left' ? 'right' : 'left'));
                }}
                className="apple-btn-primary !min-h-[34px] shrink-0 whitespace-nowrap !px-4 !py-1 !text-[12.5px]"
              >
                Run Curves
              </button>
            </div>

            <div className="mt-5 space-y-2.5">
              {MOTION_CURVES.map((curve) => (
                <div
                  key={curve.id}
                  className="grid grid-cols-1 gap-4 rounded-[16px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-4 md:grid-cols-12 md:items-center"
                >
                  <div className="flex items-center gap-3.5 md:col-span-5">
                    <svg
                      width="52"
                      height="34"
                      viewBox="0 0 100 60"
                      aria-hidden="true"
                      className="shrink-0 rounded-[8px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)]"
                    >
                      <path
                        d={curve.path}
                        fill="none"
                        stroke="var(--apple-blue)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="min-w-0">
                      <p className="font-mono text-[12.5px] font-semibold text-[var(--apple-label-primary)]">
                        {curve.name}
                      </p>
                      <p className="truncate text-[12px] text-[var(--apple-label-secondary)]">
                        {curve.usage}
                      </p>
                    </div>
                  </div>

                  <div className="md:col-span-7">
                    <div className="relative h-9 w-full overflow-hidden rounded-full bg-[var(--apple-bg-secondary)] px-1.5">
                      <motion.div
                        animate={{ x: runnerSide === 'right' ? 'calc(100% - 26px)' : '0%' }}
                        transition={effectiveReduced ? { duration: 0.01 } : curve.transition}
                        className="relative flex h-full w-full items-center"
                      >
                        <span className="h-6 w-6 rounded-full bg-[var(--apple-blue)] shadow-xs" />
                      </motion.div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Compact Timing Tokens */}
          <section
            aria-labelledby="ws-motion-tokens-heading"
            className="border-t border-[var(--apple-separator)] pt-10"
          >
            <h2 id="ws-motion-tokens-heading" className="type-title-3 text-[var(--apple-label-primary)]">
              Motion Tokens
            </h2>
            <div className="mt-4 overflow-x-auto rounded-[16px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)]">
              <table className="w-full min-w-[600px] border-collapse text-left">
                <tbody className="divide-y divide-[var(--apple-separator-subtle)] text-[13px]">
                  {MOTION_VOCABULARY.map((row) => (
                    <tr key={`${row.category}-${row.token}`}>
                      <td className="px-4 py-3 font-mono text-[12.5px] font-semibold text-[var(--apple-label-primary)]">
                        {row.token}
                      </td>
                      <td className="px-4 py-3 font-mono text-[12px] tabular-nums text-[var(--apple-link)]">
                        {row.value}
                      </td>
                      <td className="px-4 py-3 text-[12.5px] text-[var(--apple-label-secondary)]">
                        {row.usage}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <CopyTokenButton value={row.value} label="Copy" compact />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* ── ICONS & SOUND VIEW ──────────────────────────────────────────── */}
      {showIconsSound && (
        <>
          {/* Animated Icons */}
          <section
            aria-labelledby="ws-icons-heading"
            className={view === 'all' ? 'border-t border-[var(--apple-separator)] pt-12' : ''}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 id="ws-icons-heading" className="type-title-3 text-[var(--apple-label-primary)]">
                  Animated Lucide Icons
                </h2>
                <p className="mt-1 text-[13.5px] text-[var(--apple-label-secondary)]">
                  {ANIMATED_ICONS.length} @animate-ui/react Lucide motion primitives calibrated to 1.75px stroke with automatic static fallback under prefers-reduced-motion.
                </p>
              </div>

              <div className="apple-segmented shrink-0" role="group" aria-label="Animated icon trigger mode">
                {(
                  [
                    { id: 'hover', label: 'Hover' },
                    { id: 'tap', label: 'Click' },
                    { id: 'loop', label: 'Loop' },
                  ] as const
                ).map((mode) => {
                  const active = iconTrigger === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        playTick();
                        setIconTrigger(mode.id);
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
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {ANIMATED_ICONS.map((item) => (
                <AnimateIcon
                  key={item.id}
                  animateOnHover={iconTrigger === 'hover'}
                  animateOnTap
                  animate={iconTrigger === 'loop'}
                  loop={iconTrigger === 'loop'}
                  loopDelay={1500}
                  asChild
                >
                  <button
                    type="button"
                    onClick={() => {
                      item.sound();
                      setLastSound(item.name);
                    }}
                    className="group flex flex-col items-center justify-center gap-2.5 rounded-[16px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-4 text-center transition-colors hover:border-[var(--apple-separator-strong)]"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[var(--apple-bg-secondary)] text-[var(--apple-label-primary)] transition-colors group-hover:bg-[var(--apple-blue)]/10 group-hover:text-[var(--apple-blue)]">
                      {item.render()}
                    </span>
                    <span className="text-[13px] font-medium text-[var(--apple-label-primary)]">
                      {item.name}
                    </span>
                  </button>
                </AnimateIcon>
              ))}
            </div>
          </section>

          {/* Searchable Lucide Icons Grid */}
          <section
            aria-labelledby="ws-lucide-icons-heading"
            className="border-t border-[var(--apple-separator)] pt-10"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 id="ws-lucide-icons-heading" className="type-title-3 text-[var(--apple-label-primary)]">
                  Lucide Icons ({LUCIDE_CATALOG.length})
                </h2>
                <p className="mt-1 text-[13.5px] text-[var(--apple-label-secondary)]">
                  Unified 1.75px stroke standard (2px for 12–13px micro · 1.5px for ≥ 24px). Click any icon to copy its component name.
                </p>
              </div>

              <div className="relative w-full sm:w-[240px]">
                <label htmlFor="lucide-icon-search" className="sr-only">
                  Search icons
                </label>
                <Search
                  size={14}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--apple-label-tertiary)]"
                />
                <input
                  id="lucide-icon-search"
                  type="search"
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value)}
                  placeholder="Filter Lucide icons…"
                  className="apple-input min-h-[36px] rounded-[10px] py-1 pl-8 pr-3 text-[13px]"
                />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2.5 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
              {filteredSymbols.map((sym) => (
                <button
                  key={sym.name}
                  type="button"
                  onClick={() => void handleCopySymbol(sym.name)}
                  className="group flex flex-col items-center justify-center rounded-[14px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-2 py-3.5 text-center text-[var(--apple-label-primary)] transition-colors hover:border-[var(--apple-blue)]/40 hover:bg-[var(--apple-bg-secondary)]"
                >
                  <span className="transition-transform group-hover:scale-105">{sym.render()}</span>
                  <span className="mt-2 w-full truncate font-mono text-[10.5px] text-[var(--apple-label-tertiary)]">
                    {sym.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Compact Optical Size Strip */}
            <div className="mt-6 flex flex-wrap items-center gap-3 rounded-[16px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] px-4 py-3">
              <span className="text-[12px] font-medium text-[var(--apple-label-tertiary)]">
                Optical Sizes:
              </span>
              {ICON_SIZE_SCALE.map((step) => (
                <div
                  key={step.px}
                  className="inline-flex items-center gap-1.5 text-[12px] text-[var(--apple-label-primary)]"
                >
                  <LucideSparkles
                    size={step.px}
                    strokeWidth={step.px <= 13 ? 2 : step.px >= 24 ? 1.5 : 1.75}
                    aria-hidden="true"
                  />
                  <span className="font-mono tabular-nums text-[var(--apple-label-secondary)]">
                    {step.px}px
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Clean Sound Studio */}
          <section
            aria-labelledby="ws-sound-heading"
            className="border-t border-[var(--apple-separator)] pt-10"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 id="ws-sound-heading" className="type-title-3 text-[var(--apple-label-primary)]">
                  UI Sound Studio
                </h2>
                <p className="mt-1 text-[13.5px] text-[var(--apple-label-secondary)]">
                  Synthesized tactile cues played on commits and toggles, never on scroll or hover.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {lastSound && (
                  <span className="text-[12.5px] text-[var(--apple-label-tertiary)]">
                    Played: <strong className="font-medium text-[var(--apple-label-primary)]">{lastSound}</strong>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => toggleSoundEnabled()}
                  aria-pressed={soundOn}
                  className={
                    soundOn
                      ? 'apple-btn-primary !min-h-[34px] whitespace-nowrap !px-3.5 !py-1 !text-[12.5px]'
                      : 'apple-btn-tonal !min-h-[34px] whitespace-nowrap !px-3.5 !py-1 !text-[12.5px]'
                  }
                >
                  <AnimatedMuteIcon
                    muted={!soundOn}
                    size={14.5}
                    strokeWidth={1.9}
                  />
                  <span>{soundOn ? 'Sound On' : 'Muted'}</span>
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {SOUND_CUES.map((cue) => (
                <button
                  key={cue.id}
                  type="button"
                  onClick={() => {
                    if (!soundOn) setSoundEnabled(true);
                    cue.play();
                    setLastSound(cue.name);
                  }}
                  className="group flex flex-col justify-between rounded-[16px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-4 text-left transition-colors hover:border-[var(--apple-separator-strong)] active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13.5px] font-semibold text-[var(--apple-label-primary)] group-hover:text-[var(--apple-link)]">
                      {cue.name}
                    </span>
                    <LucideVolume2
                      size={14}
                      strokeWidth={1.75}
                      aria-hidden="true"
                      className="shrink-0 text-[var(--apple-label-tertiary)] group-hover:text-[var(--apple-blue)]"
                    />
                  </div>
                  <p className="mt-1.5 text-[12px] text-[var(--apple-label-secondary)]">
                    {cue.trigger}
                  </p>
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
