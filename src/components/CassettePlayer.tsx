import { Slider } from "@base-ui/react/slider";
import {
  ArrowCounterClockwiseIcon,
  FastForwardIcon,
  HandTapIcon,
  PauseIcon,
  PlayIcon,
  RewindIcon,
  SpeakerHighIcon,
  SpeakerSlashIcon,
} from "@phosphor-icons/react";
import {
  type ComponentPropsWithRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { cn } from "../lib/utils";
import {
  playPauseTone,
  playSkipTick,
  playStartChime,
  playTick,
} from "../utils/soundEngine";
import { AppleTooltip } from "./AppleTooltip";
import { MiniAudioEqualizer } from "./AudioWaveform";

const DEFAULT_TRACK_TITLE = "One Small Step";
const DEFAULT_VOLUME = 0.78;
const DEFAULT_SKIP_SECONDS = 15;
const DEFAULT_PLAYBACK_RATES = [1, 1.25, 1.5, 2] as const;
const REEL_SPOKES = [0, 60, 120, 180, 240, 300] as const;
const TAPE_WINDOW_DIVIDERS = [0, 1, 2, 3, 4] as const;
const MIN_REWIND_DURATION = 220;
const MAX_REWIND_DURATION = 1000;
const SKIP_ANIMATION_DURATION = 210;
const CASSETTE_TEXTURE =
  "url(\"data:image/svg+xml,%3Csvg width='180' height='180' viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.92' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";
const BUTTON_CLASSES =
  "grid aspect-square cursor-pointer place-items-center rounded-full border transition-[background-color,border-color,color,opacity,transform,box-shadow] duration-150 ease-out active:scale-[0.95] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-55 disabled:active:scale-100 motion-reduce:duration-[0.01ms]";

export type CassetteCaptionTrack = {
  default?: boolean;
  label: string;
  src: string;
  srcLang: string;
};

export type CassetteChapter = {
  id: string;
  num: string;
  title: string;
  /** Normalized start position along the tape (0 to <1) */
  startRatio: number;
};

export type CassettePlayerVariant = "v1" | "v2";

export type CassetteShellFinish = "dark" | "light";

export interface CassetteThemeConfig {
  id: string;
  name: string;
  subtitle: string;
  mode: "light" | "dark";
  shellFinish: CassetteShellFinish;
  stageBg: string;
  shellTop: string;
  shellMid: string;
  shellBottom: string;
  shellBorder: string;
  labelBg: string;
  labelInk: string;
  stripeOne: string;
  stripeTwo: string;
  stripeThree: string;
  reelHubBg: string;
  reelTeeth: string;
  reelToothStroke: string;
  thumbFill: string;
  thumbBorder: string;
}

export const CASSETTE_THEMES: readonly CassetteThemeConfig[] = [
  {
    id: "archive-classic",
    name: "Archive Classic",
    subtitle: "Original Light · Heritage 3-Band",
    mode: "light",
    shellFinish: "dark",
    stageBg: "#F4F2EE",
    shellTop: "#373735",
    shellMid: "#20201F",
    shellBottom: "#0E0E0D",
    shellBorder: "#050505",
    labelBg: "#F7F5F0",
    labelInk: "#1B1A18",
    stripeOne: "#22C55E",
    stripeTwo: "#14B8A6",
    stripeThree: "#3B82F6",
    reelHubBg: "#F5F4F0",
    reelTeeth: "#1B1A18",
    reelToothStroke: "#11100F",
    thumbFill: "#FFFFFF",
    thumbBorder: "#1B1A18",
  },
  {
    id: "studio-crimson",
    name: "Studio Crimson",
    subtitle: "Original Dark · Signal Red",
    mode: "dark",
    shellFinish: "dark",
    stageBg: "#141312",
    shellTop: "#353432",
    shellMid: "#1E1D1C",
    shellBottom: "#0D0D0C",
    shellBorder: "#050505",
    labelBg: "#DC2626",
    labelInk: "#FFFBF7",
    stripeOne: "#FFFFFF",
    stripeTwo: "#FFFFFF",
    stripeThree: "#FFFFFF",
    reelHubBg: "#1F1E1C",
    reelTeeth: "#D6D3CE",
    reelToothStroke: "#8C877F",
    thumbFill: "#FFFFFF",
    thumbBorder: "#991B1B",
  },
  {
    id: "warm-paper",
    name: "Warm Paper",
    subtitle: "Portfolio Editorial · Terracotta",
    mode: "light",
    shellFinish: "dark",
    stageBg: "#F3EFEA",
    shellTop: "#38332D",
    shellMid: "#231F1B",
    shellBottom: "#141210",
    shellBorder: "#0B0A09",
    labelBg: "#FAF8F6",
    labelInk: "#181715",
    stripeOne: "#9C4A2B",
    stripeTwo: "#C88A4B",
    stripeThree: "#54504A",
    reelHubBg: "#FAF8F6",
    reelTeeth: "#24201C",
    reelToothStroke: "#141210",
    thumbFill: "#FAF8F6",
    thumbBorder: "#181715",
  },
  {
    id: "braun-cream",
    name: "Braun Cream",
    subtitle: "Industrial Matte · Signal Orange",
    mode: "light",
    shellFinish: "light",
    stageBg: "#EAE6DF",
    shellTop: "#EFECE6",
    shellMid: "#DFDBD3",
    shellBottom: "#CCC7BE",
    shellBorder: "#B4AEA4",
    labelBg: "#FAF9F6",
    labelInk: "#1C1B19",
    stripeOne: "#EA580C",
    stripeTwo: "#78716C",
    stripeThree: "#292524",
    reelHubBg: "#F7F5F0",
    reelTeeth: "#292524",
    reelToothStroke: "#1C1917",
    thumbFill: "#FFFFFF",
    thumbBorder: "#1C1B19",
  },
  {
    id: "frosted-cobalt",
    name: "Cobalt Slate",
    subtitle: "Precision Tech · Anodized Navy",
    mode: "dark",
    shellFinish: "dark",
    stageBg: "#111622",
    shellTop: "#27354F",
    shellMid: "#172033",
    shellBottom: "#0C111C",
    shellBorder: "#060910",
    labelBg: "#EFF4FA",
    labelInk: "#0F172A",
    stripeOne: "#1D4ED8",
    stripeTwo: "#0EA5E9",
    stripeThree: "#94A3B8",
    reelHubBg: "#F1F5F9",
    reelTeeth: "#1E293B",
    reelToothStroke: "#0F172A",
    thumbFill: "#FFFFFF",
    thumbBorder: "#0F172A",
  },
  {
    id: "walkman-hifi",
    name: "Walkman Hi-Fi",
    subtitle: "80s Type II · Chrome Tricolor",
    mode: "light",
    shellFinish: "dark",
    stageBg: "#ECEAE5",
    shellTop: "#292D36",
    shellMid: "#191C24",
    shellBottom: "#0D0F14",
    shellBorder: "#06070A",
    labelBg: "#FBF9F4",
    labelInk: "#15171C",
    stripeOne: "#EAB308",
    stripeTwo: "#EF4444",
    stripeThree: "#2563EB",
    reelHubBg: "#F8F7F2",
    reelTeeth: "#181B22",
    reelToothStroke: "#0D0F14",
    thumbFill: "#FFFFFF",
    thumbBorder: "#15171C",
  },
  {
    id: "kyoto-matcha",
    name: "Kyoto Matcha",
    subtitle: "Botanical Linen · Deep Pine",
    mode: "light",
    shellFinish: "dark",
    stageBg: "#EAEFE7",
    shellTop: "#2C382F",
    shellMid: "#1B241E",
    shellBottom: "#0F1511",
    shellBorder: "#080C09",
    labelBg: "#EEF3EA",
    labelInk: "#19221B",
    stripeOne: "#65A30D",
    stripeTwo: "#15803D",
    stripeThree: "#B45309",
    reelHubBg: "#EFF4EC",
    reelTeeth: "#1C261F",
    reelToothStroke: "#0F1511",
    thumbFill: "#FFFFFF",
    thumbBorder: "#19221B",
  },
  {
    id: "obsidian-mono",
    name: "Obsidian Mono",
    subtitle: "Stealth Matte · Titanium Scale",
    mode: "dark",
    shellFinish: "dark",
    stageBg: "#0C0C0D",
    shellTop: "#262629",
    shellMid: "#17171A",
    shellBottom: "#0B0B0D",
    shellBorder: "#040405",
    labelBg: "#1C1C20",
    labelInk: "#F4F4F5",
    stripeOne: "#E4E4E7",
    stripeTwo: "#A1A1AA",
    stripeThree: "#52525B",
    reelHubBg: "#27272A",
    reelTeeth: "#E4E4E7",
    reelToothStroke: "#71717A",
    thumbFill: "#F4F4F5",
    thumbBorder: "#18181B",
  },
] as const;

export type CassetteStageMode = "themed" | "surface" | "transparent";

export type CassettePlayerProps = Omit<
  ComponentPropsWithRef<"section">,
  "children"
> & {
  archiveLabel?: string;
  audioSrc?: string;
  captionTracks?: readonly CassetteCaptionTrack[];
  catalogueNumber?: string;
  /** Optional chapter markers shown on v2 scrubber and active label eyebrow. */
  chapters?: readonly CassetteChapter[];
  /** Enable subtle interactive 3D pointer tilt and extruded chassis depth (respects prefers-reduced-motion). */
  enable3dTilt?: boolean;
  initialPlaybackRate?: number;
  initialVolume?: number;
  /** v2 context-aware state for the Target / Jump to Speaker button (mirrors AudioPlayer v2). */
  isOutOfContext?: boolean;
  loop?: boolean;
  onActiveChapterChange?: (chapter: CassetteChapter | null) => void;
  /** Fired when user triggers the v2 Target / Jump to Speaker control. */
  onJumpToSpeaker?: (chapter: CassetteChapter | null, currentTimeSec: number) => void;
  onPlaybackChange?: (isPlaying: boolean) => void;
  onPlaybackError?: (error: unknown) => void;
  playbackRates?: readonly number[];
  preload?: "auto" | "metadata" | "none";
  sideLabel?: string;
  skipSeconds?: number;
  stageMode?: CassetteStageMode;
  theme?: CassetteThemeConfig;
  trackTitle?: string;
  /** v1 = classic 3-key cassette deck; v2 = editorial deck with ±15s skip, target jump, speed & chapter markers. */
  variant?: CassettePlayerVariant;
};

function easeInOutCubic(progress: number) {
  return progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
}

function easeOutCubic(progress: number) {
  return 1 - (1 - progress) ** 3;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "PT0S";
  }

  return `PT${Math.floor(seconds)}S`;
}

