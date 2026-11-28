/**
 * Portfolio Studio — Workstream B: Experiments & Version Snapshots Store
 *
 * Strictly isolated to /design-system local persistence under
 * `portfolio_workshop_experiments_v1`.
 *
 * Scope disclosure:
 * - Snapshots and restorations operate strictly inside browser localStorage.
 * - They do NOT mutate Git commits, source CSS, or live public portfolio routes.
 * - Scoped JSON import/export validates schema strictly and never touches
 *   the Decision Log or Effects Lab storage keys.
 */

export type ExperimentCategory =
  | 'typography'
  | 'colour'
  | 'surfaces'
  | 'motion'
  | 'components'
  | 'layout'
  | 'materials'
  | 'interaction-patterns';

export type ExperimentStatus =
  | 'draft'
  | 'exploring'
  | 'approved'
  | 'rejected'
  | 'archived';

export type ExperimentSpecimenType =
  | 'hero-scale'
  | 'surface-tint'
  | 'card-elevation'
  | 'motion-rhythm'
  | 'control-density'
  | 'editorial-measure'
  | 'glass-material'
  | 'disclosure-cue';

export type ExperimentParameters = Record<string, string | number | boolean>;

export interface ExperimentSnapshot {
  id: string;
  versionLabel: string;
  createdAt: string;
  changeNote: string;
  parameters: ExperimentParameters;
  statusAtSnapshot: ExperimentStatus;
}

export interface StudioExperiment {
  id: string;
  name: string;
  shortDescription: string;
  category: ExperimentCategory;
  status: ExperimentStatus;
  date: string;
  systemArea: string;
  rationale: string;
  specimenType: ExperimentSpecimenType;
  tokens: readonly string[];
  components: readonly string[];
  notes: string;
  parameters: ExperimentParameters;
  snapshots: readonly ExperimentSnapshot[];
  linkedDecisionId?: string;
  updatedAt: string;
}

export interface SnapshotDiffRow {
  key: string;
  beforeValue: string;
  afterValue: string;
  changed: boolean;
}

export interface ExperimentsJsonExport {
  domain: 'studio-experiments';
  schemaVersion: 1;
  exportedAt: string;
  scopeNote: string;
  experiments: StudioExperiment[];
}

export const EXPERIMENTS_STORAGE_KEY = 'portfolio_workshop_experiments_v1';

export const EXPERIMENT_CATEGORIES: readonly {
  id: ExperimentCategory;
  label: string;
}[] = [
  { id: 'typography', label: 'Typography' },
  { id: 'colour', label: 'Colour' },
  { id: 'surfaces', label: 'Surfaces' },
  { id: 'motion', label: 'Motion' },
  { id: 'components', label: 'Components' },
  { id: 'layout', label: 'Layout' },
  { id: 'materials', label: 'Materials' },
  { id: 'interaction-patterns', label: 'Interaction Patterns' },
] as const;

export const EXPERIMENT_STATUSES: readonly {
  id: ExperimentStatus;
  label: string;
}[] = [
  { id: 'draft', label: 'Draft' },
  { id: 'exploring', label: 'Exploring' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'archived', label: 'Archived' },
] as const;

export function isValidExperimentCategory(value: unknown): value is ExperimentCategory {
  return EXPERIMENT_CATEGORIES.some((c) => c.id === value);
}

export function isValidExperimentStatus(value: unknown): value is ExperimentStatus {
  return EXPERIMENT_STATUSES.some((s) => s.id === value);
}

const VALID_SPECIMEN_TYPES = new Set<ExperimentSpecimenType>([
  'hero-scale',
  'surface-tint',
  'card-elevation',
  'motion-rhythm',
  'control-density',
  'editorial-measure',
  'glass-material',
  'disclosure-cue',
]);

export function isValidSpecimenType(value: unknown): value is ExperimentSpecimenType {
  return typeof value === 'string' && VALID_SPECIMEN_TYPES.has(value as ExperimentSpecimenType);
}

