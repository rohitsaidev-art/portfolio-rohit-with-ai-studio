import { useEffect, useMemo, useRef, useState } from 'react';
import type { ResolvedTheme } from '../../utils/appearance';
import {
  captureExperimentSnapshot,
  createExperiment,
  deleteExperiment,
  diffExperimentSnapshots,
  duplicateExperiment,
  EXPERIMENT_CATEGORIES,
  EXPERIMENT_STATUSES,
  mergeImportedExperiments,
  parseImportedExperimentsJson,
  restoreExperimentSnapshot,
  serializeExperimentsJson,
  updateExperiment,
  type ExperimentCategory,
  type ExperimentParameters,
  type ExperimentSpecimenType,
  type ExperimentStatus,
  type StudioExperiment,
} from '../../utils/experimentsStore';
import { playSuccessChime, playTap, playTick } from '../../utils/soundEngine';
import type {
  DecisionLogEntry,
  DecisionStatus,
  VisualPaletteId,
} from '../../utils/workshopStore';
import {
  Check,
  ChevronRight,
  Download,
  RotateCcw,
  Search,
  Upload,
} from 'lucide-react';

interface ExperimentsSectionProps {
  experiments: readonly StudioExperiment[];
  sandboxPalette: VisualPaletteId;
  sandboxTheme: ResolvedTheme;
  focusedExperimentId: string | null;
  decisionLog: readonly DecisionLogEntry[];
  onUpdateExperiments: (next: StudioExperiment[]) => void;
  onSendToDecisionLog: (payload: {
    experimentId: string;
    title: string;
    variantLabel: string;
    status: DecisionStatus;
    parameters: Record<string, string | number | boolean>;
    rationale: string;
  }) => void;
  onNavigateToDecisions: () => void;
}

const SPECIMEN_OPTIONS: readonly { id: ExperimentSpecimenType; label: string }[] = [
  { id: 'surface-tint', label: 'Surface Band & Hairline' },
  { id: 'hero-scale', label: 'Hero Display Scale & Tracking' },
  { id: 'card-elevation', label: 'Project Card Elevation' },
  { id: 'glass-material', label: 'Frosted Bar Material' },
  { id: 'motion-rhythm', label: 'Route Motion Cadence' },
  { id: 'editorial-measure', label: 'Editorial Prose Measure' },
  { id: 'control-density', label: 'Control Density & Radius' },
  { id: 'disclosure-cue', label: 'Disclosure Cue & Border' },
] as const;

const NUMERIC_PARAM_BOUNDS: Record<
  string,
  { label: string; min: number; max: number; step: number; unit: string }
> = {
  bandContrastStep: { label: 'Band Contrast Step', min: 1, max: 12, step: 1, unit: '%' },
  borderOpacity: { label: 'Border Opacity', min: 2, max: 24, step: 1, unit: '%' },
  fontSizePx: { label: 'Display Font Size', min: 36, max: 76, step: 2, unit: 'px' },
  trackingEm: { label: 'Optical Tracking', min: -0.05, max: 0, step: 0.002, unit: 'em' },
  measureCh: { label: 'Line Measure', min: 14, max: 72, step: 1, unit: 'ch' },
  cornerRadiusPx: { label: 'Corner Radius', min: 8, max: 36, step: 2, unit: 'px' },
  hoverLiftPx: { label: 'Hover Lift', min: 0, max: 8, step: 1, unit: 'px' },
  shadowDensityPct: { label: 'Shadow Density', min: 40, max: 160, step: 10, unit: '%' },
  blurPx: { label: 'Backdrop Blur', min: 0, max: 36, step: 2, unit: 'px' },
  surfaceOpacityPct: { label: 'Surface Opacity', min: 65, max: 98, step: 2, unit: '%' },
  saturatePct: { label: 'Backdrop Saturate', min: 100, max: 220, step: 10, unit: '%' },
  durationMs: { label: 'Transition Duration', min: 80, max: 520, step: 20, unit: 'ms' },
  offsetPx: { label: 'Entrance Offset', min: 0, max: 20, step: 1, unit: 'px' },
  bodySizePx: { label: 'Body Font Size', min: 15, max: 20, step: 1, unit: 'px' },
  lineHeight: { label: 'Line Height', min: 1.4, max: 1.85, step: 0.02, unit: '' },
  paragraphGapPx: { label: 'Paragraph Gap', min: 12, max: 32, step: 2, unit: 'px' },
  controlHeightPx: { label: 'Control Height', min: 28, max: 48, step: 2, unit: 'px' },
  horizontalPadPx: { label: 'Horizontal Padding', min: 8, max: 28, step: 2, unit: 'px' },
  radiusPx: { label: 'Corner Radius', min: 6, max: 9999, step: 2, unit: 'px' },
  chevronRotateDeg: { label: 'Chevron Rotation', min: 90, max: 180, step: 90, unit: '°' },
};

const STRING_PARAM_CHOICES: Record<string, readonly string[]> = {
  warmthTone: ['cool-neutral', 'warm-paper', 'stone-soft'],
  curve: ['EASE_APPLE', 'EASE_OUT_EXPO', 'SPRING_SEGMENT'],
};

function formatParamLabel(key: string): string {
  const known = NUMERIC_PARAM_BOUNDS[key]?.label;
  if (known) return known;
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase());
}

