/**
 * Private Design Workshop Store & Visual Approval Workflow (P1.2, P1.3, P1.4).
 *
 * Strictly isolated to /design-system local persistence.
 * Approving, rejecting, or adjusting any experimental treatment here NEVER
 * mutates production public portfolio CSS or tokens automatically.
 */

import type { ResolvedTheme } from './appearance';

export type VisualPaletteId = 'cool' | 'warm';

export type EffectTrackId =
  | 'organic-texture'
  | 'screen-edge-glow'
  | 'directional-gradient'
  | 'backdrop-blur'
  | 'subtle-parallax'
  | 'layered-shadows'
  | 'borders-hairlines';

export type DecisionStatus =
  | 'exploring'
  | 'approved'
  | 'rejected'
  | 'promoted';

export interface EffectVariantOption {
  id: string;
  label: string;
  description: string;
  defaults: {
    intensity: number;
    secondary: number;
  };
}

export interface EffectTrackDefinition {
  id: EffectTrackId;
  order: string;
  title: string;
  shortTitle: string;
  summary: string;
  baselineLabel: string;
  baselineNotes: string;
  primarySliderLabel: string;
  primaryUnit: string;
  primaryMin: number;
  primaryMax: number;
  primaryStep: number;
  secondarySliderLabel: string;
  secondaryUnit: string;
  secondaryMin: number;
  secondaryMax: number;
  secondaryStep: number;
  respectsReducedMotion?: boolean;
  variants: readonly EffectVariantOption[];
}

export interface EffectTrackConfig {
  enabled: boolean;
  variantId: string;
  intensity: number;
  secondary: number;
}

