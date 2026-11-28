import { useEffect, useMemo, useRef, useState } from 'react';
import { prefersReducedMotion } from '../utils/scroll';

export interface AudioWaveformProps {
  /** Sculpted baseline resting bar amplitudes in [0.18, 0.92] */
  profile: readonly number[];
  /** Current normalized playback progress in [0, 1] */
  progressRatio: number;
  /** Whether playback session is active */
  isPlaying: boolean;
  /** Whether an utterance chunk is actively speaking (dips gently during breath pauses) */
  isSpeaking: boolean;
  /** Whether narration audio is muted */
  muted: boolean;
  /** Narration volume in [0, 1] */
  volume: number;
  /** Active playback speed multiplier */
  rate: number;
  /** Incremented on SpeechSynthesisUtterance onboundary events to inject natural word-cadence energy */
  speechPulseTick: number;
  /** Optional click-to-seek callback with normalized ratio [0, 1] */
  onSeekRatio?: (ratio: number) => void;
}

/**
 * Apple HIG Visual Waveform Generator (Voice Memos / Podcasts inspired).
 * - Renders sculpted pill bars tinted by elapsed playback progress.
 * - Animates via requestAnimationFrame when playing, modulated by real
 *   Web Speech word-boundary cadence pulses, volume, speed, and sentence breaths.
 * - Respects prefers-reduced-motion and cleans up animation frames cleanly.
 */
export function AudioWaveform({
  profile,
  progressRatio,
  isPlaying,
  isSpeaking,
  muted,
  volume,
  rate,
  speechPulseTick,
  onSeekRatio,
}: AudioWaveformProps) {
  const barCount = profile.length;
  const reduced = prefersReducedMotion();
  const [levels, setLevels] = useState<number[]>(() =>
    profile.map((v) => Math.max(0.16, v * 0.42)),
  );

  const energyRef = useRef(0);
  const pulseBoostRef = useRef(0);
  const phaseRef = useRef(0);
  const lastFrameRef = useRef<number | null>(null);
  const levelsRef = useRef<number[]>(levels);

  // Inject organic word-cadence pulse whenever SpeechSynthesis fires a word boundary
  useEffect(() => {
    if (speechPulseTick > 0 && isPlaying && !muted && volume > 0) {
      pulseBoostRef.current = Math.min(1, pulseBoostRef.current + 0.55);
    }
  }, [speechPulseTick, isPlaying, muted, volume]);

  // Keep resting profile synced if case study or reading depth changes
  useEffect(() => {
    if (!isPlaying || reduced) {
      const resting = profile.map((v) => Math.max(0.16, v * 0.44));
      levelsRef.current = resting;
      setLevels(resting);
    }
  }, [profile, isPlaying, reduced]);

  // Smooth requestAnimationFrame acoustic animation loop
  useEffect(() => {
    if (reduced) {
      return undefined;
    }

    if (!isPlaying) {
      // Settle gracefully back to sculpted resting profile on pause
      let rafId = 0;
      const settle = () => {
        let maxDelta = 0;
        const next = levelsRef.current.map((curr, idx) => {
          const target = Math.max(0.16, (profile[idx] ?? 0.35) * 0.44);
          const blended = curr + (target - curr) * 0.18;
          maxDelta = Math.max(maxDelta, Math.abs(target - blended));
          return blended;
        });
        levelsRef.current = next;
        setLevels(next);
        if (maxDelta > 0.008) {
          rafId = window.requestAnimationFrame(settle);
        }
      };
      rafId = window.requestAnimationFrame(settle);
      return () => window.cancelAnimationFrame(rafId);
    }

    let rafId = 0;
    lastFrameRef.current = null;

    const tick = (now: number) => {
      const dt =
        lastFrameRef.current === null
          ? 0.016
          : Math.min(0.05, (now - lastFrameRef.current) / 1000);
      lastFrameRef.current = now;

      const effectiveGain = muted ? 0.12 : Math.max(0.18, volume);
      const targetEnergy = isSpeaking ? effectiveGain : effectiveGain * 0.32;
      energyRef.current += (targetEnergy - energyRef.current) * Math.min(1, dt * 8);
      pulseBoostRef.current = Math.max(0, pulseBoostRef.current - dt * 2.6);
      phaseRef.current += dt * (4.4 * Math.min(1.65, Math.max(0.75, rate)));

      const phase = phaseRef.current;
      const energy = energyRef.current;
      const pulse = pulseBoostRef.current;
      const playheadIndex = progressRatio * Math.max(1, barCount - 1);

      const next = new Array<number>(barCount);
      for (let i = 0; i < barCount; i += 1) {
        const base = profile[i] ?? 0.4;
        // Bars near the active playhead respond with slightly livelier acoustic presence
        const dist = Math.abs(i - playheadIndex);
        const focusWindow = Math.exp(-(dist * dist) / 48);
        const harmonicA = 0.5 + 0.5 * Math.sin(phase * 1.35 + i * 0.52);
        const harmonicB = 0.5 + 0.5 * Math.cos(phase * 2.15 - i * 0.31);
        const modulation = 0.36 + harmonicA * 0.4 + harmonicB * 0.24;

        const target = Math.min(
          0.98,
          Math.max(
            0.14,
            base * (0.34 + energy * (0.46 + 0.38 * focusWindow) * modulation) +
              pulse * 0.18 * focusWindow * harmonicA,
          ),
        );

        const prev = levelsRef.current[i] ?? base * 0.44;
        next[i] = prev + (target - prev) * Math.min(1, dt * 14);
      }

      levelsRef.current = next;
      setLevels(next);
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(rafId);
      lastFrameRef.current = null;
    };
  }, [isPlaying, isSpeaking, muted, volume, rate, progressRatio, profile, barCount, reduced]);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeekRatio) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    onSeekRatio(ratio);
  };

  return (
    <div
      aria-hidden="true"
      onClick={handleClick}
      className={`flex h-9 w-full items-center justify-between gap-[3px] rounded-[12px] bg-[var(--apple-bg-secondary)]/70 px-3 py-1.5 transition-colors duration-200 ${
        onSeekRatio ? 'cursor-pointer hover:bg-[var(--apple-bg-secondary)]' : ''
      }`}
    >
      {levels.map((level, idx) => {
        const barPosition = barCount > 1 ? idx / (barCount - 1) : 0;
        const isElapsed = barPosition <= progressRatio;
        const heightPct = Math.round(Math.min(100, Math.max(16, level * 100)));
        return (
          <span
            key={idx}
            style={{ height: `${heightPct}%` }}
            className={`w-[2.5px] flex-1 max-w-[3.5px] rounded-full transition-colors duration-200 ${
              isElapsed
                ? isPlaying && !muted
                  ? 'bg-[var(--apple-blue)]'
                  : 'bg-[var(--apple-blue)]/75'
                : 'bg-[var(--apple-separator-strong)]/80'
            }`}
          />
        );
      })}
    </div>
  );
}

