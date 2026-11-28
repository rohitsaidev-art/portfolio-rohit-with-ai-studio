/**
 * Zero-dependency Web Audio PCM WAV synthesizer for the CassettePlayer.
 * Generates genuine, warm analog lo-fi stereo WAV Blob URLs so <audio> playback,
 * ±15s skipping, scrubbing, playback speed, volume, and reel rewind work reliably
 * with zero external 404s.
 */

export interface CassetteTrackChapter {
  id: string;
  num: string;
  title: string;
  /** Normalized start position along the tape (0 to <1) */
  startRatio: number;
}

export interface CassetteDemoTrack {
  id: string;
  trackTitle: string;
  archiveLabel: string;
  sideLabel: string;
  catalogueNumber: string;
  durationSeconds: number;
  vibe: string;
  chordProgression: readonly (readonly number[])[];
  tempoBpm: number;
  warmth: number;
  chapters: readonly CassetteTrackChapter[];
}

export const STALLSYNC_CASSETTE_CHAPTERS: readonly CassetteTrackChapter[] = [
  { id: 'lib-seg-1', num: '01', title: 'Overview', startRatio: 0 },
  { id: 'lib-seg-2', num: '02', title: 'The Challenge', startRatio: 0.16 },
  { id: 'lib-seg-3', num: '03', title: 'Understanding', startRatio: 0.34 },
  { id: 'lib-seg-4', num: '04', title: 'Design Approach', startRatio: 0.52 },
  { id: 'lib-seg-5', num: '05', title: 'Exploration', startRatio: 0.72 },
  { id: 'lib-seg-6', num: '06', title: 'The Solution', startRatio: 0.86 },
] as const;

export const CASSETTE_DEMO_TRACKS: readonly CassetteDemoTrack[] = [
  {
    id: 'one-small-step',
    trackTitle: 'One Small Step',
    archiveLabel: 'Archive 11',
    sideLabel: 'Side A',
    catalogueNumber: '200769',
    durationSeconds: 60,
    vibe: 'Warm Rhodes & Apollo Tape Hiss',
    // Fmaj7 -> Em7 -> Dm9 -> Cmaj9
    chordProgression: [
      [174.61, 220.0, 261.63, 329.63],
      [164.81, 196.0, 246.94, 293.66],
      [146.83, 174.61, 220.0, 261.63, 329.63],
      [130.81, 196.0, 246.94, 293.66, 329.63],
    ],
    tempoBpm: 72,
    warmth: 0.72,
    chapters: [
      { id: 'step-01', num: '01', title: 'Tape Intro', startRatio: 0 },
      { id: 'step-02', num: '02', title: 'Tranquility Base', startRatio: 0.25 },
      { id: 'step-03', num: '03', title: 'Telemetry Drift', startRatio: 0.5 },
      { id: 'step-04', num: '04', title: 'Lunar Return', startRatio: 0.75 },
    ],
  },
  {
    id: 'midnight-studio',
    trackTitle: 'Midnight Studio',
    archiveLabel: 'Session 04',
    sideLabel: 'Side A',
    catalogueNumber: '084219',
    durationSeconds: 64,
    vibe: 'Lo-Fi Electric Piano & Flutter',
    // Am9 -> Fmaj7 -> Dm7 -> E7sus4
    chordProgression: [
      [110.0, 164.81, 196.0, 246.94, 261.63],
      [174.61, 220.0, 261.63, 329.63],
      [146.83, 220.0, 261.63, 349.23],
      [164.81, 220.0, 246.94, 293.66],
    ],
    tempoBpm: 68,
    warmth: 0.85,
    chapters: [
      { id: 'mid-01', num: '01', title: 'Warmup Loop', startRatio: 0 },
      { id: 'mid-02', num: '02', title: 'Tape Saturation', startRatio: 0.25 },
      { id: 'mid-03', num: '03', title: 'Late Sketch', startRatio: 0.5 },
      { id: 'mid-04', num: '04', title: 'Studio Out', startRatio: 0.75 },
    ],
  },
  {
    id: 'paper-and-ink',
    trackTitle: 'Paper & Ink',
    archiveLabel: 'Journal 09',
    sideLabel: 'Side B',
    catalogueNumber: '110426',
    durationSeconds: 56,
    vibe: 'Ambient Marimba & Tape Pad',
    // Cmaj7 -> G6 -> Am7 -> Fadd9
    chordProgression: [
      [261.63, 329.63, 392.0, 493.88],
      [196.0, 246.94, 293.66, 329.63],
      [220.0, 261.63, 329.63, 392.0],
      [174.61, 220.0, 261.63, 392.0],
    ],
    tempoBpm: 80,
    warmth: 0.62,
    chapters: [
      { id: 'ink-01', num: '01', title: 'Quiet Surface', startRatio: 0 },
      { id: 'ink-02', num: '02', title: 'Grid Cadence', startRatio: 0.25 },
      { id: 'ink-03', num: '03', title: 'Editorial Rhythm', startRatio: 0.5 },
      { id: 'ink-04', num: '04', title: 'Closing Note', startRatio: 0.75 },
    ],
  },
];

