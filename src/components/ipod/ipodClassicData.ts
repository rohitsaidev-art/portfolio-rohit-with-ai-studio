import {
  CASSETTE_DEMO_TRACKS,
  getSynthesizedTrackUrl,
} from "../../utils/cassetteSynthAudio";

export interface SyncedLyricLine {
  timeSec: number;
  text: string;
}

export interface IPodClassicTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  year: string;
  durationHintSec: number;
  /** Optional YouTube video ID for host/visitor YouTube tracks */
  youtubeId?: string;
  /** Original title/artist for lyric matching when published under an alternate title */
  lyricsTitle?: string;
  lyricsArtist?: string;
  /** Built-in local synthesized audio track index (0-2) for instant offline playback */
  synthTrackIndex: number;
  /** Palette used to generate crisp procedural album cover artwork */
  artPalette: readonly [string, string, string];
  artMotif: "rings" | "horizon" | "grid" | "prism" | "wave" | "monolith";
  lyrics: readonly SyncedLyricLine[];
  userAdded?: boolean;
}

export const IPOD_V2_STORAGE_KEY = "rohit-portfolio-ipod-v2-user-tracks";

export const HANDPICKED_IPOD_TRACKS: readonly IPodClassicTrack[] = [
  {
    id: "one-small-step",
    title: "One Small Step",
    artist: "Apollo Tape Archive",
    album: "Lunar Studies",
    year: "2024",
    durationHintSec: 60,
    synthTrackIndex: 0,
    artPalette: ["#192231", "#9C4A2B", "#F3E5D0"],
    artMotif: "rings",
    lyrics: [
      { timeSec: 0, text: "Tape reels turning in quiet telemetry" },
      { timeSec: 5, text: "Warm chord humming across the dark horizon" },
      { timeSec: 11, text: "Every calibrated mark set in brushed steel" },
      { timeSec: 17, text: "Hold the silence before the signal arrives" },
      { timeSec: 24, text: "One small step on silver dust and static" },
      { timeSec: 31, text: "Drift softly through the studio floodlights" },
      { timeSec: 38, text: "Analog echoes settling into low orbit" },
      { timeSec: 46, text: "Keep the dial steady till the fade returns" },
      { timeSec: 53, text: "End of side A · loop back to stillness" },
    ],
  },
  {
    id: "midnight-studio",
    title: "Midnight Studio",
    artist: "Koji & The Desk",
    album: "After Hours EP",
    year: "2025",
    durationHintSec: 64,
    synthTrackIndex: 1,
    artPalette: ["#0F172A", "#2563EB", "#BAE6FD"],
    artMotif: "horizon",
    lyrics: [
      { timeSec: 0, text: "Rain tracing lines on the north windowpane" },
      { timeSec: 6, text: "Electric keys breathing in half-time glow" },
      { timeSec: 13, text: "Coffee cooled beside the drafting notebook" },
      { timeSec: 20, text: "Blue backlight cutting through the late fog" },
      { timeSec: 28, text: "Gridlines soften when the city slows down" },
      { timeSec: 36, text: "Every detail tuned by ear and instinct" },
      { timeSec: 44, text: "Low bass pulse beneath the quiet ceiling" },
      { timeSec: 52, text: "Leave one lamp burning until first light" },
    ],
  },
  {
    id: "paper-and-ink",
    title: "Paper & Ink",
    artist: "Linen Press Quartet",
    album: "Editorial Notes",
    year: "2025",
    durationHintSec: 56,
    synthTrackIndex: 2,
    artPalette: ["#292524", "#D97706", "#FEF3C7"],
    artMotif: "grid",
    lyrics: [
      { timeSec: 0, text: "Dry needle touching pressed cotton stock" },
      { timeSec: 6, text: "Margins measured in calm eight-pixel beats" },
      { timeSec: 12, text: "Lead type setting in a steady cadence" },
      { timeSec: 19, text: "Warm amber light across the cutting mat" },
      { timeSec: 26, text: "Fold the proof sheet once, hold the crease" },
      { timeSec: 34, text: "Nothing ornamental, only what carries weight" },
      { timeSec: 42, text: "Ink dries cleanly as the refrain resolves" },
      { timeSec: 49, text: "Turn the page · side B begins quietly" },
    ],
  },
  {
    id: "chrome-bevel",
    title: "Chrome Bevel",
    artist: "Dieter & Friends",
    album: "Form Follows Sound",
    year: "2023",
    durationHintSec: 60,
    synthTrackIndex: 0,
    artPalette: ["#18181B", "#71717A", "#F4F4F5"],
    artMotif: "monolith",
    lyrics: [
      { timeSec: 0, text: "Milled aluminum catching afternoon light" },
      { timeSec: 7, text: "Click wheel ticking under a resting thumb" },
      { timeSec: 15, text: "Thirty-eight millimeters of honest craft" },
      { timeSec: 23, text: "No noise, no clutter, just glass and grain" },
      { timeSec: 32, text: "Reflections glide across the brushed chamfer" },
      { timeSec: 41, text: "Every curve earned through quiet restraint" },
      { timeSec: 50, text: "Still timeless two decades after launch" },
    ],
  },
  {
    id: "kyoto-rain-loop",
    title: "Kyoto Rain Loop",
    artist: "Mori Ensemble",
    album: "Botanical Tapes",
    year: "2024",
    durationHintSec: 64,
    synthTrackIndex: 1,
    artPalette: ["#143326", "#2E7D5B", "#DCFCE7"],
    artMotif: "wave",
    lyrics: [
      { timeSec: 0, text: "Cedar eaves dripping into stone basins" },
      { timeSec: 7, text: "Soft synth pads drifting over wet gravel" },
      { timeSec: 15, text: "Distant train humming past the bamboo ridge" },
      { timeSec: 23, text: "Pocket player warm inside a wool coat" },
      { timeSec: 32, text: "Every chord opens like steam from green tea" },
      { timeSec: 41, text: "Slow steps home beneath amber lanterns" },
      { timeSec: 51, text: "Let the loop carry the evening away" },
    ],
  },
  {
    id: "prism-drift",
    title: "Prism Drift",
    artist: "Optic Field",
    album: "Refraction IV",
    year: "2026",
    durationHintSec: 56,
    synthTrackIndex: 2,
    artPalette: ["#1E1B4B", "#EC4899", "#FDE68A"],
    artMotif: "prism",
    lyrics: [
      { timeSec: 0, text: "White beam splitting at the glass horizon" },
      { timeSec: 6, text: "Subtle dispersion painting the quiet wall" },
      { timeSec: 13, text: "Harmonics climbing through translucent air" },
      { timeSec: 21, text: "Tilt the lens and watch the spectrum shift" },
      { timeSec: 29, text: "Soft synth arpeggios locked to the pulse" },
      { timeSec: 38, text: "Every color settles back to pure white" },
      { timeSec: 47, text: "Fading gently into clean silence" },
    ],
  },
];