function normalizeVolume(volume: number) {
  return Number.isFinite(volume)
    ? Math.min(Math.max(volume, 0), 1)
    : DEFAULT_VOLUME;
}

function resolveChapterAtRatio(
  chapters: readonly CassetteChapter[],
  ratio: number,
): { chapter: CassetteChapter; index: number } | null {
  if (chapters.length === 0) return null;
  const clamped = Math.min(Math.max(ratio, 0), 1);
  let activeIndex = 0;
  for (let i = 0; i < chapters.length; i++) {
    if (clamped + 0.0001 >= chapters[i].startRatio) {
      activeIndex = i;
    }
  }
  return { chapter: chapters[activeIndex], index: activeIndex };
}

type ReelProps = {
  className: string;
};

function Reel({ className }: ReelProps) {
  return (
    <div
      className={cn(
        "absolute top-1/2 z-[3] aspect-square w-[78cqh] -translate-x-1/2 -translate-y-1/2",
        className,
      )}
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 origin-center rotate-[var(--reel-rotation)] rounded-full will-change-transform motion-reduce:!rotate-0"
        viewBox="0 0 100 100"
      >
        <circle fill="var(--reel-hub-bg)" cx="50" cy="50" r="48" />
        {REEL_SPOKES.map((spokeRotation) => (
          <path
            className="fill-[var(--reel-teeth)] stroke-[var(--reel-tooth-stroke)] [filter:drop-shadow(0_1px_1px_rgba(0,0,0,0.32))] [stroke-linejoin:round] [stroke-width:1.25]"
            d="M46 3h8v9a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z"
            key={spokeRotation}
            transform={`rotate(${spokeRotation} 50 50)`}
          />
        ))}
        <circle
          className="fill-none stroke-[var(--reel-window-color)] [stroke-width:3]"
          cx="50"
          cy="50"
          r="48"
        />
      </svg>
    </div>
  );
}

type ScrewProps = {
  className: string;
  light?: boolean;
};

function Screw({ className, light = false }: ScrewProps) {
  const slotClasses = light
    ? "absolute top-1/2 right-[18%] left-[18%] h-[14%] -translate-y-1/2 rounded-full bg-[#6d6962] shadow-[inset_0_1px_1px_rgba(0,0,0,0.45),0_1px_rgba(255,255,255,0.45)]"
    : "absolute top-1/2 right-[18%] left-[18%] h-[14%] -translate-y-1/2 rounded-full bg-[#1d1d1b] shadow-[inset_0_1px_1px_rgba(0,0,0,0.82),0_1px_rgba(255,255,255,0.1)]";

  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute z-[3] aspect-square w-[3.3%] rounded-full",
        light
          ? "border border-[#9c968d] bg-[radial-gradient(circle_at_36%_30%,#f5f3ef,#d5d0c8_50%,#b2aca2_82%)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.75),0_1px_1px_rgba(0,0,0,0.18)]"
          : "border border-[#060606] bg-[radial-gradient(circle_at_36%_30%,#5f5f5c,#30302e_48%,#171716_78%)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.26),0_1px_1px_rgba(0,0,0,0.38)]",
        className,
      )}
    >
      <span className={cn(slotClasses, "rotate-45")} />
      <span className={cn(slotClasses, "-rotate-45")} />
    </div>
  );
}

