import { buildWaveformProfile } from '../../utils/readAloud';
import type { TocVariant } from '../../utils/portfolio';
import {
  PAGE_TEMPLATES_CATALOG,
  type StudioPatternSpec,
} from '../../utils/studioLibraryCatalog';
import type { WorkbenchSpecimen } from '../../utils/workbenchStore';
import { AudioWaveform } from '../AudioWaveform';
import {
  Check,
  Moon,
  Play,
  Search,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Volume2,
} from 'lucide-react';
import { ComponentMiniPreview } from './ComponentMiniPreview';
import { PatternMiniPreview } from './PatternsSection';

interface WorkbenchSpecimenPreviewProps {
  specimen: WorkbenchSpecimen;
  appliedTocVariant?: TocVariant;
  experimentsCount?: number;
  compact?: boolean;
}

const TOC_VARIANT_LABELS: Record<TocVariant, string> = {
  'notch-rail': 'Notch Rail',
  'ios-capsule': 'iOS Capsule',
  'apple-local-nav': 'Local Ribbon',
  'macos-sidebar': 'macOS Rail',
  'tactile-scrubber': 'Detent Scrubber',
  'chapter-scrubber': 'Chapter Scrubber',
  'wave-scrubber': 'Wave Scrubber',
  'scroll-index': 'Scroll Index',
};

const ICON_SOUND_WAVEFORM = buildWaveformProfile(
  [
    {
      id: 'wb-audio',
      num: '01',
      title: 'Icons & Sound',
      text: 'Calm haptic feedback and crisp Lucide icon proportions.',
    },
  ],
  14,
);

/**
 * Unified visual preview renderer for every specimen on the Design System
 * Workbench canvas (Foundations, 41 Components, 12 Patterns, 6 Page Templates,
 * Behaviour, and Exploration). Reuses ComponentMiniPreview and PatternMiniPreview
 * directly so there is zero duplication of component previews.
 */