/**
 * Compact 4-bar Apple Music / Dynamic Island micro-equalizer for the floating
 * Now Playing dock and active chapter "Listening" indicator.
 */
export function MiniAudioEqualizer({
  active,
  muted = false,
  accentWhenIdle = false,
  className = '',
}: {
  active: boolean;
  muted?: boolean;
  accentWhenIdle?: boolean;
  className?: string;
}) {
  const reduced = prefersReducedMotion();
  const [heights, setHeights] = useState<readonly number[]>([34, 62, 46, 28]);
  const baseHeights = useMemo(() => [32, 64, 48, 30] as const, []);

  useEffect(() => {
    if (!active || muted || reduced) {
      setHeights(baseHeights);
      return undefined;
    }

    let rafId = 0;
    const start = performance.now();

    const animate = (now: number) => {
      const t = (now - start) / 1000;
      setHeights([
        Math.round(28 + 56 * (0.5 + 0.5 * Math.sin(t * 5.2 + 0.2))),
        Math.round(34 + 62 * (0.5 + 0.5 * Math.sin(t * 6.4 + 1.4))),
        Math.round(30 + 58 * (0.5 + 0.5 * Math.cos(t * 5.7 + 0.7))),
        Math.round(24 + 52 * (0.5 + 0.5 * Math.sin(t * 4.8 + 2.3))),
      ]);
      rafId = window.requestAnimationFrame(animate);
    };

    rafId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(rafId);
  }, [active, muted, reduced, baseHeights]);

  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-3.5 items-end gap-[2px] ${className}`}
    >
      {heights.map((h, i) => (
        <span
          key={i}
          style={{ height: `${h}%` }}
          className={`w-[2px] rounded-full transition-colors duration-200 ${
            (active || accentWhenIdle) && !muted
              ? 'bg-[var(--apple-blue)]'
              : 'bg-[var(--apple-label-tertiary)]'
          }`}
        />
      ))}
    </span>
  );
}
