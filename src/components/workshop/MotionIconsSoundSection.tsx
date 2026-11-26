import { useState } from 'react';
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
import { useSoundEnabled } from '../../utils/useSoundEnabled';
import {
  SFArrowUp,
  SFArrowUpRight,
  SFCheckmark,
  SFCheckmarkCircleFill,
  SFChevronDown,
  SFChevronLeft,
  SFChevronRight,
  SFCube,
  SFDial,
  SFDisplay,
  SFDocOnDoc,
  SFDocText,
  SFDownload,
  SFExpand,
  SFEye,
  SFGoBackward15,
  SFGoForward15,
  SFHandRaised,
  SFHeadphones,
  SFLayers,
  SFLeaf,
  SFListBullet,
  SFMenu,
  SFMoon,
  SFPauseFill,
  SFPlayFill,
  SFQuestionCircle,
  SFReset,
  SFScope,
  SFShieldCheck,
  SFSidebarLeft,
  SFSliders,
  SFSparkles,
  SFSpeakerSlash,
  SFSpeakerWave,
  SFSunMax,
  SFUpload,
  SFWaveform,
  SFXmark,
  SFiPhone,
} from '../SFSymbols';

const SF_CATALOG = [
  { name: 'play.fill', render: () => <SFPlayFill size={18} /> },
  { name: 'pause.fill', render: () => <SFPauseFill size={18} /> },
  { name: 'gobackward.15', render: () => <SFGoBackward15 size={20} /> },
  { name: 'goforward.15', render: () => <SFGoForward15 size={20} /> },
  { name: 'waveform', render: () => <SFWaveform size={18} /> },
  { name: 'headphones', render: () => <SFHeadphones size={18} /> },
  { name: 'speaker.wave.2', render: () => <SFSpeakerWave size={18} /> },
  { name: 'speaker.slash', render: () => <SFSpeakerSlash size={18} /> },
  { name: 'chevron.left', render: () => <SFChevronLeft size={16} /> },
  { name: 'chevron.right', render: () => <SFChevronRight size={16} /> },
  { name: 'chevron.down', render: () => <SFChevronDown size={16} /> },
  { name: 'arrow.up', render: () => <SFArrowUp size={16} /> },
  { name: 'arrow.up.right', render: () => <SFArrowUpRight size={16} /> },
  { name: 'expand', render: () => <SFExpand size={16} /> },
  { name: 'checkmark', render: () => <SFCheckmark size={16} /> },
  { name: 'checkmark.circle.fill', render: () => <SFCheckmarkCircleFill size={18} /> },
  { name: 'doc.on.doc', render: () => <SFDocOnDoc size={16} /> },
  { name: 'xmark', render: () => <SFXmark size={16} /> },
  { name: 'line.3.horizontal', render: () => <SFMenu size={18} /> },
  { name: 'list.bullet', render: () => <SFListBullet size={18} /> },
  { name: 'sidebar.left', render: () => <SFSidebarLeft size={18} /> },
  { name: 'slider.horizontal.3', render: () => <SFSliders size={18} /> },
  { name: 'hand.raised', render: () => <SFHandRaised size={18} /> },
  { name: 'checkmark.shield', render: () => <SFShieldCheck size={18} /> },
  { name: 'leaf', render: () => <SFLeaf size={18} /> },
  { name: 'doc.text', render: () => <SFDocText size={16} /> },
  { name: 'scope', render: () => <SFScope size={16} /> },
  { name: 'eye', render: () => <SFEye size={16} /> },
  { name: 'layers', render: () => <SFLayers size={16} /> },
  { name: 'dial.low', render: () => <SFDial size={16} /> },
  { name: 'sparkles', render: () => <SFSparkles size={16} /> },
  { name: 'cube', render: () => <SFCube size={16} /> },
  { name: 'sun.max', render: () => <SFSunMax size={16} /> },
  { name: 'moon', render: () => <SFMoon size={16} /> },
  { name: 'display', render: () => <SFDisplay size={16} /> },
  { name: 'iphone', render: () => <SFiPhone size={16} /> },
  { name: 'questionmark.circle', render: () => <SFQuestionCircle size={16} /> },
  { name: 'download', render: () => <SFDownload size={16} /> },
  { name: 'upload', render: () => <SFUpload size={16} /> },
  { name: 'reset', render: () => <SFReset size={16} /> },
] as const;