export function WorkbenchSpecimenPreview({
  specimen,
  appliedTocVariant = 'chapter-scrubber',
  experimentsCount = 6,
  compact = false,
}: WorkbenchSpecimenPreviewProps) {
  if (specimen.section === 'components') {
    return <ComponentMiniPreview componentId={specimen.sourceId} />;
  }

  if (specimen.section === 'patterns') {
    return (
      <div className="pointer-events-none flex w-full select-none items-center justify-center">
        <PatternMiniPreview id={specimen.sourceId as StudioPatternSpec['id']} />
      </div>
    );
  }

  if (specimen.section === 'templates') {
    const tpl = PAGE_TEMPLATES_CATALOG.find((t) => t.id === specimen.sourceId);
    const bands = tpl?.sectionHierarchy.slice(0, compact ? 3 : 4) ?? [];
    return (
      <div className="pointer-events-none w-full max-w-[240px] select-none space-y-1.5 rounded-[13px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-3 shadow-2xs">
        <div className="flex items-center justify-between border-b border-[var(--apple-separator-subtle)] pb-1.5 font-mono text-[10px] text-[var(--apple-label-tertiary)]">
          <span className="truncate">{tpl?.routePattern ?? '/'}</span>
          <span className="shrink-0 tabular-nums">
            {tpl?.sectionHierarchy.length ?? 4} bands
          </span>
        </div>
        <div className="space-y-1.5">
          {bands.map((band, idx) => (
            <div
              key={band.order}
              className={`flex items-center justify-between rounded-[7px] px-2 py-1 text-[10px] ${
                idx === 1
                  ? 'border border-[var(--apple-blue)]/35 bg-[var(--apple-blue)]/8 text-[var(--apple-link)]'
                  : 'bg-[var(--apple-bg-secondary)] text-[var(--apple-label-secondary)]'
              }`}
            >
              <span className="truncate font-medium">
                {band.order} · {band.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (specimen.section === 'foundations') {
    switch (specimen.sourceId) {
      case 'colour-themes':
        return (
          <div className="pointer-events-none flex select-none flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              {[
                'var(--apple-bg)',
                'var(--apple-bg-tertiary)',
                'var(--apple-label-secondary)',
                'var(--apple-label-primary)',
                'var(--apple-blue-fill)',
              ].map((bg, i) => (
                <span
                  key={i}
                  className="h-9 w-9 rounded-full border border-[var(--apple-separator-strong)] shadow-2xs"
                  style={{ backgroundColor: bg }}
                />
              ))}
            </div>
            <span className="font-mono text-[11px] tabular-nums text-[var(--apple-label-tertiary)]">
              Cool · Warm · AA ≥ 4.5:1
            </span>
          </div>
        );

      case 'typography':
        return (
          <div className="pointer-events-none flex select-none flex-col items-center text-center">
            <span className="font-display text-[46px] font-semibold leading-none tracking-[-0.04em] text-[var(--apple-label-primary)]">
              Aa
            </span>
            <span className="mt-2.5 text-[11.5px] text-[var(--apple-label-secondary)]">
              SF Pro Display · Text · 60ch
            </span>
          </div>
        );

      case 'spacing-layout':
        return (
          <div className="pointer-events-none w-full max-w-[188px] select-none space-y-2">
            {[
              { label: '8', w: '24%' },
              { label: '16', w: '44%' },
              { label: '24', w: '66%' },
              { label: '32', w: '88%' },
            ].map((step) => (
              <div key={step.label} className="flex items-center gap-2.5">
                <span className="w-5 text-right font-mono text-[10.5px] tabular-nums text-[var(--apple-label-tertiary)]">
                  {step.label}
                </span>
                <div
                  className="h-3 rounded-[4px] bg-[var(--apple-blue-fill)]/80"
                  style={{ width: step.w }}
                />
              </div>
            ))}
          </div>
        );

      case 'surfaces-elevation':
        return (
          <div className="pointer-events-none relative flex h-[102px] w-[184px] select-none items-center justify-center">
            <div className="absolute inset-0 rounded-[18px] border border-[var(--apple-separator)] bg-[var(--apple-bg)] p-3">
              <div className="h-full w-full rounded-[12px] border border-[var(--apple-separator-strong)] bg-[var(--apple-surface-elevated)] p-2.5 shadow-[var(--shadow-apple-card)]">
                <div className="flex h-full items-end justify-between text-[10.5px] text-[var(--apple-label-tertiary)]">
                  <span className="font-medium text-[var(--apple-label-primary)]">
                    Elevated
                  </span>
                  <span className="font-mono tabular-nums">r-12</span>
                </div>
              </div>
            </div>
          </div>
        );
    }
  }

  if (specimen.section === 'behaviour') {
    switch (specimen.sourceId) {
      case 'interaction-states':
        return (
          <div className="pointer-events-none flex select-none flex-wrap items-center justify-center gap-2.5">
            <span className="apple-btn-outline !min-h-[34px] !px-3.5 !py-1 !text-[12px]">
              Default
            </span>
            <span className="apple-btn-primary !min-h-[34px] !px-3.5 !py-1 !text-[12px] shadow-[0_0_0_3.5px_var(--apple-focus-ring)]">
              Focused
            </span>
            <span className="inline-flex h-[34px] items-center gap-1.5 rounded-full bg-[var(--apple-control-tonal)] px-3.5 text-[12px] text-[var(--apple-label-secondary)]">
              <span className="apple-spinner !h-3 !w-3" aria-hidden="true" />
              <span>Loading</span>
            </span>
          </div>
        );

      case 'motion':
        return (
          <div className="pointer-events-none flex select-none flex-col items-center">
            <svg
              viewBox="0 0 156 64"
              className="h-14 w-40 overflow-visible text-[var(--apple-blue)]"
              fill="none"
              aria-hidden="true"
            >
              <line
                x1="6"
                y1="56"
                x2="150"
                y2="56"
                stroke="currentColor"
                strokeOpacity="0.16"
                strokeWidth="1.2"
              />
              <path
                d="M 6 56 C 28 6, 52 6, 150 6"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              <circle cx="6" cy="56" r="3.5" fill="currentColor" />
              <circle cx="150" cy="6" r="3.5" fill="currentColor" />
            </svg>
            <span className="mt-2 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[var(--apple-label-secondary)]">
              <Play size={10} strokeWidth={2} fill="currentColor" aria-hidden="true" className="text-[var(--apple-blue)]" />
              <span>Apple easing &amp; springs</span>
            </span>
          </div>
        );

      case 'icons-sound':
        return (
          <div className="pointer-events-none flex w-full max-w-[230px] select-none flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-[var(--apple-label-primary)]">
              {[
                Search,
                Sparkles,
                Sun,
                Moon,
                SlidersHorizontal,
                Volume2,
              ].map((Icon, idx) => (
                <span
                  key={idx}
                  className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] shadow-2xs"
                >
                  <Icon size={14} strokeWidth={1.75} aria-hidden="true" />
                </span>
              ))}
            </div>
            <div className="w-[180px]">
              <AudioWaveform
                profile={ICON_SOUND_WAVEFORM}
                progressRatio={0.55}
                isPlaying={false}
                isSpeaking={false}
                muted={false}
                volume={0.85}
                rate={1}
                speechPulseTick={0}
              />
            </div>
          </div>
        );
    }
  }

  /* Exploration specimens */
  switch (specimen.sourceId) {
    case 'effects':
      return (
        <div className="pointer-events-none relative flex h-full w-full select-none items-center justify-center">
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-[12px] opacity-70"
            style={{
              background:
                'radial-gradient(circle at 30% 35%, rgba(29,86,201,0.22), transparent 58%)',
            }}
          />
          <div className="apple-ios-bar relative flex items-center gap-2 rounded-[14px] px-4 py-2.5 text-[12.5px] font-medium text-[var(--apple-label-primary)] shadow-sm">
            <Sparkles size={13} strokeWidth={2} aria-hidden="true" className="text-[var(--apple-blue)]" />
            <span>Frosted Glass &amp; Depth</span>
          </div>
        </div>
      );

    case 'toc-lab':
      return (
        <div className="pointer-events-none w-full max-w-[215px] select-none space-y-1.5 rounded-[13px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-3 text-[11.5px] shadow-2xs">
          <div className="flex items-center justify-between border-b border-[var(--apple-separator-subtle)] pb-1.5 text-[10.5px] text-[var(--apple-label-tertiary)]">
            <span>Active TOC</span>
            <span className="font-medium text-[var(--apple-link)]">
              {TOC_VARIANT_LABELS[appliedTocVariant]}
            </span>
          </div>
          <div className="flex items-center gap-2 pt-0.5 font-semibold text-[var(--apple-label-primary)]">
            <span className="h-3 w-0.5 rounded-full bg-[var(--apple-blue-fill)]" />
            <span>01 · Overview</span>
          </div>
          <div className="pl-2.5 text-[var(--apple-label-secondary)]">
            02 · Architecture
          </div>
        </div>
      );

    case 'experiments':
    default:
      return (
        <div className="pointer-events-none flex w-full max-w-[235px] select-none items-center gap-2.5">
          <div className="flex-1 rounded-[11px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-2.5 text-center">
            <span className="font-mono text-[10px] text-[var(--apple-label-tertiary)]">
              v1 · Base
            </span>
            <div className="mt-2 h-6 rounded-[6px] bg-[var(--apple-bg-secondary)]" />
          </div>
          <SlidersHorizontal size={13} strokeWidth={2} aria-hidden="true" className="shrink-0 text-[var(--apple-label-tertiary)]" />
          <div className="flex-1 rounded-[11px] border border-[var(--apple-blue)]/45 bg-[var(--apple-surface-elevated)] p-2.5 text-center shadow-2xs">
            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-medium text-[var(--apple-link)]">
              <Check size={9} strokeWidth={2} aria-hidden="true" />
              <span>{experimentsCount} studies</span>
            </span>
            <div className="mt-2 h-6 rounded-[6px] bg-[var(--apple-blue)]/14" />
          </div>
        </div>
      );
  }
}