export function createSeedExperiments(): StudioExperiment[] {
  return [
    {
      id: 'exp-warm-editorial-surface',
      name: 'Warm Neutral Editorial Paper Stepping',
      shortDescription:
        'Evaluate whether warm stone secondary bands soften long-form case study reading without reducing AA contrast.',
      category: 'colour',
      status: 'exploring',
      date: '2026-11-18',
      systemArea: 'Foundations · Colour & Themes',
      rationale:
        'Cool Neutral (#FFFFFF / #F5F5F7) remains production baseline; Warm Neutral (#FBFAF7 / #F3F1EC) is under study for calmer monograph cadence.',
      specimenType: 'surface-tint',
      tokens: ['--apple-bg', '--apple-bg-secondary', '--apple-label-secondary', '--apple-separator'],
      components: ['CaseStudyPage', 'ProjectCard', 'AudioPlayer'],
      notes:
        'All 100 contrast checks pass >= 4.5:1 on both Cool and Warm matrices. Comparing perceived warmth next to colorful project photography.',
      parameters: {
        bandContrastStep: 5,
        borderOpacity: 9,
        warmthTone: 'warm-paper',
        showHairlineDivider: true,
      },
      snapshots: [
        {
          id: 'snap-warm-v1',
          versionLabel: 'v1',
          createdAt: '2026-11-16T09:30:00.000Z',
          changeNote: 'Initial Cool Neutral production baseline capture',
          statusAtSnapshot: 'draft',
          parameters: {
            bandContrastStep: 4,
            borderOpacity: 8,
            warmthTone: 'cool-neutral',
            showHairlineDivider: true,
          },
        },
        {
          id: 'snap-warm-v2',
          versionLabel: 'v2',
          createdAt: '2026-11-18T14:20:00.000Z',
          changeNote: 'Tested Warm Paper stepping with 9% warm umber hairline',
          statusAtSnapshot: 'exploring',
          parameters: {
            bandContrastStep: 5,
            borderOpacity: 9,
            warmthTone: 'warm-paper',
            showHairlineDivider: true,
          },
        },
      ],
      updatedAt: '2026-11-18T14:20:00.000Z',
    },
    {
      id: 'exp-hero-display-tracking',
      name: 'Hero Display Optical Tracking & Measure',
      shortDescription:
        'Compare -0.036em vs -0.042em optical letter-spacing and 20ch vs 18ch balance on the Home hero headline.',
      category: 'typography',
      status: 'approved',
      date: '2026-11-14',
      systemArea: 'Foundations · Typography',
      rationale:
        'Ensures 72px desktop hero headlines settle cleanly into two balanced lines across SF Pro Display and Inter fallback without orphaned trailing words.',
      specimenType: 'hero-scale',
      tokens: ['--font-sf-display', '--type-display-size', '--type-display-ls', '--measure-display'],
      components: ['HomePage'],
      notes:
        'Approved at -0.036em and 20ch measure; -0.042em felt slightly cramped on Inter fallback glyphs.',
      parameters: {
        fontSizePx: 56,
        trackingEm: -0.036,
        measureCh: 20,
        balanceWrap: true,
      },
      snapshots: [
        {
          id: 'snap-hero-v1',
          versionLabel: 'v1',
          createdAt: '2026-11-12T11:00:00.000Z',
          changeNote: 'Tighter -0.042em tracking candidate at 18ch',
          statusAtSnapshot: 'exploring',
          parameters: {
            fontSizePx: 60,
            trackingEm: -0.042,
            measureCh: 18,
            balanceWrap: true,
          },
        },
        {
          id: 'snap-hero-v2',
          versionLabel: 'v2',
          createdAt: '2026-11-14T16:15:00.000Z',
          changeNote: 'Calibrated to -0.036em / 20ch for Inter fallback parity',
          statusAtSnapshot: 'approved',
          parameters: {
            fontSizePx: 56,
            trackingEm: -0.036,
            measureCh: 20,
            balanceWrap: true,
          },
        },
      ],
      updatedAt: '2026-11-14T16:15:00.000Z',
    },
    {
      id: 'exp-card-elevation-lift',
      name: 'Project Card Resting vs. Hover Depth',
      shortDescription:
        'Test tighter contact shadows and 2px vs 4px hover lift on Selected Work cards in light and dark modes.',
      category: 'surfaces',
      status: 'exploring',
      date: '2026-11-20',
      systemArea: 'Foundations · Surfaces, Borders & Elevation',
      rationale:
        'Evaluate whether reducing hover lift from 4px to 2px with a crisper specular edge feels more composed on dense desktop screens.',
      specimenType: 'card-elevation',
      tokens: ['--shadow-apple-card', '--shadow-apple-card-hover', '--apple-surface-elevated', '--apple-separator'],
      components: ['ProjectCard', 'RelatedProjectsSection'],
      notes: 'Requires dark-mode specular rim review before deciding.',
      parameters: {
        cornerRadiusPx: 28,
        hoverLiftPx: 3,
        shadowDensityPct: 100,
        specularHighlight: true,
      },
      snapshots: [
        {
          id: 'snap-card-v1',
          versionLabel: 'v1',
          createdAt: '2026-11-19T10:00:00.000Z',
          changeNote: 'Production baseline: 28px radius, 4px hover lift',
          statusAtSnapshot: 'exploring',
          parameters: {
            cornerRadiusPx: 28,
            hoverLiftPx: 4,
            shadowDensityPct: 100,
            specularHighlight: true,
          },
        },
        {
          id: 'snap-card-v2',
          versionLabel: 'v2',
          createdAt: '2026-11-20T15:40:00.000Z',
          changeNote: 'Calmer 3px hover lift with identical ambient depth',
          statusAtSnapshot: 'exploring',
          parameters: {
            cornerRadiusPx: 28,
            hoverLiftPx: 3,
            shadowDensityPct: 100,
            specularHighlight: true,
          },
        },
      ],
      updatedAt: '2026-11-20T15:40:00.000Z',
    },
    {
      id: 'exp-frosted-bar-vibrancy',
      name: 'Floating Bar Frosted Vibrancy Calibration',
      shortDescription:
        'Compare 16px, 24px, and 32px backdrop blur with 86%–92% tint opacity over rich case study photography.',
      category: 'materials',
      status: 'exploring',
      date: '2026-11-21',
      systemArea: 'Exploration · Materials & Effects Lab',
      rationale:
        'Verify floating AudioPlayer dock and sticky Navbar retain crisp contrast when passing over high-contrast screenshots.',
      specimenType: 'glass-material',
      tokens: ['--apple-surface-glass', '--apple-surface-ios-bar', '--shadow-apple-ios-bar'],
      components: ['Navbar', 'AudioPlayer', 'TableOfContents'],
      notes: 'Linked conceptually to Effects Lab Track 04 (Backdrop Blur).',
      parameters: {
        blurPx: 24,
        surfaceOpacityPct: 90,
        saturatePct: 180,
        specularTopEdge: true,
      },
      snapshots: [
        {
          id: 'snap-glass-v1',
          versionLabel: 'v1',
          createdAt: '2026-11-20T09:00:00.000Z',
          changeNote: 'Thinner 16px blur / 84% opacity trial',
          statusAtSnapshot: 'exploring',
          parameters: {
            blurPx: 16,
            surfaceOpacityPct: 84,
            saturatePct: 160,
            specularTopEdge: true,
          },
        },
        {
          id: 'snap-glass-v2',
          versionLabel: 'v2',
          createdAt: '2026-11-21T12:10:00.000Z',
          changeNote: 'Raised diffusion to 24px blur and 90% tint for legibility',
          statusAtSnapshot: 'exploring',
          parameters: {
            blurPx: 24,
            surfaceOpacityPct: 90,
            saturatePct: 180,
            specularTopEdge: true,
          },
        },
      ],
      updatedAt: '2026-11-21T12:10:00.000Z',
    },
    {
      id: 'exp-route-motion-cadence',
      name: 'Route Cross-Fade Distance & Duration',
      shortDescription:
        'Measure perceived snappiness between 240ms/6px and 180ms/4px route transitions.',
      category: 'motion',
      status: 'draft',
      date: '2026-11-22',
      systemArea: 'Behaviour · Motion & Transitions',
      rationale:
        'Keep page transitions imperceptible and calm without making rapid case-study switching feel delayed.',
      specimenType: 'motion-rhythm',
      tokens: ['--ease-apple'],
      components: ['App'],
      notes: 'Always collapses to 10ms opacity-only under prefers-reduced-motion.',
      parameters: {
        durationMs: 240,
        offsetPx: 6,
        curve: 'EASE_APPLE',
        respectReducedMotion: true,
      },
      snapshots: [
        {
          id: 'snap-motion-v1',
          versionLabel: 'v1',
          createdAt: '2026-11-22T08:45:00.000Z',
          changeNote: 'Baseline 240ms / 6px vertical settle',
          statusAtSnapshot: 'draft',
          parameters: {
            durationMs: 240,
            offsetPx: 6,
            curve: 'EASE_APPLE',
            respectReducedMotion: true,
          },
        },
      ],
      updatedAt: '2026-11-22T08:45:00.000Z',
    },
    {
      id: 'exp-prose-measure-cadence',
      name: 'Case Study Prose Measure (60ch vs 66ch)',
      shortDescription:
        'Assess long-form scanning comfort in 7-chapter case studies beside the sticky TOC rail.',
      category: 'layout',
      status: 'rejected',
      date: '2026-11-11',
      systemArea: 'Foundations · Spacing & Layout',
      rationale:
        'Tested widening case-study body measure to 66ch; rejected in favor of 60ch (--measure-prose) because eye return scanning remained noticeably calmer at 60ch.',
      specimenType: 'editorial-measure',
      tokens: ['--measure-prose', '--type-body-size', '--type-body-lh'],
      components: ['CaseStudyPage', 'NoteDetailPage'],
      notes: 'Retained as a documented negative result to prevent future measure drift.',
      parameters: {
        measureCh: 60,
        bodySizePx: 17,
        lineHeight: 1.62,
        paragraphGapPx: 20,
      },
      snapshots: [
        {
          id: 'snap-measure-v1',
          versionLabel: 'v1',
          createdAt: '2026-11-10T10:15:00.000Z',
          changeNote: 'Wider 66ch trial on 1440px desktop viewport',
          statusAtSnapshot: 'exploring',
          parameters: {
            measureCh: 66,
            bodySizePx: 17,
            lineHeight: 1.6,
            paragraphGapPx: 18,
          },
        },
        {
          id: 'snap-measure-v2',
          versionLabel: 'v2',
          createdAt: '2026-11-11T17:00:00.000Z',
          changeNote: 'Reverted to 60ch / 1.62 LH and marked 66ch rejected',
          statusAtSnapshot: 'rejected',
          parameters: {
            measureCh: 60,
            bodySizePx: 17,
            lineHeight: 1.62,
            paragraphGapPx: 20,
          },
        },
      ],
      updatedAt: '2026-11-11T17:00:00.000Z',
    },
  ];
}

