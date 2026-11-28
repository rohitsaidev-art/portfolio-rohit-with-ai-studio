export interface NarrationSegment {
  id: string;
  num: string;
  title: string;
  text: string;
}

export interface TimedNarrationSegment extends NarrationSegment {
  wordCount: number;
  startSec: number;
  endSec: number;
  durationSec: number;
}

export interface NarrationTimeline {
  segments: TimedNarrationSegment[];
  totalDurationSec: number;
}

export interface ActiveNarrationPosition {
  segmentIndex: number;
  segment: TimedNarrationSegment;
  segmentProgress: number;
  charOffset: number;
  remainingText: string;
}

export interface SpeechVoiceDescriptor {
  name: string;
  lang: string;
  voiceURI: string;
  localService?: boolean;
  default?: boolean;
}

export type SpeechVoiceProvider = 'apple' | 'google' | 'neural' | 'system';

export interface RankedSpeechVoice<T extends SpeechVoiceDescriptor = SpeechVoiceDescriptor> {
  voice: T;
  score: number;
  tier: 'natural' | 'standard';
  provider: SpeechVoiceProvider;
  displayLabel: string;
}

export interface SpeechVoiceTuning {
  /** User-facing playback speed multiplier (0.75 – 2.0, default 1.0) */
  rate: number;
  /** Explicit vocal pitch adjustment (0.85 – 1.15, default 0.98 for grounded warmth) */
  pitch: number;
  /** Narration output gain (0.0 – 1.0, default 1.0) */
  volume: number;
}

export interface CalibratedSpeechParams {
  rate: number;
  pitch: number;
  volume: number;
  lang: string;
}

export const DEFAULT_SPEECH_TUNING: SpeechVoiceTuning = {
  rate: 1,
  pitch: 0.98,
  volume: 1,
};

const DEFAULT_WORDS_PER_MINUTE = 165;

/**
 * Novelty, joke, or heavily distorted legacy OS voices that degrade editorial
 * case-study narration and should never be auto-selected or clutter the picker.
 */
const EXCLUDED_VOICE_NAME_PATTERNS: readonly RegExp[] = [
  /\balbert\b/i,
  /\bbad news\b/i,
  /\bbahh\b/i,
  /\bbells\b/i,
  /\bboing\b/i,
  /\bbubbles\b/i,
  /\bcellos\b/i,
  /\bderanged\b/i,
  /\bgood news\b/i,
  /\bhysterical\b/i,
  /\bjester\b/i,
  /\borgan\b/i,
  /\bprincess\b/i,
  /\bsuperstar\b/i,
  /\btrinoids\b/i,
  /\bwhisper\b/i,
  /\bwobble\b/i,
  /\bzarvox\b/i,
  /\bfred\b/i,
  /\bjunior\b/i,
  /\bkathy\b/i,
  /\bralph\b/i,
  /\bgrandma\b/i,
  /\bgrandpa\b/i,
  /\beddy\b/i,
  /\bflo\b/i,
  /\breed\b/i,
  /\brocko\b/i,
  /\bsandy\b/i,
  /\bshelley\b/i,
  /\bespeak\b/i,
];

const APPLE_NEURAL_VOICE_PATTERNS: readonly RegExp[] = [
  /\bsiri\b/i,
  /com\.apple\.ttsbundle\.siri/i,
  /com\.apple\.voice\.premium/i,
  /com\.apple\.voice\.enhanced/i,
  /\(premium\)/i,
  /\(enhanced\)/i,
];

const APPLE_CORE_VOICE_NAMES: readonly RegExp[] = [
  /\bsamantha\b/i,
  /\bava\b/i,
  /\bzoe\b/i,
  /\ballison\b/i,
  /\bevan\b/i,
  /\bnoelle\b/i,
  /\bdaniel\b/i,
  /\bkaren\b/i,
  /\bmoira\b/i,
  /\btessa\b/i,
  /\bserena\b/i,
  /\bjamie\b/i,
  /\brishi\b/i,
  /\balex\b/i,
  /\baaron\b/i,
  /\bnicky\b/i,
  /\bmartha\b/i,
  /\barthur\b/i,
];