const cachedBlobUrls = new Map<string, string>();

function writeAscii(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

/**
 * Generates a deterministic warm analog stereo WAV Blob URL for a given demo track.
 * Loops the chord progression cleanly across longer durations (56s–64s) with subtle
 * harmonic phrasing so ±15s skipping and multi-chapter scrubbing feel rich and musical.
 */
export function getSynthesizedTrackUrl(track: CassetteDemoTrack): string {
  const existing = cachedBlobUrls.get(track.id);
  if (existing) return existing;

  const sampleRate = 22050;
  const numChannels = 2;
  const totalSamples = Math.floor(sampleRate * track.durationSeconds);
  const bytesPerSample = 2;
  const dataSize = totalSamples * numChannels * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF / WAVE PCM header
  writeAscii(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(view, 8, 'WAVE');
  writeAscii(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
  view.setUint16(32, numChannels * bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  const chords = track.chordProgression;
  const beatDuration = 60 / track.tempoBpm;
  const chordDuration = beatDuration * 4; // 1 bar per chord, cycling smoothly across the full tape

  // Deterministic pseudo-random generator for gentle analog tape hiss
  let seed = 1337 + track.id.length * 97;
  const nextNoise = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed / 2147483647) * 2 - 1;
  };

  let lpLeft = 0;
  let lpRight = 0;
  const lpAlpha = 0.22 + (1 - track.warmth) * 0.25;

  let offset = 44;
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const barIndex = Math.floor(t / chordDuration);
    const chordIdx = barIndex % chords.length;
    const phraseCycle = Math.floor(barIndex / chords.length);
    const localT = t - barIndex * chordDuration;
    const chord = chords[chordIdx];

    // Smooth chord envelope with gentle fade-in / fade-out at track boundaries
    const attack = Math.min(1, localT / 0.14);
    const release = Math.min(1, (chordDuration - localT) / 0.35);
    const trackFadeIn = Math.min(1, t / 0.35);
    const trackFadeOut = Math.min(1, (track.durationSeconds - t) / 0.8);
    const env = attack * release * trackFadeIn * trackFadeOut;

    // Subtle analog tape wow & flutter pitch modulation
    const wow = 1 + Math.sin(t * 2.1) * 0.0022 + Math.sin(t * 11.4) * 0.0006;

    // Gentle plucked Rhodes / arpeggio pulse on beats, shifting gently across phrases
    const beatIndex = Math.floor(t / beatDuration);
    const beatT = t - beatIndex * beatDuration;
    const pluckEnv = Math.exp(-beatT * 4.2);
    const arpNote = chord[(beatIndex + phraseCycle) % chord.length];
    const chimeOctave = phraseCycle % 2 === 1 ? 2 : 1;

    let sampleL = 0;
    let sampleR = 0;

    for (let n = 0; n < chord.length; n++) {
      const freq = chord[n] * wow;
      const detune = n % 2 === 0 ? 1.0015 : 0.9985;
      const fundamental = Math.sin(2 * Math.PI * freq * t);
      const harmonic2 =
        Math.sin(2 * Math.PI * freq * 2 * t) * 0.22 * Math.exp(-localT * 1.3);
      const harmonic3 =
        Math.sin(2 * Math.PI * freq * 3 * t) * 0.06 * Math.exp(-localT * 2.2);
      const voice = (fundamental + harmonic2 + harmonic3) / chord.length;
      const pan = 0.5 + ((n / Math.max(1, chord.length - 1)) - 0.5) * 0.45;
      sampleL += voice * (1 - pan) * 1.15;
      sampleR += voice * pan * 1.15 * Math.cos(0.01 * detune);
    }

    // Soft octave chime accent on beat
    const chime =
      Math.sin(2 * Math.PI * arpNote * 2 * chimeOctave * wow * t) *
      0.13 *
      pluckEnv;
    sampleL += chime * 0.85;
    sampleR += chime * 1.1;

    // Warm sub bass foundation
    const bassFreq = chord[0] * 0.5 * wow;
    const bass = Math.sin(2 * Math.PI * bassFreq * t) * 0.18;
    sampleL = (sampleL + bass) * env;
    sampleR = (sampleR + bass) * env;

    // Gentle analog tape hiss floor
    const hiss = nextNoise() * 0.011;
    lpLeft += lpAlpha * (sampleL + hiss - lpLeft);
    lpRight += lpAlpha * (sampleR + hiss * 0.9 - lpRight);

    // Soft analog saturation
    const outL = Math.tanh(lpLeft * 1.15) * 0.82;
    const outR = Math.tanh(lpRight * 1.15) * 0.82;

    view.setInt16(offset, Math.max(-1, Math.min(1, outL)) * 32767, true);
    view.setInt16(offset + 2, Math.max(-1, Math.min(1, outR)) * 32767, true);
    offset += 4;
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  const url = URL.createObjectURL(blob);
  cachedBlobUrls.set(track.id, url);
  return url;
}