const ANIMATED_ICONS = [
  { id: 'bell', name: 'Bell', registry: '@animate-ui/icons-lucide-bell', sound: playBellChime, render: () => <Bell size={24} /> },
  { id: 'bell-ring', name: 'Bell Ring', registry: '@animate-ui/icons-lucide-bell-ring', sound: playBellChime, render: () => <BellRing size={24} /> },
  { id: 'volume-2', name: 'Volume 2', registry: '@animate-ui/icons-lucide-volume-2', sound: playStartChime, render: () => <Volume2 size={24} /> },
  { id: 'sparkles', name: 'Sparkles', registry: '@animate-ui/icons-lucide-sparkles', sound: playSuccessChime, render: () => <Sparkles size={24} /> },
  { id: 'check', name: 'Check', registry: '@animate-ui/icons-lucide-check', sound: playSuccessChime, render: () => <Check size={24} /> },
  { id: 'send', name: 'Send', registry: '@animate-ui/icons-lucide-send', sound: playTap, render: () => <Send size={24} /> },
  { id: 'compass', name: 'Compass', registry: '@animate-ui/icons-lucide-compass', sound: playTick, render: () => <Compass size={24} /> },
  { id: 'settings', name: 'Settings', registry: '@animate-ui/icons-lucide-settings', sound: playTick, render: () => <Settings size={24} /> },
  { id: 'heart', name: 'Heart', registry: '@animate-ui/icons-lucide-heart', sound: playTap, render: () => <Heart size={24} /> },
] as const;

const MOTION_CURVES = [
  {
    id: 'ease-apple',
    name: 'EASE_APPLE',
    spec: 'cubic-bezier(0.22, 1, 0.36, 1) · 440ms',
    usage: 'Route entries, modal sheets, reveal choreography',
    path: 'M 4 56 C 18 4, 29 4, 96 4',
    transition: { duration: 0.44, ease: EASE_APPLE },
  },
  {
    id: 'ease-out-expo',
    name: 'EASE_OUT_EXPO',
    spec: 'cubic-bezier(0.16, 1, 0.3, 1) · 320ms',
    usage: 'Snappy micro-feedback & drawer settles',
    path: 'M 4 56 C 14 4, 24 4, 96 4',
    transition: { duration: 0.32, ease: EASE_OUT_EXPO },
  },
  {
    id: 'spring-segment',
    name: 'SPRING_SEGMENT',
    spec: 'stiffness 420 · damping 36 · mass 0.72',
    usage: 'Sliding segmented control thumb & active nav underline',
    path: 'M 4 56 C 20 8, 42 2, 96 4',
    transition: SPRING_SEGMENT,
  },
  {
    id: 'spring-tactile',
    name: 'SPRING_TACTILE',
    spec: 'stiffness 480 · damping 34 · mass 0.68',
    usage: 'Direct manipulation detents & crisp press recovery',
    path: 'M 4 56 C 16 10, 36 1, 96 4',
    transition: SPRING_TACTILE,
  },
  {
    id: 'spring-gentle',
    name: 'SPRING_GENTLE',
    spec: 'stiffness 280 · damping 30 · mass 0.85',
    usage: 'Large showcase panels & smooth progress indicators',
    path: 'M 4 56 C 28 16, 54 4, 96 4',
    transition: SPRING_GENTLE,
  },
] as const;

const SOUND_CUES = [
  { id: 'tick', name: 'Detent Tick', trigger: 'Segmented switch, filter toggle, scrubber detent', spec: '1650 → 620 Hz band-pass', play: playTick },
  { id: 'tap', name: 'Surface Tap', trigger: 'Lightbox open, modal actions, validation alert', spec: '540 → 290 Hz damped sine', play: playTap },
  { id: 'start', name: 'Play Chime', trigger: 'AudioPlayer playback start', spec: 'C5 → E5 ascending dyad', play: playStartChime },
  { id: 'pause', name: 'Pause Tone', trigger: 'AudioPlayer pause & dismissal', spec: 'B4 → G4 resolving dyad', play: playPauseTone },
  { id: 'skip-back', name: 'Skip −15s', trigger: 'Audio rewind 15 seconds', spec: '860 → 620 Hz double detent', play: () => playSkipTick('back') },
  { id: 'skip-fwd', name: 'Skip +15s', trigger: 'Audio forward 15 seconds', spec: '680 → 920 Hz double detent', play: () => playSkipTick('forward') },
  { id: 'bell', name: 'Bell Chime', trigger: 'Animated Bell specimen audition', spec: '880 Hz tri-partial decay', play: playBellChime },
  { id: 'success', name: 'Success Chord', trigger: 'Copy email, apply TOC, inquiry submitted', spec: 'C5 · E5 · G5 soft bloom', play: playSuccessChime },
] as const;