function isValidParametersRecord(value: unknown): value is ExperimentParameters {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.values(value as Record<string, unknown>).every(
    (v) => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean',
  );
}

export function isValidExperimentSnapshot(value: unknown): value is ExperimentSnapshot {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    v.id.length > 0 &&
    typeof v.versionLabel === 'string' &&
    v.versionLabel.length > 0 &&
    typeof v.createdAt === 'string' &&
    typeof v.changeNote === 'string' &&
    isValidParametersRecord(v.parameters) &&
    isValidExperimentStatus(v.statusAtSnapshot)
  );
}

export function isValidStudioExperiment(value: unknown): value is StudioExperiment {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    v.id.length > 0 &&
    typeof v.name === 'string' &&
    v.name.trim().length > 0 &&
    typeof v.shortDescription === 'string' &&
    isValidExperimentCategory(v.category) &&
    isValidExperimentStatus(v.status) &&
    typeof v.date === 'string' &&
    typeof v.systemArea === 'string' &&
    typeof v.rationale === 'string' &&
    isValidSpecimenType(v.specimenType) &&
    Array.isArray(v.tokens) &&
    v.tokens.every((t) => typeof t === 'string') &&
    Array.isArray(v.components) &&
    v.components.every((c) => typeof c === 'string') &&
    typeof v.notes === 'string' &&
    isValidParametersRecord(v.parameters) &&
    Array.isArray(v.snapshots) &&
    v.snapshots.every(isValidExperimentSnapshot) &&
    typeof v.updatedAt === 'string' &&
    (v.linkedDecisionId === undefined || typeof v.linkedDecisionId === 'string')
  );
}

