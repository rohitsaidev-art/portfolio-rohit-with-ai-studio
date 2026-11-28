import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AudioLines,
  ChevronDown,
  Headphones,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { AnimatedMuteIcon } from './icons/MuteToggle';
import {
  setFloatingAudioDockActive,
  useMobileReadingBarVisible,
} from '../utils/floatingDock';
import {
  buildNarrationTimeline,
  buildWaveformProfile,
  clampAudioTime,
  computeCalibratedSpeechParams,
  DEFAULT_SPEECH_TUNING,
  formatAudioTime,
  rankSpeechVoices,
  resolvePositionAtTime,
  skipAudioTime,
  splitIntoSpeechChunks,
  type NarrationSegment,
  type RankedSpeechVoice,
  type SpeechVoiceProvider,
} from '../utils/readAloud';
import {
  playPauseTone,
  playSkipTick,
  playStartChime,
  playTick,
} from '../utils/soundEngine';
import { EASE_APPLE } from '../utils/motion';
import { scrollToElementById } from '../utils/scroll';
import { AppleTooltip } from './AppleTooltip';
import { AudioWaveform, MiniAudioEqualizer } from './AudioWaveform';
import { HandTapIcon, SkipBack15Icon, SkipForward15Icon } from './icons/AudioSkipIcons';

export type AudioPlayerVariant = 'editorial' | 'contextual-floating';

export const AUDIO_PLAYER_VARIANTS: readonly {
  id: AudioPlayerVariant;
  name: string;
  description: string;
}[] = [
  {
    id: 'editorial',
    name: 'Editorial Deck & Floating Dock',
    description:
      'Full inline narration card with waveform, voice tuning, and auto-docking Now Playing bar.',
  },
  {
    id: 'contextual-floating',
    name: 'Contextual Floating Pill',
    description:
      'Minimal pill-shaped persistent player with segmented chapter track and context-aware Jump to Speaker.',
  },
];

export interface AudioPlayerProps {
  title: string;
  segments: NarrationSegment[];
  /** Selectable player architecture. Defaults to 'editorial' to preserve existing usage. */
  variant?: AudioPlayerVariant;
  /** Rendering mode for the 'contextual-floating' variant ('floating' fixed at viewport bottom, or 'inline' for embedded placement). */
  contextualDisplayMode?: 'floating' | 'inline';
  /** When contextualDisplayMode is 'inline', smoothly floats the pill at viewport bottom once scrolled past during playback. */
  autoFloatOnScroll?: boolean;
  /** When true, compresses the floating pill into a short compact capsule (e.g. after scrolling past the article into the next section). */
  compressed?: boolean;
  /** Optional preview override for the contextual Jump to Speaker out-of-context state (used in Studio specimens). */
  forceOutOfContext?: boolean;
  onActiveSectionChange?: (sectionId: string | null) => void;
  onJumpToSection?: (sectionId: string) => void;
  onPlaybackChange?: (playing: boolean) => void;
  compactFloatingOffsetClass?: string;
  idleLabel?: string;
  /** @deprecated Helper caption removed for cleaner visual hierarchy */
  helperText?: string;
  anchorId?: string;
}

const PLAYBACK_RATES = [1, 1.25, 1.5, 2] as const;
const DEFAULT_RATE_INDEX = 1; // 1.25×
const PITCH_PRESETS = [
  { label: 'Calm', value: 0.92 },
  { label: 'Natural', value: DEFAULT_SPEECH_TUNING.pitch },
  { label: 'Bright', value: 1.06 },
] as const;

const LEGACY_VOICE_STORAGE_KEY = 'portfolio_narration_voice_uri';
const PREFS_STORAGE_KEY = 'portfolio_narration_voice_prefs_v2';
const SENTENCE_PAUSE_MS = 135;
const CHAPTER_PAUSE_MS = 380;

interface StoredNarrationPrefs {
  voiceUri: string;
  rateIndex: number;
  pitch: number;
  volume: number;
}

function loadStoredNarrationPrefs(): StoredNarrationPrefs {
  const fallback: StoredNarrationPrefs = {
    voiceUri: '',
    rateIndex: DEFAULT_RATE_INDEX,
    pitch: DEFAULT_SPEECH_TUNING.pitch,
    volume: DEFAULT_SPEECH_TUNING.volume,
  };
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(PREFS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoredNarrationPrefs>;
      const safeRateIndex =
        typeof parsed.rateIndex === 'number' &&
        parsed.rateIndex >= 0 &&
        parsed.rateIndex < PLAYBACK_RATES.length
          ? parsed.rateIndex
          : DEFAULT_RATE_INDEX;
      const safePitch =
        typeof parsed.pitch === 'number' && Number.isFinite(parsed.pitch)
          ? Math.min(1.15, Math.max(0.85, parsed.pitch))
          : DEFAULT_SPEECH_TUNING.pitch;
      const safeVolume =
        typeof parsed.volume === 'number' && Number.isFinite(parsed.volume)
          ? Math.min(1, Math.max(0, parsed.volume))
          : DEFAULT_SPEECH_TUNING.volume;
      return {
        voiceUri: typeof parsed.voiceUri === 'string' ? parsed.voiceUri : '',
        rateIndex: safeRateIndex,
        pitch: safePitch,
        volume: safeVolume,
      };
    }

    const legacyUri = window.localStorage.getItem(LEGACY_VOICE_STORAGE_KEY) || '';
    return { ...fallback, voiceUri: legacyUri };
  } catch {
    return fallback;
  }
}

function saveStoredNarrationPrefs(prefs: StoredNarrationPrefs): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
    if (prefs.voiceUri) {
      window.localStorage.setItem(LEGACY_VOICE_STORAGE_KEY, prefs.voiceUri);
    } else {
      window.localStorage.removeItem(LEGACY_VOICE_STORAGE_KEY);
    }
  } catch {
    // Ignore storage quota restrictions
  }
}

function formatProviderLabel(provider: SpeechVoiceProvider | null): string {
  if (provider === 'google') return 'Google Neural';
  if (provider === 'apple') return 'Apple Neural';
  if (provider === 'neural') return 'Neural Voice';
  return 'System Voice';
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return Boolean(target.closest('[contenteditable="true"]'));
}

function hasOpenModal(): boolean {
  if (typeof document === 'undefined') return false;
  return Boolean(document.querySelector('[data-modal-open="true"]'));
}

/**
 * Reusable Apple HIG AudioPlayer (P0.2, P2.5).
 * - Web Speech API narration with explicit voice, lang, rate, pitch, and volume
 *   parameters, prioritizing Google & Apple high-quality neural voices.
 * - Live Apple HIG visual waveform generator synchronized to playback & word cadence.
 * - Play/pause, ±15s skip, variable playback speed, voice tuning popover, chapter-synced scrubber.
 * - Independent narration volume & mute (strictly decoupled from global UI sound mute).
 * - Active section tracking & "Jump back to speaker" when scrolled away.
 * - Narration remains completely silent until explicitly played.
 */