export interface DecisionLogEntry {
  id: string;
  subjectType: 'effect-track' | 'palette' | 'appearance' | 'toc' | 'experiment';
  subjectId: string;
  trackId?: EffectTrackId;
  experimentId?: string;
  title: string;
  variantLabel: string;
  status: DecisionStatus;
  parameters: Record<string, string | number | boolean>;
  paletteContext: VisualPaletteId;
  themeContext: ResolvedTheme;
  rationale: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkshopDecisionLogExport {
  schemaVersion: 1;
  exportedAt: string;
  note: string;
  entries: DecisionLogEntry[];
}

export const DECISION_LOG_STORAGE_KEY = 'portfolio_workshop_decision_log_v1';
export const EFFECTS_CONFIG_STORAGE_KEY = 'portfolio_workshop_effects_config_v1';
export const WORKSHOP_SANDBOX_STORAGE_KEY = 'portfolio_workshop_sandbox_prefs_v1';

export const EFFECT_TRACKS: readonly EffectTrackDefinition[] = [
  {
    id: 'organic-texture',
    order: '01',
    title: 'Organic Textures & Paper Grain',
    shortTitle: 'Paper Grain',
    summary:
      'Ultra-fine tactile noise overlays to soften clinical white surfaces without reducing body-copy legibility.',
    baselineLabel: 'Pure Flat Surface',
    baselineNotes: 'Zero procedural grain. Clean digital Apple.com neutrality.',
    primarySliderLabel: 'Grain Opacity',
    primaryUnit: '%',
    primaryMin: 0,
    primaryMax: 14,
    primaryStep: 1,
    secondarySliderLabel: 'Fiber Scale',
    secondaryUnit: 'px',
    secondaryMin: 120,
    secondaryMax: 320,
    secondaryStep: 10,
    variants: [
      {
        id: 'cotton-fine',
        label: 'Fine Cotton Rag',
        description: 'High-frequency archival paper grain that reads as print softness.',
        defaults: { intensity: 5, secondary: 180 },
      },
      {
        id: 'ceramic-matte',
        label: 'Matte Ceramic Speckle',
        description: 'Slightly tighter mineral texture reminiscent of bead-blasted aluminum.',
        defaults: { intensity: 4, secondary: 140 },
      },
      {
        id: 'warm-fiber',
        label: 'Editorial Fiber Veil',
        description: 'Soft low-contrast weave tuned for long-form case study bands.',
        defaults: { intensity: 6, secondary: 240 },
      },
    ],
  },
  {
    id: 'screen-edge-glow',
    order: '02',
    title: 'Screen-Edge Gradients & Perimeter Illumination',
    shortTitle: 'Perimeter Glow',
    summary:
      'Delicate perimeter falloff and top-edge studio lighting that frames content without feeling decorative.',
    baselineLabel: 'Uniform Edge Canvas',
    baselineNotes: 'Zero perimeter shading or ambient wash.',
    primarySliderLabel: 'Edge Intensity',
    primaryUnit: '%',
    primaryMin: 0,
    primaryMax: 24,
    primaryStep: 1,
    secondarySliderLabel: 'Spread Reach',
    secondaryUnit: '%',
    secondaryMin: 15,
    secondaryMax: 65,
    secondaryStep: 5,
    variants: [
      {
        id: 'top-specular',
        label: 'Top Studio Wash',
        description: 'Gentle overhead daylight gradient kissing the top viewport edge.',
        defaults: { intensity: 9, secondary: 40 },
      },
      {
        id: 'perimeter-frame',
        label: 'Quiet Perimeter Vignette',
        description: 'Micro-vignette around the outer border to pull focus toward center prose.',
        defaults: { intensity: 8, secondary: 30 },
      },
      {
        id: 'ambient-blue-rim',
        label: 'Cool Optical Rim',
        description: 'Sub-5% Apple Blue perimeter tint along the upper frame.',
        defaults: { intensity: 7, secondary: 35 },
      },
    ],
  },
  {
    id: 'directional-gradient',
    order: '03',
    title: 'Directional & Radial Gradients',
    shortTitle: 'Surface Gradients',
    summary:
      'Restrained tonal transitions on hero and showcase cards to suggest natural studio lighting direction.',
    baselineLabel: 'Solid Semantic Fill',
    baselineNotes: 'Flat single-value CSS token background with zero gradient stops.',
    primarySliderLabel: 'Contrast Depth',
    primaryUnit: '%',
    primaryMin: 0,
    primaryMax: 20,
    primaryStep: 1,
    secondarySliderLabel: 'Light Angle',
    secondaryUnit: '°',
    secondaryMin: 90,
    secondaryMax: 225,
    secondaryStep: 15,
    variants: [
      {
        id: 'architectural-linear',
        label: 'Directional Daylight',
        description: 'Subtle top-to-bottom luminance shift mirroring overhead gallery lighting.',
        defaults: { intensity: 7, secondary: 165 },
      },
      {
        id: 'radial-halo',
        label: 'Soft Radial Focus',
        description: 'Broad off-center radial lift behind flagship case study thumbnails.',
        defaults: { intensity: 8, secondary: 135 },
      },
      {
        id: 'horizon-wash',
        label: 'Quiet Horizon Fade',
        description: 'Feather-soft lower transition separating gallery bands.',
        defaults: { intensity: 6, secondary: 180 },
      },
    ],
  },
  {
    id: 'backdrop-blur',
    order: '04',
    title: 'Blur & Backdrop Blur Materials',
    shortTitle: 'Backdrop Blur',
    summary:
      'Compare translucent iOS/macOS material densities for floating bars, overlays, and sticky controls.',
    baselineLabel: 'Opaque / Production Bar',
    baselineNotes: 'Solid elevated surface or standard 20px vibrancy bar.',
    primarySliderLabel: 'Blur Radius',
    primaryUnit: 'px',
    primaryMin: 0,
    primaryMax: 40,
    primaryStep: 2,
    secondarySliderLabel: 'Surface Opacity',
    secondaryUnit: '%',
    secondaryMin: 55,
    secondaryMax: 96,
    secondaryStep: 2,
    variants: [
      {
        id: 'crisp-thin',
        label: 'Thin Material (12px)',
        description: 'Light translucency that preserves crisp chromatic hints beneath.',
        defaults: { intensity: 12, secondary: 82 },
      },
      {
        id: 'apple-vibrancy',
        label: 'Calibrated Vibrancy (24px)',
        description: 'Balanced macOS-style saturation and frost for sticky bars.',
        defaults: { intensity: 24, secondary: 86 },
      },
      {
        id: 'frosted-thick',
        label: 'Thick Frosted Glass (36px)',
        description: 'High diffusion for floating docks over busy case study imagery.',
        defaults: { intensity: 36, secondary: 90 },
      },
    ],
  },
  {
    id: 'subtle-parallax',
    order: '05',
    title: 'Subtle Parallax Depth',
    shortTitle: 'Subtle Parallax',
    summary:
      'Micro-displacement between foreground copy and background imagery. Strictly disabled under prefers-reduced-motion.',
    baselineLabel: 'Static Scroll Plane',
    baselineNotes: '1:1 scroll lock with zero layer displacement.',
    primarySliderLabel: 'Max Shift',
    primaryUnit: 'px',
    primaryMin: 0,
    primaryMax: 24,
    primaryStep: 2,
    secondarySliderLabel: 'Scrub Preview',
    secondaryUnit: '%',
    secondaryMin: 0,
    secondaryMax: 100,
    secondaryStep: 2,
    respectsReducedMotion: true,
    variants: [
      {
        id: 'media-drift',
        label: 'Gentle Media Drift',
        description: 'Cover image translates at 0.92x speed inside its clipped frame.',
        defaults: { intensity: 10, secondary: 50 },
      },
      {
        id: 'caption-parallax',
        label: 'Layered Caption Float',
        description: 'Subtle differential between showcase media and editorial metadata.',
        defaults: { intensity: 8, secondary: 50 },
      },
      {
        id: 'ambient-plate',
        label: 'Micro Plate Depth',
        description: 'Restrained 4–6px parallax suited for tall case study cover banners.',
        defaults: { intensity: 6, secondary: 50 },
      },
    ],
  },
  {
    id: 'layered-shadows',
    order: '06',
    title: 'Ambient, Contact & Layered Shadows',
    shortTitle: 'Layered Shadows',
    summary:
      'Calibrate contact crispness versus wide ambient diffusion across cards, modals, and floating controls.',
    baselineLabel: 'Production Apple Depth',
    baselineNotes: 'Current --shadow-apple-card balanced specular + contact + ambient stack.',
    primarySliderLabel: 'Shadow Depth',
    primaryUnit: '%',
    primaryMin: 0,
    primaryMax: 200,
    primaryStep: 10,
    secondarySliderLabel: 'Vertical Lift',
    secondaryUnit: 'px',
    secondaryMin: 4,
    secondaryMax: 36,
    secondaryStep: 2,
    variants: [
      {
        id: 'contact-crisp',
        label: 'Tight Contact Shadow',
        description: 'Architectural micro-ring and crisp 1px drop for high-density grids.',
        defaults: { intensity: 90, secondary: 8 },
      },
      {
        id: 'multi-layer-soft',
        label: 'Multi-Layer Studio Soft',
        description: 'Three-tier physical penumbra calibrated for white and warm canvases.',
        defaults: { intensity: 110, secondary: 18 },
      },
      {
        id: 'floating-sheet',
        label: 'Elevated Floating Sheet',
        description: 'Longer ambient drop reserved for interactive prototypes and lightboxes.',
        defaults: { intensity: 130, secondary: 28 },
      },
    ],
  },
  {
    id: 'borders-hairlines',
    order: '07',
    title: 'Borders, Hairlines & Surface Treatments',
    shortTitle: 'Borders & Hairlines',
    summary:
      'Evaluate sub-pixel hairlines, specular top highlights, and recessed inner rims to separate cards cleanly.',
    baselineLabel: 'Borderless Shadow Framing',
    baselineNotes: 'Separation achieved primarily via surface contrast and subtle ring.',
    primarySliderLabel: 'Border Opacity',
    primaryUnit: '%',
    primaryMin: 0,
    primaryMax: 24,
    primaryStep: 1,
    secondarySliderLabel: 'Specular Rim',
    secondaryUnit: '%',
    secondaryMin: 0,
    secondaryMax: 100,
    secondaryStep: 5,
    variants: [
      {
        id: 'optical-hairline',
        label: 'Optical Hairline',
        description: 'Clean 1px translucent hairline dividing light and dark surfaces cleanly.',
        defaults: { intensity: 10, secondary: 40 },
      },
      {
        id: 'top-specular-bevel',
        label: 'Machined Top Bevel',
        description: 'Hairline border paired with an inset top light catch like anodized hardware.',
        defaults: { intensity: 11, secondary: 85 },
      },
      {
        id: 'inset-recess',
        label: 'Soft Inset Contour',
        description: 'Quiet dual-ring border for nested showcase trays and audio decks.',
        defaults: { intensity: 13, secondary: 60 },
      },
    ],
  },
] as const;

export function createDefaultEffectsConfig(): Record<EffectTrackId, EffectTrackConfig> {
  const result = {} as Record<EffectTrackId, EffectTrackConfig>;
  for (const track of EFFECT_TRACKS) {
    const first = track.variants[0];
    result[track.id] = {
      enabled: true,
      variantId: first.id,
      intensity: first.defaults.intensity,
      secondary: first.defaults.secondary,
    };
  }
  return result;
}

export function loadEffectsConfig(): Record<EffectTrackId, EffectTrackConfig> {
  const defaults = createDefaultEffectsConfig();
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = window.localStorage.getItem(EFFECTS_CONFIG_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<Record<EffectTrackId, Partial<EffectTrackConfig>>>;
    for (const track of EFFECT_TRACKS) {
      const saved = parsed[track.id];
      if (!saved) continue;
      const validVariant = track.variants.some((v) => v.id === saved.variantId)
        ? (saved.variantId as string)
        : defaults[track.id].variantId;
      defaults[track.id] = {
        enabled: typeof saved.enabled === 'boolean' ? saved.enabled : defaults[track.id].enabled,
        variantId: validVariant,
        intensity:
          typeof saved.intensity === 'number' && Number.isFinite(saved.intensity)
            ? Math.min(track.primaryMax, Math.max(track.primaryMin, saved.intensity))
            : defaults[track.id].intensity,
        secondary:
          typeof saved.secondary === 'number' && Number.isFinite(saved.secondary)
            ? Math.min(track.secondaryMax, Math.max(track.secondaryMin, saved.secondary))
            : defaults[track.id].secondary,
      };
    }
  } catch {
    // Fallback to clean defaults on corrupt storage
  }
  return defaults;
}

export function saveEffectsConfig(config: Record<EffectTrackId, EffectTrackConfig>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(EFFECTS_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Ignore storage quota restrictions
  }
}

export function isValidDecisionStatus(value: unknown): value is DecisionStatus {
  return (
    value === 'exploring' ||
    value === 'approved' ||
    value === 'rejected' ||
    value === 'promoted'
  );
}

export function loadDecisionLog(): DecisionLogEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(DECISION_LOG_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidDecisionLogEntry);
  } catch {
    return [];
  }
}