export function loadExperiments(): StudioExperiment[] {
  if (typeof window === 'undefined') return createSeedExperiments();
  try {
    const raw = window.localStorage.getItem(EXPERIMENTS_STORAGE_KEY);
    if (!raw) return createSeedExperiments();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return createSeedExperiments();
    const valid = parsed.filter(isValidStudioExperiment);
    return valid.length > 0 ? valid : createSeedExperiments();
  } catch {
    return createSeedExperiments();
  }
}

export function saveExperiments(experiments: readonly StudioExperiment[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(EXPERIMENTS_STORAGE_KEY, JSON.stringify(experiments));
  } catch {
    // Ignore storage quota restrictions
  }
}

function defaultParametersForSpecimen(specimenType: ExperimentSpecimenType): ExperimentParameters {
  switch (specimenType) {
    case 'hero-scale':
      return { fontSizePx: 54, trackingEm: -0.036, measureCh: 20, balanceWrap: true };
    case 'surface-tint':
      return { bandContrastStep: 5, borderOpacity: 9, warmthTone: 'warm-paper', showHairlineDivider: true };
    case 'card-elevation':
      return { cornerRadiusPx: 28, hoverLiftPx: 4, shadowDensityPct: 100, specularHighlight: true };
    case 'motion-rhythm':
      return { durationMs: 240, offsetPx: 6, curve: 'EASE_APPLE', respectReducedMotion: true };
    case 'control-density':
      return { controlHeightPx: 36, horizontalPadPx: 14, radiusPx: 9999, showCounts: true };
    case 'editorial-measure':
      return { measureCh: 60, bodySizePx: 17, lineHeight: 1.62, paragraphGapPx: 20 };
    case 'glass-material':
      return { blurPx: 24, surfaceOpacityPct: 90, saturatePct: 180, specularTopEdge: true };
    case 'disclosure-cue':
      return { durationMs: 300, borderVisible: true, chevronRotateDeg: 180, showHelperLine: true };
  }
}