export function AudioPlayer({
  title,
  segments,
  variant = 'editorial',
  contextualDisplayMode = 'floating',
  autoFloatOnScroll = false,
  compressed = false,
  forceOutOfContext,
  onActiveSectionChange,
  onJumpToSection,
  onPlaybackChange,
  compactFloatingOffsetClass,
  idleLabel = 'Listen to case study',
  helperText: _helperText,
  anchorId = 'audio-narration-player',
}: AudioPlayerProps) {
  const dockId = useId();
  const mobileBarVisible = useMobileReadingBarVisible();
  const timeline = useMemo(() => buildNarrationTimeline(segments), [segments]);
  const waveformProfile = useMemo(
    () => buildWaveformProfile(segments, 44),
    [segments],
  );

  const initialPrefs = useMemo(() => loadStoredNarrationPrefs(), []);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeakingChunk, setIsSpeakingChunk] = useState(false);
  const [speechPulseTick, setSpeechPulseTick] = useState(0);
  /** Independent media mute & volume — strictly decoupled from global UI sound effects */
  const [narrationMuted, setNarrationMuted] = useState(false);
  const [narrationVolume, setNarrationVolume] = useState(initialPrefs.volume);
  const [narrationPitch, setNarrationPitch] = useState(initialPrefs.pitch);
  const [rankedVoices, setRankedVoices] = useState<
    RankedSpeechVoice<SpeechSynthesisVoice>[]
  >([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState<string>(
    initialPrefs.voiceUri,
  );
  const [currentTime, setCurrentTime] = useState(0);
  const [rateIndex, setRateIndex] = useState(initialPrefs.rateIndex);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPreviewTime, setDragPreviewTime] = useState<number | null>(null);
  const [showFloatingDock, setShowFloatingDock] = useState(false);
  const [floatingDismissed, setFloatingDismissed] = useState(false);
  const [inlineOutOfView, setInlineOutOfView] = useState(false);
  const [speakerSectionOutOfView, setSpeakerSectionOutOfView] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [tuningOpen, setTuningOpen] = useState(false);
  const [manualExpanded, setManualExpanded] = useState(false);

  const inlineRef = useRef<HTMLDivElement | null>(null);
  const tuningContainerRef = useRef<HTMLDivElement | null>(null);
  const currentTimeRef = useRef(0);
  const lastScrubSegmentIdRef = useRef<string | null>(null);
  const speechSessionRef = useRef(0);
  const speechTimerRef = useRef<number | null>(null);
  // Strong ref prevents Chromium/WebKit from garbage-collecting active utterances mid-sentence
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  // Tracks when real Web Speech synthesis is driving progression vs muted/fallback timer
  const speechDrivenRef = useRef(false);
  const chunkCeilingSecRef = useRef(0);
  const jumpSuppressUntilRef = useRef(0);
  const rate = PLAYBACK_RATES[rateIndex] ?? PLAYBACK_RATES[DEFAULT_RATE_INDEX];

  const displayedTime = dragPreviewTime ?? currentTime;
  const activePosition = useMemo(
    () => resolvePositionAtTime(timeline, displayedTime),
    [timeline, displayedTime],
  );
  const activeSegmentId = isPlaying ? activePosition?.segment.id ?? null : null;
  const observedSpeakerSegmentId =
    variant === 'contextual-floating'
      ? (activePosition?.segment.id ?? null)
      : activeSegmentId;

  const progressRatio =
    timeline.totalDurationSec > 0
      ? clampAudioTime(displayedTime, timeline.totalDurationSec) /
        timeline.totalDurationSec
      : 0;

  // Persist narration voice & prosody tuning preferences
  useEffect(() => {
    saveStoredNarrationPrefs({
      voiceUri: selectedVoiceUri,
      rateIndex,
      pitch: narrationPitch,
      volume: narrationVolume,
    });
  }, [selectedVoiceUri, rateIndex, narrationPitch, narrationVolume]);

  // Close Voice Tuning popover on Escape or outside pointer click
  useEffect(() => {
    if (!tuningOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        tuningContainerRef.current &&
        !tuningContainerRef.current.contains(event.target as Node)
      ) {
        setTuningOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setTuningOpen(false);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [tuningOpen]);

  // Populate & rank system voices (prioritizing Google & Apple high-quality neural voices)
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const loadVoices = () => {
      try {
        const list = window.speechSynthesis.getVoices();
        if (!Array.isArray(list) || list.length === 0) return;
        const curated = rankSpeechVoices(list, 14, { gender: 'male' });
        setRankedVoices(curated);
      } catch {
        // Ignore restricted speechSynthesis environments
      }
    };

    loadVoices();
    const retryTimer = window.setTimeout(loadVoices, 250);
    const synth = window.speechSynthesis;
    if (typeof synth.addEventListener === 'function') {
      synth.addEventListener('voiceschanged', loadVoices);
      return () => {
        window.clearTimeout(retryTimer);
        synth.removeEventListener('voiceschanged', loadVoices);
      };
    }
    return () => window.clearTimeout(retryTimer);
  }, []);

  const activeRankedVoice = useMemo(() => {
    if (rankedVoices.length === 0) return null;
    if (selectedVoiceUri) {
      const explicit = rankedVoices.find(
        (r) => r.voice.voiceURI === selectedVoiceUri,
      );
      if (explicit) return explicit;
    }
    return rankedVoices[0];
  }, [rankedVoices, selectedVoiceUri]);

  const resolveBestVoice = useCallback(
    (voiceUri: string): SpeechSynthesisVoice | null => {
      if (rankedVoices.length > 0) {
        if (voiceUri) {
          const explicit = rankedVoices.find((r) => r.voice.voiceURI === voiceUri);
          if (explicit) return explicit.voice;
        }
        return rankedVoices[0].voice;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          const fresh = rankSpeechVoices(window.speechSynthesis.getVoices(), 14, {
            gender: 'male',
          });
          if (fresh.length > 0) {
            if (voiceUri) {
              const explicit = fresh.find((r) => r.voice.voiceURI === voiceUri);
              if (explicit) return explicit.voice;
            }
            return fresh[0].voice;
          }
        } catch {
          return null;
        }
      }
      return null;
    },
    [rankedVoices],
  );

  const clearScheduledSpeechTimer = useCallback(() => {
    if (speechTimerRef.current !== null) {
      window.clearTimeout(speechTimerRef.current);
      speechTimerRef.current = null;
    }
  }, []);

  const stopSpeech = useCallback(() => {
    speechSessionRef.current += 1;
    clearScheduledSpeechTimer();
    activeUtteranceRef.current = null;
    speechDrivenRef.current = false;
    setIsSpeakingChunk(false);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
          window.speechSynthesis.cancel();
        }
      } catch {
        // Ignore sandbox speechSynthesis restrictions
      }
    }
  }, [clearScheduledSpeechTimer]);

  /**
   * Speaks sequentially from any timeline position using short sentence-aligned
   * chunks with explicitly calibrated Google/Apple neural voice parameters
   * (voice, lang, rate, pitch, volume) to eliminate robotic artifacts and cutoffs.
   */
  const speakFromTime = useCallback(
    (
      timeSec: number,
      playbackRate: number,
      muted = narrationMuted,
      volume = narrationVolume,
      pitch = narrationPitch,
      voiceUri = selectedVoiceUri,
      initialDelayMs = 45,
    ) => {
      const wasActive =
        typeof window !== 'undefined' &&
        'speechSynthesis' in window &&
        (window.speechSynthesis.speaking || window.speechSynthesis.pending);

      stopSpeech();

      if (muted || volume <= 0) {
        speechDrivenRef.current = false;
        setIsSpeakingChunk(false);
        return;
      }

      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        speechDrivenRef.current = false;
        setIsSpeakingChunk(false);
        return;
      }

      const sessionId = speechSessionRef.current;
      const startPos = resolvePositionAtTime(timeline, timeSec);
      if (!startPos) {
        speechDrivenRef.current = false;
        setIsSpeakingChunk(false);
        return;
      }

      speechDrivenRef.current = true;
      let activeVoice = resolveBestVoice(voiceUri);
      let usedLocalFallback = false;

      const speakSegmentFromIndex = (
        segmentIndex: number,
        textOverride?: string,
        segmentStartTimeSec?: number,
        delayMs = 0,
      ) => {
        if (sessionId !== speechSessionRef.current) return;

        const segment = timeline.segments[segmentIndex];
        if (!segment) {
          speechDrivenRef.current = false;
          setIsSpeakingChunk(false);
          currentTimeRef.current = timeline.totalDurationSec;
          setCurrentTime(timeline.totalDurationSec);
          setIsPlaying(false);
          onActiveSectionChange?.(null);
          return;
        }

        const sourceText = (textOverride ?? segment.text).trim();
        const chunks = splitIntoSpeechChunks(sourceText, 190);
        if (chunks.length === 0) {
          speakSegmentFromIndex(segmentIndex + 1, undefined, undefined, CHAPTER_PAUSE_MS);
          return;
        }

        const totalChunkChars = Math.max(
          1,
          chunks.reduce((sum, c) => sum + c.length, 0),
        );
        const baseStartSec = segmentStartTimeSec ?? segment.startSec;
        const remainingSpanSec = Math.max(1, segment.endSec - baseStartSec);

        const chunkWindows: Array<{ startSec: number; endSec: number }> = [];
        let consumedChars = 0;
        for (const chunk of chunks) {
          const cStart =
            baseStartSec + (consumedChars / totalChunkChars) * remainingSpanSec;
          consumedChars += chunk.length;
          const cEnd =
            baseStartSec + (consumedChars / totalChunkChars) * remainingSpanSec;
          chunkWindows.push({ startSec: cStart, endSec: cEnd });
        }

        onActiveSectionChange?.(segment.id);

        const speakChunk = (chunkIdx: number, pauseBeforeMs: number) => {
          if (sessionId !== speechSessionRef.current) return;

          if (chunkIdx >= chunks.length) {
            const nextSegmentIdx = segmentIndex + 1;
            const nextSeg = timeline.segments[nextSegmentIdx];
            if (!nextSeg) {
              speechDrivenRef.current = false;
              setIsSpeakingChunk(false);
              activeUtteranceRef.current = null;
              currentTimeRef.current = timeline.totalDurationSec;
              setCurrentTime(timeline.totalDurationSec);
              setIsPlaying(false);
              onActiveSectionChange?.(null);
              return;
            }

            setIsSpeakingChunk(false);
            currentTimeRef.current = nextSeg.startSec;
            setCurrentTime(nextSeg.startSec);
            onActiveSectionChange?.(nextSeg.id);
            onJumpToSection?.(nextSeg.id);
            speakSegmentFromIndex(
              nextSegmentIdx,
              undefined,
              nextSeg.startSec,
              CHAPTER_PAUSE_MS,
            );
            return;
          }

          const win = chunkWindows[chunkIdx];
          chunkCeilingSecRef.current = Math.max(win.startSec, win.endSec - 0.15);

          const startUtterance = () => {
            if (sessionId !== speechSessionRef.current) return;
            try {
              const chunkText = chunks[chunkIdx];
              const utterance = new SpeechSynthesisUtterance(chunkText);
              const calibrated = computeCalibratedSpeechParams(
                { rate: playbackRate, pitch, volume },
                activeVoice,
              );

              utterance.rate = calibrated.rate;
              utterance.pitch = calibrated.pitch;
              utterance.volume = calibrated.volume;
              utterance.lang = calibrated.lang;
              if (activeVoice) {
                utterance.voice = activeVoice;
              }

              utterance.onstart = () => {
                if (sessionId !== speechSessionRef.current) return;
                setIsSpeakingChunk(true);
                setSpeechPulseTick((t) => t + 1);
                currentTimeRef.current = win.startSec;
                setCurrentTime(win.startSec);
              };

              utterance.onboundary = (event) => {
                if (sessionId !== speechSessionRef.current) return;
                setSpeechPulseTick((t) => t + 1);
                if (typeof event.charIndex === 'number' && chunkText.length > 0) {
                  const ratio = Math.min(1, Math.max(0, event.charIndex / chunkText.length));
                  const mapped = win.startSec + ratio * (win.endSec - win.startSec);
                  currentTimeRef.current = mapped;
                  setCurrentTime(mapped);
                }
              };

              utterance.onend = () => {
                if (sessionId !== speechSessionRef.current) return;
                setIsSpeakingChunk(false);
                currentTimeRef.current = win.endSec;
                setCurrentTime(win.endSec);
                speakChunk(chunkIdx + 1, SENTENCE_PAUSE_MS);
              };

              utterance.onerror = (event) => {
                if (sessionId !== speechSessionRef.current) return;
                const err = event.error;
                if (err === 'interrupted' || err === 'canceled') {
                  return;
                }
                // If a cloud voice fails (e.g. offline), fall back once to best local voice
                if (activeVoice && activeVoice.localService === false && !usedLocalFallback) {
                  usedLocalFallback = true;
                  const localCandidate = rankedVoices.find(
                    (r) => r.voice.localService === true,
                  )?.voice;
                  if (localCandidate) {
                    activeVoice = localCandidate;
                    speakChunk(chunkIdx, 40);
                    return;
                  }
                }
                activeUtteranceRef.current = null;
                speechDrivenRef.current = false;
                setIsSpeakingChunk(false);
              };

              activeUtteranceRef.current = utterance;
              window.speechSynthesis.speak(utterance);
            } catch {
              activeUtteranceRef.current = null;
              speechDrivenRef.current = false;
              setIsSpeakingChunk(false);
            }
          };

          if (pauseBeforeMs > 0) {
            clearScheduledSpeechTimer();
            speechTimerRef.current = window.setTimeout(startUtterance, pauseBeforeMs);
          } else {
            startUtterance();
          }
        };

        speakChunk(0, delayMs);
      };

      const safeFlushDelay = Math.max(wasActive ? 45 : 0, initialDelayMs);
      speakSegmentFromIndex(
        startPos.segmentIndex,
        startPos.remainingText,
        timeSec,
        safeFlushDelay,
      );
    },
    [
      stopSpeech,
      timeline,
      narrationMuted,
      narrationVolume,
      narrationPitch,
      selectedVoiceUri,
      rankedVoices,
      resolveBestVoice,
      clearScheduledSpeechTimer,
      onActiveSectionChange,
      onJumpToSection,
    ],
  );

  // Reset cleanly when switching case studies, notes, or reading depth segments
  const segmentSignature = useMemo(
    () => segments.map((s) => `${s.id}:${s.text.length}`).join('|'),
    [segments],
  );

  useEffect(() => {
    stopSpeech();
    setIsPlaying(false);
    setCurrentTime(0);
    currentTimeRef.current = 0;
    setDragPreviewTime(null);
    setShowFloatingDock(false);
    setFloatingDismissed(false);
    setSpeakerSectionOutOfView(false);
    setTuningOpen(false);
    setManualExpanded(false);
    lastScrubSegmentIdRef.current = null;
    onActiveSectionChange?.(null);
    onPlaybackChange?.(false);
  }, [title, segmentSignature, stopSpeech, onActiveSectionChange, onPlaybackChange]);

  // Reset manual expand override whenever user scrolls back into the active article
  useEffect(() => {
    if (!compressed) {
      setManualExpanded(false);
    }
  }, [compressed]);

  // Notify parent on playback status changes
  useEffect(() => {
    onPlaybackChange?.(isPlaying);
  }, [isPlaying, onPlaybackChange]);

  // Cancel audio on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, [stopSpeech]);

  // Observe whether the inline bar has scrolled out of view to surface the floating iOS bar
  useEffect(() => {
    const el = inlineRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setInlineOutOfView(!entry.isIntersecting);
      },
      { threshold: 0.05 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [variant, contextualDisplayMode, autoFloatOnScroll]);

  // Track whether the currently narrating section is scrolled out of view (P2.5 Jump Back to Speaker)
  useEffect(() => {
    if (!observedSpeakerSegmentId || typeof IntersectionObserver === 'undefined') {
      setSpeakerSectionOutOfView(false);
      return;
    }

    const sectionEl = document.getElementById(observedSpeakerSegmentId);
    if (!sectionEl) {
      setSpeakerSectionOutOfView(false);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting && Date.now() < jumpSuppressUntilRef.current) {
          return;
        }
        setSpeakerSectionOutOfView(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '-72px 0px -72px 0px' },
    );

    observer.observe(sectionEl);
    return () => observer.disconnect();
  }, [observedSpeakerSegmentId]);

  // Smooth scrubber ticker:
  // - When real speech synthesis is speaking, gently interpolates INSIDE the
  //   active sentence chunk (clamped below chunkCeilingSecRef) so it NEVER cuts
  //   off a sentence or jumps chapters ahead of the narrator.
  // - When muted or when speechSynthesis is unavailable, advances full timeline smoothly.
  useEffect(() => {
    if (!isPlaying || isDragging) return;

    const tickMs = 200;
    const intervalId = window.setInterval(() => {
      if (speechDrivenRef.current) {
        const ceiling = chunkCeilingSecRef.current;
        if (currentTimeRef.current < ceiling) {
          const nudged = Math.min(
            ceiling,
            currentTimeRef.current + (tickMs / 1000) * rate,
          );
          currentTimeRef.current = nudged;
          setCurrentTime(nudged);
        }
        return;
      }

      const prevPos = resolvePositionAtTime(timeline, currentTimeRef.current);
      const next = currentTimeRef.current + (tickMs / 1000) * rate;
      if (next >= timeline.totalDurationSec) {
        currentTimeRef.current = timeline.totalDurationSec;
        setCurrentTime(timeline.totalDurationSec);
        setIsPlaying(false);
        stopSpeech();
        onActiveSectionChange?.(null);
        return;
      }

      currentTimeRef.current = next;
      setCurrentTime(next);

      const pos = resolvePositionAtTime(timeline, next);
      if (pos) {
        onActiveSectionChange?.(pos.segment.id);
        if (prevPos && pos.segmentIndex !== prevPos.segmentIndex) {
          onJumpToSection?.(pos.segment.id);
        }
      }
    }, tickMs);

    return () => window.clearInterval(intervalId);
  }, [
    isPlaying,
    isDragging,
    rate,
    timeline,
    stopSpeech,
    onActiveSectionChange,
    onJumpToSection,
  ]);

  const scrollToTimeSection = useCallback(
    (timeSec: number) => {
      const pos = resolvePositionAtTime(timeline, timeSec);
      if (pos) {
        onActiveSectionChange?.(pos.segment.id);
        onJumpToSection?.(pos.segment.id);
      }
    },
    [timeline, onActiveSectionChange, onJumpToSection],
  );

  const handleTogglePlay = useCallback(() => {
    setHasInteracted(true);
    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
      onActiveSectionChange?.(null);
      playPauseTone();
      return;
    }

    const startAt =
      currentTimeRef.current >= timeline.totalDurationSec - 0.5
        ? 0
        : currentTimeRef.current;

    currentTimeRef.current = startAt;
    setCurrentTime(startAt);
    setFloatingDismissed(false);
    setShowFloatingDock(true);
    setIsPlaying(true);
    playStartChime();
    // Wait 120ms so the subtle UI chime finishes cleanly before speech opens
    speakFromTime(
      startAt,
      rate,
      narrationMuted,
      narrationVolume,
      narrationPitch,
      selectedVoiceUri,
      120,
    );

    const pos = resolvePositionAtTime(timeline, startAt);
    if (pos) {
      onActiveSectionChange?.(pos.segment.id);
    }
  }, [
    isPlaying,
    stopSpeech,
    timeline,
    rate,
    narrationMuted,
    narrationVolume,
    narrationPitch,
    selectedVoiceUri,
    speakFromTime,
    onActiveSectionChange,
  ]);

  const commitSeek = useCallback(
    (targetTime: number, shouldScroll = true) => {
      const clamped = clampAudioTime(targetTime, timeline.totalDurationSec);
      currentTimeRef.current = clamped;
      setCurrentTime(clamped);
      setHasInteracted(true);
      setFloatingDismissed(false);
      setShowFloatingDock(true);

      if (shouldScroll) {
        scrollToTimeSection(clamped);
      }

      if (isPlaying) {
        speakFromTime(
          clamped,
          rate,
          narrationMuted,
          narrationVolume,
          narrationPitch,
          selectedVoiceUri,
          50,
        );
      } else if (!shouldScroll) {
        onActiveSectionChange?.(null);
      }
    },
    [
      timeline.totalDurationSec,
      isPlaying,
      rate,
      narrationMuted,
      narrationVolume,
      narrationPitch,
      selectedVoiceUri,
      speakFromTime,
      scrollToTimeSection,
      onActiveSectionChange,
    ],
  );

  const handleSkip = useCallback(
    (deltaSec: number) => {
      playSkipTick(deltaSec > 0 ? 'forward' : 'back');
      const next = skipAudioTime(
        currentTimeRef.current,
        deltaSec,
        timeline.totalDurationSec,
      );
      commitSeek(next, true);
    },
    [timeline.totalDurationSec, commitSeek],
  );

  const applyRateIndex = (nextIndex: number) => {
    const safeIndex = Math.max(0, Math.min(PLAYBACK_RATES.length - 1, nextIndex));
    setRateIndex(safeIndex);
    if (isPlaying) {
      speakFromTime(
        currentTimeRef.current,
        PLAYBACK_RATES[safeIndex],
        narrationMuted,
        narrationVolume,
        narrationPitch,
        selectedVoiceUri,
        50,
      );
    }
  };

  const handleCycleRate = () => {
    playTick();
    applyRateIndex((rateIndex + 1) % PLAYBACK_RATES.length);
  };

  const handlePitchChange = (nextPitch: number) => {
    const clamped = Number(Math.min(1.15, Math.max(0.85, nextPitch)).toFixed(2));
    setNarrationPitch(clamped);
    if (isPlaying && !narrationMuted) {
      speakFromTime(
        currentTimeRef.current,
        rate,
        false,
        narrationVolume,
        clamped,
        selectedVoiceUri,
        50,
      );
    }
  };

  const handleToggleNarrationMute = () => {
    const nextMuted = !narrationMuted;
    setNarrationMuted(nextMuted);
    if (nextMuted) {
      stopSpeech();
    } else if (isPlaying) {
      const restoredVolume = narrationVolume > 0 ? narrationVolume : 0.85;
      if (narrationVolume === 0) {
        setNarrationVolume(restoredVolume);
      }
      speakFromTime(
        currentTimeRef.current,
        rate,
        false,
        restoredVolume,
        narrationPitch,
        selectedVoiceUri,
        50,
      );
    }
  };

  const handleVolumeChange = (nextVol: number) => {
    const clamped = Math.min(1, Math.max(0, nextVol));
    setNarrationVolume(clamped);
    const shouldMute = clamped === 0;
    setNarrationMuted(shouldMute);
    if (shouldMute) {
      stopSpeech();
    } else if (isPlaying) {
      speakFromTime(
        currentTimeRef.current,
        rate,
        false,
        clamped,
        narrationPitch,
        selectedVoiceUri,
        50,
      );
    }
  };

  const handleVoiceChange = (nextUri: string) => {
    playTick();
    setSelectedVoiceUri(nextUri);
    if (isPlaying && !narrationMuted) {
      speakFromTime(
        currentTimeRef.current,
        rate,
        false,
        narrationVolume,
        narrationPitch,
        nextUri,
        50,
      );
    }
  };

  const handleResetTuning = () => {
    playTick();
    setRateIndex(DEFAULT_RATE_INDEX);
    setNarrationPitch(DEFAULT_SPEECH_TUNING.pitch);
    setNarrationVolume(DEFAULT_SPEECH_TUNING.volume);
    setNarrationMuted(false);
    if (isPlaying) {
      speakFromTime(
        currentTimeRef.current,
        PLAYBACK_RATES[DEFAULT_RATE_INDEX],
        false,
        DEFAULT_SPEECH_TUNING.volume,
        DEFAULT_SPEECH_TUNING.pitch,
        selectedVoiceUri,
        50,
      );
    }
  };

  const handleJumpBackToSpeaker = () => {
    if (!activePosition) return;
    playTick();
    jumpSuppressUntilRef.current = Date.now() + 850;
    setSpeakerSectionOutOfView(false);
    if (onJumpToSection) {
      onJumpToSection(activePosition.segment.id);
    } else {
      scrollToElementById(activePosition.segment.id);
    }
  };

  // Document-level keyboard shortcuts when player session is active (P2.5)
  useEffect(() => {
    if (!isPlaying && !hasInteracted) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target) || hasOpenModal()) return;

      const targetEl = event.target as HTMLElement | null;
      const isInteractiveButton =
        targetEl?.tagName === 'BUTTON' || targetEl?.tagName === 'A';

      if (event.code === 'Space' && !isInteractiveButton && isPlaying) {
        event.preventDefault();
        handleTogglePlay();
        return;
      }

      if (event.key === 'j' || event.key === 'J') {
        event.preventDefault();
        handleSkip(-15);
        return;
      }

      if (event.key === 'k' || event.key === 'K') {
        event.preventDefault();
        handleSkip(15);
        return;
      }

      if (isPlaying && !isInteractiveButton && event.key === 'ArrowLeft') {
        event.preventDefault();
        handleSkip(-15);
      } else if (isPlaying && !isInteractiveButton && event.key === 'ArrowRight') {
        event.preventDefault();
        handleSkip(15);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, hasInteracted, handleTogglePlay, handleSkip]);

  const handleDragPreview = useCallback(
    (previewSec: number) => {
      setDragPreviewTime(previewSec);
      const pos = resolvePositionAtTime(timeline, previewSec);
      if (pos) {
        if (lastScrubSegmentIdRef.current !== pos.segment.id) {
          lastScrubSegmentIdRef.current = pos.segment.id;
          playTick();
        }
        onActiveSectionChange?.(pos.segment.id);
      }
    },
    [timeline, onActiveSectionChange],
  );

  const shouldRenderContextualDocked =
    variant === 'contextual-floating' &&
    contextualDisplayMode === 'inline' &&
    autoFloatOnScroll &&
    !floatingDismissed &&
    inlineOutOfView &&
    (isPlaying || showFloatingDock);

  const shouldRenderFloating =
    variant === 'contextual-floating'
      ? contextualDisplayMode === 'floating' || shouldRenderContextualDocked
      : !floatingDismissed && (isPlaying || (showFloatingDock && inlineOutOfView));

  // Notify FloatingBackToTop & ToastViewport so they smoothly clear the active floating dock
  useEffect(() => {
    setFloatingAudioDockActive(dockId, shouldRenderFloating);
    return () => {
      setFloatingAudioDockActive(dockId, false);
    };
  }, [dockId, shouldRenderFloating]);

  const floatingBottomClass =
    compactFloatingOffsetClass ??
    (mobileBarVisible ? 'bottom-[78px] md:bottom-5' : 'bottom-5');

  const isAudioMutedOrZero = narrationMuted || narrationVolume === 0;
  const isDefaultTuning =
    rateIndex === DEFAULT_RATE_INDEX &&
    Math.abs(narrationPitch - DEFAULT_SPEECH_TUNING.pitch) < 0.005 &&
    Math.abs(narrationVolume - DEFAULT_SPEECH_TUNING.volume) < 0.01 &&
    !narrationMuted;

  const isJumpOutOfContext =
    forceOutOfContext !== undefined
      ? forceOutOfContext
      : isPlaying && speakerSectionOutOfView;

  if (variant === 'contextual-floating') {
    const isCompressedDocked = compressed && !manualExpanded;

    const renderPillContent = (isFloatingInstance: boolean) => {
      const isCompact = isFloatingInstance && isCompressedDocked;
      const showJumpControl = !isCompact && isJumpOutOfContext;

      return (
        <div
          id={!isFloatingInstance && contextualDisplayMode === 'inline' ? anchorId : undefined}
          role="region"
          aria-label={`Read aloud player for ${title}`}
          data-audio-variant="contextual-floating"
          data-compact={isCompact ? 'true' : 'false'}
          className={`flex items-center rounded-full border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] transition-[padding,box-shadow] duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isFloatingInstance
              ? 'apple-ios-bar shadow-[0_8px_28px_-6px_rgba(0,0,0,0.16)] dark:shadow-[0_12px_34px_-6px_rgba(0,0,0,0.72)]'
              : 'w-full shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06),0_10px_28px_-10px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_30px_-4px_rgba(0,0,0,0.65)]'
          } ${
            isCompact
              ? 'px-2.5 py-2'
              : 'px-3.5 py-[13px] sm:px-5 sm:py-3.5'
          }`}
        >
          {/* Left: Transport Controls — Skippers collapse smoothly into the Play/Pause anchor */}
          <div className="flex shrink-0 items-center">
            <div
              className={`grid transition-[grid-template-columns] duration-[360ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isCompact ? 'grid-cols-[0fr]' : 'grid-cols-[1fr]'
              }`}
            >
              <div className="overflow-hidden">
                <div
                  className={`pr-1 sm:pr-2 transition-opacity ${
                    isCompact
                      ? 'pointer-events-none opacity-0 duration-150 delay-0'
                      : 'opacity-100 duration-200 delay-100'
                  }`}
                >
                  <button
                    type="button"
                    tabIndex={isCompact ? -1 : 0}
                    onClick={() => handleSkip(-15)}
                    aria-label="Skip back 15 seconds"
                    title="Back 15 seconds (J)"
                    className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--apple-label-primary)] transition-colors duration-150 hover:bg-[var(--apple-control-hover)] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--apple-blue)] sm:h-10 sm:w-10"
                  >
                    <SkipBack15Icon size={22} />
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTogglePlay}
              aria-label={isPlaying ? 'Pause read aloud' : 'Play read aloud'}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--apple-blue-fill)] text-white transition-[background-color,transform] duration-150 hover:bg-[var(--apple-blue-hover)] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--apple-blue)]"
            >
              {isPlaying ? (
                <Pause
                  size={17}
                  fill="currentColor"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              ) : (
                <Play
                  size={17}
                  fill="currentColor"
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className="translate-x-[1px]"
                />
              )}
            </button>

            <div
              className={`grid transition-[grid-template-columns] duration-[360ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isCompact ? 'grid-cols-[0fr]' : 'grid-cols-[1fr]'
              }`}
            >
              <div className="overflow-hidden">
                <div
                  className={`pl-1 sm:pl-2 transition-opacity ${
                    isCompact
                      ? 'pointer-events-none opacity-0 duration-150 delay-0'
                      : 'opacity-100 duration-200 delay-100'
                  }`}
                >
                  <button
                    type="button"
                    tabIndex={isCompact ? -1 : 0}
                    onClick={() => handleSkip(15)}
                    aria-label="Skip forward 15 seconds"
                    title="Forward 15 seconds (K)"
                    className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--apple-label-primary)] transition-colors duration-150 hover:bg-[var(--apple-control-hover)] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--apple-blue)] sm:h-10 sm:w-10"
                  >
                    <SkipForward15Icon size={22} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Hairline vertical divider — smoothly collapses when compact */}
          <div
            aria-hidden="true"
            className={`hidden sm:grid shrink-0 transition-[grid-template-columns] duration-[360ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isCompact ? 'grid-cols-[0fr]' : 'grid-cols-[1fr]'
            }`}
          >
            <div className="overflow-hidden">
              <div
                className={`px-3.5 transition-opacity ${
                  isCompact ? 'opacity-0 duration-100' : 'opacity-100 duration-200 delay-75'
                }`}
              >
                <span className="block h-6 w-px bg-[var(--apple-separator)]" />
              </div>
            </div>
          </div>

          {/* Center: Continuous Title/Timecode + Smoothly Folding Scrubber */}
          <div
            onClick={
              isCompact
                ? () => {
                    playTick();
                    setManualExpanded(true);
                  }
                : undefined
            }
            role={isCompact ? 'button' : undefined}
            tabIndex={isCompact ? 0 : undefined}
            aria-label={isCompact ? 'Expand audio player controls' : undefined}
            onKeyDown={
              isCompact
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      playTick();
                      setManualExpanded(true);
                    }
                  }
                : undefined
            }
            className={`min-w-0 transition-[width,margin,padding] duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isFloatingInstance
                ? isCompact
                  ? 'mx-2 w-[156px] cursor-pointer rounded-full px-1.5 py-0.5 hover:bg-[var(--apple-control-hover)] sm:w-[186px]'
                  : 'ml-2 mr-2 w-[min(340px,calc(100vw-250px))] sm:ml-0 sm:mr-4 sm:w-[340px]'
                : 'ml-2.5 mr-2.5 flex-1 sm:ml-0 sm:mr-4'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <MiniAudioEqualizer
                  active={isPlaying}
                  muted={isAudioMutedOrZero}
                  accentWhenIdle
                  className="shrink-0"
                />
                <span className="truncate text-[13px] font-semibold tracking-[-0.015em] text-[var(--apple-label-primary)] sm:text-[14px]">
                  {isCompact
                    ? title
                    : activePosition
                      ? `${activePosition.segment.num} · ${activePosition.segment.title}`
                      : title}
                </span>
              </div>

              <span className="flex shrink-0 items-center text-[11.5px] font-normal tabular-nums text-[var(--apple-label-secondary)] sm:text-[12.5px]">
                <span>{formatAudioTime(displayedTime)}</span>
                <span
                  className={`grid transition-[grid-template-columns] duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isCompact ? 'grid-cols-[0fr]' : 'grid-cols-[1fr]'
                  }`}
                >
                  <span className="overflow-hidden whitespace-nowrap">
                    <span
                      className={`inline-block pl-1 transition-opacity ${
                        isCompact ? 'opacity-0 duration-100' : 'opacity-100 duration-200 delay-75'
                      }`}
                    >
                      / {formatAudioTime(timeline.totalDurationSec)}
                    </span>
                  </span>
                </span>
              </span>
            </div>

            {/* Scrubber folds vertically into the pill on collapse */}
            <div
              className={`grid transition-[grid-template-rows] duration-[360ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isCompact ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'
              }`}
            >
              <div className={isCompact ? 'overflow-hidden' : 'overflow-visible'}>
                <div
                  className={`pt-1 transition-opacity ${
                    isCompact
                      ? 'pointer-events-none opacity-0 duration-150 delay-0'
                      : 'opacity-100 duration-200 delay-100'
                  }`}
                >
                  <DraggableAudioScrubber
                    compact
                    segmented
                    timeline={timeline}
                    currentTime={displayedTime}
                    progressRatio={progressRatio}
                    isDragging={isDragging}
                    onDragStart={() => {
                      setIsDragging(true);
                      playTick();
                    }}
                    onDragPreview={handleDragPreview}
                    onDragEnd={(finalSec) => {
                      setIsDragging(false);
                      setDragPreviewTime(null);
                      commitSeek(finalSec, true);
                    }}
                    onKeyboardSeek={(nextSec) => {
                      playTick();
                      commitSeek(nextSec, true);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Collapsible Controls Group (Volume · Jump to Speaker · Speed) + Expand/Close */}
          <div className="flex shrink-0 items-center">
            <div
              className={`grid transition-[grid-template-columns] duration-[360ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isCompact ? 'grid-cols-[0fr]' : 'grid-cols-[1fr]'
              }`}
            >
              <div className={isCompact ? 'overflow-hidden' : 'overflow-visible'}>
                <div
                  className={`flex items-center transition-opacity ${
                    isCompact
                      ? 'pointer-events-none opacity-0 duration-150 delay-0'
                      : 'opacity-100 duration-200 delay-100'
                  }`}
                >
                  <InlineVolumeSlider
                    volume={narrationVolume}
                    muted={narrationMuted}
                    onToggleMute={handleToggleNarrationMute}
                    onVolumeChange={handleVolumeChange}
                  />

                  {/* Context-Aware Jump to Speaker — smoothly appears only when scrolled away, disappears on click or scroll-back */}
                  <div
                    className={`grid transition-[grid-template-columns] duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      showJumpControl ? 'grid-cols-[1fr]' : 'grid-cols-[0fr]'
                    }`}
                  >
                    <div className={showJumpControl ? 'overflow-visible' : 'overflow-hidden'}>
                      <div
                        className={`pl-1.5 sm:pl-2 transition-opacity ${
                          showJumpControl
                            ? 'opacity-100 duration-200 delay-75'
                            : 'pointer-events-none opacity-0 duration-100 delay-0'
                        }`}
                      >
                        <AppleTooltip
                          label="Jump to speaker"
                          placement="top"
                          disabled={!showJumpControl}
                        >
                          <button
                            type="button"
                            tabIndex={showJumpControl ? 0 : -1}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={(e) => {
                              e.currentTarget.blur();
                              handleJumpBackToSpeaker();
                            }}
                            aria-label="Jump to speaker"
                            data-context-state={
                              isJumpOutOfContext ? 'out-of-context' : 'on-track'
                            }
                            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--apple-control-tonal)] text-[var(--apple-link)] transition-[background-color,color,transform] duration-150 hover:bg-[var(--apple-control-tonal-hover)] hover:text-[var(--apple-label-primary)] active:scale-[0.94] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--apple-blue)] sm:h-10 sm:w-10"
                          >
                            <HandTapIcon size={19} />
                          </button>
                        </AppleTooltip>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    tabIndex={isCompact ? -1 : 0}
                    onClick={handleCycleRate}
                    aria-label={`Playback speed ${rate}x. Click to change speed`}
                    className="ml-1.5 inline-flex h-9 w-[56px] shrink-0 items-center justify-center rounded-full bg-[var(--apple-control-tonal)] px-0 text-[12.5px] font-semibold tabular-nums text-[var(--apple-label-primary)] transition-colors duration-150 hover:bg-[var(--apple-control-tonal-hover)] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--apple-blue)] sm:ml-2 sm:h-10 sm:w-[62px] sm:text-[13.5px]"
                  >
                    {rate}×
                  </button>
                </div>
              </div>
            </div>

            {/* Expand / Collapse toggle smoothly glides in when scrolled past Overview */}
            {isFloatingInstance && (
              <div
                className={`grid transition-[grid-template-columns] duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  compressed ? 'grid-cols-[1fr]' : 'grid-cols-[0fr]'
                }`}
              >
                <div className={compressed ? 'overflow-visible' : 'overflow-hidden'}>
                  <div
                    className={`pl-1 transition-opacity ${
                      compressed
                        ? 'opacity-100 duration-200 delay-75'
                        : 'pointer-events-none opacity-0 duration-100 delay-0'
                    }`}
                  >
                    <AppleTooltip
                      label={isCompact ? 'Expand player' : 'Minimize player'}
                      placement="top"
                      disabled={!compressed}
                    >
                      <button
                        type="button"
                        tabIndex={compressed ? 0 : -1}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          playTick();
                          setManualExpanded((prev) => !prev);
                        }}
                        aria-label={isCompact ? 'Expand audio player' : 'Minimize audio player'}
                        className="apple-btn-icon h-8 w-8 shrink-0 text-[var(--apple-label-tertiary)] hover:text-[var(--apple-label-primary)]"
                      >
                        {isCompact ? (
                          <Maximize2 size={13.5} strokeWidth={1.85} aria-hidden="true" />
                        ) : (
                          <Minimize2 size={13.5} strokeWidth={1.85} aria-hidden="true" />
                        )}
                      </button>
                    </AppleTooltip>
                  </div>
                </div>
              </div>
            )}

            {isFloatingInstance && autoFloatOnScroll && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  stopSpeech();
                  setIsPlaying(false);
                  setFloatingDismissed(true);
                  onActiveSectionChange?.(null);
                  playPauseTone();
                }}
                aria-label="Close floating audio player"
                className="apple-btn-icon ml-0.5 h-8 w-8 shrink-0 text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]"
              >
                <X size={14.5} strokeWidth={1.75} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      );
    };

    if (contextualDisplayMode === 'inline') {
      return (
        <>
          <div
            ref={inlineRef}
            className="w-full scroll-mt-[var(--scroll-offset-header)] print:hidden"
          >
            {renderPillContent(false)}
          </div>

          <AnimatePresence>
            {shouldRenderContextualDocked && (
              <motion.aside
                aria-label="Floating read aloud controls"
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.96 }}
                transition={{ duration: 0.28, ease: EASE_APPLE }}
                className={`fixed left-1/2 z-40 w-fit max-w-[calc(100%-1.5rem)] -translate-x-1/2 transition-[bottom] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] print:hidden ${floatingBottomClass}`}
              >
                {renderPillContent(true)}
              </motion.aside>
            )}
          </AnimatePresence>
        </>
      );
    }

    return (
      <motion.aside
        id={anchorId}
        aria-label="Contextual floating read aloud player"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.28, ease: EASE_APPLE }}
        className={`fixed left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-[780px] -translate-x-1/2 transition-[bottom] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] print:hidden ${floatingBottomClass}`}
      >
        {renderPillContent(true)}
      </motion.aside>
    );
  }

  return (
    <>
      {/* Inline Apple News+ / Podcasts Editorial AudioPlayer */}
      <div
        id={anchorId}
        ref={inlineRef}
        aria-label={`Read aloud player for ${title}`}
        className="apple-surface-subtle mt-8 scroll-mt-[var(--scroll-offset-header)] rounded-[20px] px-5 py-4.5 sm:px-6 sm:py-5 print:hidden"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Transport Controls (15s Back / Play-Pause / 15s Forward) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSkip(-15)}
              aria-label="Skip back 15 seconds"
              title="Back 15 seconds (J)"
              className="apple-btn-icon h-11 w-11 shrink-0 text-[var(--apple-label-primary)] sm:h-10 sm:w-10"
            >
              <SkipBack15Icon size={22} />
            </button>

            <button
              type="button"
              onClick={handleTogglePlay}
              aria-label={isPlaying ? 'Pause read aloud' : 'Play read aloud'}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--apple-blue-fill)] text-white transition-all duration-200 hover:bg-[var(--apple-blue-hover)] active:scale-[0.95]"
            >
              {isPlaying ? (
                <Pause size={17} fill="currentColor" strokeWidth={1.75} aria-hidden="true" />
              ) : (
                <Play size={17} fill="currentColor" strokeWidth={1.75} aria-hidden="true" className="translate-x-[1px]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSkip(15)}
              aria-label="Skip forward 15 seconds"
              title="Forward 15 seconds (K)"
              className="apple-btn-icon h-11 w-11 shrink-0 text-[var(--apple-label-primary)] sm:h-10 sm:w-10"
            >
              <SkipForward15Icon size={22} />
            </button>

            <div className="ml-1.5 min-w-0">
              <div className="type-caption flex items-center gap-2 text-[var(--apple-link)]">
                {isPlaying ? (
                  <MiniAudioEqualizer active={isPlaying} muted={isAudioMutedOrZero} />
                ) : (
                  <Headphones size={14} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
                )}
                <span className="truncate">
                  {isPlaying ? 'Listening now' : idleLabel}
                </span>
              </div>
              <p className="mt-0.5 truncate text-[15px] font-semibold tracking-[-0.015em] text-[var(--apple-label-primary)]">
                {activePosition
                  ? `${activePosition.segment.num} · ${activePosition.segment.title}`
                  : title}
              </p>
            </div>
          </div>

          {/* Right: Speed, Independent Narration Volume/Mute & Remaining Time */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 sm:justify-end">
            <span className="type-footnote tabular-nums text-[var(--apple-label-secondary)]">
              {formatAudioTime(displayedTime)}
              <span className="mx-1 text-[var(--apple-label-tertiary)]">/</span>
              {formatAudioTime(timeline.totalDurationSec)}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleNarrationMute}
                aria-pressed={narrationMuted}
                aria-label={
                  narrationMuted
                    ? 'Unmute narration audio'
                    : 'Mute narration audio'
                }
                title={
                  narrationMuted
                    ? 'Narration muted (independent of UI sounds)'
                    : 'Mute narration audio (independent of UI sounds)'
                }
                className="apple-btn-icon h-11 w-11 bg-[var(--apple-control-tonal)] text-[var(--apple-label-primary)] hover:bg-[var(--apple-control-tonal-hover)] sm:h-8 sm:w-8"
              >
                <AnimatedMuteIcon
                  muted={isAudioMutedOrZero}
                  size={15}
                  strokeWidth={1.85}
                  className={
                    isAudioMutedOrZero
                      ? 'text-[var(--apple-label-tertiary)]'
                      : 'text-[var(--apple-label-primary)]'
                  }
                />
              </button>

              <label className="sr-only" htmlFor={`${dockId}-volume`}>
                Narration volume
              </label>
              <input
                id={`${dockId}-volume`}
                type="range"
                min={0}
                max={100}
                step={5}
                value={narrationMuted ? 0 : Math.round(narrationVolume * 100)}
                onChange={(e) => handleVolumeChange(Number(e.target.value) / 100)}
                aria-label="Narration volume"
                className="hidden h-1.5 w-20 cursor-pointer accent-[var(--apple-blue)] sm:block"
              />

              <button
                type="button"
                onClick={handleCycleRate}
                aria-label={`Playback speed ${rate}x. Click to change speed`}
                className="type-caption inline-flex h-11 w-[54px] shrink-0 items-center justify-center rounded-full bg-[var(--apple-control-tonal)] px-0 tabular-nums text-[var(--apple-label-primary)] transition-colors duration-150 hover:bg-[var(--apple-control-tonal-hover)] active:scale-[0.96] sm:h-8 sm:w-[52px]"
              >
                {rate}×
              </button>
            </div>
          </div>
        </div>

        {/* Visual Waveform Generator + Draggable iOS Scrub Rail with Chapter Detents */}
        <div className="mt-4">
          <AudioWaveform
            profile={waveformProfile}
            progressRatio={progressRatio}
            isPlaying={isPlaying}
            isSpeaking={isSpeakingChunk || (!speechDrivenRef.current && isPlaying)}
            muted={isAudioMutedOrZero}
            volume={narrationVolume}
            rate={rate}
            speechPulseTick={speechPulseTick}
            onSeekRatio={(ratio) => {
              playTick();
              commitSeek(ratio * timeline.totalDurationSec, true);
            }}
          />

          <div className="mt-1.5">
            <DraggableAudioScrubber
              timeline={timeline}
              currentTime={displayedTime}
              progressRatio={progressRatio}
              isDragging={isDragging}
              onDragStart={() => {
                setIsDragging(true);
                playTick();
              }}
              onDragPreview={handleDragPreview}
              onDragEnd={(finalSec) => {
                setIsDragging(false);
                setDragPreviewTime(null);
                commitSeek(finalSec, true);
              }}
              onKeyboardSeek={(nextSec) => {
                playTick();
                commitSeek(nextSec, true);
              }}
            />
          </div>

          {/* Secondary Row: Voice Selection, Voice Tuning Popover & Jump Back to Speaker */}
          <div className="mt-2.5 flex flex-wrap items-center justify-end gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {isPlaying && speakerSectionOutOfView && activePosition && (
                <button
                  type="button"
                  onClick={handleJumpBackToSpeaker}
                  className="type-caption inline-flex min-h-[32px] items-center gap-1.5 rounded-full bg-[var(--apple-blue)]/10 px-3 py-1 font-medium text-[var(--apple-link)] transition-colors hover:bg-[var(--apple-blue)]/15"
                >
                  <AudioLines size={12} strokeWidth={2} aria-hidden="true" />
                  <span>Jump back to speaker</span>
                </button>
              )}

              {rankedVoices.length > 0 && (
                <div className="relative inline-flex items-center">
                  <label className="sr-only" htmlFor={`${dockId}-voice`}>
                    Narration voice
                  </label>
                  <select
                    id={`${dockId}-voice`}
                    value={
                      rankedVoices.some((r) => r.voice.voiceURI === selectedVoiceUri)
                        ? selectedVoiceUri
                        : ''
                    }
                    onChange={(e) => handleVoiceChange(e.target.value)}
                    aria-label="Select narration voice"
                    className="h-8 max-w-[225px] appearance-none rounded-full bg-[var(--apple-control-tonal)] pl-3 pr-7 text-[11.5px] font-medium text-[var(--apple-label-secondary)] transition-colors hover:bg-[var(--apple-control-tonal-hover)] hover:text-[var(--apple-label-primary)]"
                  >
                    <option value="">
                      Auto · {rankedVoices[0].displayLabel}
                    </option>
                    {rankedVoices.map(({ voice, displayLabel }) => (
                      <option key={voice.voiceURI} value={voice.voiceURI}>
                        {displayLabel} ({voice.lang})
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={12}
                    strokeWidth={2}
                    aria-hidden="true"
                    className="pointer-events-none absolute right-2.5 text-[var(--apple-label-tertiary)]"
                  />
                </div>
              )}

              {/* Apple HIG Voice Tuning Popover (Rate, Pitch & Volume) */}
              <div ref={tuningContainerRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    playTick();
                    setTuningOpen((prev) => !prev);
                  }}
                  aria-expanded={tuningOpen}
                  aria-haspopup="dialog"
                  aria-label="Adjust voice rate, pitch, and volume"
                  className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[11.5px] font-medium transition-colors ${
                    tuningOpen
                      ? 'bg-[var(--apple-blue)]/12 text-[var(--apple-link)]'
                      : 'bg-[var(--apple-control-tonal)] text-[var(--apple-label-secondary)] hover:bg-[var(--apple-control-tonal-hover)] hover:text-[var(--apple-label-primary)]'
                  }`}
                >
                  <SlidersHorizontal size={12} strokeWidth={2} aria-hidden="true" />
                  <span>Voice Tuning</span>
                </button>

                <AnimatePresence>
                  {tuningOpen && (
                    <motion.div
                      role="dialog"
                      aria-label="Voice cadence and acoustic tuning"
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.2, ease: EASE_APPLE }}
                      className="apple-ios-bar absolute right-0 z-30 mt-2 w-[288px] rounded-[20px] p-4 shadow-[0_18px_40px_-14px_rgba(0,0,0,0.28)] sm:w-[304px]"
                    >
                      <div className="flex items-start justify-between gap-2 border-b border-[var(--apple-separator-subtle)] pb-3">
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold tracking-[-0.012em] text-[var(--apple-label-primary)]">
                            Voice Tuning
                          </p>
                          <p className="mt-0.5 truncate text-[11.5px] text-[var(--apple-label-tertiary)]">
                            {activeRankedVoice
                              ? `${formatProviderLabel(activeRankedVoice.provider)} · ${activeRankedVoice.displayLabel}`
                              : 'Browser Web Speech'}
                          </p>
                        </div>
                        {!isDefaultTuning && (
                          <button
                            type="button"
                            onClick={handleResetTuning}
                            className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium text-[var(--apple-link)] transition-colors hover:bg-[var(--apple-blue)]/10"
                          >
                            <RotateCcw size={12} strokeWidth={2} aria-hidden="true" />
                            <span>Reset</span>
                          </button>
                        )}
                      </div>

                      {/* Speed Selector */}
                      <div className="mt-3.5">
                        <div className="flex items-center justify-between text-[11.5px]">
                          <span className="font-medium text-[var(--apple-label-secondary)]">
                            Cadence Speed
                          </span>
                          <span className="tabular-nums font-semibold text-[var(--apple-label-primary)]">
                            {rate}×
                          </span>
                        </div>
                        <div
                          role="group"
                          aria-label="Playback speed"
                          className="mt-2 grid grid-cols-4 gap-1 rounded-[12px] bg-[var(--apple-control-tonal)] p-1"
                        >
                          {PLAYBACK_RATES.map((r, idx) => {
                            const selected = idx === rateIndex;
                            return (
                              <button
                                key={r}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => {
                                  playTick();
                                  applyRateIndex(idx);
                                }}
                                className={`h-7 rounded-[9px] text-[11.5px] font-medium tabular-nums transition-all ${
                                  selected
                                    ? 'apple-pill-shadow bg-[var(--apple-control-thumb)] text-[var(--apple-label-primary)]'
                                    : 'text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                                }`}
                              >
                                {r}×
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Pitch Adjustment */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-[11.5px]">
                          <label
                            htmlFor={`${dockId}-pitch`}
                            className="font-medium text-[var(--apple-label-secondary)]"
                          >
                            Vocal Pitch
                          </label>
                          <span className="tabular-nums font-semibold text-[var(--apple-label-primary)]">
                            {narrationPitch.toFixed(2)}
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-3 gap-1">
                          {PITCH_PRESETS.map((preset) => {
                            const active = Math.abs(narrationPitch - preset.value) < 0.015;
                            return (
                              <button
                                key={preset.label}
                                type="button"
                                aria-pressed={active}
                                onClick={() => {
                                  playTick();
                                  handlePitchChange(preset.value);
                                }}
                                className={`h-7 rounded-full text-[11px] font-medium transition-colors ${
                                  active
                                    ? 'bg-[var(--apple-blue)]/14 text-[var(--apple-link)]'
                                    : 'bg-[var(--apple-control-tonal)] text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                                }`}
                              >
                                {preset.label}
                              </button>
                            );
                          })}
                        </div>
                        <input
                          id={`${dockId}-pitch`}
                          type="range"
                          min={0.85}
                          max={1.15}
                          step={0.01}
                          value={narrationPitch}
                          onChange={(e) => handlePitchChange(Number(e.target.value))}
                          aria-label="Vocal pitch"
                          className="mt-2.5 h-1.5 w-full cursor-pointer accent-[var(--apple-blue)]"
                        />
                      </div>

                      {/* Volume Slider */}
                      <div className="mt-3.5">
                        <div className="flex items-center justify-between text-[11.5px]">
                          <label
                            htmlFor={`${dockId}-popover-volume`}
                            className="font-medium text-[var(--apple-label-secondary)]"
                          >
                            Narration Volume
                          </label>
                          <span className="tabular-nums font-semibold text-[var(--apple-label-primary)]">
                            {narrationMuted ? 'Muted' : `${Math.round(narrationVolume * 100)}%`}
                          </span>
                        </div>
                        <input
                          id={`${dockId}-popover-volume`}
                          type="range"
                          min={0}
                          max={100}
                          step={5}
                          value={narrationMuted ? 0 : Math.round(narrationVolume * 100)}
                          onChange={(e) => handleVolumeChange(Number(e.target.value) / 100)}
                          aria-label="Narration volume level"
                          className="mt-2 h-1.5 w-full cursor-pointer accent-[var(--apple-blue)]"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Apple iOS Now Playing Dock */}
      <AnimatePresence>
        {shouldRenderFloating && (
          <motion.aside
            aria-label="Floating read aloud controls"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.34, ease: EASE_APPLE }}
            className={`fixed left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-[680px] -translate-x-1/2 transition-[bottom] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] print:hidden ${floatingBottomClass}`}
          >
            <div className="apple-ios-bar rounded-[20px] px-4 py-3 sm:px-5 sm:py-3.5">
              {/* Jump Back to Speaker strip when user scrolls away from active chapter */}
              {isPlaying && speakerSectionOutOfView && activePosition && (
                <div className="mb-2 flex items-center justify-between gap-2 border-b border-[var(--apple-separator-subtle)] pb-2">
                  <span className="type-caption flex items-center gap-2 truncate font-normal text-[var(--apple-label-secondary)]">
                    <MiniAudioEqualizer active={isPlaying} muted={isAudioMutedOrZero} />
                    <span className="truncate">
                      Narrating{' '}
                      <strong className="font-semibold text-[var(--apple-label-primary)]">
                        {activePosition.segment.num} · {activePosition.segment.title}
                      </strong>
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={handleJumpBackToSpeaker}
                    className="type-caption shrink-0 font-medium text-[var(--apple-link)] hover:underline"
                  >
                    Jump back to speaker
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2.5 sm:gap-3.5">
                {/* Transport */}
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleSkip(-15)}
                    aria-label="Skip back 15 seconds"
                    className="apple-btn-icon h-11 w-11 text-[var(--apple-label-primary)] sm:h-9 sm:w-9"
                  >
                    <SkipBack15Icon size={19} />
                  </button>

                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    aria-label={isPlaying ? 'Pause read aloud' : 'Resume read aloud'}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--apple-blue-fill)] text-white transition-all hover:bg-[var(--apple-blue-hover)] active:scale-95 sm:h-10 sm:w-10"
                  >
                    {isPlaying ? (
                      <Pause size={16} fill="currentColor" strokeWidth={1.75} aria-hidden="true" />
                    ) : (
                      <Play size={16} fill="currentColor" strokeWidth={1.75} aria-hidden="true" className="translate-x-[1px]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSkip(15)}
                    aria-label="Skip forward 15 seconds"
                    className="apple-btn-icon h-11 w-11 text-[var(--apple-label-primary)] sm:h-9 sm:w-9"
                  >
                    <SkipForward15Icon size={19} />
                  </button>
                </div>

                {/* Scrubber + Chapter Label + Live Equalizer */}
                <div className="min-w-0 flex-1">
                  <div className="type-caption flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2 font-semibold text-[var(--apple-label-primary)]">
                      {isPlaying && (
                        <MiniAudioEqualizer
                          active={isPlaying}
                          muted={isAudioMutedOrZero}
                          className="shrink-0"
                        />
                      )}
                      <span className="truncate">
                        {activePosition
                          ? `${activePosition.segment.num} · ${activePosition.segment.title}`
                          : title}
                      </span>
                    </span>
                    <span className="shrink-0 tabular-nums font-normal text-[var(--apple-label-secondary)]">
                      {formatAudioTime(displayedTime)} /{' '}
                      {formatAudioTime(timeline.totalDurationSec)}
                    </span>
                  </div>

                  <div className="mt-1">
                    <DraggableAudioScrubber
                      compact
                      timeline={timeline}
                      currentTime={displayedTime}
                      progressRatio={progressRatio}
                      isDragging={isDragging}
                      onDragStart={() => {
                        setIsDragging(true);
                        playTick();
                      }}
                      onDragPreview={handleDragPreview}
                      onDragEnd={(finalSec) => {
                        setIsDragging(false);
                        setDragPreviewTime(null);
                        commitSeek(finalSec, true);
                      }}
                      onKeyboardSeek={(nextSec) => {
                        playTick();
                        commitSeek(nextSec, true);
                      }}
                    />
                  </div>
                </div>

                {/* Independent Narration Mute + Speed + Dismiss */}
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={handleToggleNarrationMute}
                    aria-pressed={narrationMuted}
                    aria-label={
                      narrationMuted
                        ? 'Unmute narration audio'
                        : 'Mute narration audio'
                    }
                    className="apple-btn-icon h-11 w-11 text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)] sm:h-8 sm:w-8"
                  >
                    <AnimatedMuteIcon
                      muted={isAudioMutedOrZero}
                      size={15}
                      strokeWidth={1.85}
                      className={
                        isAudioMutedOrZero
                          ? 'text-[var(--apple-label-tertiary)]'
                          : 'text-[var(--apple-label-primary)]'
                      }
                    />
                  </button>
                  <button
                    type="button"
                    onClick={handleCycleRate}
                    aria-label={`Playback speed ${rate}x`}
                    className="type-caption hidden h-8 w-[48px] shrink-0 items-center justify-center rounded-full bg-[var(--apple-control-tonal)] px-0 tabular-nums text-[var(--apple-label-primary)] transition-colors hover:bg-[var(--apple-control-tonal-hover)] active:scale-95 sm:inline-flex"
                  >
                    {rate}×
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      stopSpeech();
                      setIsPlaying(false);
                      setFloatingDismissed(true);
                      onActiveSectionChange?.(null);
                      playPauseTone();
                    }}
                    aria-label="Close floating audio player"
                    className="apple-btn-icon h-11 w-11 text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)] sm:h-8 sm:w-8"
                  >
                    <X size={14} strokeWidth={1.75} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

interface DraggableAudioScrubberProps {
  timeline: ReturnType<typeof buildNarrationTimeline>;
  currentTime: number;
  progressRatio: number;
  isDragging: boolean;
  compact?: boolean;
  segmented?: boolean;
  onDragStart: () => void;
  onDragPreview: (timeSec: number) => void;
  onDragEnd: (timeSec: number) => void;
  onKeyboardSeek: (timeSec: number) => void;
}

function DraggableAudioScrubber({
  timeline,
  currentTime,
  progressRatio,
  isDragging,
  compact = false,
  segmented = false,
  onDragStart,
  onDragPreview,
  onDragEnd,
  onKeyboardSeek,
}: DraggableAudioScrubberProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [hoveredTime, setHoveredTime] = useState<number | null>(null);

  const pointerToTime = useCallback(
    (clientX: number) => {
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect || rect.width <= 0) return 0;
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      return ratio * timeline.totalDurationSec;
    },
    [timeline.totalDurationSec],
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    onDragStart();
    const nextSec = pointerToTime(event.clientX);
    onDragPreview(nextSec);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const nextSec = pointerToTime(event.clientX);
    if (isDragging) {
      onDragPreview(nextSec);
    } else {
      setHoveredTime(nextSec);
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const finalSec = pointerToTime(event.clientX);
    onDragEnd(finalSec);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      onKeyboardSeek(skipAudioTime(currentTime, 15, timeline.totalDurationSec));
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      onKeyboardSeek(skipAudioTime(currentTime, -15, timeline.totalDurationSec));
    } else if (event.key === 'Home') {
      event.preventDefault();
      onKeyboardSeek(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      onKeyboardSeek(timeline.totalDurationSec);
    }
  };

  const tooltipTime = isDragging ? currentTime : hoveredTime;
  const tooltipPosition =
    tooltipTime !== null ? resolvePositionAtTime(timeline, tooltipTime) : null;
  const tooltipRatio =
    tooltipTime !== null && timeline.totalDurationSec > 0
      ? Math.min(1, Math.max(0, tooltipTime / timeline.totalDurationSec))
      : progressRatio;

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label="Audio scrub timeline"
      aria-valuemin={0}
      aria-valuemax={Math.round(timeline.totalDurationSec)}
      aria-valuenow={Math.round(currentTime)}
      aria-valuetext={
        tooltipPosition
          ? `${tooltipPosition.segment.title}, ${formatAudioTime(currentTime)}`
          : formatAudioTime(currentTime)
      }
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => setHoveredTime(null)}
      onKeyDown={handleKeyDown}
      className={`group relative flex touch-none select-none cursor-pointer items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--apple-blue)] ${
        compact ? 'h-8 sm:h-5' : 'h-11 sm:h-7'
      }`}
    >
      {/* Floating Apple Scrub Popover on Hover / Drag */}
      {tooltipPosition && (isDragging || hoveredTime !== null) && (
        <div
          style={{
            left: `${Math.min(92, Math.max(8, tooltipRatio * 100))}%`,
          }}
          className="apple-pill-shadow pointer-events-none absolute -top-9 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--apple-label-primary)] px-3 py-1 text-[11.5px] font-medium tracking-[-0.01em] text-[var(--apple-bg)]"
        >
          <span>
            {tooltipPosition.segment.num} · {tooltipPosition.segment.title}
          </span>
          <span className="ml-1.5 tabular-nums opacity-70">
            {formatAudioTime(tooltipTime ?? currentTime)}
          </span>
        </div>
      )}

      {/* Rail Track: Segmented chapter boundaries or continuous detent track */}
      {segmented ? (
        <div className="relative flex w-full items-center gap-[3px]">
          {timeline.segments.map((seg) => {
            const segDuration = Math.max(0.01, seg.endSec - seg.startSec);
            const segWeight =
              timeline.totalDurationSec > 0
                ? Math.max(0.04, segDuration / timeline.totalDurationSec)
                : 1;
            const fillPct =
              currentTime >= seg.endSec
                ? 100
                : currentTime <= seg.startSec
                  ? 0
                  : ((currentTime - seg.startSec) / segDuration) * 100;

            return (
              <div
                key={seg.id}
                data-chapter-segment={seg.id}
                style={{ flexGrow: segWeight, flexBasis: 0 }}
                className={`relative overflow-hidden rounded-full bg-[#D5D7DC] transition-[height] duration-150 dark:bg-white/18 ${
                  isDragging
                    ? 'h-[6px]'
                    : 'h-[4px] group-hover:h-[5px]'
                }`}
              >
                <div
                  style={{ width: `${fillPct}%` }}
                  className="h-full rounded-full bg-[var(--apple-blue)]"
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className={`relative w-full overflow-hidden rounded-full bg-[var(--apple-separator)] transition-all duration-150 ${
            isDragging
              ? 'h-[7px]'
              : compact
                ? 'h-[4px] group-hover:h-[6px]'
                : 'h-[5px] group-hover:h-[7px]'
          }`}
        >
          {/* Elapsed Fill */}
          <div
            style={{ width: `${progressRatio * 100}%` }}
            className="h-full rounded-full bg-[var(--apple-blue)]"
          />

          {/* Chapter Detent Ticks */}
          {timeline.segments.slice(1).map((seg) => {
            const pct =
              timeline.totalDurationSec > 0
                ? (seg.startSec / timeline.totalDurationSec) * 100
                : 0;
            return (
              <span
                key={seg.id}
                aria-hidden="true"
                style={{ left: `${pct}%` }}
                className="absolute top-0 h-full w-[2px] -translate-x-1/2 bg-[var(--apple-surface-elevated)] opacity-85"
              />
            );
          })}
        </div>
      )}

      {/* Physical Circular Apple Scrubber Thumb */}
      <span
        aria-hidden="true"
        style={{ left: `${progressRatio * 100}%` }}
        className={`apple-pill-shadow pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--apple-separator-strong)] bg-[var(--apple-surface-elevated)] transition-transform duration-150 ${
          compact ? 'h-3.5 w-3.5' : 'h-4 w-4'
        } ${isDragging ? 'scale-125 ring-4 ring-[var(--apple-focus-ring)]' : 'group-hover:scale-110'}`}
      />
    </div>
  );
}

interface InlineVolumeSliderProps {
  volume: number;
  muted: boolean;
  onToggleMute: () => void;
  onVolumeChange: (nextVol: number) => void;
}

/**
 * Polished hover-expandable horizontal narration volume pill.
 * Uses CSS Grid column easing (0fr -> 1fr), opacity lead-out on collapse to
 * eliminate overflow flicker, a 140ms hover-out grace period, and pointer
 * capture so dragging outside the pill never snaps it closed mid-gesture.
 */
function InlineVolumeSlider({
  volume,
  muted,
  onToggleMute,
  onVolumeChange,
}: InlineVolumeSliderProps) {
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [isDraggingVol, setIsDraggingVol] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const effectiveVolume = muted ? 0 : Math.min(1, Math.max(0, volume));
  const pct = Math.round(effectiveVolume * 100);
  const isExpanded = hovered || focusWithin || isDraggingVol;

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setHovered(true);
  };

  const handleMouseLeave = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = window.setTimeout(() => {
      setHovered(false);
      closeTimerRef.current = null;
    }, 140);
  };

  const clientXToVolume = useCallback((clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return effectiveVolume;
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return Math.round(ratio * 20) / 20;
  }, [effectiveVolume]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDraggingVol(true);
    playTick();
    onVolumeChange(clientXToVolume(event.clientX));
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingVol) return;
    onVolumeChange(clientXToVolume(event.clientX));
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingVol) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    onVolumeChange(clientXToVolume(event.clientX));
    setIsDraggingVol(false);
  };

  const handleSliderKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      onVolumeChange(Math.min(1, effectiveVolume + 0.05));
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      onVolumeChange(Math.max(0, effectiveVolume - 0.05));
    } else if (event.key === 'Home') {
      event.preventDefault();
      onVolumeChange(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      onVolumeChange(1);
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={() => setFocusWithin(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setFocusWithin(false);
        }
      }}
      className="hidden h-9 items-center rounded-full bg-[var(--apple-control-tonal)] transition-colors duration-200 hover:bg-[var(--apple-control-tonal-hover)] sm:inline-flex sm:h-10"
    >
      <button
        type="button"
        onClick={() => {
          playTick();
          onToggleMute();
        }}
        aria-pressed={effectiveVolume === 0}
        aria-label={effectiveVolume === 0 ? 'Unmute narration' : 'Mute narration'}
        title={effectiveVolume === 0 ? 'Unmute narration' : `Narration volume ${pct}%`}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--apple-label-secondary)] transition-colors duration-150 hover:text-[var(--apple-label-primary)] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--apple-blue)] sm:h-10 sm:w-10"
      >
        <AnimatedMuteIcon
          muted={effectiveVolume === 0}
          size={17}
          strokeWidth={1.85}
          className={
            effectiveVolume === 0 ? 'text-[var(--apple-label-tertiary)]' : ''
          }
        />
      </button>

      <div
        className={`grid transition-[grid-template-columns] duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isExpanded ? 'grid-cols-[1fr]' : 'grid-cols-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div
            className={`flex items-center pl-2 pr-4 transition-opacity ${
              isExpanded
                ? 'opacity-100 duration-200 delay-75'
                : 'pointer-events-none opacity-0 duration-100 delay-0'
            }`}
          >
            <div
              ref={trackRef}
              role="slider"
              tabIndex={isExpanded ? 0 : -1}
              aria-label="Narration volume"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
              aria-valuetext={`${pct}%`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={() => setIsDraggingVol(false)}
              onKeyDown={handleSliderKeyDown}
              className="group relative flex h-7 w-[72px] cursor-pointer touch-none select-none items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--apple-blue)]"
            >
              <div
                className={`relative w-full overflow-hidden rounded-full bg-[var(--apple-separator-strong)]/45 transition-[height] duration-150 ${
                  isDraggingVol ? 'h-[5px]' : 'h-[4px] group-hover:h-[5px]'
                }`}
              >
                <div
                  style={{ width: `${pct}%` }}
                  className="h-full rounded-full bg-[var(--apple-blue)]"
                />
              </div>

              <span
                aria-hidden="true"
                style={{ left: `${pct}%` }}
                className={`apple-pill-shadow pointer-events-none absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--apple-separator-strong)] bg-[var(--apple-surface-elevated)] transition-transform duration-150 ${
                  isDraggingVol ? 'scale-125' : 'group-hover:scale-110'
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