function triggerJsonDownload(filename: string, content: string) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function ExperimentSpecimenPreview({
  specimenType,
  parameters,
  palette,
  theme,
  label,
}: {
  specimenType: ExperimentSpecimenType;
  parameters: ExperimentParameters;
  palette: VisualPaletteId;
  theme: ResolvedTheme;
  label: string;
}) {
  const isDark = theme === 'dark';

  return (
    <div
      data-ds-sandbox="true"
      data-ds-palette={palette}
      data-ds-theme={theme}
      className="rounded-[18px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] p-4"
    >
      <div className="mb-3 flex items-center justify-between gap-2 text-[12px]">
        <span className="font-semibold text-[var(--apple-label-primary)]">{label}</span>
        <span className="text-[var(--apple-label-tertiary)]">
          {palette === 'cool' ? 'Cool' : 'Warm'} · {theme}
        </span>
      </div>

      <div className="rounded-[14px] border border-[var(--apple-separator-subtle)] bg-[var(--apple-bg)] p-4">
        {specimenType === 'surface-tint' && (() => {
          const step = Number(parameters.bandContrastStep ?? 5);
          const borderAlpha = Number(parameters.borderOpacity ?? 9) / 100;
          const tone = String(parameters.warmthTone ?? 'warm-paper');
          const showDivider = Boolean(parameters.showHairlineDivider ?? true);
          const bgTint = isDark
            ? tone === 'warm-paper'
              ? `rgba(255, 245, 228, ${(step / 100).toFixed(3)})`
              : `rgba(255, 255, 255, ${(step / 100).toFixed(3)})`
            : tone === 'warm-paper'
              ? `rgba(222, 208, 184, ${(step / 45).toFixed(3)})`
              : `rgba(148, 154, 166, ${(step / 60).toFixed(3)})`;
          return (
            <div
              style={{
                backgroundColor: bgTint,
                border: showDivider
                  ? `1px solid rgba(${isDark ? '255,255,255' : '29,29,31'}, ${borderAlpha.toFixed(2)})`
                  : '1px solid transparent',
              }}
              className="rounded-[12px] p-4"
            >
              <p className="text-[11.5px] font-medium text-[var(--apple-link)]">
                Secondary Band · {tone}
              </p>
              <p className="mt-1 text-[14.5px] font-semibold text-[var(--apple-label-primary)]">
                Calm contrast stepping across long-form sections.
              </p>
              <p className="mt-1 font-mono text-[11.5px] text-[var(--apple-label-secondary)]">
                Step {step}% · Border {(borderAlpha * 100).toFixed(0)}%
              </p>
            </div>
          );
        })()}

        {specimenType === 'hero-scale' && (() => {
          const size = Math.min(Number(parameters.fontSizePx ?? 54), 60);
          const tracking = Number(parameters.trackingEm ?? -0.036);
          const measure = Number(parameters.measureCh ?? 20);
          const balance = Boolean(parameters.balanceWrap ?? true);
          return (
            <div className="space-y-2">
              <p
                style={{
                  fontSize: `${Math.round(size * 0.62)}px`,
                  letterSpacing: `${tracking}em`,
                  maxWidth: `${measure}ch`,
                  textWrap: balance ? 'balance' : 'pretty',
                  lineHeight: 1.08,
                }}
                className="font-semibold text-[var(--apple-label-primary)]"
              >
                Designing calm interfaces for everyday craft.
              </p>
              <p className="font-mono text-[11px] tabular-nums text-[var(--apple-label-tertiary)]">
                {size}px · {tracking.toFixed(3)}em · {measure}ch
              </p>
            </div>
          );
        })()}

        {specimenType === 'card-elevation' && (() => {
          const radius = Number(parameters.cornerRadiusPx ?? 28);
          const lift = Number(parameters.hoverLiftPx ?? 4);
          const density = Number(parameters.shadowDensityPct ?? 100) / 100;
          const spec = Boolean(parameters.specularHighlight ?? true);
          return (
            <div
              style={{
                borderRadius: `${radius}px`,
                transform: `translateY(-${Math.min(lift, 6)}px)`,
                boxShadow: `${spec ? `inset 0 1px 0 rgba(255,255,255,${isDark ? '0.12' : '0.92'}), ` : ''}0 ${Math.max(4, lift * 3)}px ${Math.max(12, lift * 6)}px -8px rgba(0,0,0,${(0.14 * density).toFixed(2)})`,
              }}
              className="border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-4 transition-transform"
            >
              <p className="text-[11.5px] font-medium text-[var(--apple-link)]">Selected Work Card</p>
              <p className="mt-1 text-[14.5px] font-semibold text-[var(--apple-label-primary)]">
                StallSync — Queue Telemetry
              </p>
              <p className="mt-1 font-mono text-[11.5px] text-[var(--apple-label-secondary)]">
                {radius}px · −{lift}px lift · {Math.round(density * 100)}% shadow
              </p>
            </div>
          );
        })()}

        {specimenType === 'glass-material' && (() => {
          const blur = Number(parameters.blurPx ?? 24);
          const opacity = Number(parameters.surfaceOpacityPct ?? 90) / 100;
          const saturate = Number(parameters.saturatePct ?? 180);
          const specTop = Boolean(parameters.specularTopEdge ?? true);
          const rgb = isDark ? '28, 28, 32' : '255, 255, 255';
          return (
            <div className="relative overflow-hidden rounded-[12px] bg-[var(--apple-bg-secondary)] p-4">
              <div className="flex items-center justify-between text-[11.5px] text-[var(--apple-label-tertiary)]">
                <span>Underlying surface</span>
                <span>01 / 07</span>
              </div>
              <div
                style={{
                  backgroundColor: `rgba(${rgb}, ${opacity.toFixed(2)})`,
                  backdropFilter: `saturate(${saturate}%) blur(${blur}px)`,
                  WebkitBackdropFilter: `saturate(${saturate}%) blur(${blur}px)`,
                  boxShadow: specTop
                    ? `inset 0 1px 0 rgba(255,255,255,${isDark ? '0.14' : '0.95'})`
                    : 'none',
                }}
                className="mt-3 flex items-center justify-between rounded-full border border-[var(--apple-separator)] px-4 py-2"
              >
                <span className="text-[12.5px] font-semibold text-[var(--apple-label-primary)]">
                  Floating Bar
                </span>
                <span className="font-mono text-[11px] tabular-nums text-[var(--apple-label-secondary)]">
                  {blur}px · {Math.round(opacity * 100)}%
                </span>
              </div>
            </div>
          );
        })()}

        {specimenType === 'motion-rhythm' && (() => {
          const duration = Number(parameters.durationMs ?? 240);
          const offset = Number(parameters.offsetPx ?? 6);
          const curve = String(parameters.curve ?? 'EASE_APPLE');
          return (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-[var(--apple-label-primary)]">
                  Route Cross-Fade
                </span>
                <span className="font-mono text-[11.5px] tabular-nums text-[var(--apple-link)]">
                  {duration}ms · {offset}px
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--apple-bg-secondary)]">
                <div
                  style={{ width: `${Math.min(100, Math.round((duration / 520) * 100))}%` }}
                  className="h-full rounded-full bg-[var(--apple-blue)]"
                />
              </div>
              <p className="font-mono text-[11.5px] text-[var(--apple-label-secondary)]">
                {curve}
              </p>
            </div>
          );
        })()}

        {specimenType === 'editorial-measure' && (() => {
          const ch = Number(parameters.measureCh ?? 60);
          const size = Number(parameters.bodySizePx ?? 17);
          const lh = Number(parameters.lineHeight ?? 1.62);
          const gap = Number(parameters.paragraphGapPx ?? 20);
          return (
            <div style={{ maxWidth: `${ch}ch`, fontSize: `${Math.min(size, 18)}px`, lineHeight: lh }}>
              <p className="text-[var(--apple-label-primary)]">
                Restrained line lengths protect vertical scanning rhythm across dense design rationale.
              </p>
              <p style={{ marginTop: `${gap}px` }} className="text-[12.5px] text-[var(--apple-label-secondary)]">
                {ch}ch · {size}px · {lh.toFixed(2)}
              </p>
            </div>
          );
        })()}

        {specimenType === 'control-density' && (() => {
          const h = Number(parameters.controlHeightPx ?? 36);
          const pad = Number(parameters.horizontalPadPx ?? 14);
          const radius = Number(parameters.radiusPx ?? 9999);
          const counts = Boolean(parameters.showCounts ?? true);
          return (
            <div className="flex flex-wrap items-center gap-2">
              <span
                style={{
                  minHeight: `${h}px`,
                  paddingInline: `${pad}px`,
                  borderRadius: `${radius}px`,
                }}
                className="inline-flex items-center gap-1.5 bg-[var(--apple-blue-fill)] text-[13px] font-medium text-white"
              >
                <span>Primary Action</span>
                {counts && <span className="tabular-nums opacity-80">12</span>}
              </span>
              <span
                style={{
                  minHeight: `${h}px`,
                  paddingInline: `${pad}px`,
                  borderRadius: `${radius}px`,
                }}
                className="inline-flex items-center bg-[var(--apple-control-tonal)] text-[13px] font-medium text-[var(--apple-label-primary)]"
              >
                Secondary
              </span>
            </div>
          );
        })()}

        {specimenType === 'disclosure-cue' && (() => {
          const dur = Number(parameters.durationMs ?? 300);
          const borderVis = Boolean(parameters.borderVisible ?? true);
          const rot = Number(parameters.chevronRotateDeg ?? 180);
          const helper = Boolean(parameters.showHelperLine ?? true);
          return (
            <div
              className={`rounded-[12px] bg-[var(--apple-surface-elevated)] p-3.5 ${
                borderVis ? 'border border-[var(--apple-separator)]' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-[var(--apple-label-primary)]">
                  Disclosure ({dur}ms)
                </span>
                <span className="font-mono text-[11px] text-[var(--apple-label-tertiary)]">
                  {rot}°
                </span>
              </div>
              {helper && (
                <p className="mt-2 border-t border-[var(--apple-separator-subtle)] pt-2 text-[12px] text-[var(--apple-label-secondary)]">
                  Reveals structured notes via CSS grid-template-rows.
                </p>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

export function ExperimentsSection({
  experiments,
  sandboxPalette,
  sandboxTheme,
  focusedExperimentId,
  decisionLog,
  onUpdateExperiments,
  onSendToDecisionLog,
  onNavigateToDecisions,
}: ExperimentsSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ExperimentCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ExperimentStatus>('all');
  const [selectedId, setSelectedId] = useState<string>(
    focusedExperimentId ?? experiments[0]?.id ?? '',
  );
  const [workspaceTab, setWorkspaceTab] = useState<'tune' | 'compare'>('tune');
  const [showNewForm, setShowNewForm] = useState(false);
  const [showImportDrawer, setShowImportDrawer] = useState(false);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [snapshotNote, setSnapshotNote] = useState('');
  const [compareBeforeId, setCompareBeforeId] = useState<string>('');
  const [compareAfterId, setCompareAfterId] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // New experiment form
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<ExperimentCategory>('surfaces');
  const [newSpecimenType, setNewSpecimenType] =
    useState<ExperimentSpecimenType>('surface-tint');
  const [newSystemArea, setNewSystemArea] = useState('Foundations · Surfaces');
  const [newRationale, setNewRationale] = useState('');

  useEffect(() => {
    if (focusedExperimentId && experiments.some((e) => e.id === focusedExperimentId)) {
      setSelectedId(focusedExperimentId);
    }
  }, [focusedExperimentId, experiments]);

  const filteredExperiments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return experiments.filter((exp) => {
      if (categoryFilter !== 'all' && exp.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && exp.status !== statusFilter) return false;
      if (!q) return true;
      return (
        exp.name.toLowerCase().includes(q) ||
        exp.shortDescription.toLowerCase().includes(q) ||
        exp.systemArea.toLowerCase().includes(q)
      );
    });
  }, [experiments, searchQuery, categoryFilter, statusFilter]);

  const activeExperiment =
    experiments.find((e) => e.id === selectedId) ??
    filteredExperiments[0] ??
    experiments[0] ??
    null;

  useEffect(() => {
    if (!activeExperiment) {
      setCompareBeforeId('');
      setCompareAfterId('');
      return;
    }
    const snaps = activeExperiment.snapshots;
    if (snaps.length >= 2) {
      setCompareBeforeId(snaps[0].id);
      setCompareAfterId(snaps[snaps.length - 1].id);
    } else if (snaps.length === 1) {
      setCompareBeforeId(snaps[0].id);
      setCompareAfterId(snaps[0].id);
    } else {
      setCompareBeforeId('');
      setCompareAfterId('');
    }
  }, [activeExperiment?.id, activeExperiment?.snapshots.length]);

  const beforeSnapshot =
    activeExperiment?.snapshots.find((s) => s.id === compareBeforeId) ??
    activeExperiment?.snapshots[0] ??
    null;
  const afterSnapshot =
    activeExperiment?.snapshots.find((s) => s.id === compareAfterId) ??
    activeExperiment?.snapshots[activeExperiment.snapshots.length - 1] ??
    null;

  const diffRows = useMemo(() => {
    if (!beforeSnapshot || !afterSnapshot) return [];
    return diffExperimentSnapshots(beforeSnapshot, afterSnapshot);
  }, [beforeSnapshot, afterSnapshot]);

  const linkedDecision = activeExperiment
    ? decisionLog.find(
        (d) =>
          d.id === activeExperiment.linkedDecisionId ||
          d.experimentId === activeExperiment.id,
      ) ?? null
    : null;

  const showTransientFeedback = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(null), 4000);
  };

  const handleCreateSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newName.trim()) {
      playTap();
      return;
    }
    const { nextExperiments, created } = createExperiment(experiments, {
      name: newName,
      shortDescription:
        newDescription.trim() || 'Isolated Portfolio Studio design-system study.',
      category: newCategory,
      status: 'draft',
      systemArea: newSystemArea,
      rationale:
        newRationale.trim() || 'Testing candidate parameters inside Studio sandbox.',
      specimenType: newSpecimenType,
    });
    playSuccessChime();
    onUpdateExperiments(nextExperiments);
    setSelectedId(created.id);
    setShowNewForm(false);
    setNewName('');
    setNewDescription('');
    setNewRationale('');
    showTransientFeedback(`Created "${created.name}" with v1 snapshot.`);
  };

  const handleDuplicate = (id: string) => {
    const { nextExperiments, duplicated } = duplicateExperiment(experiments, id);
    if (!duplicated) return;
    playSuccessChime();
    onUpdateExperiments(nextExperiments);
    setSelectedId(duplicated.id);
    showTransientFeedback(`Duplicated as "${duplicated.name}".`);
  };

  const handleDelete = (id: string) => {
    const target = experiments.find((e) => e.id === id);
    const next = deleteExperiment(experiments, id);
    playTap();
    onUpdateExperiments(next);
    if (selectedId === id) {
      setSelectedId(next[0]?.id ?? '');
    }
    if (target) {
      showTransientFeedback(`Removed "${target.name}".`);
    }
  };

  const handleCaptureSnapshot = () => {
    if (!activeExperiment) return;
    const { nextExperiments, snapshot } = captureExperimentSnapshot(
      experiments,
      activeExperiment.id,
      snapshotNote,
    );
    if (!snapshot) return;
    playSuccessChime();
    onUpdateExperiments(nextExperiments);
    setSnapshotNote('');
    setCompareAfterId(snapshot.id);
    showTransientFeedback(`Saved snapshot ${snapshot.versionLabel}.`);
  };

  const handleRestoreSnapshot = (snapshotId: string) => {
    if (!activeExperiment) return;
    const { nextExperiments, restored, createdCheckpoint } = restoreExperimentSnapshot(
      experiments,
      activeExperiment.id,
      snapshotId,
    );
    if (!restored) return;
    playSuccessChime();
    onUpdateExperiments(nextExperiments);
    showTransientFeedback(
      createdCheckpoint
        ? `Restored ${restored.versionLabel} and saved an automatic checkpoint.`
        : `Restored ${restored.versionLabel}.`,
    );
  };

  const handleParameterChange = (key: string, value: string | number | boolean) => {
    if (!activeExperiment) return;
    const next = updateExperiment(experiments, activeExperiment.id, {
      parameters: {
        ...activeExperiment.parameters,
        [key]: value,
      },
    });
    onUpdateExperiments(next);
  };

  const handleExportJson = () => {
    playSuccessChime();
    triggerJsonDownload(
      'portfolio-studio-experiments.json',
      serializeExperimentsJson(experiments),
    );
  };

  const handleApplyImport = (raw: string) => {
    const parsed = parseImportedExperimentsJson(raw);
    if (!parsed.ok) {
      playTap();
      setImportError(parsed.error);
      return;
    }
    const merged = mergeImportedExperiments(experiments, parsed.experiments, importMode);
    playSuccessChime();
    onUpdateExperiments(merged);
    if (merged.length > 0 && !merged.some((e) => e.id === selectedId)) {
      setSelectedId(merged[0].id);
    }
    setImportError(null);
    setImportText('');
    setShowImportDrawer(false);
    showTransientFeedback(
      `${importMode === 'replace' ? 'Replaced' : 'Merged'} ${parsed.experiments.length} experiments.`,
    );
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleApplyImport(reader.result);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="space-y-7">
      {/* Compact Top Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-[230px]">
            <label htmlFor="exp-search" className="sr-only">
              Search experiments
            </label>
            <Search
              size={14}
              strokeWidth={1.75}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--apple-label-tertiary)]"
            />
            <input
              id="exp-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search studies…"
              className="apple-input min-h-[36px] rounded-[10px] py-1 pl-8 pr-3 text-[13px]"
            />
          </div>

          <select
            id="exp-filter-cat"
            aria-label="Filter by category"
            value={categoryFilter}
            onChange={(e) => {
              playTick();
              setCategoryFilter(e.target.value as 'all' | ExperimentCategory);
            }}
            className="apple-input !w-auto min-h-[36px] rounded-[10px] px-3 py-1 text-[12.5px]"
          >
            <option value="all">All Categories</option>
            {EXPERIMENT_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          <select
            id="exp-filter-status"
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => {
              playTick();
              setStatusFilter(e.target.value as 'all' | ExperimentStatus);
            }}
            className="apple-input !w-auto min-h-[36px] rounded-[10px] px-3 py-1 text-[12.5px]"
          >
            <option value="all">All Statuses</option>
            {EXPERIMENT_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              playTick();
              setShowNewForm((s) => !s);
              setShowImportDrawer(false);
            }}
            className="apple-btn-primary !min-h-[34px] whitespace-nowrap !px-3.5 !py-1 !text-[12.5px]"
          >
            {showNewForm ? 'Close' : 'New Experiment'}
          </button>
          <button
            type="button"
            onClick={handleExportJson}
            className="apple-btn-tonal !min-h-[34px] whitespace-nowrap !px-3 !py-1 !text-[12.5px]"
          >
            <Download size={12} strokeWidth={2} aria-hidden="true" />
            <span>Export</span>
          </button>
          <button
            type="button"
            onClick={() => {
              playTick();
              setShowImportDrawer((s) => !s);
              setShowNewForm(false);
              setImportError(null);
            }}
            className="apple-btn-outline !min-h-[34px] whitespace-nowrap !px-3 !py-1 !text-[12.5px]"
          >
            <Upload size={12} strokeWidth={2} aria-hidden="true" />
            <span>Import</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          role="status"
          className="rounded-[14px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-4 py-2.5 text-[13px] font-medium text-[var(--apple-link)]"
        >
          {feedback}
        </div>
      )}

      {/* New Experiment Form */}
      {showNewForm && (
        <form
          onSubmit={handleCreateSubmit}
          className="space-y-4 rounded-[18px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-5"
        >
          <h3 className="text-[15.5px] font-semibold text-[var(--apple-label-primary)]">
            New Experiment
          </h3>

          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
            <div>
              <label htmlFor="exp-new-name" className="block text-[12px] font-medium text-[var(--apple-label-secondary)]">
                Name
              </label>
              <input
                id="exp-new-name"
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Case Study Pull-Quote Spacing"
                className="apple-input mt-1 min-h-[38px] rounded-[10px] px-3 py-1.5 text-[13.5px]"
              />
            </div>

            <div>
              <label htmlFor="exp-new-area" className="block text-[12px] font-medium text-[var(--apple-label-secondary)]">
                Area
              </label>
              <input
                id="exp-new-area"
                type="text"
                value={newSystemArea}
                onChange={(e) => setNewSystemArea(e.target.value)}
                className="apple-input mt-1 min-h-[38px] rounded-[10px] px-3 py-1.5 text-[13.5px]"
              />
            </div>

            <div>
              <label htmlFor="exp-new-cat" className="block text-[12px] font-medium text-[var(--apple-label-secondary)]">
                Category
              </label>
              <select
                id="exp-new-cat"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as ExperimentCategory)}
                className="apple-input mt-1 min-h-[38px] rounded-[10px] px-3 py-1.5 text-[13.5px]"
              >
                {EXPERIMENT_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="exp-new-specimen" className="block text-[12px] font-medium text-[var(--apple-label-secondary)]">
                Live Specimen
              </label>
              <select
                id="exp-new-specimen"
                value={newSpecimenType}
                onChange={(e) => setNewSpecimenType(e.target.value as ExperimentSpecimenType)}
                className="apple-input mt-1 min-h-[38px] rounded-[10px] px-3 py-1.5 text-[13.5px]"
              >
                {SPECIMEN_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="exp-new-desc" className="block text-[12px] font-medium text-[var(--apple-label-secondary)]">
                Description
              </label>
              <input
                id="exp-new-desc"
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="What visual refinement are you testing?"
                className="apple-input mt-1 min-h-[38px] rounded-[10px] px-3 py-1.5 text-[13.5px]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              className="apple-btn-primary !min-h-[36px] !px-4 !py-1 !text-[12.5px]"
            >
              Create &amp; Save v1
            </button>
            <button
              type="button"
              onClick={() => setShowNewForm(false)}
              className="apple-btn-tonal !min-h-[36px] !px-3.5 !py-1 !text-[12.5px]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Scoped JSON Import Drawer */}
      {showImportDrawer && (
        <div className="rounded-[18px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[14.5px] font-semibold text-[var(--apple-label-primary)]">
                Import Experiments JSON
              </p>
              <p className="text-[12.5px] text-[var(--apple-label-secondary)]">
                Scoped to Studio Experiments only — Decision Log and live portfolio stay untouched.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="apple-segmented" role="group" aria-label="Import conflict mode">
                {(
                  [
                    { id: 'merge', label: 'Merge' },
                    { id: 'replace', label: 'Replace' },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    aria-pressed={importMode === m.id}
                    onClick={() => {
                      playTick();
                      setImportMode(m.id);
                    }}
                    className={`apple-segmented-item !min-h-[28px] px-3 text-[12px] ${
                      importMode === m.id
                        ? 'apple-pill-shadow bg-[var(--apple-control-thumb)] text-[var(--apple-label-primary)]'
                        : 'text-[var(--apple-label-secondary)]'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleFileChange}
                className="sr-only"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="apple-btn-tonal !min-h-[32px] !px-3 !py-1 !text-[12px]"
              >
                Choose .json
              </button>
            </div>
          </div>

          <textarea
            rows={4}
            value={importText}
            onChange={(e) => {
              setImportText(e.target.value);
              setImportError(null);
            }}
            placeholder="Paste exported Studio Experiments JSON…"
            aria-label="Paste Experiments JSON"
            className="apple-input mt-3 rounded-[12px] px-3 py-2 font-mono text-[12px]"
          />

          {importError && (
            <p role="alert" className="mt-2 text-[12.5px] text-[var(--apple-error)]">
              {importError}
            </p>
          )}

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              disabled={!importText.trim()}
              onClick={() => handleApplyImport(importText)}
              className="apple-btn-primary !min-h-[34px] !px-4 !py-1 !text-[12.5px]"
            >
              {importMode === 'replace' ? 'Replace List' : 'Merge'}
            </button>
            <button
              type="button"
              onClick={() => setShowImportDrawer(false)}
              className="apple-btn-tonal !min-h-[34px] !px-3.5 !py-1 !text-[12.5px]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Split: Study List + Tabbed Workspace */}
      <div className="grid grid-cols-1 gap-7 lg:grid-cols-12">
        {/* Study Selector List */}
        <aside className="space-y-2 lg:col-span-4" aria-label="Experiments list">
          {filteredExperiments.length === 0 ? (
            <div className="rounded-[16px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] p-5 text-center text-[13px] text-[var(--apple-label-secondary)]">
              No studies match your filters.
            </div>
          ) : (
            filteredExperiments.map((exp) => {
              const selected = activeExperiment?.id === exp.id;
              const statusLabel =
                EXPERIMENT_STATUSES.find((s) => s.id === exp.status)?.label ?? exp.status;
              return (
                <button
                  key={exp.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    playTick();
                    setSelectedId(exp.id);
                  }}
                  className={`flex w-full flex-col rounded-[14px] border p-3.5 text-left transition-colors ${
                    selected
                      ? 'border-[var(--apple-blue)] bg-[var(--apple-blue)]/[0.06]'
                      : 'border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] hover:border-[var(--apple-separator-strong)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[11.5px]">
                    <span
                      className={
                        exp.status === 'approved'
                          ? 'font-medium text-[var(--apple-link)]'
                          : 'text-[var(--apple-label-tertiary)]'
                      }
                    >
                      {statusLabel}
                    </span>
                    <span className="tabular-nums text-[var(--apple-label-tertiary)]">
                      {exp.snapshots.length}v
                    </span>
                  </div>
                  <p className="mt-1 text-[14px] font-semibold text-[var(--apple-label-primary)]">
                    {exp.name}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-[12px] text-[var(--apple-label-secondary)]">
                    {exp.shortDescription}
                  </p>
                </button>
              );
            })
          )}

          <p className="pt-2 text-[11.5px] leading-[1.5] text-[var(--apple-label-tertiary)]">
            Stored locally in this browser only. Restores and snapshots never affect live portfolio pages.
          </p>
        </aside>

        {/* Active Study Workspace */}
        {activeExperiment ? (
          <div className="space-y-5 lg:col-span-8">
            <div className="rounded-[18px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-5 sm:p-6">
              {/* Study Header */}
              <div className="flex flex-col gap-3 border-b border-[var(--apple-separator-subtle)] pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[12px] text-[var(--apple-label-tertiary)]">
                    {activeExperiment.systemArea}
                  </p>
                  <h3 className="mt-0.5 text-[18px] font-semibold text-[var(--apple-label-primary)]">
                    {activeExperiment.name}
                  </h3>
                  <p className="mt-1 text-[13px] text-[var(--apple-label-secondary)]">
                    {activeExperiment.shortDescription}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                  <select
                    id="exp-active-status"
                    aria-label="Experiment status"
                    value={activeExperiment.status}
                    onChange={(e) => {
                      playTick();
                      onUpdateExperiments(
                        updateExperiment(experiments, activeExperiment.id, {
                          status: e.target.value as ExperimentStatus,
                        }),
                      );
                    }}
                    className="apple-input !w-auto min-h-[32px] rounded-full px-3 py-0.5 text-[12px] font-medium"
                  >
                    {EXPERIMENT_STATUSES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleDuplicate(activeExperiment.id)}
                    className="apple-btn-tonal !min-h-[32px] !px-3 !py-0.5 !text-[12px]"
                  >
                    Duplicate
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(activeExperiment.id)}
                    className="apple-btn-outline !min-h-[32px] !px-2.5 !py-0.5 !text-[12px] text-[var(--apple-label-secondary)]"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Workspace Tabs: Preview & Tune vs Compare Versions */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="apple-segmented" role="tablist" aria-label="Experiment workspace mode">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={workspaceTab === 'tune'}
                    onClick={() => {
                      playTick();
                      setWorkspaceTab('tune');
                    }}
                    className={`apple-segmented-item !min-h-[30px] px-3.5 text-[12px] ${
                      workspaceTab === 'tune'
                        ? 'apple-pill-shadow bg-[var(--apple-control-thumb)] text-[var(--apple-label-primary)]'
                        : 'text-[var(--apple-label-secondary)]'
                    }`}
                  >
                    Preview &amp; Tune
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={workspaceTab === 'compare'}
                    onClick={() => {
                      playTick();
                      setWorkspaceTab('compare');
                    }}
                    className={`apple-segmented-item !min-h-[30px] px-3.5 text-[12px] ${
                      workspaceTab === 'compare'
                        ? 'apple-pill-shadow bg-[var(--apple-control-thumb)] text-[var(--apple-label-primary)]'
                        : 'text-[var(--apple-label-secondary)]'
                    }`}
                  >
                    Versions ({activeExperiment.snapshots.length})
                  </button>
                </div>

                {linkedDecision && (
                  <button
                    type="button"
                    onClick={() => {
                      playTick();
                      onNavigateToDecisions();
                    }}
                    className="inline-flex items-center gap-1 text-[12.5px] font-medium text-[var(--apple-link)] hover:underline"
                  >
                    <span>Decision: {linkedDecision.status}</span>
                    <ChevronRight size={12} strokeWidth={2} aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* Tab 1: Preview & Tune */}
              {workspaceTab === 'tune' && (
                <div className="mt-5 space-y-5">
                  <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                    <div className="space-y-3 xl:col-span-5">
                      {Object.entries(activeExperiment.parameters).map(([key, val]) => {
                        if (typeof val === 'boolean') {
                          return (
                            <div
                              key={key}
                              className="flex items-center justify-between gap-3 rounded-[10px] bg-[var(--apple-bg-secondary)] px-3 py-2"
                            >
                              <span className="text-[12.5px] font-medium text-[var(--apple-label-primary)]">
                                {formatParamLabel(key)}
                              </span>
                              <button
                                type="button"
                                role="switch"
                                aria-checked={val}
                                onClick={() => {
                                  playTick();
                                  handleParameterChange(key, !val);
                                }}
                                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                                  val ? 'bg-[var(--apple-blue)]' : 'bg-[var(--apple-separator-strong)]'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                                    val ? 'translate-x-4.5' : 'translate-x-0.5'
                                  }`}
                                />
                              </button>
                            </div>
                          );
                        }
                        if (typeof val === 'number') {
                          const bounds = NUMERIC_PARAM_BOUNDS[key] ?? {
                            label: formatParamLabel(key),
                            min: 0,
                            max: Math.max(100, val * 2),
                            step: 1,
                            unit: '',
                          };
                          return (
                            <div key={key}>
                              <div className="flex items-center justify-between text-[12.5px]">
                                <label
                                  htmlFor={`exp-param-${key}`}
                                  className="font-medium text-[var(--apple-label-primary)]"
                                >
                                  {bounds.label}
                                </label>
                                <span className="font-mono tabular-nums text-[var(--apple-link)]">
                                  {val}
                                  {bounds.unit}
                                </span>
                              </div>
                              <input
                                id={`exp-param-${key}`}
                                type="range"
                                min={bounds.min}
                                max={bounds.max}
                                step={bounds.step}
                                value={val}
                                onChange={(e) =>
                                  handleParameterChange(key, Number(e.target.value))
                                }
                                className="mt-1 w-full accent-[var(--apple-blue)]"
                              />
                            </div>
                          );
                        }
                        const choices = STRING_PARAM_CHOICES[key];
                        return (
                          <div key={key}>
                            <label
                              htmlFor={`exp-param-${key}`}
                              className="block text-[12.5px] font-medium text-[var(--apple-label-primary)]"
                            >
                              {formatParamLabel(key)}
                            </label>
                            {choices ? (
                              <select
                                id={`exp-param-${key}`}
                                value={val}
                                onChange={(e) => {
                                  playTick();
                                  handleParameterChange(key, e.target.value);
                                }}
                                className="apple-input mt-1 w-full rounded-[10px] px-3 py-1.5 text-[12.5px]"
                              >
                                {choices.map((ch) => (
                                  <option key={ch} value={ch}>
                                    {ch}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                id={`exp-param-${key}`}
                                type="text"
                                value={val}
                                onChange={(e) => handleParameterChange(key, e.target.value)}
                                className="apple-input mt-1 w-full rounded-[10px] px-3 py-1.5 text-[12.5px]"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="space-y-3 xl:col-span-7">
                      <ExperimentSpecimenPreview
                        specimenType={activeExperiment.specimenType}
                        parameters={activeExperiment.parameters}
                        palette={sandboxPalette}
                        theme={sandboxTheme}
                        label="Live Working Preview"
                      />

                      <input
                        id="exp-rationale-input"
                        type="text"
                        aria-label="Evaluation note"
                        placeholder="Add rationale note…"
                        value={activeExperiment.rationale}
                        onChange={(e) =>
                          onUpdateExperiments(
                            updateExperiment(experiments, activeExperiment.id, {
                              rationale: e.target.value,
                            }),
                          )
                        }
                        className="apple-input min-h-[36px] rounded-[10px] px-3 py-1.5 text-[13px]"
                      />
                    </div>
                  </div>

                  {/* Capture Snapshot + Decision Actions */}
                  <div className="space-y-3 border-t border-[var(--apple-separator-subtle)] pt-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        type="text"
                        value={snapshotNote}
                        onChange={(e) => setSnapshotNote(e.target.value)}
                        placeholder={`Snapshot note for v${activeExperiment.snapshots.length + 1}…`}
                        aria-label="Snapshot change note"
                        className="apple-input min-h-[36px] flex-1 rounded-[10px] px-3 py-1.5 text-[13px]"
                      />
                      <button
                        type="button"
                        onClick={handleCaptureSnapshot}
                        className="apple-btn-primary !min-h-[36px] shrink-0 whitespace-nowrap !px-4 !py-1 !text-[12.5px]"
                      >
                        Save Snapshot v{activeExperiment.snapshots.length + 1}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <span className="text-[12px] text-[var(--apple-label-tertiary)]">
                        Record in Decision Log:
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {(
                          [
                            { status: 'exploring', label: 'Exploring', cls: 'apple-btn-tonal' },
                            { status: 'approved', label: 'Approve', cls: 'apple-btn-primary' },
                            { status: 'rejected', label: 'Reject', cls: 'apple-btn-outline' },
                          ] as const
                        ).map((action) => (
                          <button
                            key={action.status}
                            type="button"
                            onClick={() => {
                              playSuccessChime();
                              const latestSnap =
                                activeExperiment.snapshots[activeExperiment.snapshots.length - 1];
                              onSendToDecisionLog({
                                experimentId: activeExperiment.id,
                                title: activeExperiment.name,
                                variantLabel: latestSnap ? latestSnap.versionLabel : 'working',
                                status: action.status,
                                parameters: { ...activeExperiment.parameters },
                                rationale:
                                  activeExperiment.rationale ||
                                  activeExperiment.shortDescription,
                              });
                              showTransientFeedback(
                                `Sent "${activeExperiment.name}" to Decision Log as ${action.status}.`,
                              );
                            }}
                            className={`${action.cls} !min-h-[32px] whitespace-nowrap !px-3 !py-1 !text-[12px]`}
                          >
                            {action.status === 'approved' && <Check size={12} strokeWidth={2} aria-hidden="true" />}
                            <span>{action.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Compare Versions & Safe Restore */}
              {workspaceTab === 'compare' && (
                <div className="mt-5 space-y-5">
                  {activeExperiment.snapshots.length >= 1 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        aria-label="Select Version A snapshot"
                        value={beforeSnapshot?.id ?? ''}
                        onChange={(e) => {
                          playTick();
                          setCompareBeforeId(e.target.value);
                        }}
                        className="apple-input !w-auto min-h-[32px] rounded-full px-3 py-1 text-[12px] font-medium"
                      >
                        {activeExperiment.snapshots.map((snap) => (
                          <option key={snap.id} value={snap.id}>
                            A: {snap.versionLabel} — {snap.changeNote.slice(0, 28)}
                          </option>
                        ))}
                      </select>
                      <span className="text-[12px] text-[var(--apple-label-tertiary)]">vs</span>
                      <select
                        aria-label="Select Version B snapshot"
                        value={afterSnapshot?.id ?? ''}
                        onChange={(e) => {
                          playTick();
                          setCompareAfterId(e.target.value);
                        }}
                        className="apple-input !w-auto min-h-[32px] rounded-full px-3 py-1 text-[12px] font-medium"
                      >
                        {activeExperiment.snapshots.map((snap) => (
                          <option key={snap.id} value={snap.id}>
                            B: {snap.versionLabel} — {snap.changeNote.slice(0, 28)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {beforeSnapshot && afterSnapshot && (
                    <>
                      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                        <ExperimentSpecimenPreview
                          specimenType={activeExperiment.specimenType}
                          parameters={beforeSnapshot.parameters}
                          palette={sandboxPalette}
                          theme={sandboxTheme}
                          label={`Before · ${beforeSnapshot.versionLabel}`}
                        />
                        <ExperimentSpecimenPreview
                          specimenType={activeExperiment.specimenType}
                          parameters={afterSnapshot.parameters}
                          palette={sandboxPalette}
                          theme={sandboxTheme}
                          label={`After · ${afterSnapshot.versionLabel}`}
                        />
                      </div>

                      <div className="overflow-x-auto rounded-[14px] border border-[var(--apple-separator)]">
                        <table className="w-full min-w-[440px] border-collapse text-left text-[12.5px]">
                          <thead>
                            <tr className="border-b border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)]">
                              <th className="px-4 py-2 font-medium text-[var(--apple-label-tertiary)]">
                                Property
                              </th>
                              <th className="px-4 py-2 font-medium text-[var(--apple-label-tertiary)]">
                                {beforeSnapshot.versionLabel}
                              </th>
                              <th className="px-4 py-2 font-medium text-[var(--apple-label-tertiary)]">
                                {afterSnapshot.versionLabel}
                              </th>
                              <th className="px-4 py-2 text-right font-medium text-[var(--apple-label-tertiary)]">
                                State
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--apple-separator-subtle)]">
                            {diffRows.map((row) => (
                              <tr
                                key={row.key}
                                className={row.changed ? 'bg-[var(--apple-blue)]/[0.04]' : ''}
                              >
                                <td className="px-4 py-2 font-mono font-medium text-[var(--apple-label-primary)]">
                                  {row.key}
                                </td>
                                <td className="px-4 py-2 font-mono tabular-nums text-[var(--apple-label-secondary)]">
                                  {row.beforeValue}
                                </td>
                                <td className="px-4 py-2 font-mono tabular-nums text-[var(--apple-label-primary)]">
                                  {row.afterValue}
                                </td>
                                <td className="px-4 py-2 text-right text-[11.5px] font-medium">
                                  <span
                                    className={
                                      row.changed
                                        ? 'text-[var(--apple-link)]'
                                        : 'text-[var(--apple-label-tertiary)]'
                                    }
                                  >
                                    {row.changed ? 'Changed' : 'Same'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {/* Snapshot History */}
                  <div className="divide-y divide-[var(--apple-separator-subtle)] rounded-[14px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)]">
                    {[...activeExperiment.snapshots].reverse().map((snap) => (
                      <div
                        key={snap.id}
                        className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-[var(--apple-label-primary)]">
                            <span className="font-mono text-[var(--apple-link)]">
                              {snap.versionLabel}
                            </span>{' '}
                            · {snap.changeNote}
                          </p>
                          <p className="text-[11.5px] tabular-nums text-[var(--apple-label-tertiary)]">
                            {new Date(snap.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRestoreSnapshot(snap.id)}
                          className="apple-btn-tonal !min-h-[30px] shrink-0 whitespace-nowrap !px-3 !py-1 !text-[12px]"
                        >
                          <RotateCcw size={11} strokeWidth={2} aria-hidden="true" />
                          <span>Restore {snap.versionLabel}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-[18px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] p-10 text-center lg:col-span-8">
            <p className="text-[14.5px] font-medium text-[var(--apple-label-primary)]">
              No experiment selected.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