export function createExperiment(
  experiments: readonly StudioExperiment[],
  input: {
    name: string;
    shortDescription: string;
    category: ExperimentCategory;
    status?: ExperimentStatus;
    systemArea: string;
    rationale: string;
    specimenType: ExperimentSpecimenType;
    tokens?: readonly string[];
    components?: readonly string[];
    notes?: string;
    parameters?: ExperimentParameters;
  },
  nowIso = new Date().toISOString(),
): { nextExperiments: StudioExperiment[]; created: StudioExperiment } {
  const slugBase = input.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 36) || 'experiment';
  const id = `exp-${slugBase}-${Math.random().toString(36).slice(2, 6)}`;
  const status: ExperimentStatus = input.status ?? 'draft';
  const params: ExperimentParameters = input.parameters
    ? { ...input.parameters }
    : defaultParametersForSpecimen(input.specimenType);

  const initialSnapshot: ExperimentSnapshot = {
    id: `${id}-v1`,
    versionLabel: 'v1',
    createdAt: nowIso,
    changeNote: 'Initial experiment snapshot',
    parameters: { ...params },
    statusAtSnapshot: status,
  };

  const created: StudioExperiment = {
    id,
    name: input.name.trim(),
    shortDescription: input.shortDescription.trim(),
    category: input.category,
    status,
    date: nowIso.slice(0, 10),
    systemArea: input.systemArea.trim() || 'Portfolio Studio',
    rationale: input.rationale.trim(),
    specimenType: input.specimenType,
    tokens: input.tokens ? [...input.tokens] : ['--apple-bg', '--apple-label-primary'],
    components: input.components ? [...input.components] : ['Studio Specimen'],
    notes: input.notes?.trim() ?? '',
    parameters: params,
    snapshots: [initialSnapshot],
    updatedAt: nowIso,
  };

  return {
    nextExperiments: [created, ...experiments],
    created,
  };
}

export function updateExperiment(
  experiments: readonly StudioExperiment[],
  id: string,
  patch: Partial<Omit<StudioExperiment, 'id' | 'snapshots'>>,
  nowIso = new Date().toISOString(),
): StudioExperiment[] {
  return experiments.map((exp) =>
    exp.id === id
      ? {
          ...exp,
          ...patch,
          parameters: patch.parameters ? { ...patch.parameters } : exp.parameters,
          updatedAt: nowIso,
        }
      : exp,
  );
}