export type MotionIconsSoundView = 'all' | 'motion' | 'icons-sound';

interface MotionIconsSoundSectionProps {
  view?: MotionIconsSoundView;
}

export function MotionIconsSoundSection({
  view = 'all',
}: MotionIconsSoundSectionProps = {}) {
  const showMotion = view === 'all' || view === 'motion';
  const showIconsSound = view === 'all' || view === 'icons-sound';
  const [iconTrigger, setIconTrigger] = useState<'hover' | 'tap' | 'loop'>('hover');
  const [runnerSide, setRunnerSide] = useState<'left' | 'right'>('left');
  const [disclosureOpen, setDisclosureOpen] = useState(true);
  const [demoTab, setDemoTab] = useState<'enter' | 'spring' | 'disclosure'>('enter');
  const [replaySeed, setReplaySeed] = useState(0);
  const [lastSound, setLastSound] = useState<string | null>(null);
  const soundOn = useSoundEnabled();
  const reducedMotion = prefersReducedMotion();

  return (
    <div className="space-y-16">
      {/* Module 8: SF-Style & Animated Icon Library */}
      {showIconsSound && (
      <section aria-labelledby="ws-icons-heading">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="type-caption text-[var(--apple-link)]">
              Module 08 · Iconography
            </p>
            <h2 id="ws-icons-heading" className="type-title-2 mt-1.5">
              SF-Style &amp; Animated Icon Library
            </h2>
            <p className="type-callout measure-prose mt-2">
              {SF_CATALOG.length} custom Apple SF-proportioned SVG glyphs plus {ANIMATED_ICONS.length} shadcn <code className="font-mono text-[13px]">@animate-ui</code> motion Lucide icons.
            </p>
          </div>

          <div className="apple-segmented" role="group" aria-label="Animated icon trigger mode">
            {(
              [
                { id: 'hover', label: 'On Hover' },
                { id: 'tap', label: 'On Click' },
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
        </div>

        {/* Animated Lucide Specimens */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                className="apple-surface-subtle group flex items-center gap-4 rounded-[20px] p-4 text-left transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[var(--apple-bg-secondary)] text-[var(--apple-label-primary)] transition-colors group-hover:bg-[var(--apple-blue)]/10 group-hover:text-[var(--apple-blue)]">
                  {item.render()}
                </span>
                <div className="min-w-0">
                  <p className="type-headline text-[15px] text-[var(--apple-label-primary)]">
                    {item.name}
                  </p>
                  <p className="truncate font-mono text-[11.5px] text-[var(--apple-label-tertiary)]">
                    {item.registry}
                  </p>
                </div>
              </button>
            </AnimateIcon>
          ))}
        </div>

        {/* Custom SF Symbols Grid */}
        <div className="mt-8 rounded-[24px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="type-caption text-[var(--apple-label-secondary)]">
              Production Custom SF Symbol Set ({SF_CATALOG.length} symbols)
            </p>
            <span className="type-footnote font-normal text-[var(--apple-label-tertiary)]">
              24×24 viewBox · 1.7–2.1px round optical strokes
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8">
            {SF_CATALOG.map((sym) => (
              <div
                key={sym.name}
                className="flex flex-col items-center justify-center rounded-[14px] border border-[var(--apple-separator-subtle)] bg-[var(--apple-surface-elevated)] px-2 py-3.5 text-center text-[var(--apple-label-primary)]"
              >
                {sym.render()}
                <span className="mt-2 w-full truncate font-mono text-[10.5px] text-[var(--apple-label-tertiary)]">
                  {sym.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Module 10: Animations & Transitions */}
      {showMotion && (
      <section
        aria-labelledby="ws-animations-heading"
        className={view === 'all' ? 'border-t border-[var(--apple-separator)] pt-14' : ''}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="type-caption text-[var(--apple-link)]">
              Module 10 · Choreography
            </p>
            <h2 id="ws-animations-heading" className="type-title-2 mt-1.5">
              Animations &amp; Transitions
            </h2>
            <p className="type-callout measure-prose mt-2">
              Compositor-only transforms and opacity. Reduced-motion status:{' '}
              <strong className="text-[var(--apple-label-primary)]">
                {reducedMotion ? 'Reduced Motion Active' : 'Standard Motion Active'}
              </strong>
              .
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              playTick();
              setReplaySeed((s) => s + 1);
            }}
            className="apple-btn-tonal !min-h-[36px] shrink-0 !px-4 !py-1.5 !text-[13px]"
          >
            <SFReset size={13} />
            <span>Replay Transition</span>
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Route Entry / Exit Specimen */}
          <div className="rounded-[22px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] p-6">
            <p className="type-caption text-[var(--apple-label-tertiary)]">
              Route Entry (240ms · EASE_APPLE)
            </p>
            <motion.div
              key={`route-demo-${replaySeed}`}
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reducedMotion ? { duration: 0.01 } : { duration: 0.24, ease: EASE_APPLE }}
              className="apple-surface-subtle mt-4 rounded-[16px] p-4"
            >
              <p className="type-headline text-[15px]">Page Transition Frame</p>
              <p className="type-footnote mt-1 font-normal text-[var(--apple-label-secondary)]">
                Outgoing route completes exit before scroll-to-top fires cleanly.
              </p>
            </motion.div>
          </div>

          {/* Spring Segmented Thumb */}
          <div className="rounded-[22px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] p-6">
            <p className="type-caption text-[var(--apple-label-tertiary)]">
              Spring Layout Thumb (SPRING_SEGMENT)
            </p>
            <div className="mt-4">
              <div className="apple-segmented" role="group" aria-label="Spring pill demo">
                {(['enter', 'spring', 'disclosure'] as const).map((tab) => {
                  const active = demoTab === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => {
                        playTick();
                        setDemoTab(tab);
                      }}
                      className={`apple-segmented-item !min-h-[32px] px-3.5 text-[12.5px] ${
                        active
                          ? 'text-[var(--apple-label-primary)]'
                          : 'text-[var(--apple-label-secondary)]'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="ws-motion-demo-pill"
                          transition={SPRING_SEGMENT}
                          className="apple-pill-shadow absolute inset-0 rounded-full bg-[var(--apple-control-thumb)]"
                        />
                      )}
                      <span className="relative z-10 capitalize">{tab}</span>
                    </button>
                  );
                })}
              </div>
              <p className="type-footnote mt-4 font-normal text-[var(--apple-label-secondary)]">
                Critically damped spring without overshoot or elastic bounce.
              </p>
            </div>
          </div>

          {/* Grid-Rows Disclosure */}
          <div className="rounded-[22px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] p-6">
            <div className="flex items-center justify-between gap-2">
              <p className="type-caption text-[var(--apple-label-tertiary)]">
                Zero-Jank Disclosure
              </p>
              <button
                type="button"
                onClick={() => {
                  playTick();
                  setDisclosureOpen((o) => !o);
                }}
                className="apple-btn-tonal !min-h-[28px] !px-3 !py-0.5 !text-[12px]"
              >
                {disclosureOpen ? 'Collapse' : 'Expand'}
              </button>
            </div>
            <div
              className={`mt-4 grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                disclosureOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <div className="apple-surface-subtle rounded-[16px] p-4">
                  <p className="type-footnote font-normal text-[var(--apple-label-secondary)]">
                    Uses CSS <code className="font-mono">grid-template-rows</code> rather than animating height directly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Module 11: Motion Timing & Easing Curves */}
      {showMotion && (
      <section
        aria-labelledby="ws-curves-heading"
        className="border-t border-[var(--apple-separator)] pt-14"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="type-caption text-[var(--apple-link)]">
              Module 11 · Motion Physics
            </p>
            <h2 id="ws-curves-heading" className="type-title-2 mt-1.5">
              Timing &amp; Easing Curves
            </h2>
            <p className="type-callout measure-prose mt-2">
              Compare every exported token in <code className="font-mono text-[13px]">src/utils/motion.ts</code> simultaneously on a synchronized displacement track.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              playTick();
              setRunnerSide((prev) => (prev === 'left' ? 'right' : 'left'));
            }}
            className="apple-btn-primary !min-h-[38px] shrink-0 !px-4 !py-1.5 !text-[13px]"
          >
            Run All Curves
          </button>
        </div>

        <div className="mt-8 space-y-3">
          {MOTION_CURVES.map((curve) => (
            <div
              key={curve.id}
              className="grid grid-cols-1 gap-4 rounded-[20px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-5 md:grid-cols-12 md:items-center"
            >
              <div className="flex items-center gap-4 md:col-span-5">
                <svg
                  width="64"
                  height="40"
                  viewBox="0 0 100 60"
                  aria-hidden="true"
                  className="shrink-0 rounded-[10px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)]"
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
                  <p className="font-mono text-[13px] font-semibold text-[var(--apple-label-primary)]">
                    {curve.name}
                  </p>
                  <p className="type-footnote mt-0.5 font-normal text-[var(--apple-label-tertiary)]">
                    {curve.spec}
                  </p>
                  <p className="type-footnote font-normal text-[var(--apple-label-secondary)]">
                    {curve.usage}
                  </p>
                </div>
              </div>

              <div className="md:col-span-7">
                <div className="relative h-10 w-full overflow-hidden rounded-full bg-[var(--apple-bg-secondary)] px-2">
                  <motion.div
                    animate={{ x: runnerSide === 'right' ? 'calc(100% - 28px)' : '0%' }}
                    transition={reducedMotion ? { duration: 0.01 } : curve.transition}
                    className="relative flex h-full w-full items-center"
                  >
                    <span className="h-7 w-7 rounded-full bg-[var(--apple-blue)] shadow-sm" />
                  </motion.div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* Module 12: UI Sound Studio */}
      {showIconsSound && (
      <section
        aria-labelledby="ws-sound-heading"
        className="border-t border-[var(--apple-separator)] pt-14"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="type-caption text-[var(--apple-link)]">
              Module 12 · Tactile Acoustics
            </p>
            <h2 id="ws-sound-heading" className="type-title-2 mt-1.5">
              UI Sound Studio
            </h2>
            <p className="type-callout measure-prose mt-2">
              Synthesized in real time via Web Audio API. Enabled by default for meaningful commits/toggles, silent on ordinary navigation/scroll/hover, and 100% independent from AudioPlayer narration.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {lastSound && (
              <span className="type-footnote text-[var(--apple-label-secondary)]">
                Last: <strong className="text-[var(--apple-label-primary)]">{lastSound}</strong>
              </span>
            )}
            <button
              type="button"
              onClick={() => toggleSoundEnabled()}
              aria-pressed={soundOn}
              className={
                soundOn
                  ? 'apple-btn-primary !min-h-[38px] !px-4 !py-1.5 !text-[13px]'
                  : 'apple-btn-tonal !min-h-[38px] !px-4 !py-1.5 !text-[13px]'
              }
            >
              {soundOn ? <SFSpeakerWave size={14} /> : <SFSpeakerSlash size={14} />}
              <span>{soundOn ? 'UI Sound: On' : 'UI Sound: Muted'}</span>
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SOUND_CUES.map((cue) => (
            <button
              key={cue.id}
              type="button"
              onClick={() => {
                if (!soundOn) setSoundEnabled(true);
                cue.play();
                setLastSound(cue.name);
              }}
              className="apple-surface-subtle group flex flex-col justify-between rounded-[20px] p-5 text-left transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="type-headline text-[15px] text-[var(--apple-label-primary)] group-hover:text-[var(--apple-link)]">
                    {cue.name}
                  </span>
                  <SFSpeakerWave
                    size={15}
                    className="shrink-0 text-[var(--apple-label-tertiary)] group-hover:text-[var(--apple-blue)]"
                  />
                </div>
                <p className="type-footnote mt-1.5 font-normal text-[var(--apple-label-secondary)]">
                  {cue.trigger}
                </p>
              </div>
              <p className="type-caption mt-4 border-t border-[var(--apple-separator-subtle)] pt-3 font-mono font-normal text-[var(--apple-label-tertiary)]">
                {cue.spec}
              </p>
            </button>
          ))}
        </div>
      </section>
      )}
    </div>
  );
}
