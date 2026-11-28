import type { ResolvedTheme } from '../../utils/appearance';
import type { StudioExperiment } from '../../utils/experimentsStore';
import type { TocVariant } from '../../utils/portfolio';
import { playTick } from '../../utils/soundEngine';
import type {
  WorkbenchMode,
  WorkbenchSpecimen,
  WorkbenchState,
} from '../../utils/workbenchStore';
import type { DecisionLogEntry, VisualPaletteId } from '../../utils/workshopStore';
import { ChevronRight } from 'lucide-react';
import {
  WorkbenchCanvasView,
  type ArchiveOriginRect,
} from './WorkbenchCanvasView';

interface StudioOverviewSectionProps {
  sandboxPalette: VisualPaletteId;
  sandboxTheme: ResolvedTheme;
  appliedTocVariant: TocVariant;
  decisionLog: readonly DecisionLogEntry[];
  experiments: readonly StudioExperiment[];
  workbenchState: WorkbenchState;
  workbenchMode: WorkbenchMode;
  onWorkbenchModeChange: (next: WorkbenchMode) => void;
  onUpdateWorkbenchState: (
    updater: (prev: WorkbenchState) => WorkbenchState,
  ) => void;
  onArchiveSpecimens: (
    ids: readonly string[],
    origins: readonly ArchiveOriginRect[],
  ) => void;
  onOpenSpecimenDetail: (specimen: WorkbenchSpecimen) => void;
  onNavigate: (path: string) => void;
}

/**
 * Unified Visual Design System Workbench (/design-system).
 * Brings Foundations, all 41 Components, all 12 Patterns, all 6 Page Templates,
 * Behaviour (Interaction States, Motion, Icons & Sound), and Exploration
 * (Materials & Effects, TOC Lab, Experiments) together in one interactive
 * visual canvas supporting Browse, Arrange, Compare, Collections, and Archive.
 */
export function StudioOverviewSection({
  sandboxPalette,
  sandboxTheme,
  appliedTocVariant,
  decisionLog,
  experiments,
  workbenchState,
  workbenchMode,
  onWorkbenchModeChange,
  onUpdateWorkbenchState,
  onArchiveSpecimens,
  onOpenSpecimenDetail,
  onNavigate,
}: StudioOverviewSectionProps) {
  const handleLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    path: string,
  ) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    playTick();
    onNavigate(path);
  };

  const approvedCount = decisionLog.filter(
    (entry) => entry.status === 'approved' || entry.status === 'promoted',
  ).length;

  return (
    <div className="space-y-10">
      <WorkbenchCanvasView
        scope="all"
        state={workbenchState}
        mode={workbenchMode}
        onModeChange={onWorkbenchModeChange}
        onUpdateState={onUpdateWorkbenchState}
        onArchiveSpecimens={onArchiveSpecimens}
        onOpenSpecimenDetail={onOpenSpecimenDetail}
        sandboxPalette={sandboxPalette}
        sandboxTheme={sandboxTheme}
        appliedTocVariant={appliedTocVariant}
        experimentsCount={experiments.length}
      />

      {/* Quiet System Links */}
      <section
        aria-label="System index and decisions"
        className="grid grid-cols-1 gap-x-8 border-t border-[var(--apple-separator-subtle)] pt-6 sm:grid-cols-2"
      >
        {[
          {
            label: 'Documentation Directory',
            meta: 'Search all 15 Studio views',
            path: '/design-system/documentation',
          },
          {
            label: 'Decision Log',
            meta:
              decisionLog.length > 0
                ? `${decisionLog.length} logged · ${approvedCount} approved`
                : 'Approvals & token promotions',
            path: '/design-system/decisions',
          },
        ].map((item) => (
          <a
            key={item.path}
            href={item.path}
            onClick={(e) => handleLinkClick(e, item.path)}
            className="apple-link group flex items-center justify-between gap-4 border-b border-[var(--apple-separator-subtle)] py-3.5 transition-colors hover:text-[var(--apple-link)]"
          >
            <span className="text-[14px] font-medium text-[var(--apple-label-primary)] group-hover:text-[var(--apple-link)]">
              {item.label}
            </span>
            <span className="flex items-center gap-2 text-[12.5px] text-[var(--apple-label-tertiary)]">
              <span className="tabular-nums">{item.meta}</span>
              <ChevronRight
                size={12}
                strokeWidth={2}
                aria-hidden="true"
                className="shrink-0 transition-transform group-hover:translate-x-0.5"
              />
            </span>
          </a>
        ))}
      </section>
    </div>
  );
}