export function duplicateExperiment(
  experiments: readonly StudioExperiment[],
  id: string,
  nowIso = new Date().toISOString(),
): { nextExperiments: StudioExperiment[]; duplicated: StudioExperiment | null } {
  const source = experiments.find((exp) => exp.id === id);
  if (!source) return { nextExperiments: [...experiments], duplicated: null };

  const newId = `${source.id}-copy-${Math.random().toString(36).slice(2, 5)}`;
  const duplicated: StudioExperiment = {
    ...source,
    id: newId,
    name: `${source.name} (Copy)`,
    status: 'draft',
    date: nowIso.slice(0, 10),
    linkedDecisionId: undefined,
    parameters: { ...source.parameters },
    snapshots: [
      {
        id: `${newId}-v1`,
        versionLabel: 'v1',
        createdAt: nowIso,
        changeNote: `Duplicated from ${source.name}`,
        parameters: { ...source.parameters },
        statusAtSnapshot: 'draft',
      },
    ],
    updatedAt: nowIso,
  };

  return {
    nextExperiments: [duplicated, ...experiments],
    duplicated,
  };
}

export function deleteExperiment(
  experiments: readonly StudioExperiment[],
  id: string,
): StudioExperiment[] {
  return experiments.filter((exp) => exp.id !== id);
}

export function captureExperimentSnapshot(
  experiments: readonly StudioExperiment[],
  experimentId: string,
  changeNote: string,
  nowIso = new Date().toISOString(),
): { nextExperiments: StudioExperiment[]; snapshot: ExperimentSnapshot | null } {
  let createdSnapshot: ExperimentSnapshot | null = null;
  const nextExperiments = experiments.map((exp) => {
    if (exp.id !== experimentId) return exp;
    const nextNum = exp.snapshots.length + 1;
    const snapshot: ExperimentSnapshot = {
      id: `${exp.id}-v${nextNum}-${Math.random().toString(36).slice(2, 5)}`,
      versionLabel: `v${nextNum}`,
      createdAt: nowIso,
      changeNote: changeNote.trim() || `Captured snapshot v${nextNum}`,
      parameters: { ...exp.parameters },
      statusAtSnapshot: exp.status,
    };
    createdSnapshot = snapshot;
    return {
      ...exp,
      snapshots: [...exp.snapshots, snapshot],
      updatedAt: nowIso,
    };
  });
  return { nextExperiments, snapshot: createdSnapshot };
}

/**
 * Computes a deterministic, key-sorted property diff between two snapshots.
 */
export function diffExperimentSnapshots(
  beforeSnapshot: ExperimentSnapshot,
  afterSnapshot: ExperimentSnapshot,
): SnapshotDiffRow[] {
  const keys = Array.from(
    new Set([
      ...Object.keys(beforeSnapshot.parameters),
      ...Object.keys(afterSnapshot.parameters),
    ]),
  ).sort();

  return keys.map((key) => {
    const beforeRaw = beforeSnapshot.parameters[key];
    const afterRaw = afterSnapshot.parameters[key];
    const beforeValue = beforeRaw === undefined ? '—' : String(beforeRaw);
    const afterValue = afterRaw === undefined ? '—' : String(afterRaw);
    return {
      key,
      beforeValue,
      afterValue,
      changed: beforeValue !== afterValue,
    };
  });
}

function parametersEqual(a: ExperimentParameters, b: ExperimentParameters): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((k) => a[k] === b[k]);
}

/**
 * Restores a previous snapshot safely. If current working parameters differ from
 * the latest recorded snapshot, saves an automatic pre-restore checkpoint first
 * so no unsaved iteration is ever lost.
 */