export function saveDecisionLog(entries: readonly DecisionLogEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(DECISION_LOG_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Ignore storage restrictions
  }
}

export function isValidDecisionLogEntry(value: unknown): value is DecisionLogEntry {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    v.id.length > 0 &&
    (v.subjectType === 'effect-track' ||
      v.subjectType === 'palette' ||
      v.subjectType === 'appearance' ||
      v.subjectType === 'toc' ||
      v.subjectType === 'experiment') &&
    typeof v.subjectId === 'string' &&
    (v.experimentId === undefined || typeof v.experimentId === 'string') &&
    typeof v.title === 'string' &&
    typeof v.variantLabel === 'string' &&
    isValidDecisionStatus(v.status) &&
    typeof v.parameters === 'object' &&
    v.parameters !== null &&
    (v.paletteContext === 'cool' || v.paletteContext === 'warm') &&
    (v.themeContext === 'light' || v.themeContext === 'dark') &&
    typeof v.rationale === 'string' &&
    typeof v.createdAt === 'string' &&
    typeof v.updatedAt === 'string'
  );
}

export function upsertDecisionEntry(
  entries: readonly DecisionLogEntry[],
  input: Omit<DecisionLogEntry, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
  nowIso = new Date().toISOString(),
): DecisionLogEntry[] {
  const targetId =
    input.id ?? `${input.subjectType}:${input.subjectId}:${input.variantLabel.toLowerCase().replace(/\s+/g, '-')}`;
  const existingIndex = entries.findIndex((entry) => entry.id === targetId);

  if (existingIndex >= 0) {
    const existing = entries[existingIndex];
    const updated: DecisionLogEntry = {
      ...existing,
      ...input,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: nowIso,
    };
    const next = [...entries];
    next[existingIndex] = updated;
    return next;
  }

  const created: DecisionLogEntry = {
    ...input,
    id: targetId,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
  return [created, ...entries];
}

/**
 * Transitions ONLY entries explicitly marked 'approved' to 'promoted' (P2.1).
 * Leaves 'exploring', 'rejected', and already 'promoted' entries untouched.
 * Never mutates public production tokens automatically.
 */
export function promoteApprovedDecisions(
  entries: readonly DecisionLogEntry[],
  nowIso = new Date().toISOString(),
): { nextEntries: DecisionLogEntry[]; promotedCount: number } {
  let promotedCount = 0;
  const nextEntries = entries.map((entry) => {
    if (entry.status !== 'approved') {
      return entry;
    }
    promotedCount += 1;
    return {
      ...entry,
      status: 'promoted' as const,
      updatedAt: nowIso,
    };
  });
  return { nextEntries, promotedCount };
}

export function serializeDecisionLogJson(
  entries: readonly DecisionLogEntry[],
  exportedAt = new Date().toISOString(),
): string {
  const payload: WorkshopDecisionLogExport = {
    schemaVersion: 1,
    exportedAt,
    note: 'Private Design Workshop Decision Log. Approvals document visual intent and do not automatically modify public production tokens.',
    entries: [...entries],
  };
  return JSON.stringify(payload, null, 2);
}

export function parseImportedDecisionLogJson(
  rawJson: string,
): { ok: true; entries: DecisionLogEntry[] } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(rawJson) as unknown;
    if (
      parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed) &&
      (parsed as { domain?: unknown }).domain === 'studio-experiments'
    ) {
      return {
        ok: false,
        error:
          'This file is a Studio Experiments export. Import it inside Exploration → Experiments & Versions instead.',
      };
    }

    const list = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === 'object' && Array.isArray((parsed as { entries?: unknown }).entries)
        ? (parsed as { entries: unknown[] }).entries
        : null;

    if (!list) {
      return {
        ok: false,
        error: 'JSON must be an array of decision entries or an exported Decision Log object.',
      };
    }

    const valid = list.filter(isValidDecisionLogEntry);
    if (list.length > 0 && valid.length === 0) {
      return {
        ok: false,
        error: 'No valid decision entries were found in the imported JSON.',
      };
    }

    return { ok: true, entries: valid };
  } catch {
    return {
      ok: false,
      error: 'Could not parse JSON. Check syntax and try again.',
    };
  }
}