const artCache = new Map<string, string>();

/**
 * Generates a crisp zero-404 procedural SVG album cover Data URI for any track.
 */
export function getTrackCoverArtUri(track: IPodClassicTrack): string {
  const key = `${track.id}-${track.artMotif}-${track.artPalette.join("-")}`;
  const cached = artCache.get(key);
  if (cached) return cached;

  const [c1, c2, c3] = track.artPalette;
  let motifSvg = "";

  switch (track.artMotif) {
    case "rings":
      motifSvg = `
        <circle cx="120" cy="112" r="76" fill="none" stroke="${c3}" stroke-opacity="0.22" stroke-width="1.5"/>
        <circle cx="120" cy="112" r="54" fill="${c2}" fill-opacity="0.9"/>
        <circle cx="120" cy="112" r="24" fill="${c3}" fill-opacity="0.92"/>
        <circle cx="120" cy="112" r="8" fill="${c1}"/>
      `;
      break;
    case "horizon":
      motifSvg = `
        <rect x="0" y="138" width="240" height="102" fill="${c1}" fill-opacity="0.72"/>
        <circle cx="120" cy="138" r="56" fill="${c3}" fill-opacity="0.88"/>
        <rect x="24" y="152" width="192" height="3" rx="1.5" fill="${c3}" fill-opacity="0.45"/>
        <rect x="44" y="164" width="152" height="2" rx="1" fill="${c3}" fill-opacity="0.3"/>
      `;
      break;
    case "grid":
      motifSvg = `
        <rect x="36" y="36" width="76" height="76" rx="10" fill="${c2}"/>
        <rect x="126" y="36" width="78" height="76" rx="10" fill="${c3}" fill-opacity="0.88"/>
        <rect x="36" y="126" width="168" height="36" rx="8" fill="${c3}" fill-opacity="0.22"/>
        <circle cx="74" cy="74" r="18" fill="${c1}"/>
      `;
      break;
    case "monolith":
      motifSvg = `
        <rect x="74" y="34" width="92" height="148" rx="16" fill="url(#g2)" stroke="${c3}" stroke-opacity="0.45" stroke-width="2"/>
        <circle cx="120" cy="130" r="24" fill="${c1}" stroke="${c3}" stroke-opacity="0.6" stroke-width="2"/>
        <circle cx="120" cy="130" r="8" fill="${c3}"/>
      `;
      break;
    case "wave":
      motifSvg = `
        <path d="M0 128 Q60 72 120 124 T240 118 L240 240 L0 240 Z" fill="${c2}" fill-opacity="0.82"/>
        <path d="M0 156 Q60 112 120 154 T240 148 L240 240 L0 240 Z" fill="${c3}" fill-opacity="0.34"/>
        <circle cx="176" cy="64" r="22" fill="${c3}" fill-opacity="0.9"/>
      `;
      break;
    case "prism":
      motifSvg = `
        <polygon points="120,38 192,168 48,168" fill="none" stroke="${c3}" stroke-width="3"/>
        <polygon points="120,62 172,156 68,156" fill="${c2}" fill-opacity="0.72"/>
        <line x1="16" y1="126" x2="96" y2="112" stroke="${c3}" stroke-width="3" stroke-opacity="0.85"/>
        <line x1="146" y1="112" x2="226" y2="96" stroke="${c3}" stroke-width="3" stroke-opacity="0.85"/>
        <line x1="146" y1="116" x2="226" y2="122" stroke="${c2}" stroke-width="3.5"/>
      `;
      break;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient>
      <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${c3}" stop-opacity="0.92"/>
        <stop offset="100%" stop-color="${c2}" stop-opacity="0.45"/>
      </linearGradient>
    </defs>
    <rect width="240" height="240" fill="url(#bg)"/>
    ${motifSvg}
    <rect width="240" height="240" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="4"/>
  </svg>`;

  const uri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  artCache.set(key, uri);
  return uri;
}

export function getTrackAudioSrc(track: IPodClassicTrack): string {
  const safeIdx =
    ((track.synthTrackIndex % CASSETTE_DEMO_TRACKS.length) +
      CASSETTE_DEMO_TRACKS.length) %
    CASSETTE_DEMO_TRACKS.length;
  return getSynthesizedTrackUrl(CASSETTE_DEMO_TRACKS[safeIdx]);
}

export function extractYouTubeVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  const embedMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];
  return null;
}

export function loadUserIPodTracks(): IPodClassicTrack[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(IPOD_V2_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is IPodClassicTrack =>
        Boolean(item) &&
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        typeof item.artist === "string",
    );
  } catch {
    return [];
  }
}

export function saveUserIPodTracks(tracks: readonly IPodClassicTrack[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(IPOD_V2_STORAGE_KEY, JSON.stringify(tracks));
  } catch {
    // Ignore quota/private mode errors gracefully
  }
}