const GOOGLE_VOICE_PATTERNS: readonly RegExp[] = [
  /\bgoogle us english\b/i,
  /\bgoogle uk english\b/i,
  /\bgoogle\b/i,
];

const OTHER_NEURAL_PATTERNS: readonly RegExp[] = [
  /\bnatural\b/i,
  /\bneural\b/i,
  /\bwavenet\b/i,
  /\bstudio\b/i,
  /\bonline\b/i,
];

const CLEAR_SYSTEM_VOICES: readonly RegExp[] = [
  /\baria\b/i,
  /\bjenny\b/i,
  /\bguy\b/i,
  /\bryan\b/i,
  /\bsonia\b/i,
  /\bemma\b/i,
  /\bsteffan\b/i,
  /\bandrew\b/i,
  /\bchristopher\b/i,
  /\bzira\b/i,
  /\bmark\b/i,
  /\bdavid\b/i,
  /\bhazel\b/i,
  /\bgeorge\b/i,
];

/**
 * Known female Web Speech voice identifiers across macOS, iOS, Windows, Edge,
 * Chrome, and Android so male-only narration pickers exclude them reliably.
 */
const FEMALE_VOICE_PATTERNS: readonly RegExp[] = [
  /\bfemale\b/i,
  /\bwoman\b/i,
  /\bgirl\b/i,
  /\bgoogle us english\b/i,
  /\bsamantha\b/i,
  /\bvictoria\b/i,
  /\bkaren\b/i,
  /\bmoira\b/i,
  /\btessa\b/i,
  /\bfiona\b/i,
  /\bveena\b/i,
  /\bava\b/i,
  /\ballison\b/i,
  /\bsusan\b/i,
  /\bzoe\b/i,
  /\bnicky\b/i,
  /\bnoelle\b/i,
  /\bserena\b/i,
  /\bmartha\b/i,
  /\bkate\b/i,
  /\bstephanie\b/i,
  /\bmatilda\b/i,
  /\bisha\b/i,
  /\bsangeeta\b/i,
  /\bvicki\b/i,
  /\bagnes\b/i,
  /\baria\b/i,
  /\bjenny\b/i,
  /\bzira\b/i,
  /\bhazel\b/i,
  /\bsonia\b/i,
  /\blibby\b/i,
  /\bmaisie\b/i,
  /\bnatasha\b/i,
  /\bclara\b/i,
  /\bemily\b/i,
  /\bneerja\b/i,
  /\bmichelle\b/i,
  /\bana\b/i,
  /\bashley\b/i,
  /\bcora\b/i,
  /\belizabeth\b/i,
  /\bemma\b/i,
  /\bjane\b/i,
  /\bmonica\b/i,
  /\bnancy\b/i,
  /\bsara\b/i,
  /\bcatherine\b/i,
  /\blinda\b/i,
  /\bheera\b/i,
  /\beva\b/i,
  /\bmia\b/i,
  /\bleah\b/i,
  /\bluna\b/i,
  /\bmolly\b/i,
  /\brosa\b/i,
  /\bsiri\b.*\b(voice\s*[135])\b/i,
];

/**
 * Recognized male Web Speech voice names across Apple, Google, and Microsoft
 * speech engines.
 */
const MALE_VOICE_PATTERNS: readonly RegExp[] = [
  /\bmale\b/i,
  /\bdaniel\b/i,
  /\balex\b/i,
  /\barthur\b/i,
  /\baaron\b/i,
  /\bevan\b/i,
  /\boliver\b/i,
  /\bjamie\b/i,
  /\brishi\b/i,
  /\bgordon\b/i,
  /\blee\b/i,
  /\bmalcolm\b/i,
  /\bnathan\b/i,
  /\btom\b/i,
  /\bbruce\b/i,
  /\bmartin\b/i,
  /\bdavid\b/i,
  /\bmark\b/i,
  /\bgeorge\b/i,
  /\bguy\b/i,
  /\bryan\b/i,
  /\bandrew\b/i,
  /\bbrian\b/i,
  /\bchristopher\b/i,
  /\beric\b/i,
  /\broger\b/i,
  /\bsteffan\b/i,
  /\btony\b/i,
  /\bbrandon\b/i,
  /\bdavis\b/i,
  /\bjacob\b/i,
  /\bjason\b/i,
  /\bliam\b/i,
  /\bmitchell\b/i,
  /\bwilliam\b/i,
  /\bconnor\b/i,
  /\bprabhat\b/i,
  /\bsam\b/i,
  /\bluke\b/i,
  /\bjames\b/i,
  /\brichard\b/i,
  /\bsean\b/i,
  /\bravi\b/i,
  /\bsiri\b.*\b(voice\s*[24])\b/i,
];

