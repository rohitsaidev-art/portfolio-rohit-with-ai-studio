import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
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
import { AudioWaveform, MiniAudioEqualizer } from './AudioWaveform';
import {
  SFChevronDown,
  SFGoBackward15,
  SFGoForward15,
  SFHeadphones,
  SFPauseFill,
  SFPlayFill,
  SFReset,
  SFSliders,
  SFSpeakerSlash,
  SFSpeakerWave,
  SFWaveform,
  SFXmark,
} from './SFSymbols';

export interface AudioPlayerProps {
  title: string;
  segments: NarrationSegment[];
  onActiveSectionChange?: (sectionId: string | null) => void;
  onJumpToSection?: (sectionId: string) => void;
  onPlaybackChange?: (playing: boolean) => void;
  compactFloatingOffsetClass?: string;
  idleLabel?: string;
  helperText?: string;
  anchorId?: string;
}

const PLAYBACK_RATES = [0.85, 1, 1.25, 1.5, 2] as const;
const DEFAULT_RATE_INDEX = 1; // 1×
const PITCH_PRESETS = [
  { label: 'Calm', value: 0.92 },
  { label: 'Natural', value: DEFAULT_SPEECH_TUNING.pitch },
  { label: 'Bright', value: 1.06 },
] as const;

const LEGACY_VOICE_STORAGE_KEY = 'portfolio_narration_voice_uri';
const PREFS_STORAGE_KEY = 'portfolio_narration_voice_prefs';
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
  onActiveSectionChange,
  onJumpToSection,
  onPlaybackChange,
  compactFloatingOffsetClass,
  idleLabel = 'Listen to case study',
  helperText = 'Drag the timeline or tap the waveform to jump straight to that chapter.',
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
  const rate = PLAYBACK_RATES[rateIndex] ?? 1;

  const displayedTime = dragPreviewTime ?? currentTime;
  const activePosition = useMemo(
    () => resolvePositionAtTime(timeline, displayedTime),
    [timeline, displayedTime],
  );
  const activeSegmentId = isPlaying ? activePosition?.segment.id ?? null : null;

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
        const curated = rankSpeechVoices(list, 14);
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
          const fresh = rankSpeechVoices(window.speechSynthesis.getVoices(), 14);
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
    lastScrubSegmentIdRef.current = null;
    onActiveSectionChange?.(null);
    onPlaybackChange?.(false);
  }, [title, segmentSignature, stopSpeech, onActiveSectionChange, onPlaybackChange]);

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
  }, []);

  // Track whether the currently narrating section is scrolled out of view (P2.5 Jump Back to Speaker)
  useEffect(() => {
    if (!activeSegmentId || typeof IntersectionObserver === 'undefined') {
      setSpeakerSectionOutOfView(false);
      return;
    }

    const sectionEl = document.getElementById(activeSegmentId);
    if (!sectionEl) {
      setSpeakerSectionOutOfView(false);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setSpeakerSectionOutOfView(!entry.isIntersecting);
      },
      { threshold: 0.08, rootMargin: '-80px 0px -80px 0px' },
    );

    observer.observe(sectionEl);
    return () => observer.disconnect();
  }, [activeSegmentId]);

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
    onJumpToSection?.(activePosition.segment.id);
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

  const shouldRenderFloating =
    !floatingDismissed && (isPlaying || (showFloatingDock && inlineOutOfView));

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

  return (
    <>
      {/* Inline Apple News+ / Podcasts Editorial AudioPlayer */}
      <div
        id={anchorId}
        ref={inlineRef}
        aria-label={`Read aloud player for ${title}`}
        className="apple-surface-subtle mt-8 scroll-mt-[var(--scroll-offset-header)] rounded-[24px] px-5 py-4.5 sm:px-6 sm:py-5 print:hidden"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Transport Controls (Play/Pause + 15s Back / Forward) */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleTogglePlay}
              aria-label={isPlaying ? 'Pause read aloud' : 'Play read aloud'}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--apple-blue-fill)] text-white shadow-[0_4px_12px_-2px_rgba(0,113,227,0.42)] transition-all duration-200 hover:bg-[var(--apple-blue-hover)] active:scale-[0.95]"
            >
              {isPlaying ? (
                <SFPauseFill size={17} />
              ) : (
                <SFPlayFill size={17} className="translate-x-[1px]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSkip(-15)}
              aria-label="Skip back 15 seconds"
              title="Back 15 seconds (J)"
              className="apple-btn-icon h-11 w-11 shrink-0 text-[var(--apple-label-primary)] sm:h-10 sm:w-10"
            >
              <SFGoBackward15 size={22} />
            </button>

            <button
              type="button"
              onClick={() => handleSkip(15)}
              aria-label="Skip forward 15 seconds"
              title="Forward 15 seconds (K)"
              className="apple-btn-icon h-11 w-11 shrink-0 text-[var(--apple-label-primary)] sm:h-10 sm:w-10"
            >
              <SFGoForward15 size={22} />
            </button>

            <div className="ml-1.5 min-w-0">
              <div className="type-caption flex items-center gap-2 text-[var(--apple-link)]">
                {isPlaying ? (
                  <MiniAudioEqualizer active={isPlaying} muted={isAudioMutedOrZero} />
                ) : (
                  <SFHeadphones size={14} className="shrink-0" />
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
                {isAudioMutedOrZero ? (
                  <SFSpeakerSlash size={14} className="text-[var(--apple-label-tertiary)]" />
                ) : (
                  <SFSpeakerWave size={14} className="text-[var(--apple-label-primary)]" />
                )}
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
                className="type-caption inline-flex h-11 min-w-[48px] shrink-0 items-center justify-center rounded-full bg-[var(--apple-control-tonal)] px-3 tabular-nums text-[var(--apple-label-primary)] transition-all duration-150 hover:bg-[var(--apple-control-tonal-hover)] active:scale-[0.96] sm:h-8 sm:min-w-[46px]"
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

          {/* Secondary Row: Helper, Voice Selection, Voice Tuning Popover & Jump Back to Speaker */}
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="type-footnote font-normal text-[var(--apple-label-tertiary)]">
              {helperText}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {isPlaying && speakerSectionOutOfView && activePosition && (
                <button
                  type="button"
                  onClick={handleJumpBackToSpeaker}
                  className="type-caption inline-flex min-h-[32px] items-center gap-1.5 rounded-full bg-[var(--apple-blue)]/10 px-3 py-1 font-medium text-[var(--apple-link)] transition-colors hover:bg-[var(--apple-blue)]/15"
                >
                  <SFWaveform size={12} />
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
                  <SFChevronDown
                    size={11}
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
                  <SFSliders size={12} />
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
                            <SFReset size={11} />
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
                          className="mt-2 grid grid-cols-5 gap-1 rounded-[12px] bg-[var(--apple-control-tonal)] p-1"
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
            <div className="apple-ios-bar rounded-[24px] px-4 py-3 sm:px-5 sm:py-3.5">
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
                    <SFGoBackward15 size={20} />
                  </button>

                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    aria-label={isPlaying ? 'Pause read aloud' : 'Resume read aloud'}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--apple-blue-fill)] text-white shadow-[0_3px_10px_-2px_rgba(0,113,227,0.45)] transition-all hover:bg-[var(--apple-blue-hover)] active:scale-95 sm:h-10 sm:w-10"
                  >
                    {isPlaying ? (
                      <SFPauseFill size={16} />
                    ) : (
                      <SFPlayFill size={16} className="translate-x-[1px]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSkip(15)}
                    aria-label="Skip forward 15 seconds"
                    className="apple-btn-icon h-11 w-11 text-[var(--apple-label-primary)] sm:h-9 sm:w-9"
                  >
                    <SFGoForward15 size={20} />
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
                    {isAudioMutedOrZero ? (
                      <SFSpeakerSlash size={14} className="text-[var(--apple-label-tertiary)]" />
                    ) : (
                      <SFSpeakerWave size={14} className="text-[var(--apple-label-primary)]" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCycleRate}
                    aria-label={`Playback speed ${rate}x`}
                    className="type-caption hidden h-8 min-w-[40px] items-center justify-center rounded-full bg-[var(--apple-control-tonal)] px-2.5 tabular-nums text-[var(--apple-label-primary)] transition-all hover:bg-[var(--apple-control-tonal-hover)] active:scale-95 sm:inline-flex"
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
                    <SFXmark size={14} />
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
      className={`group relative flex touch-none select-none cursor-pointer items-center ${
        compact ? 'h-9 sm:h-6' : 'h-11 sm:h-7'
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

      {/* Rail Track */}
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

      {/* Physical Circular Apple Scrubber Thumb */}
      <span
        aria-hidden="true"
        style={{ left: `${progressRatio * 100}%` }}
        className={`apple-pill-shadow pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] transition-transform duration-150 ${
          compact ? 'h-3.5 w-3.5' : 'h-4 w-4'
        } ${isDragging ? 'scale-125 ring-4 ring-[var(--apple-focus-ring)]' : 'group-hover:scale-110'}`}
      />
    </div>
  );
}