export function CassettePlayer({
  archiveLabel = "Archive 11",
  audioSrc,
  captionTracks = [],
  catalogueNumber = "200769",
  chapters = [],
  className,
  enable3dTilt = true,
  initialPlaybackRate = 1,
  initialVolume = DEFAULT_VOLUME,
  isOutOfContext = false,
  loop = true,
  onActiveChapterChange,
  onJumpToSpeaker,
  onPlaybackChange,
  onPlaybackError,
  playbackRates = DEFAULT_PLAYBACK_RATES,
  preload = "metadata",
  ref,
  sideLabel = "Side A",
  skipSeconds = DEFAULT_SKIP_SECONDS,
  stageMode = "themed",
  theme = CASSETTE_THEMES[0],
  trackTitle,
  variant = "v1",
  style,
  ...sectionProps
}: CassettePlayerProps) {
  const isV2 = variant === "v2";
  const resolvedTrackTitle = trackTitle ?? DEFAULT_TRACK_TITLE;
  const prefersReducedMotion = useReducedMotion();
  const is3dEnabled = enable3dTilt && !prefersReducedMotion;
  const audioRef = useRef<HTMLAudioElement>(null);
  const cassetteRef = useRef<HTMLDivElement>(null);
  const tiltStageRef = useRef<HTMLDivElement>(null);
  const durationRef = useRef(0);
  const isPlayingRef = useRef(false);
  const isScrubbingRef = useRef(false);
  const previousSourceRef = useRef(audioSrc);
  const rewindAnimationRef = useRef<number | null>(null);
  const resumeAfterRewindRef = useRef(false);
  const resumeAfterScrubRef = useRef(false);
  const lastChapterIdRef = useRef<string | null>(null);

  // Spring-interpolated 3D pointer tilt & lighting values
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const hoverLevel = useMotionValue(0);

  const smoothX = useSpring(pointerX, { stiffness: 210, damping: 24, mass: 0.7 });
  const smoothY = useSpring(pointerY, { stiffness: 210, damping: 24, mass: 0.7 });
  const smoothHover = useSpring(hoverLevel, { stiffness: 180, damping: 26 });

  // Slight sculptural +2deg desk tilt at rest; rocks smoothly ±7deg on X and ±9deg on Y
  const tiltRotateX = useTransform(smoothY, [-0.5, 0.5], [9, -5]);
  const tiltRotateY = useTransform(smoothX, [-0.5, 0.5], [-9, 9]);
  const tiltLiftZ = useTransform(smoothHover, [0, 1], [0, 8]);
  const shadowOffsetX = useTransform(smoothX, [-0.5, 0.5], [14, -14]);
  const shadowOffsetY = useTransform(smoothY, [-0.5, 0.5], [8, 22]);
  const sheenX = useTransform(smoothX, [-0.5, 0.5], [16, 84]);
  const sheenY = useTransform(smoothY, [-0.5, 0.5], [12, 88]);
  const sheenOpacity = useTransform(smoothHover, [0, 1], [0.24, 0.78]);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [volume, setVolume] = useState(() => normalizeVolume(initialVolume));
  const [previousVolume, setPreviousVolume] = useState(() =>
    normalizeVolume(initialVolume),
  );
  const [rateIndex, setRateIndex] = useState(() => {
    const idx = playbackRates.indexOf(initialPlaybackRate);
    return idx >= 0 ? idx : 0;
  });

  const playbackRate = playbackRates[rateIndex] ?? 1;

  const progressRatio = useMemo(
    () =>
      duration > 0 ? Math.min(Math.max(currentTime / duration, 0), 1) : 0,
    [currentTime, duration],
  );

  const activeChapterInfo = useMemo(
    () => resolveChapterAtRatio(chapters, progressRatio),
    [chapters, progressRatio],
  );

  useEffect(() => {
    const nextId = activeChapterInfo?.chapter.id ?? null;
    if (nextId !== lastChapterIdRef.current) {
      lastChapterIdRef.current = nextId;
      onActiveChapterChange?.(activeChapterInfo?.chapter ?? null);
    }
  }, [activeChapterInfo, onActiveChapterChange]);

  const updatePlaybackVisuals = useCallback((time: number) => {
    const cassette = cassetteRef.current;

    if (!cassette) {
      return;
    }

    const mediaDuration = durationRef.current;
    const progress =
      mediaDuration > 0 ? Math.min(Math.max(time / mediaDuration, 0), 1) : 0;

    cassette.style.setProperty("--reel-rotation", `${(time * 300) % 360}deg`);
    cassette.style.setProperty("--left-tape-scale", `${1 - progress * 0.4}`);
    cassette.style.setProperty("--right-tape-scale", `${0.6 + progress * 0.4}`);
  }, []);

  const reportPlaybackError = useCallback(
    (error: unknown, message: string) => {
      setPlaybackError(message);
      onPlaybackError?.(error);
    },
    [onPlaybackError],
  );

  const updatePlaybackState = useCallback(
    (nextIsPlaying: boolean) => {
      if (isPlayingRef.current === nextIsPlaying) {
        return;
      }

      isPlayingRef.current = nextIsPlaying;
      setIsPlaying(nextIsPlaying);
      onPlaybackChange?.(nextIsPlaying);
    },
    [onPlaybackChange],
  );

  const updateMediaDuration = useCallback(
    (audio: HTMLAudioElement) => {
      const nextDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
      durationRef.current = nextDuration;
      setDuration(nextDuration);
      updatePlaybackVisuals(audio.currentTime);
    },
    [updatePlaybackVisuals],
  );

  useEffect(() => {
    const audio = audioRef.current;

    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;

    if (audio) {
      audio.playbackRate = isV2 ? playbackRate : 1;
    }
  }, [isV2, playbackRate]);

  useEffect(() => {
    const audio = audioRef.current;

    if (audio && audio.readyState >= 1) {
      updateMediaDuration(audio);
    }
  }, [updateMediaDuration]);

  useEffect(() => {
    if (previousSourceRef.current === audioSrc) {
      return;
    }

    previousSourceRef.current = audioSrc;

    if (rewindAnimationRef.current !== null) {
      window.cancelAnimationFrame(rewindAnimationRef.current);
      rewindAnimationRef.current = null;
    }

    const audio = audioRef.current;
    audio?.pause();
    audio?.load();
    durationRef.current = 0;
    resumeAfterRewindRef.current = false;
    resumeAfterScrubRef.current = false;
    setCurrentTime(0);
    setDuration(0);
    updatePlaybackState(false);
    setPlaybackError(null);
    updatePlaybackVisuals(0);
  }, [audioSrc, updatePlaybackState, updatePlaybackVisuals]);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    let animationFrameId = 0;

    function syncPlaybackFrame() {
      const audio = audioRef.current;

      if (!audio || audio.paused) {
        return;
      }

      updatePlaybackVisuals(audio.currentTime);
      setCurrentTime(audio.currentTime);

      animationFrameId = window.requestAnimationFrame(syncPlaybackFrame);
    }

    animationFrameId = window.requestAnimationFrame(syncPlaybackFrame);

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [isPlaying, updatePlaybackVisuals]);

  useEffect(
    () => () => {
      if (rewindAnimationRef.current !== null) {
        window.cancelAnimationFrame(rewindAnimationRef.current);
      }
    },
    [],
  );

  function cancelRewind() {
    if (rewindAnimationRef.current === null) {
      return;
    }

    window.cancelAnimationFrame(rewindAnimationRef.current);
    rewindAnimationRef.current = null;
    resumeAfterRewindRef.current = false;

    const audio = audioRef.current;

    if (audio) {
      audio.currentTime = currentTime;
      updatePlaybackVisuals(currentTime);
    }
  }

  async function togglePlayback() {
    const audio = audioRef.current;

    if (!audio || !audioSrc) {
      return;
    }

    cancelRewind();

    if (audio.paused) {
      if (isV2) playStartChime();
      try {
        audio.playbackRate = isV2 ? playbackRate : 1;
        await audio.play();
      } catch (error) {
        updatePlaybackState(false);
        reportPlaybackError(
          error,
          "Playback could not start. Check the audio source and try again.",
        );
      }
    } else {
      if (isV2) playPauseTone();
      audio.pause();
    }
  }

  function animateToTime(
    targetTime: number,
    animDurationMs: number,
    easing: (p: number) => number,
  ) {
    const audio = audioRef.current;
    if (!audio) return;

    const audioElement = audio;
    const maxTime = durationRef.current;
    const clampedTarget = Math.min(Math.max(targetTime, 0), maxTime);

    if (rewindAnimationRef.current !== null) {
      window.cancelAnimationFrame(rewindAnimationRef.current);
    }

    resumeAfterRewindRef.current =
      resumeAfterRewindRef.current || !audioElement.paused;

    if (!audioElement.paused) {
      audioElement.pause();
    }

    const startFrom = currentTime;
    const shouldReduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    function finishJump() {
      rewindAnimationRef.current = null;
      audioElement.currentTime = clampedTarget;
      setCurrentTime(clampedTarget);
      updatePlaybackVisuals(clampedTarget);

      const shouldResume = resumeAfterRewindRef.current;
      resumeAfterRewindRef.current = false;

      if (shouldResume && clampedTarget < maxTime) {
        audioElement.play().catch((error) => {
          updatePlaybackState(false);
          reportPlaybackError(
            error,
            "Playback could not resume after seeking the track.",
          );
        });
      }
    }

    if (Math.abs(clampedTarget - startFrom) < 0.05 || shouldReduceMotion) {
      finishJump();
      return;
    }

    const startedAt = performance.now();

    function step(now: number) {
      const linearProgress = Math.min((now - startedAt) / animDurationMs, 1);
      const easedProgress = easing(linearProgress);
      const nextTime = startFrom + (clampedTarget - startFrom) * easedProgress;

      updatePlaybackVisuals(nextTime);
      setCurrentTime(nextTime);

      if (linearProgress < 1) {
        rewindAnimationRef.current = window.requestAnimationFrame(step);
        return;
      }

      finishJump();
    }

    rewindAnimationRef.current = window.requestAnimationFrame(step);
  }

  function restart() {
    if (isV2) playTick();
    const rewindDistance =
      duration > 0 ? Math.min(Math.max(currentTime / duration, 0), 1) : 1;
    const rewindDuration =
      MIN_REWIND_DURATION +
      (MAX_REWIND_DURATION - MIN_REWIND_DURATION) * rewindDistance;
    animateToTime(0, rewindDuration, easeInOutCubic);
  }

  function skipBy(deltaSeconds: number) {
    if (durationRef.current <= 0) return;
    playSkipTick(deltaSeconds > 0 ? "forward" : "back");
    const target = Math.min(
      Math.max(currentTime + deltaSeconds, 0),
      durationRef.current,
    );
    animateToTime(target, SKIP_ANIMATION_DURATION, easeOutCubic);
  }

  function cyclePlaybackRate() {
    playTick();
    setRateIndex((prev) => (prev + 1) % playbackRates.length);
  }

  function handleTargetJump() {
    playTick();
    onJumpToSpeaker?.(activeChapterInfo?.chapter ?? null, currentTime);
  }

  function seek(nextTime: number) {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    cancelRewind();
    const maximumTime = durationRef.current;
    const clampedTime = Math.min(Math.max(nextTime, 0), maximumTime);
    if (isV2 && chapters.length > 0 && maximumTime > 0) {
      const prevChap = resolveChapterAtRatio(
        chapters,
        currentTime / maximumTime,
      );
      const nextChap = resolveChapterAtRatio(
        chapters,
        clampedTime / maximumTime,
      );
      if (prevChap?.chapter.id !== nextChap?.chapter.id) {
        playTick();
      }
    }
    audio.currentTime = clampedTime;
    setCurrentTime(clampedTime);
    updatePlaybackVisuals(clampedTime);
  }

  function startScrubbing() {
    isScrubbingRef.current = true;
    pointerX.set(0);
    pointerY.set(0);
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    cancelRewind();
    resumeAfterScrubRef.current = !audio.paused;

    if (!audio.paused) {
      audio.pause();
    }
  }

  async function finishScrubbing() {
    isScrubbingRef.current = false;
    const audio = audioRef.current;
    const shouldResume = resumeAfterScrubRef.current;
    resumeAfterScrubRef.current = false;

    if (!audio || !shouldResume) {
      return;
    }

    try {
      await audio.play();
    } catch (error) {
      updatePlaybackState(false);
      reportPlaybackError(
        error,
        "Playback could not resume after seeking the track.",
      );
    }
  }

  function handleDeckPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!is3dEnabled || isScrubbingRef.current || event.pointerType !== "mouse") {
      return;
    }
    const stage = tiltStageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const nx = Math.min(Math.max((event.clientX - rect.left) / rect.width - 0.5, -0.5), 0.5);
    const ny = Math.min(Math.max((event.clientY - rect.top) / rect.height - 0.5, -0.5), 0.5);
    pointerX.set(nx);
    pointerY.set(ny);
    hoverLevel.set(1);
  }

  function handleDeckPointerLeave() {
    pointerX.set(0);
    pointerY.set(0);
    hoverLevel.set(0);
  }

  function changeVolume(nextVolume: number) {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const normalizedVolume = normalizeVolume(nextVolume);
    audio.volume = normalizedVolume;
    setVolume(normalizedVolume);

    if (normalizedVolume > 0) {
      setPreviousVolume(normalizedVolume);
    }
  }

  function toggleMute() {
    if (isV2) playTick();
    changeVolume(volume === 0 ? previousVolume || DEFAULT_VOLUME : 0);
  }

  function handleSectionKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (!isV2) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target as HTMLElement | null;
    if (
      target &&
      (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable)
    ) {
      return;
    }

    if (event.key === "j" || event.key === "J") {
      event.preventDefault();
      skipBy(-skipSeconds);
    } else if (event.key === "k" || event.key === "K") {
      event.preventDefault();
      skipBy(skipSeconds);
    } else if (event.key === "m" || event.key === "M") {
      event.preventDefault();
      toggleMute();
    } else if (event.key === "0") {
      event.preventDefault();
      restart();
    }
  }

  const isLightShell = theme.shellFinish === "light";

  const specularSheenBg = useMotionTemplate`radial-gradient(circle at ${sheenX}% ${sheenY}%, ${
    isLightShell ? "rgba(255,255,255,0.48)" : "rgba(255,255,255,0.18)"
  } 0%, ${
    isLightShell ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.045)"
  } 28%, transparent 64%)`;

  const themeVars = {
    "--label-bg": theme.labelBg,
    "--label-border": `color-mix(in srgb, ${theme.labelBg} 55%, ${theme.labelInk} 14%)`,
    "--label-catalogue": `color-mix(in srgb, ${theme.labelInk} 68%, transparent)`,
    "--label-ink": theme.labelInk,
    "--label-kicker": `color-mix(in srgb, ${theme.labelInk} 82%, transparent)`,
    "--label-stripe-one": theme.stripeOne,
    "--label-stripe-two": theme.stripeTwo,
    "--label-stripe-three": theme.stripeThree,
    "--progress-thumb-border": theme.thumbBorder,
    "--progress-thumb-fill": theme.thumbFill,
    "--reel-hub-bg": theme.reelHubBg,
    "--reel-teeth": theme.reelTeeth,
    "--reel-tooth-stroke": theme.reelToothStroke,
    ...(stageMode === "themed" ? { backgroundColor: theme.stageBg } : {}),
    ...style,
  } as CSSProperties;

  const shellGradient = `linear-gradient(165deg, ${theme.shellTop} 0%, ${theme.shellMid} 52%, ${theme.shellBottom} 100%)`;

  const secondaryDeckKeyClass = isLightShell
    ? "border-[#b8b2a7] bg-[#e5e1d8] text-[#292524] shadow-[0_2px_5px_rgba(24,23,21,0.16),inset_0_1px_0_rgba(255,255,255,0.75)] hover:bg-[#efece4]"
    : "border-[#82827c] bg-[#63635e] text-[#fdfdfc] shadow-[0_2px_5px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.2)] hover:bg-[#7c7b74]";

  const primaryDeckKeyClass = isLightShell
    ? "border-[#292524]/25 bg-[#292524] text-[#faf8f5] shadow-[0_3px_8px_rgba(24,23,21,0.25),inset_0_1px_0_rgba(255,255,255,0.18)] hover:bg-[#3c3735]"
    : "border-[#bcbbb5]/50 bg-[#8d8d86] text-[#fdfdfc] shadow-[0_3px_8px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.25)] hover:bg-[#82827c]";

  const v2SecondaryDeckKeyClass = isLightShell
    ? "border-[#9f988c] bg-[#f8f6f1] text-[#1c1917] shadow-[0_3px_8px_rgba(24,23,21,0.18),inset_0_1px_0_rgba(255,255,255,0.95)] hover:bg-white"
    : "border-white/30 bg-[#464541] text-white shadow-[0_3px_9px_rgba(0,0,0,0.46),inset_0_1px_0_rgba(255,255,255,0.28)] hover:bg-[#5a5853]";

  const v2PrimaryDeckKeyClass = isLightShell
    ? "border-[#1c1917]/30 bg-[#1c1917] text-[#faf8f5] shadow-[0_4px_11px_rgba(24,23,21,0.28),inset_0_1px_0_rgba(255,255,255,0.2)] hover:bg-[#322e2b]"
    : "border-white/85 bg-[#faf8f5] text-[#141312] shadow-[0_4px_12px_rgba(0,0,0,0.48),inset_0_1px_0_rgba(255,255,255,0.95)] hover:bg-white";

  return (
    <section
      aria-label={`${resolvedTrackTitle} cassette audio player`}
      data-cassette-variant={variant}
      onKeyDown={handleSectionKeyDown}
      {...sectionProps}
      style={themeVars}
      className={cn(
        "grid min-h-[440px] w-full place-items-center overflow-hidden rounded-[24px] px-6 py-12 transition-colors duration-300 [container-type:inline-size] sm:min-h-[480px] sm:px-8 sm:py-14 max-[560px]:min-h-[380px] max-[560px]:px-3.5 max-[560px]:py-10",
        stageMode === "surface" &&
          "border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)]",
        stageMode === "transparent" && "bg-transparent px-2 py-6 sm:py-8",
        stageMode === "themed" && "border border-[var(--apple-separator-subtle)]",
        className,
      )}
      ref={ref}
    >
      <audio
        loop={loop}
        onDurationChange={(event) => updateMediaDuration(event.currentTarget)}
        onEnded={() => {
          updatePlaybackState(false);
        }}
        onError={(event) => {
          reportPlaybackError(
            event.currentTarget.error,
            "This audio track could not be loaded.",
          );
        }}
        onLoadedMetadata={(event) => {
          updateMediaDuration(event.currentTarget);
          setPlaybackError(null);
        }}
        onPause={() => {
          updatePlaybackState(false);
        }}
        onPlay={() => {
          updatePlaybackState(true);
          setPlaybackError(null);
        }}
        onTimeUpdate={(event) => {
          setCurrentTime(event.currentTarget.currentTime);
          updatePlaybackVisuals(event.currentTarget.currentTime);
        }}
        preload={preload}
        ref={audioRef}
        src={audioSrc}
      >
        {captionTracks.map((captionTrack) => (
          <track
            default={captionTrack.default}
            key={`${captionTrack.srcLang}-${captionTrack.src}`}
            kind="captions"
            label={captionTrack.label}
            src={captionTrack.src}
            srcLang={captionTrack.srcLang}
          />
        ))}
      </audio>

      <div
        ref={tiltStageRef}
        onPointerMove={handleDeckPointerMove}
        onPointerLeave={handleDeckPointerLeave}
        className="w-full max-w-[530px] [perspective:1150px]"
      >
        <motion.div
          style={
            is3dEnabled
              ? {
                  rotateX: tiltRotateX,
                  rotateY: tiltRotateY,
                  z: tiltLiftZ,
                  transformStyle: "preserve-3d",
                }
              : undefined
          }
          className="relative w-full will-change-transform"
        >
          {/* Floating dynamic ambient desk shadow beneath the 3D deck */}
          <motion.div
            aria-hidden="true"
            style={
              is3dEnabled
                ? {
                    x: shadowOffsetX,
                    y: shadowOffsetY,
                    z: -26,
                  }
                : undefined
            }
            className={cn(
              "pointer-events-none absolute inset-[5%_4%_-2%_4%] rounded-[22px] blur-[22px] transition-colors duration-300",
              isLightShell ? "bg-black/22" : "bg-black/48",
            )}
          />

          {/* Extruded 3D chassis thickness layers (visible as the cassette tilts) */}
          <div
            aria-hidden="true"
            style={{
              backgroundColor: theme.shellBorder,
              transform: "translateZ(-10px) translateY(3px)",
            }}
            className="pointer-events-none absolute inset-0 rounded-[18px] border border-black/35 max-[560px]:rounded-xl"
          />
          <div
            aria-hidden="true"
            style={{
              backgroundColor: theme.shellBottom,
              borderColor: theme.shellBorder,
              transform: "translateZ(-5px) translateY(1.5px)",
            }}
            className="pointer-events-none absolute inset-0 rounded-[18px] border max-[560px]:rounded-xl"
          />

          <div
            style={{
              backgroundImage: shellGradient,
              borderColor: theme.shellBorder,
              transform: "translateZ(0px)",
            }}
            className={cn(
              "relative aspect-[1.58] w-full overflow-hidden rounded-[18px] border transition-[background-image,border-color,box-shadow] duration-300 [--left-tape-scale:1] [--reel-rotation:0deg] [--right-tape-scale:0.6] max-[560px]:rounded-xl",
              isLightShell
                ? "shadow-[0_18px_36px_rgba(24,23,21,0.16),0_6px_14px_rgba(24,23,21,0.1),inset_0_2px_1px_rgba(255,255,255,0.9),inset_0_-3px_4px_rgba(24,23,21,0.18)]"
                : "shadow-[0_20px_38px_rgba(0,0,0,0.28),0_6px_14px_rgba(0,0,0,0.2),inset_0_2px_1px_rgba(255,255,255,0.24),inset_0_-3px_4px_rgba(0,0,0,0.78)]",
            )}
            ref={cassetteRef}
          >
            {/* Dynamic pointer-reactive specular surface reflection */}
            {is3dEnabled ? (
              <motion.div
                aria-hidden="true"
                style={{
                  backgroundImage: specularSheenBg,
                  opacity: sheenOpacity,
                }}
                className="pointer-events-none absolute inset-0 z-[2] rounded-[inherit]"
              />
            ) : null}

            <div
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-1.5 rounded-[13px] border",
                isLightShell
                  ? "border-white/75 shadow-[inset_0_0_0_1px_rgba(24,23,21,0.12)]"
                  : "border-white/[0.14] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.62)]",
              )}
            />
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-0 mix-blend-multiply",
              isLightShell ? "opacity-35" : "opacity-100",
            )}
            style={{ backgroundImage: CASSETTE_TEXTURE }}
          />
          <Screw light={isLightShell} className="top-[4%] left-[2.53%]" />
          <Screw light={isLightShell} className="top-[4%] right-[2.53%]" />
          <Screw light={isLightShell} className="bottom-[4%] left-[2.53%]" />
          <Screw light={isLightShell} className="right-[2.53%] bottom-[4%]" />

          {/* Main Paper Label */}
          <div
            className={cn(
              "absolute top-[9.5%] right-[8.5%] left-[8.5%] z-[1] overflow-clip rounded-[9px] border-4 border-transparent bg-[var(--label-bg)] text-[var(--label-ink)] shadow-[inset_0_0_12px_rgba(92,74,49,0.12)] transition-colors duration-300 [container-type:inline-size] [overflow-clip-margin:border-box] max-[560px]:rounded-md",
              isV2 ? "bottom-[25%]" : "bottom-[24%]",
            )}
          >
            <div
              className={cn(
                "relative z-[2] mx-4 mt-3.5 flex justify-between gap-2 max-[560px]:mx-3 max-[560px]:mt-2.5",
                isV2 ? "items-center" : "items-start",
              )}
            >
              {isV2 ? (
                <>
                  <div className="flex min-w-0 items-center gap-2">
                    {isPlaying ? (
                      <MiniAudioEqualizer
                        active={isPlaying}
                        muted={volume === 0}
                        className="shrink-0"
                      />
                    ) : null}
                    <span className="relative z-[2] block truncate font-sans text-[clamp(14px,5.1cqw,22px)] font-semibold leading-tight tracking-[-0.035em]">
                      {resolvedTrackTitle}
                    </span>
                  </div>

                  <div className="ml-2 flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={cyclePlaybackRate}
                      aria-label={`Playback speed ${playbackRate}x. Click to cycle speed`}
                      title="Cycle playback speed"
                      className="inline-flex h-[clamp(26px,7.2cqw,32px)] min-w-[clamp(46px,12.5cqw,58px)] cursor-pointer items-center justify-center rounded-full border-2 border-[var(--label-ink)] bg-[var(--label-ink)] px-2.5 font-mono text-[clamp(11px,3.1cqw,13.5px)] font-bold leading-none tabular-nums text-[var(--label-bg)] shadow-[0_2px_6px_rgba(0,0,0,0.16)] transition-[opacity,transform] duration-150 hover:opacity-88 active:scale-[0.95] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--label-ink)]"
                    >
                      {playbackRate}×
                    </button>

                    <button
                      type="button"
                      onClick={toggleMute}
                      aria-label={volume === 0 ? "Unmute tape" : "Mute tape"}
                      title={volume === 0 ? "Unmute (M)" : "Mute (M)"}
                      className={cn(
                        "grid size-[clamp(26px,7.2cqw,32px)] cursor-pointer place-items-center rounded-full border-[1.5px] shadow-[0_2px_5px_rgba(0,0,0,0.1)] transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.95] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--label-ink)]",
                        volume === 0
                          ? "border-[var(--label-ink)] bg-[var(--label-ink)] text-[var(--label-bg)]"
                          : "border-[color-mix(in_srgb,var(--label-ink)_52%,transparent)] bg-[color-mix(in_srgb,var(--label-ink)_10%,transparent)] text-[var(--label-ink)] hover:bg-[color-mix(in_srgb,var(--label-ink)_18%,transparent)]",
                      )}
                    >
                      {volume === 0 ? (
                        <SpeakerSlashIcon aria-hidden size={15} weight="bold" />
                      ) : (
                        <SpeakerHighIcon aria-hidden size={15} weight="bold" />
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid min-w-0 content-between gap-y-1.5">
                    <span className="relative z-[2] flex items-center gap-1.5 font-mono text-[clamp(8px,2.4cqw,10.5px)] font-bold uppercase leading-none tracking-[0.11em] text-[var(--label-kicker)]">
                      <span className="truncate">{archiveLabel}</span>
                    </span>
                    <span className="relative z-[2] block truncate font-sans text-[clamp(12px,4.5cqw,19.5px)] font-semibold leading-none tracking-[-0.035em]">
                      {resolvedTrackTitle}
                    </span>
                  </div>

                  <div className="ml-2 grid shrink-0 content-between justify-items-end gap-y-2 font-mono font-bold uppercase leading-none">
                    <span className="rounded-full border border-[var(--label-ink)] bg-[var(--label-ink)] px-[7px] py-1 text-[clamp(8px,2.5cqw,11px)] tracking-[0.08em] text-[var(--label-bg)]">
                      {sideLabel}
                    </span>
                    <span className="font-mono text-[clamp(7px,2.2cqw,10px)] tracking-[0.08em] text-[var(--label-catalogue)]">
                      {catalogueNumber}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* 3-Band Stripe + Central Tape Window */}
            <div
              className={cn(
                "relative h-[34%] max-[560px]:h-[31%]",
                isV2 ? "mt-4 max-[560px]:mt-3" : "mt-3.5 max-[560px]:mt-2.5",
              )}
            >
              <div
                aria-hidden="true"
                className="absolute -inset-x-1 top-1/2 grid h-[58%] -translate-y-1/2 grid-rows-3 gap-y-1"
              >
                <span className="bg-[var(--label-stripe-one)] transition-colors duration-300" />
                <span className="bg-[var(--label-stripe-two)] transition-colors duration-300" />
                <span className="bg-[var(--label-stripe-three)] transition-colors duration-300" />
              </div>

              <div className="absolute inset-x-[17.5%] inset-y-0 z-[3] overflow-hidden rounded-full bg-[#1b1a18] bg-[linear-gradient(rgba(255,255,255,0.13),transparent_45%)] shadow-[0_0_0_4px_var(--label-border),inset_0_3px_8px_rgba(0,0,0,0.58)] [--reel-window-color:#1b1a18] [container-type:size]">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-25 mix-blend-multiply"
                  style={{ backgroundImage: CASSETTE_TEXTURE }}
                />
                <div
                  aria-hidden="true"
                  className="absolute top-[12%] right-[28%] bottom-[12%] left-[28%] z-[2] flex items-center justify-evenly overflow-hidden rounded-[3px] border-2 border-[#11100f] bg-[#393631] bg-[linear-gradient(to_bottom,rgba(255,255,255,0.1),transparent_42%)] shadow-[inset_0_3px_6px_rgba(0,0,0,0.72),0_0_0_2px_rgba(255,255,255,0.08)]"
                >
                  <span className="absolute top-1/2 left-[calc(50cqh-28cqw)] aspect-square h-[360%] -translate-x-1/2 -translate-y-1/2 scale-[var(--left-tape-scale)] rounded-full border border-[#0d0a08] bg-[repeating-radial-gradient(circle,#050505_0_2px,#171717_2px_4px)] shadow-[inset_0_0_5px_rgba(0,0,0,0.7),0_1px_2px_rgba(0,0,0,0.5)] will-change-transform" />
                  <span className="absolute top-1/2 left-[calc(72cqw-50cqh)] aspect-square h-[360%] -translate-x-1/2 -translate-y-1/2 scale-[var(--right-tape-scale)] rounded-full border border-[#0d0a08] bg-[repeating-radial-gradient(circle,#050505_0_2px,#171717_2px_4px)] shadow-[inset_0_0_5px_rgba(0,0,0,0.7),0_1px_2px_rgba(0,0,0,0.5)] will-change-transform" />
                  {TAPE_WINDOW_DIVIDERS.map((divider) => (
                    <span
                      className="relative z-[1] h-[42%] w-0.5 bg-[rgba(224,215,195,0.28)]"
                      key={divider}
                    />
                  ))}
                </div>
                <Reel className="left-[50cqh]" />
                <Reel className="left-[calc(100%-50cqh)]" />
              </div>
            </div>

            {/* Scrubber & Timecode */}
            <div className="absolute right-4 bottom-3.5 left-4 z-[5] grid gap-y-1 max-[560px]:right-3 max-[560px]:bottom-2.5 max-[560px]:left-3">
              <Slider.Root
                disabled={duration <= 0}
                largeStep={Math.min(Math.max(duration / 10, 1), 10)}
                max={Math.max(duration, 0.01)}
                min={0}
                onValueCommitted={finishScrubbing}
                onValueChange={seek}
                step={0.01}
                thumbAlignment="edge"
                value={Math.min(currentTime, Math.max(duration, 0.01))}
              >
                <Slider.Control
                  className="flex h-6 w-full cursor-pointer touch-none items-center data-disabled:cursor-default"
                  onPointerCancel={finishScrubbing}
                  onPointerDown={startScrubbing}
                >
                  <Slider.Track className="relative h-[3.5px] w-full translate-y-0.5 rounded-full bg-[color-mix(in_srgb,var(--label-ink)_24%,transparent)]">
                    <Slider.Indicator className="h-full rounded-full bg-[var(--label-ink)]" />

                    {/* v2 Chapter notch dividers along the tape scrubber */}
                    {isV2 &&
                      chapters.map((chapter) =>
                        chapter.startRatio > 0.01 && chapter.startRatio < 0.99 ? (
                          <span
                            key={chapter.id}
                            aria-hidden="true"
                            style={{ left: `${chapter.startRatio * 100}%` }}
                            className="pointer-events-none absolute top-1/2 z-[2] h-[7px] w-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--label-bg)]"
                          />
                        ) : null,
                      )}

                    <Slider.Thumb
                      getAriaLabel={() => `Seek through ${resolvedTrackTitle}`}
                      getAriaValueText={(_formattedValue, value) =>
                        `${formatTime(value)} of ${formatTime(duration)}`
                      }
                      className="z-[3] size-[13px] rounded-full border-2 border-[var(--progress-thumb-border)] bg-[var(--progress-thumb-fill)] shadow-[0_1px_4px_rgba(37,33,29,0.38)] outline-none has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-[3px] has-[:focus-visible]:outline-[var(--label-ink)]"
                    />
                  </Slider.Track>
                </Slider.Control>
              </Slider.Root>

              <div className="relative z-[2] flex items-baseline justify-between gap-2 font-sans text-[11.5px] font-normal leading-4 tabular-nums">
                <span>
                  <span className="sr-only">Elapsed time </span>
                  <time dateTime={formatDuration(currentTime)}>
                    {formatTime(currentTime)}
                  </time>
                </span>

                {isV2 && isOutOfContext ? (
                  <span className="truncate font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-[var(--label-stripe-one)]">
                    Scrolled away · Tap target
                  </span>
                ) : null}

                <span>
                  <span className="sr-only">Total time </span>
                  <time dateTime={formatDuration(duration)}>
                    {formatTime(duration)}
                  </time>
                </span>
              </div>
            </div>

            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-1 z-10 rounded-[inherit] border-4 border-[var(--label-border)]"
            />
          </div>

          {/* Lower Trapezoid Transport Deck */}
          {isV2 ? (
            <div
              className={cn(
                "absolute right-[7.5%] bottom-[2%] left-[7.5%] z-[4] grid h-[19.5%] grid-cols-[1fr_1fr_auto_1fr_1fr] place-items-center gap-x-[clamp(6px,1.8cqw,12px)] px-[6.5%] [clip-path:polygon(6%_0,94%_0,100%_100%,0_100%)]",
                isLightShell
                  ? "bg-[#c8c3b9]/82 shadow-[inset_0_3px_9px_rgba(24,23,21,0.2)]"
                  : "bg-[color-mix(in_srgb,#63635e_28%,transparent)] shadow-[inset_0_3px_9px_rgba(0,0,0,0.58)]",
              )}
            >
              {/* 1. Restart / Rewind to 0:00 */}
              <AppleTooltip label="Rewind to start (0)" placement="top">
                <button
                  aria-label="Restart track"
                  className={cn(
                    BUTTON_CLASSES,
                    "w-[clamp(30px,8cqw,40px)]",
                    v2SecondaryDeckKeyClass,
                  )}
                  disabled={currentTime <= 0}
                  onClick={restart}
                  type="button"
                >
                  <ArrowCounterClockwiseIcon aria-hidden size={17} weight="bold" />
                </button>
              </AppleTooltip>

              {/* 2. Skip Back 15s */}
              <AppleTooltip label={`Back ${skipSeconds}s (J)`} placement="top">
                <button
                  aria-label={`Skip back ${skipSeconds} seconds`}
                  className={cn(
                    BUTTON_CLASSES,
                    "w-[clamp(32px,8.6cqw,43px)]",
                    v2SecondaryDeckKeyClass,
                  )}
                  disabled={duration <= 0 || currentTime <= 0}
                  onClick={() => skipBy(-skipSeconds)}
                  type="button"
                >
                  <RewindIcon aria-hidden size={19} weight="fill" />
                </button>
              </AppleTooltip>

              {/* 3. Primary Center Play / Pause */}
              <button
                aria-label={
                  isPlaying
                    ? `Pause ${resolvedTrackTitle}`
                    : `Play ${resolvedTrackTitle}`
                }
                className={cn(
                  BUTTON_CLASSES,
                  "w-[clamp(38px,10.2cqw,50px)]",
                  v2PrimaryDeckKeyClass,
                )}
                onClick={togglePlayback}
                type="button"
              >
                {isPlaying ? (
                  <PauseIcon aria-hidden size={22} weight="fill" />
                ) : (
                  <PlayIcon aria-hidden size={22} weight="fill" />
                )}
              </button>

              {/* 4. Skip Forward 15s */}
              <AppleTooltip label={`Forward ${skipSeconds}s (K)`} placement="top">
                <button
                  aria-label={`Skip forward ${skipSeconds} seconds`}
                  className={cn(
                    BUTTON_CLASSES,
                    "w-[clamp(32px,8.6cqw,43px)]",
                    v2SecondaryDeckKeyClass,
                  )}
                  disabled={duration <= 0 || currentTime >= duration}
                  onClick={() => skipBy(skipSeconds)}
                  type="button"
                >
                  <FastForwardIcon aria-hidden size={19} weight="fill" />
                </button>
              </AppleTooltip>

              {/* 5. Target / Context-Aware Jump to Speaker */}
              <AppleTooltip
                label={
                  isOutOfContext
                    ? "Jump to speaker"
                    : "On active chapter · Jump to speaker"
                }
                placement="top"
              >
                <button
                  aria-label="Jump to speaker"
                  data-context-state={isOutOfContext ? "out-of-context" : "on-track"}
                  style={
                    isOutOfContext
                      ? {
                          backgroundColor: theme.stripeOne,
                          borderColor: "rgba(255,255,255,0.68)",
                          color: "#ffffff",
                          boxShadow: `0 0 0 2.5px color-mix(in srgb, ${theme.stripeOne} 45%, transparent), 0 4px 12px rgba(0,0,0,0.38)`,
                        }
                      : undefined
                  }
                  className={cn(
                    BUTTON_CLASSES,
                    "w-[clamp(32px,8.6cqw,43px)]",
                    !isOutOfContext && v2SecondaryDeckKeyClass,
                  )}
                  onClick={handleTargetJump}
                  type="button"
                >
                  <HandTapIcon aria-hidden size={20} weight="bold" />
                </button>
              </AppleTooltip>
            </div>
          ) : (
            <div
              className={cn(
                "absolute right-[27%] bottom-[3.5%] left-[27%] z-[4] grid h-[16%] grid-cols-[1fr_auto_1fr] place-items-center gap-x-[clamp(6px,1.5cqw,10px)] px-[12%] [clip-path:polygon(13%_0,87%_0,100%_100%,0_100%)]",
                isLightShell
                  ? "bg-[#c8c3b9]/75 shadow-[inset_0_3px_8px_rgba(24,23,21,0.18)]"
                  : "bg-[color-mix(in_srgb,#63635e_20%,transparent)] shadow-[inset_0_3px_8px_rgba(0,0,0,0.5)]",
              )}
            >
              <button
                aria-label="Restart track"
                className={cn(
                  BUTTON_CLASSES,
                  "w-[clamp(24px,6.5cqw,32px)]",
                  secondaryDeckKeyClass,
                )}
                disabled={currentTime <= 0}
                onClick={restart}
                type="button"
              >
                <ArrowCounterClockwiseIcon aria-hidden size={16} weight="bold" />
              </button>

              <button
                aria-label={
                  isPlaying
                    ? `Pause ${resolvedTrackTitle}`
                    : `Play ${resolvedTrackTitle}`
                }
                className={cn(
                  BUTTON_CLASSES,
                  "w-[clamp(30px,8.2cqw,43px)]",
                  primaryDeckKeyClass,
                )}
                onClick={togglePlayback}
                type="button"
              >
                {isPlaying ? (
                  <PauseIcon aria-hidden size={18} weight="fill" />
                ) : (
                  <PlayIcon aria-hidden size={18} weight="fill" />
                )}
              </button>

              <button
                aria-label={volume === 0 ? "Unmute" : "Mute"}
                className={cn(
                  BUTTON_CLASSES,
                  "w-[clamp(24px,6.5cqw,32px)]",
                  secondaryDeckKeyClass,
                )}
                onClick={toggleMute}
                type="button"
              >
                {volume === 0 ? (
                  <SpeakerSlashIcon aria-hidden size={16} weight="bold" />
                ) : (
                  <SpeakerHighIcon aria-hidden size={16} weight="bold" />
                )}
              </button>
            </div>
          )}
          </div>
        </motion.div>

        {playbackError ? (
          <p
            className="mt-3 text-center text-sm text-red-700 dark:text-red-400"
            role="alert"
          >
            {playbackError}
          </p>
        ) : null}
      </div>
    </section>
  );
}
