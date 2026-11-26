/**
 * Subtle, Apple-calibrated Web Audio API UI sound synthesizer.
 *
 * Policy (Portfolio Refinement Master Roadmap Rev 2 — P0.2):
 * - UI interaction sounds are enabled by default (default = true).
 * - Globally reactive mute/unmute store persisted in localStorage.
 * - Plays ONLY on meaningful interactions (toggles, commits, confirmations,
 *   scrubber detents, prototype controls) — NEVER on ordinary navigation,
 *   scrolling, or pointer hover.
 * - Initializes AudioContext safely after the first user gesture to respect
 *   browser autoplay restrictions without errors.
 * - Strictly independent from AudioPlayer narration and video/audio media.
 */

const SOUND_STORAGE_KEY = 'portfolio_sound_enabled';

type SoundListener = () => void;

let audioCtx: AudioContext | null = null;
let soundEnabled = loadSoundPreference();
let hasUserGesture = false;
let gestureListenersBound = false;
const listeners = new Set<SoundListener>();

function loadSoundPreference(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = window.localStorage.getItem(SOUND_STORAGE_KEY);
    if (raw === 'false') return false;
    if (raw === 'true') return true;
  } catch {
    // Ignore storage restrictions
  }
  return true;
}

function notifyListeners(): void {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Isolate subscriber errors
    }
  });
}

function unlockOnFirstUserGesture(): void {
  hasUserGesture = true;
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {
      // Ignore browser autoplay restrictions
    });
  }
}

function ensureGestureListeners(): void {
  if (gestureListenersBound || typeof window === 'undefined') return;
  gestureListenersBound = true;

  const opts: AddEventListenerOptions = {
    once: true,
    capture: true,
    passive: true,
  };
  window.addEventListener('pointerdown', unlockOnFirstUserGesture, opts);
  window.addEventListener('keydown', unlockOnFirstUserGesture, opts);

  // Sync mute state across open browser tabs
  window.addEventListener('storage', (event: StorageEvent) => {
    if (event.key !== SOUND_STORAGE_KEY) return;
    const next = event.newValue !== 'false';
    if (next !== soundEnabled) {
      soundEnabled = next;
      notifyListeners();
    }
  });
}

if (typeof window !== 'undefined') {
  ensureGestureListeners();
}

function canInitializeAudioContext(): boolean {
  if (typeof window === 'undefined') return false;
  if (hasUserGesture) return true;
  const userActivation = (
    navigator as Navigator & {
      userActivation?: { hasBeenActive?: boolean; isActive?: boolean };
    }
  ).userActivation;
  if (userActivation?.hasBeenActive || userActivation?.isActive) {
    hasUserGesture = true;
    return true;
  }
  return false;
}

function getAudioContext(fromExplicitInteraction = false): AudioContext | null {
  if (!soundEnabled || typeof window === 'undefined') return null;

  if (fromExplicitInteraction) {
    hasUserGesture = true;
  }

  if (!canInitializeAudioContext()) {
    return null;
  }

  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctx) return null;

  if (!audioCtx) {
    try {
      audioCtx = new Ctx();
    } catch {
      return null;
    }
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {
      // Ignore autoplay blocks prior to user gesture
    });
  }

  return audioCtx;
}

/**
 * Returns whether UI interaction sound effects are enabled.
 * Does NOT control AudioPlayer narration or media/video audio.
 */
export function isSoundEnabled(): boolean {
  return soundEnabled;
}

/**
 * Subscribes to global UI sound preference changes.
 * Compatible with React's useSyncExternalStore.
 */
export function subscribeSoundPreference(listener: SoundListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Updates and persists the global UI sound preference, notifying all subscribers.
 */
export function setSoundEnabled(enabled: boolean): void {
  const changed = soundEnabled !== enabled;
  soundEnabled = enabled;

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(SOUND_STORAGE_KEY, String(enabled));
    } catch {
      // Ignore storage restrictions
    }
  }

  if (changed) {
    notifyListeners();
  }

  if (enabled) {
    hasUserGesture = true;
    playTick();
  }
}

export function toggleSoundEnabled(): boolean {
  const next = !soundEnabled;
  setSoundEnabled(next);
  return next;
}

/**
 * Test helper for resetting module state in deterministic unit tests.
 */
export function resetSoundStateForTest(initialEnabled = true): void {
  soundEnabled = initialEnabled;
  hasUserGesture = false;
  audioCtx = null;
  notifyListeners();
}

/**
 * Microscopic physical detent tick (segmented switches, scrubber detents, accordions).
 */
export function playTick(): void {
  const ctx = getAudioContext(true);
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(1650, now);
  osc.frequency.exponentialRampToValueAtTime(620, now + 0.016);

  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1400, now);
  filter.Q.setValueAtTime(1.4, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.032, now + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.022);
}

/**
 * Soft, damped iOS touch tap reserved for meaningful modal/prototype actions
 * (never ordinary navigation links, scrolling, or hover).
 */
export function playTap(): void {
  const ctx = getAudioContext(true);
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(540, now);
  osc.frequency.exponentialRampToValueAtTime(290, now + 0.028);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.038, now + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.034);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.04);
}

/**
 * Gentle ascending two-tone UI feedback when starting audio narration.
 */
export function playStartChime(): void {
  const ctx = getAudioContext(true);
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [523.25, 659.25]; // C5 -> E5

  notes.forEach((freq, idx) => {
    const start = now + idx * 0.055;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(0.036, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + 0.18);
  });
}

/**
 * Soft descending two-tone UI resolution when pausing playback.
 */
export function playPauseTone(): void {
  const ctx = getAudioContext(true);
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [493.88, 392.0]; // B4 -> G4

  notes.forEach((freq, idx) => {
    const start = now + idx * 0.048;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(0.032, start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.13);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + 0.15);
  });
}

/**
 * Tactile double-detent pulse for -15s rewind or +15s skip forward.
 */
export function playSkipTick(direction: 'back' | 'forward'): void {
  const ctx = getAudioContext(true);
  if (!ctx) return;

  const now = ctx.currentTime;
  const freqs = direction === 'forward' ? [680, 920] : [860, 620];

  freqs.forEach((freq, idx) => {
    const start = now + idx * 0.04;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, start);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.82, start + 0.025);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(0.03, start + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.032);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + 0.038);
  });
}

/**
 * Warm crystalline notification bell harmonic tailored for the animated Bell icon.
 */
export function playBellChime(): void {
  const ctx = getAudioContext(true);
  if (!ctx) return;

  const now = ctx.currentTime;
  const partials = [
    { freq: 880, peak: 0.042, decay: 0.55 },
    { freq: 1760, peak: 0.018, decay: 0.34 },
    { freq: 2637, peak: 0.009, decay: 0.22 },
  ];

  partials.forEach(({ freq, peak, decay }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + decay + 0.02);
  });
}

/**
 * Calm macOS-inspired confirmation chord for copy, apply, and submit actions.
 */
export function playSuccessChime(): void {
  const ctx = getAudioContext(true);
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

  notes.forEach((freq, idx) => {
    const start = now + idx * 0.045;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(0.03, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.24);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + 0.26);
  });
}