export function isLikelyFemaleVoice(voice: SpeechVoiceDescriptor): boolean {
  const signature = `${voice.name} ${voice.voiceURI}`;
  if (/\bmale\b/i.test(signature) && !/\bfemale\b/i.test(signature)) {
    return false;
  }
  return FEMALE_VOICE_PATTERNS.some((pattern) => pattern.test(signature));
}

export function isLikelyMaleVoice(voice: SpeechVoiceDescriptor): boolean {
  const signature = `${voice.name} ${voice.voiceURI}`;
  if (isLikelyFemaleVoice(voice)) return false;
  return MALE_VOICE_PATTERNS.some((pattern) => pattern.test(signature));
}

export interface RankSpeechVoicesOptions {
  gender?: 'all' | 'male';
}

/**
 * Classifies a Web Speech voice into its provider family so Google and Apple
 * neural voices receive top priority and provider-tuned prosody.
 */
export function detectVoiceProvider(voice: SpeechVoiceDescriptor): SpeechVoiceProvider {
  const signature = `${voice.name} ${voice.voiceURI}`;
  if (GOOGLE_VOICE_PATTERNS.some((p) => p.test(signature))) {
    return 'google';
  }
  if (
    /com\.apple\./i.test(signature) ||
    APPLE_NEURAL_VOICE_PATTERNS.some((p) => p.test(signature)) ||
    APPLE_CORE_VOICE_NAMES.some((p) => p.test(voice.name))
  ) {
    return 'apple';
  }
  if (OTHER_NEURAL_PATTERNS.some((p) => p.test(signature))) {
    return 'neural';
  }
  return 'system';
}

/**
 * Computes explicit, artifact-free Web Speech API parameters (rate, pitch,
 * volume, lang) calibrated for the chosen voice family to eliminate rushed or
 * metallic robotic cadence.
 */
export function computeCalibratedSpeechParams(
  tuning: SpeechVoiceTuning,
  voice?: SpeechVoiceDescriptor | null,
): CalibratedSpeechParams {
  const provider = voice ? detectVoiceProvider(voice) : 'system';
  const clampedUserRate = Math.min(2.0, Math.max(0.75, Number.isFinite(tuning.rate) ? tuning.rate : 1));
  const clampedUserPitch = Math.min(1.15, Math.max(0.85, Number.isFinite(tuning.pitch) ? tuning.pitch : 0.98));
  const clampedVolume = Math.min(1, Math.max(0, Number.isFinite(tuning.volume) ? tuning.volume : 1));

  // Google & Apple neural voices stay natural near 0.97x baseline; generic OS voices benefit from 0.94x
  const cadenceFactor =
    provider === 'google' || provider === 'apple' || provider === 'neural'
      ? 0.97
      : 0.94;
  // Slightly ground pitch on generic system voices to soften harsh metallic formants
  const pitchOffset = provider === 'system' ? -0.02 : 0;

  return {
    rate: Number(Math.min(2.0, Math.max(0.6, clampedUserRate * cadenceFactor)).toFixed(2)),
    pitch: Number(Math.min(1.15, Math.max(0.85, clampedUserPitch + pitchOffset)).toFixed(2)),
    volume: Number(clampedVolume.toFixed(2)),
    lang: voice?.lang || 'en-US',
  };
}

/**
 * Normalizes editorial typography, abbreviations, and punctuation into clean
 * spoken prose so Web Speech engines breathe naturally instead of reading
 * symbols literally or smashing clauses together.
 */