export function restoreExperimentSnapshot(
  experiments: readonly StudioExperiment[],
  experimentId: string,
  snapshotId: string,
  nowIso = new Date().toISOString(),
): {
  nextExperiments: StudioExperiment[];
  restored: ExperimentSnapshot | null;
  createdCheckpoint: boolean;
} {
  let restored: ExperimentSnapshot | null = null;
  let createdCheckpoint = false;

  const nextExperiments = experiments.map((exp) => {
    if (exp.id !== experimentId) return exp;
    const target = exp.snapshots.find((s) => s.id === snapshotId);
    if (!target) return exp;

    restored = target;
    const nextSnapshots = [...exp.snapshots];
    const latest = nextSnapshots[nextSnapshots.length - 1];

    if (!latest || !parametersEqual(exp.parameters, latest.parameters)) {
      const checkpointNum = nextSnapshots.length + 1;
      nextSnapshots.push({
        id: `${exp.id}-v${checkpointNum}-chk`,
        versionLabel: `v${checkpointNum}`,
        createdAt: nowIso,
        changeNote: `Auto-checkpoint before restoring ${target.versionLabel}`,
        parameters: { ...exp.parameters },
        statusAtSnapshot: exp.status,
      });
      createdCheckpoint = true;
    }

    return {
      ...exp,
      parameters: { ...target.parameters },
      snapshots: nextSnapshots,
      updatedAt: nowIso,
    };
  });

  return { nextExperiments, restored, createdCheckpoint };
}

export function linkExperimentToDecision(
  experiments: readonly StudioExperiment[],
  experimentId: string,
  decisionId: string,
  nowIso = new Date().toISOString(),
): StudioExperiment[] {
  return experiments.map((exp) =>
    exp.id === experimentId
      ? { ...exp, linkedDecisionId: decisionId, updatedAt: nowIso }
      : exp,
  );
}

export function serializeExperimentsJson(
  experiments: readonly StudioExperiment[],
  exportedAt = new Date().toISOString(),
): string {
  const payload: ExperimentsJsonExport = {
    domain: 'studio-experiments',
    schemaVersion: 1,
    exportedAt,
    scopeNote:
      'Scoped Portfolio Studio Experiments & Snapshots export (client-side localStorage only; never modifies Decision Log, Effects Lab, or public CSS).',
    experiments: [...experiments],
  };
  return JSON.stringify(payload, null, 2);
}

export function parseImportedExperimentsJson(
  rawJson: string,
): { ok: true; experiments: StudioExperiment[] } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(rawJson) as unknown;

    // Reject Decision Log exports explicitly so domains can never cross-contaminate
    if (
      parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed) &&
      'entries' in parsed &&
      !('experiments' in parsed)
    ) {
      return {
        ok: false,
        error:
          'This file appears to be a Decision Log export. Import it inside System → Decision Log instead.',
      };
    }

    let list: unknown[] | null = null;
    if (Array.isArray(parsed)) {
      list = parsed;
    } else if (
      parsed &&
      typeof parsed === 'object' &&
      (parsed as { domain?: unknown }).domain === 'studio-experiments' &&
      Array.isArray((parsed as { experiments?: unknown }).experiments)
    ) {
      list = (parsed as { experiments: unknown[] }).experiments;
    } else if (
      parsed &&
      typeof parsed === 'object' &&
      Array.isArray((parsed as { experiments?: unknown }).experiments)
    ) {
      list = (parsed as { experiments: unknown[] }).experiments;
    }

    if (!list) {
      return {
        ok: false,
        error:
          'JSON must be an exported Studio Experiments payload (domain: "studio-experiments") or an array of valid experiments.',
      };
    }

    const valid = list.filter(isValidStudioExperiment);
    if (list.length > 0 && valid.length === 0) {
      return {
        ok: false,
        error: 'No valid experiment records were found in the imported JSON.',
      };
    }

    return { ok: true, experiments: valid };
  } catch {
    return {
      ok: false,
      error: 'Could not parse JSON. Verify syntax and try again.',
    };
  }
}

export function mergeImportedExperiments(
  existing: readonly StudioExperiment[],
  imported: readonly StudioExperiment[],
  mode: 'merge' | 'replace',
): StudioExperiment[] {
  if (mode === 'replace') {
    return [...imported];
  }
  const byId = new Map<string, StudioExperiment>();
  for (const exp of existing) {
    byId.set(exp.id, exp);
  }
  for (const exp of imported) {
    byId.set(exp.id, exp);
  }
  return Array.from(byId.values());
}