const STATUS_LABELS: Record<DecisionStatus, string> = {
  exploring: 'Exploring',
  approved: 'Approved (Pending Implementation)',
  rejected: 'Rejected (Excluded from Production)',
  promoted: 'Promoted to Production',
};

export function generateTokenPromotionMarkdown(
  entries: readonly DecisionLogEntry[],
  generatedAt = new Date().toISOString(),
): string {
  const approved = entries.filter((e) => e.status === 'approved');
  const promoted = entries.filter((e) => e.status === 'promoted');
  const rejected = entries.filter((e) => e.status === 'rejected');
  const exploring = entries.filter((e) => e.status === 'exploring');

  const formatEntry = (entry: DecisionLogEntry): string => {
    const params = Object.entries(entry.parameters)
      .map(([k, v]) => `\`${k}: ${String(v)}\``)
      .join(', ');
    return [
      `### ${entry.title} — ${entry.variantLabel}`,
      `- **Status**: ${STATUS_LABELS[entry.status]}`,
      `- **Context**: ${entry.paletteContext === 'cool' ? 'Cool Neutral' : 'Warm Neutral'} · ${entry.themeContext === 'dark' ? 'Dark Mode' : 'Light Mode'}`,
      ...(entry.experimentId ? [`- **Linked Experiment**: \`${entry.experimentId}\``] : []),
      `- **Parameters**: ${params || 'Default'}`,
      `- **Rationale**: ${entry.rationale.trim() || 'No rationale recorded yet.'}`,
      `- **Updated**: ${entry.updatedAt}`,
      '',
    ].join('\n');
  };

  return [
    '# Design Workshop — Token Promotion Summary',
    '',
    `Generated: ${generatedAt}`,
    '',
    '> Workflow: `EXPLORE → COMPARE → APPROVE / REJECT → IMPLEMENT`',
    '> Approved treatments are recorded for intentional promotion into `src/index.css` and never auto-applied to the live public portfolio.',
    '',
    `## Summary Counts`,
    `- Approved (ready for token promotion): ${approved.length}`,
    `- Promoted to Production: ${promoted.length}`,
    `- Exploring: ${exploring.length}`,
    `- Rejected (excluded from public site): ${rejected.length}`,
    '',
    '## Approved for Promotion',
    approved.length > 0 ? approved.map(formatEntry).join('\n') : '_No treatments currently awaiting promotion._\n',
    '## Promoted to Production',
    promoted.length > 0 ? promoted.map(formatEntry).join('\n') : '_No treatments marked promoted yet._\n',
    '## Exploring',
    exploring.length > 0 ? exploring.map(formatEntry).join('\n') : '_No treatments currently in exploration._\n',
    '## Rejected (Excluded)',
    rejected.length > 0 ? rejected.map(formatEntry).join('\n') : '_No treatments rejected._\n',
  ].join('\n');
}