export function prepareTextForSpeech(rawText: string): string {
  const cleaned = rawText
    .replace(/\r?\n+/g, '. ')
    // Replace typographic separators with gentle comma pauses
    .replace(/\s*[·•|]\s*/g, ', ')
    .replace(/\s*[—–]\s*/g, ', ')
    // Expand common design/product abbreviations & symbols cleanly
    .replace(/\bUI\s*\/\s*UX\b/gi, 'UI and UX')
    .replace(/\bUX\s*\/\s*UI\b/gi, 'UX and UI')
    .replace(/\bTL;DR\b/gi, 'Summary')
    .replace(/\be\.g\./gi, 'for example')
    .replace(/\bi\.e\./gi, 'that is')
    .replace(/\bvs\./gi, 'versus')
    .replace(/±\s*(\d+)\s*s\b/gi, 'plus or minus $1 seconds')
    .replace(/±/g, 'plus or minus ')
    .replace(/(\d+(?:\.\d+)?\s*[a-zA-Z]*)\s*×\s*(\d+(?:\.\d+)?\s*[a-zA-Z]*)/g, '$1 by $2')
    .replace(/\s+&\s+/g, ' and ')
    // Turn simple word/word slashes into spoken "or" (avoid breaking URLs)
    .replace(/\b([A-Za-z]{2,})\/([A-Za-z]{2,})\b/g, '$1 or $2')
    // Clean duplicate or awkward punctuation (e.g. "Title. Tagline..")
    .replace(/\.{2,}/g, '.')
    .replace(/([!?])\./g, '$1')
    .replace(/,\s*\./g, '.')
    .replace(/,\s*,+/g, ', ')
    .replace(/\s+([,.;!?])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (!cleaned) return '';
  return /[.!?]$/.test(cleaned) ? cleaned : `${cleaned}.`;
}

/**
 * Splits spoken text into short, sentence-aligned chunks (default <= 190 chars)
 * so Chromium/WebKit speech engines never hit their ~15-second silent-cutoff
 * bug and maintain natural cadence between sentences.
 */
export function splitIntoSpeechChunks(
  rawText: string,
  maxChars = 190,
): string[] {
  const normalized = prepareTextForSpeech(rawText);
  if (!normalized) return [];

  const safeMax = Math.max(80, maxChars);
  const sentences = normalized
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks: string[] = [];

  for (const sentence of sentences) {
    if (sentence.length <= safeMax) {
      chunks.push(sentence);
      continue;
    }

    // Break long sentences cleanly on clause boundaries first
    const clauses = sentence
      .split(/(?<=[,;:])\s+/)
      .map((c) => c.trim())
      .filter(Boolean);

    let buffer = '';
    for (const clause of clauses) {
      if (clause.length > safeMax) {
        if (buffer) {
          chunks.push(buffer);
          buffer = '';
        }
        // Final fallback: word-boundary split for unusually long clauses
        const words = clause.split(/\s+/);
        let wordBuf = '';
        for (const word of words) {
          const candidate = wordBuf ? `${wordBuf} ${word}` : word;
          if (candidate.length > safeMax && wordBuf) {
            chunks.push(wordBuf);
            wordBuf = word;
          } else {
            wordBuf = candidate;
          }
        }
        if (wordBuf) {
          chunks.push(wordBuf);
        }
        continue;
      }

      const candidate = buffer ? `${buffer} ${clause}` : clause;
      if (candidate.length > safeMax && buffer) {
        chunks.push(buffer);
        buffer = clause;
      } else {
        buffer = candidate;
      }
    }

    if (buffer) {
      chunks.push(buffer);
    }
  }

  return chunks;
}

/**
 * Filters out novelty/robotic OS voices and ranks available Web Speech voices
 * with explicit top priority for Google and Apple high-quality neural voices.
 */
export function rankSpeechVoices<T extends SpeechVoiceDescriptor>(
  voices: readonly T[],
  maxCount = 14,
  options?: RankSpeechVoicesOptions,
): RankedSpeechVoice<T>[] {
  if (!Array.isArray(voices) || voices.length === 0) {
    return [];
  }

  const seenUris = new Set<string>();
  const deduped: T[] = [];
  for (const voice of voices) {
    if (!voice || !voice.name || !voice.voiceURI) continue;
    if (seenUris.has(voice.voiceURI)) continue;
    seenUris.add(voice.voiceURI);
    deduped.push(voice);
  }

  const englishVoices = deduped.filter((v) =>
    (v.lang || '').toLowerCase().startsWith('en'),
  );
  const pool = englishVoices.length > 0 ? englishVoices : deduped;

  const withoutNovelty = pool.filter(
    (v) => !EXCLUDED_VOICE_NAME_PATTERNS.some((pattern) => pattern.test(v.name)),
  );
  let candidates = withoutNovelty.length > 0 ? withoutNovelty : pool;

  if (options?.gender === 'male') {
    const confirmedMale = candidates.filter((v) => isLikelyMaleVoice(v));
    if (confirmedMale.length > 0) {
      candidates = confirmedMale;
    } else {
      const nonFemale = candidates.filter((v) => !isLikelyFemaleVoice(v));
      candidates = nonFemale;
    }
    if (candidates.length === 0) {
      return [];
    }
  }

  const scored: RankedSpeechVoice<T>[] = candidates.map((voice) => {
    const name = voice.name;
    const signature = `${voice.name} ${voice.voiceURI}`;
    const lang = (voice.lang || '').toLowerCase();
    const provider = detectVoiceProvider(voice);

    let score = 20;
    let isNatural = false;

    // Tier 1: Apple Neural / Siri / Premium / Enhanced voices & Google Neural English voices
    if (provider === 'google') {
      isNatural = true;
      score += 170;
      if (/google us english/i.test(name)) {
        score += 24;
      } else if (/google uk english/i.test(name)) {
        score += 20;
      }
    } else if (provider === 'apple') {
      const isAppleNeural = APPLE_NEURAL_VOICE_PATTERNS.some((p) => p.test(signature));
      if (isAppleNeural) {
        isNatural = true;
        score += 180;
        if (/\bpremium\b/i.test(signature) || /\bsiri\b/i.test(signature)) {
          score += 18;
        }
      } else {
        // Standard modern Apple voice (e.g. Samantha, Daniel, Karen, Alex)
        score += 105;
      }
    } else if (provider === 'neural') {
      isNatural = true;
      score += 150;
      if (/microsoft.*online.*natural/i.test(name)) {
        score += 16;
      }
    } else if (CLEAR_SYSTEM_VOICES.some((p) => p.test(name))) {
      score += 60;
    }

    if (/\bcompact\b/i.test(signature)) {
      score -= 50;
    }

    if (lang === 'en-us') {
      score += 14;
    } else if (lang === 'en-gb') {
      score += 12;
    } else if (
      lang === 'en-in' ||
      lang === 'en-au' ||
      lang === 'en-ca' ||
      lang === 'en-ie'
    ) {
      score += 10;
    }

    if (voice.localService === false && isNatural) {
      score += 6;
    }

    const shortName = name
      .replace(/^Microsoft\s+/i, '')
      .replace(/\s+Online\s+\(Natural\)\s*-\s*English.*$/i, ' · Natural')
      .replace(/\s+-\s+English.*$/i, '')
      .trim();

    let displayLabel = shortName;
    if (provider === 'google' && !/neural|natural/i.test(shortName)) {
      displayLabel = `${shortName} · Neural`;
    } else if (provider === 'apple' && isNatural && !/premium|enhanced|siri/i.test(shortName)) {
      displayLabel = `${shortName} · Apple Neural`;
    } else if (isNatural && !/natural|enhanced|premium|google|siri/i.test(shortName)) {
      displayLabel = `${shortName} · Natural`;
    }

    return {
      voice,
      score,
      tier: isNatural ? 'natural' : 'standard',
      provider,
      displayLabel,
    };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.voice.name.localeCompare(b.voice.name, 'en');
  });

  return scored.slice(0, Math.max(1, maxCount));
}

/**
 * Generates a deterministic, symmetrically sculpted resting acoustic waveform
 * profile (values in [0.18, 0.92]) derived from real segment lengths so the
 * AudioPlayer waveform reflects the editorial rhythm of each case study.
 */
export function buildWaveformProfile(
  segments: readonly NarrationSegment[],
  barCount = 40,
): number[] {
  const safeCount = Math.max(8, Math.min(96, Math.round(barCount)));
  const combinedSeed = segments
    .map((s) => `${s.id}:${s.text.length}`)
    .join('|');

  let hash = 2166136261;
  for (let i = 0; i < combinedSeed.length; i += 1) {
    hash ^= combinedSeed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  const profile: number[] = [];
  for (let i = 0; i < safeCount; i += 1) {
    const t = i / (safeCount - 1);
    // Gentle Apple Voice Memos edge taper so ends feel refined rather than clipped
    const envelope = 0.52 + 0.48 * Math.sin(t * Math.PI);
    const waveA = 0.5 + 0.5 * Math.sin(i * 0.68 + ((hash >>> 0) % 17));
    const waveB = 0.5 + 0.5 * Math.cos(i * 1.42 + ((hash >>> 8) % 23));
    const raw = (0.24 + waveA * 0.42 + waveB * 0.28) * envelope;
    profile.push(Number(Math.min(0.92, Math.max(0.18, raw)).toFixed(3)));
  }

  return profile;
}

/**
 * Builds a deterministic audio timeline from prose segments so scrubber dragging,
 * ±15s seeking, and viewport section synchronization stay strictly aligned.
 */
export function buildNarrationTimeline(
  segments: readonly NarrationSegment[],
  wordsPerMinute = DEFAULT_WORDS_PER_MINUTE,
): NarrationTimeline {
  const safeWpm = Math.max(80, wordsPerMinute);
  let cursor = 0;

  const timed: TimedNarrationSegment[] = segments.map((segment) => {
    const words = segment.text
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
    const durationSec = Math.max(8, Math.round((words / safeWpm) * 60));
    const startSec = cursor;
    const endSec = cursor + durationSec;
    cursor = endSec;

    return {
      ...segment,
      wordCount: words,
      startSec,
      endSec,
      durationSec,
    };
  });

  return {
    segments: timed,
    totalDurationSec: cursor,
  };
}

/**
 * Clamps playback time cleanly within [0, totalDurationSec].
 */
export function clampAudioTime(timeSec: number, totalDurationSec: number): number {
  if (!Number.isFinite(timeSec) || totalDurationSec <= 0) {
    return 0;
  }
  return Math.min(Math.max(0, timeSec), totalDurationSec);
}

/**
 * Skips forward or backward by a fixed interval (e.g., -15s or +15s).
 */
export function skipAudioTime(
  currentSec: number,
  deltaSec: number,
  totalDurationSec: number,
): number {
  return clampAudioTime(currentSec + deltaSec, totalDurationSec);
}

/**
 * Maps any playback timestamp to its exact section and word-aligned character offset
 * for Web Speech API narration resumption and page scrolling.
 */
export function resolvePositionAtTime(
  timeline: NarrationTimeline,
  timeSec: number,
): ActiveNarrationPosition | null {
  if (timeline.segments.length === 0) {
    return null;
  }

  const clamped = clampAudioTime(timeSec, timeline.totalDurationSec);

  let segmentIndex = timeline.segments.findIndex(
    (seg) => clamped >= seg.startSec && clamped < seg.endSec,
  );

  if (segmentIndex === -1) {
    segmentIndex = timeline.segments.length - 1;
  }

  const segment = timeline.segments[segmentIndex];
  const elapsedInSegment = Math.max(0, clamped - segment.startSec);
  const segmentProgress =
    segment.durationSec > 0
      ? Math.min(1, elapsedInSegment / segment.durationSec)
      : 0;

  // Snap character offset to the nearest word boundary so speech starts cleanly.
  const rawIndex = Math.floor(segmentProgress * segment.text.length);
  let charOffset = 0;
  if (rawIndex > 0 && rawIndex < segment.text.length) {
    const nextSpace = segment.text.lastIndexOf(' ', rawIndex);
    charOffset = nextSpace > 0 ? nextSpace + 1 : 0;
  } else if (rawIndex >= segment.text.length) {
    charOffset = Math.max(0, segment.text.length - 1);
  }

  return {
    segmentIndex,
    segment,
    segmentProgress,
    charOffset,
    remainingText: segment.text.slice(charOffset).trim(),
  };
}

/**
 * Formats seconds into crisp Apple tabular m:ss playback timestamps.
 */
export function formatAudioTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
