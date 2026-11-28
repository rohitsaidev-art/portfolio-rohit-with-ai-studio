import { PROJECTS } from '../../data/projects';
import { buildWaveformProfile } from '../../utils/readAloud';
import { AudioWaveform } from '../AudioWaveform';
import { Breadcrumbs } from '../Breadcrumbs';
import { LocalTimeClock } from '../LocalTimeClock';
import {
  AlertTriangle,
  ArrowUp,
  ArrowUpRight,
  AudioWaveform as WaveformIcon,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  Info,
  List,
  Maximize2,
  Moon,
  Play,
  Search,
  SlidersHorizontal,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';

interface ComponentMiniPreviewProps {
  componentId: string;
}

const PREVIEW_WAVEFORM = buildWaveformProfile(
  [
    {
      id: 'preview-1',
      num: '01',
      title: 'Overview',
      text: 'StallSync spatial allocation workbench and editorial narration rhythm.',
    },
  ],
  20,
);

const NOOP = () => {};

/**
 * Large, scannable live visual specimen for all 43 portfolio components on the
 * Unified Component Library canvas. Reuses actual production components, real
 * portfolio media, and production CSS classes/tokens so every tile responds
 * authentically to Cool/Warm and Light/Dark sandbox contexts.
 */
export function ComponentMiniPreview({ componentId }: ComponentMiniPreviewProps) {
  const sampleProject = PROJECTS[0];
  const secondaryProjects = PROJECTS.slice(1, 3);

  return (
    <div className="pointer-events-none flex w-full select-none items-center justify-center">
      {renderTileSpecimen(componentId, sampleProject, secondaryProjects)}
    </div>
  );
}

function renderTileSpecimen(
  componentId: string,
  sampleProject: (typeof PROJECTS)[number],
  secondaryProjects: readonly (typeof PROJECTS)[number][],
) {
  switch (componentId) {
    /* ── A. Actions & Controls ───────────────────────────── */
    case 'buttons':
      return (
        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="apple-btn-primary !min-h-[34px] !px-4 !py-1.5 !text-[12.5px]">
              Primary
            </span>
            <span className="apple-btn-tonal !min-h-[34px] !px-3.5 !py-1.5 !text-[12.5px]">
              Tonal
            </span>
            <span className="apple-btn-outline !min-h-[34px] !px-3.5 !py-1.5 !text-[12.5px]">
              Outline
            </span>
          </div>
          <div className="flex items-center gap-4 text-[12px]">
            <span className="inline-flex items-center gap-1 font-medium text-[var(--apple-link)]">
              <span>Read case study</span>
              <ArrowUpRight size={11} strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="inline-flex h-[30px] items-center rounded-full bg-[var(--apple-control-tonal)] px-3 text-[11.5px] font-medium text-[var(--apple-label-quaternary)] opacity-60">
              Disabled
            </span>
          </div>
        </div>
      );

    case 'icon-buttons':
      return (
        <div className="flex items-center gap-3">
          <span className="apple-btn-icon !h-10 !w-10 border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] text-[var(--apple-label-primary)] shadow-2xs">
            <Search size={15} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span className="apple-btn-icon !h-10 !w-10 border border-[var(--apple-blue)]/35 bg-[var(--apple-blue)]/12 text-[var(--apple-link)] shadow-[0_0_0_3px_var(--apple-focus-ring)]">
            <Sun size={15} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span className="apple-btn-icon !h-10 !w-10 bg-[var(--apple-control-tonal)] text-[var(--apple-label-primary)]">
            <SlidersHorizontal size={14} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span className="apple-btn-icon !h-10 !w-10 border border-[var(--apple-separator-subtle)] bg-[var(--apple-surface-elevated)] text-[var(--apple-label-quaternary)] opacity-55">
            <X size={14} strokeWidth={1.75} aria-hidden="true" />
          </span>
        </div>
      );

    case 'segmented-control':
      return (
        <div className="flex flex-col items-center gap-2.5">
          <div className="apple-segmented">
            <span className="apple-segmented-item apple-pill-shadow !min-h-[30px] bg-[var(--apple-control-thumb)] px-3.5 text-[12px] text-[var(--apple-label-primary)]">
              All Work
            </span>
            <span className="apple-segmented-item !min-h-[30px] px-3 text-[12px] text-[var(--apple-label-secondary)]">
              Product
            </span>
            <span className="apple-segmented-item !min-h-[30px] px-3 text-[12px] text-[var(--apple-label-secondary)]">
              Systems
            </span>
          </div>
          <div className="apple-segmented !p-0.5">
            <span className="apple-segmented-item !min-h-[26px] px-2.5 text-[11px] text-[var(--apple-label-secondary)]">
              <Sun size={11} strokeWidth={2} aria-hidden="true" />
              <span>Light</span>
            </span>
            <span className="apple-segmented-item apple-pill-shadow !min-h-[26px] bg-[var(--apple-control-thumb)] px-2.5 text-[11px] text-[var(--apple-label-primary)]">
              <Moon size={11} strokeWidth={2} aria-hidden="true" />
              <span>Dark</span>
            </span>
          </div>
        </div>
      );

    case 'toggle-switch':
      return (
        <div className="flex items-center gap-5">
          <div className="flex flex-col items-center gap-1.5">
            <span className="flex h-7 w-12 items-center rounded-full bg-[var(--apple-control-tonal-active)] p-0.5">
              <span className="h-6 w-6 rounded-full bg-white shadow-xs" />
            </span>
            <span className="text-[11px] text-[var(--apple-label-tertiary)]">Off</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <span className="flex h-7 w-12 items-center justify-end rounded-full bg-[var(--apple-blue-fill)] p-0.5 shadow-[0_0_0_3px_var(--apple-focus-ring)]">
              <span className="h-6 w-6 rounded-full bg-white shadow-xs" />
            </span>
            <span className="text-[11px] font-medium text-[var(--apple-label-primary)]">On</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 opacity-45">
            <span className="flex h-7 w-12 items-center rounded-full bg-[var(--apple-control-tonal-active)] p-0.5">
              <span className="h-6 w-6 rounded-full bg-white shadow-xs" />
            </span>
            <span className="text-[11px] text-[var(--apple-label-tertiary)]">Disabled</span>
          </div>
        </div>
      );

    case 'search-select-controls':
      return (
        <div className="w-full max-w-[245px] space-y-2.5">
          <div className="flex h-[36px] items-center justify-between rounded-[11px] border border-[var(--apple-separator-strong)] bg-[var(--apple-surface-elevated)] px-3 text-[12px] shadow-2xs">
            <span className="inline-flex items-center gap-2 text-[var(--apple-label-primary)]">
              <Search size={13} strokeWidth={2} aria-hidden="true" className="shrink-0 text-[var(--apple-label-tertiary)]" />
              <span>StallSync</span>
            </span>
            <X size={11} strokeWidth={2} aria-hidden="true" className="shrink-0 text-[var(--apple-label-tertiary)]" />
          </div>
          <div className="flex h-[34px] items-center justify-between rounded-[10px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-3 text-[12px] text-[var(--apple-label-primary)] shadow-2xs">
            <span>Sort: Featured order</span>
            <ChevronDown size={12} strokeWidth={2} aria-hidden="true" className="shrink-0 text-[var(--apple-label-tertiary)]" />
          </div>
        </div>
      );

    case 'range-slider':
      return (
        <div className="w-full max-w-[230px] space-y-3">
          <div className="flex items-center justify-between text-[12px]">
            <span className="font-medium text-[var(--apple-label-primary)]">Glass blur</span>
            <span className="font-mono font-medium tabular-nums text-[var(--apple-link)]">
              18px
            </span>
          </div>
          <div className="relative h-2 rounded-full bg-[var(--apple-control-tonal-active)]">
            <div className="h-full w-[64%] rounded-full bg-[var(--apple-blue-fill)]" />
            <span className="absolute top-1/2 left-[64%] h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--apple-blue-fill)] bg-[var(--apple-surface-elevated)] shadow-sm" />
          </div>
          <div className="flex justify-between font-mono text-[10.5px] tabular-nums text-[var(--apple-label-tertiary)]">
            <span>0px</span>
            <span>28px</span>
          </div>
        </div>
      );

    case 'checkbox-radio-experimental':
      return (
        <div className="flex items-center gap-7">
          <div className="space-y-2.5 text-[12px]">
            <div className="flex items-center gap-2.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-[6px] bg-[var(--apple-blue-fill)] text-white shadow-2xs">
                <Check size={11} strokeWidth={2} aria-hidden="true" />
              </span>
              <span className="font-medium text-[var(--apple-label-primary)]">Selected</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="h-5 w-5 rounded-[6px] border border-[var(--apple-separator-strong)] bg-[var(--apple-surface-elevated)]" />
              <span className="text-[var(--apple-label-secondary)]">Unchecked</span>
            </div>
          </div>
          <div className="h-10 w-px bg-[var(--apple-separator)]" />
          <div className="space-y-2.5 text-[12px]">
            <div className="flex items-center gap-2.5">
              <span className="h-5 w-5 rounded-full border-[5.5px] border-[var(--apple-blue-fill)] bg-[var(--apple-surface-elevated)]" />
              <span className="font-medium text-[var(--apple-label-primary)]">Active</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="h-5 w-5 rounded-full border border-[var(--apple-separator-strong)] bg-[var(--apple-surface-elevated)]" />
              <span className="text-[var(--apple-label-secondary)]">Default</span>
            </div>
          </div>
        </div>
      );

    /* ── B. Navigation ───────────────────────────────────── */
    case 'desktop-mobile-navbar':
      return (
        <div className="apple-ios-bar flex w-full max-w-[268px] items-center justify-between rounded-[14px] px-4 py-2.5">
          <span className="text-[12px] font-semibold tracking-[-0.01em] text-[var(--apple-label-primary)]">
            Aarav Sen
          </span>
          <div className="flex items-center gap-3 text-[11px] text-[var(--apple-label-secondary)]">
            <span className="border-b-[1.5px] border-[var(--apple-label-primary)] pb-0.5 font-semibold text-[var(--apple-label-primary)]">
              Work
            </span>
            <span>Notes</span>
            <span>About</span>
          </div>
          <span className="rounded-full bg-[var(--apple-blue-fill)] px-2.5 py-1 text-[10px] font-medium text-white">
            Contact
          </span>
        </div>
      );

    case 'breadcrumbs':
      return (
        <div className="rounded-[12px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-4 py-2.5 shadow-2xs">
          <Breadcrumbs
            items={[
              { label: 'Work', href: '/' },
              { label: 'Case Study', href: '/#selected-work' },
              { label: 'StallSync' },
            ]}
            onNavigate={NOOP}
          />
        </div>
      );

    case 'table-of-contents':
      return (
        <div className="w-full max-w-[215px] space-y-1.5 rounded-[14px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-3.5 text-[11.5px] shadow-2xs">
          <div className="flex items-center gap-2 rounded-[8px] bg-[var(--apple-blue)]/8 px-2 py-1 font-semibold text-[var(--apple-link)]">
            <span className="h-3.5 w-0.5 rounded-full bg-[var(--apple-blue-fill)]" />
            <span>01 · Overview</span>
          </div>
          <div className="px-2.5 py-0.5 text-[var(--apple-label-secondary)]">
            02 · Problem &amp; Context
          </div>
          <div className="px-2.5 py-0.5 text-[var(--apple-label-tertiary)]">
            03 · Spatial Architecture
          </div>
        </div>
      );

    case 'command-palette':
      return (
        <div className="w-full max-w-[248px] overflow-hidden rounded-[14px] border border-[var(--apple-separator-strong)] bg-[var(--apple-surface-elevated)] shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--apple-separator-subtle)] px-3.5 py-2.5 text-[11.5px] text-[var(--apple-label-tertiary)]">
            <span className="inline-flex items-center gap-2">
              <Search size={12} strokeWidth={2} aria-hidden="true" />
              <span>Search work or actions…</span>
            </span>
            <span className="font-mono text-[10px] text-[var(--apple-label-tertiary)]">⌘K</span>
          </div>
          <div className="space-y-1 p-2 text-[11.5px]">
            <div className="flex items-center justify-between rounded-[8px] bg-[var(--apple-blue)]/10 px-2.5 py-1.5 font-medium text-[var(--apple-link)]">
              <span>StallSync Case Study</span>
              <ChevronRight size={10} strokeWidth={2} aria-hidden="true" />
            </div>
            <div className="flex items-center justify-between px-2.5 py-1 text-[var(--apple-label-secondary)]">
              <span>Switch Appearance</span>
              <span className="text-[10px] text-[var(--apple-label-tertiary)]">Action</span>
            </div>
          </div>
        </div>
      );

    case 'popovers-menus':
      return (
        <div className="w-full max-w-[225px] rounded-[14px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-3.5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--apple-separator-subtle)] pb-2.5 text-[11.5px]">
            <span className="font-medium text-[var(--apple-label-primary)]">Appearance</span>
            <div className="apple-segmented !p-0.5">
              <span className="rounded-full bg-[var(--apple-control-thumb)] px-2 py-0.5 text-[10px] font-medium text-[var(--apple-label-primary)] shadow-2xs">
                Light
              </span>
              <span className="px-2 py-0.5 text-[10px] text-[var(--apple-label-secondary)]">
                Dark
              </span>
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11.5px]">
            <span className="text-[var(--apple-label-secondary)]">UI Sound Cues</span>
            <span className="flex h-4.5 w-8 items-center justify-end rounded-full bg-[var(--apple-blue-fill)] p-0.5">
              <span className="h-3.5 w-3.5 rounded-full bg-white shadow-2xs" />
            </span>
          </div>
        </div>
      );

    case 'floating-back-to-top':
      return (
        <div className="flex items-center gap-4">
          <span className="apple-ios-bar inline-flex h-11 w-11 items-center justify-center rounded-full text-[var(--apple-label-primary)] shadow-sm">
            <ArrowUp size={16} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span className="apple-ios-bar inline-flex h-10 items-center gap-2 rounded-full px-3.5 text-[12px] font-medium text-[var(--apple-label-primary)] shadow-sm">
            <ArrowUp size={13} strokeWidth={2} aria-hidden="true" className="text-[var(--apple-link)]" />
            <span>Top</span>
          </span>
        </div>
      );

    /* ── C. Cards & Content ──────────────────────────────── */
    case 'project-card':
      return (
        <div className="w-full max-w-[235px] overflow-hidden rounded-[16px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-2 shadow-2xs">
          <div className="aspect-[16/9] overflow-hidden rounded-[11px] bg-[var(--apple-bg-tertiary)]">
            <img
              src={sampleProject.coverImage}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex items-baseline justify-between gap-2 px-1.5 pt-2.5 pb-1">
            <p className="truncate text-[12.5px] font-semibold text-[var(--apple-label-primary)]">
              {sampleProject.title}
            </p>
            <span className="shrink-0 tabular-nums text-[10.5px] text-[var(--apple-label-tertiary)]">
              {sampleProject.year}
            </span>
          </div>
        </div>
      );

    case 'related-project-cards':
      return (
        <div className="grid w-full max-w-[260px] grid-cols-2 gap-2.5">
          {secondaryProjects.map((project) => (
            <div
              key={project.slug}
              className="overflow-hidden rounded-[13px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-1.5 shadow-2xs"
            >
              <div className="aspect-[16/10] overflow-hidden rounded-[8px] bg-[var(--apple-bg-tertiary)]">
                <img
                  src={project.coverImage}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="mt-1.5 truncate px-1 text-[11px] font-semibold text-[var(--apple-label-primary)]">
                {project.title}
              </p>
            </div>
          ))}
        </div>
      );

    case 'feature-editorial-cards':
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-[78px] w-[76px] flex-col justify-between rounded-[14px] border border-[var(--apple-separator)] bg-[var(--apple-bg)] p-2.5">
            <span className="h-1.5 w-8 rounded-full bg-[var(--apple-label-tertiary)]/35" />
            <span className="text-[10px] text-[var(--apple-label-tertiary)]">Base</span>
          </div>
          <div className="flex h-[88px] w-[92px] flex-col justify-between rounded-[14px] border border-[var(--apple-separator-strong)] bg-[var(--apple-surface-elevated)] p-3 shadow-sm">
            <span className="h-1.5 w-10 rounded-full bg-[var(--apple-blue-fill)]/75" />
            <span className="text-[10.5px] font-semibold text-[var(--apple-label-primary)]">
              Elevated
            </span>
          </div>
          <div className="flex h-[78px] w-[76px] flex-col justify-between rounded-[14px] bg-[var(--apple-bg-tertiary)] p-2.5">
            <span className="h-1.5 w-7 rounded-full bg-[var(--apple-label-secondary)]/35" />
            <span className="text-[10px] text-[var(--apple-label-secondary)]">Tinted</span>
          </div>
        </div>
      );

    case 'testimonials-layout':
      return (
        <div className="w-full max-w-[248px] rounded-[14px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-3.5 shadow-2xs">
          <p className="text-[11.5px] leading-[1.48] text-[var(--apple-label-primary)]">
            “Brought immediate clarity and architectural calm to a dense operational workflow.”
          </p>
          <p className="mt-2.5 text-[10.5px] text-[var(--apple-label-tertiary)]">
            Verified Reference · Product Leadership
          </p>
        </div>
      );

    case 'project-credits':
      return (
        <div className="grid w-full max-w-[250px] grid-cols-3 gap-2.5 rounded-[14px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-3.5 text-[11px] shadow-2xs">
          {[
            ['Role', 'Lead UX'],
            ['Year', sampleProject.year],
            ['Platform', 'Web App'],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-[10px] text-[var(--apple-label-tertiary)]">{k}</p>
              <p className="mt-0.5 truncate font-semibold text-[var(--apple-label-primary)]">
                {v}
              </p>
            </div>
          ))}
        </div>
      );

    case 'case-study-metadata-tags':
      return (
        <div className="space-y-2.5 text-center">
          <div className="flex flex-wrap items-center justify-center gap-2 text-[12.5px] text-[var(--apple-label-secondary)]">
            <span className="font-semibold text-[var(--apple-label-primary)]">
              Product Design
            </span>
            <span aria-hidden="true">·</span>
            <span>Web App</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">2025</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11.5px] text-[var(--apple-label-tertiary)]">
            <span>Figma</span>
            <span aria-hidden="true">·</span>
            <span>React</span>
            <span aria-hidden="true">·</span>
            <span>6 min read</span>
          </div>
        </div>
      );

    /* ── D. Forms & Inputs ───────────────────────────────── */
    case 'form-fields':
      return (
        <div className="w-full max-w-[242px] space-y-2.5">
          <div className="space-y-1">
            <span className="block text-[10.5px] font-medium text-[var(--apple-label-secondary)]">
              Email (Focused)
            </span>
            <div className="flex h-[34px] items-center rounded-[10px] border border-[var(--apple-blue)] bg-[var(--apple-surface-elevated)] px-3 text-[12px] text-[var(--apple-label-primary)] shadow-[0_0_0_3px_var(--apple-focus-ring)]">
              hello@aaravsen.design
            </div>
          </div>
          <div className="flex h-[32px] items-center justify-between rounded-[10px] border border-[var(--apple-error)] bg-[var(--apple-surface-elevated)] px-3 text-[11.5px] text-[var(--apple-error)]">
            <span>Invalid address</span>
            <AlertTriangle size={12} strokeWidth={2} aria-hidden="true" />
          </div>
        </div>
      );

    case 'contact-form-flow':
      return (
        <div className="w-full max-w-[238px] space-y-2 rounded-[14px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-3.5 shadow-2xs">
          <div className="flex h-6 items-center rounded-[7px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] px-2 text-[10px] text-[var(--apple-label-tertiary)]">
            Your name
          </div>
          <div className="flex h-9 items-start rounded-[7px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] px-2 pt-1.5 text-[10px] text-[var(--apple-label-tertiary)]">
            Project scope &amp; timeline…
          </div>
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-[10px] text-[var(--apple-label-tertiary)]">24h reply</span>
            <span className="apple-btn-primary !min-h-[26px] !px-3 !py-0.5 !text-[10.5px]">
              Send Inquiry
            </span>
          </div>
        </div>
      );

    case 'engagement-selector-group':
      return (
        <div className="flex max-w-[250px] flex-wrap justify-center gap-2">
          <span className="rounded-full border border-[var(--apple-blue)] bg-[var(--apple-blue)]/10 px-3 py-1.5 text-[11.5px] font-medium text-[var(--apple-link)]">
            Product Design
          </span>
          <span className="rounded-full border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-3 py-1.5 text-[11.5px] text-[var(--apple-label-secondary)]">
            Design Systems
          </span>
          <span className="rounded-full border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-3 py-1.5 text-[11.5px] text-[var(--apple-label-secondary)]">
            Advisory
          </span>
        </div>
      );

    /* ── E. Overlays & Disclosures ───────────────────────── */
    case 'slide-over-drawers':
      return (
        <div className="flex h-[104px] w-full max-w-[244px] overflow-hidden rounded-[14px] border border-[var(--apple-separator)] bg-[var(--apple-bg)] shadow-2xs">
          <div className="flex-1 bg-black/10 p-3">
            <div className="h-2 w-12 rounded-full bg-[var(--apple-label-tertiary)]/25" />
            <div className="mt-2 h-2 w-16 rounded-full bg-[var(--apple-label-tertiary)]/18" />
          </div>
          <div className="w-[126px] border-l border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[var(--apple-label-primary)]">
                Colophon
              </span>
              <X size={10} strokeWidth={2} aria-hidden="true" className="text-[var(--apple-label-tertiary)]" />
            </div>
            <div className="mt-2.5 space-y-2">
              <div className="h-3 rounded-[5px] bg-[var(--apple-bg-tertiary)]" />
              <div className="h-3 w-4/5 rounded-[5px] bg-[var(--apple-bg-tertiary)]" />
            </div>
          </div>
        </div>
      );

    case 'lightbox-modal':
      return (
        <div className="relative h-[106px] w-full max-w-[244px] overflow-hidden rounded-[14px] bg-[#141416] p-2.5 text-white shadow-sm">
          <div className="relative h-full w-full overflow-hidden rounded-[9px] border border-white/15">
            <img
              src={sampleProject.coverImage}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover opacity-80"
            />
            <span className="absolute right-2 bottom-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm">
              <Maximize2 size={11} strokeWidth={2} aria-hidden="true" />
            </span>
          </div>
          <span className="absolute top-3.5 right-3.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/65 text-white">
            <X size={9} strokeWidth={2} aria-hidden="true" />
          </span>
        </div>
      );

    case 'disclosure-accordion':
      return (
        <div className="w-full max-w-[244px] divide-y divide-[var(--apple-separator-subtle)] rounded-[14px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-3.5 text-[11.5px] shadow-2xs">
          <div className="py-2.5">
            <div className="flex items-center justify-between font-semibold text-[var(--apple-label-primary)]">
              <span>Design process</span>
              <ChevronDown
                size={12}
                strokeWidth={2}
                aria-hidden="true"
                className="rotate-180 text-[var(--apple-label-tertiary)]"
              />
            </div>
            <p className="mt-1 text-[10.5px] leading-[1.45] text-[var(--apple-label-secondary)]">
              Structured discovery to interactive code prototypes.
            </p>
          </div>
          <div className="flex items-center justify-between py-2.5 text-[var(--apple-label-secondary)]">
            <span>Availability</span>
            <ChevronDown size={12} strokeWidth={2} aria-hidden="true" className="text-[var(--apple-label-tertiary)]" />
          </div>
        </div>
      );

    case 'mobile-bottom-sheet':
      return (
        <div className="flex h-[104px] w-[166px] flex-col justify-end overflow-hidden rounded-[16px] border border-[var(--apple-separator-strong)] bg-[var(--apple-bg)] p-2 shadow-2xs">
          <div className="rounded-[12px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-3 py-2.5 shadow-sm">
            <div className="mx-auto mb-2 h-1 w-8 rounded-full bg-[var(--apple-separator-strong)]" />
            <div className="flex items-center justify-between text-[11px] font-medium text-[var(--apple-label-primary)]">
              <span>Chapters · 2 / 6</span>
              <List size={11} strokeWidth={2} aria-hidden="true" className="text-[var(--apple-link)]" />
            </div>
          </div>
        </div>
      );

    /* ── F. Feedback & Status ────────────────────────────── */
    case 'toast-notification':
      return (
        <div className="flex flex-col items-center gap-2.5">
          <div className="apple-ios-bar inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-medium text-[var(--apple-label-primary)] shadow-sm">
            <CheckCircle2 size={14} strokeWidth={1.75} aria-hidden="true" className="text-[var(--apple-success)]" />
            <span>Email copied to clipboard</span>
          </div>
          <div className="apple-ios-bar inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11.5px] text-[var(--apple-label-secondary)]">
            <Info size={13} strokeWidth={2} aria-hidden="true" className="text-[var(--apple-link)]" />
            <span>Switched to 2-Min Skim</span>
          </div>
        </div>
      );

    case 'semantic-status-alerts':
      return (
        <div className="w-full max-w-[244px] space-y-2 text-[11.5px]">
          <div className="flex items-center justify-between rounded-[10px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-3 py-2">
            <span className="inline-flex items-center gap-1.5 font-medium text-[var(--apple-success)]">
              <CheckCircle2 size={13} strokeWidth={2} aria-hidden="true" />
              <span>AA Contrast Verified</span>
            </span>
            <span className="text-[10.5px] text-[var(--apple-label-tertiary)]">Success</span>
          </div>
          <div className="flex items-center justify-between rounded-[10px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-3 py-2">
            <span className="inline-flex items-center gap-1.5 font-medium text-[var(--apple-warning)]">
              <AlertTriangle size={13} strokeWidth={2} aria-hidden="true" />
              <span>Draft Case Note</span>
            </span>
            <span className="text-[10.5px] text-[var(--apple-label-tertiary)]">Warning</span>
          </div>
        </div>
      );

    case 'loading-skeleton-indicators':
      return (
        <div className="w-full max-w-[235px] space-y-3 rounded-[14px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-3.5 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="apple-spinner" aria-hidden="true" />
            <span className="text-[12px] font-medium text-[var(--apple-label-secondary)]">
              Loading view…
            </span>
          </div>
          <div className="space-y-2">
            <div className="h-2.5 w-full rounded-full bg-[var(--apple-bg-tertiary)]" />
            <div className="h-2.5 w-2/3 rounded-full bg-[var(--apple-bg-tertiary)]" />
          </div>
        </div>
      );

    case 'empty-error-states':
      return (
        <div className="w-full max-w-[236px] rounded-[14px] border border-dashed border-[var(--apple-separator-strong)] bg-[var(--apple-surface-elevated)] px-4 py-4 text-center">
          <p className="text-[12.5px] font-semibold text-[var(--apple-label-primary)]">
            No matching results
          </p>
          <p className="mt-1 text-[11px] text-[var(--apple-label-tertiary)]">
            Clear active filters to restore items
          </p>
          <span className="apple-btn-tonal mt-2.5 inline-flex !min-h-[26px] !px-3 !py-0.5 !text-[10.5px]">
            Reset filters
          </span>
        </div>
      );

    /* ── G. Media & Interactive ──────────────────────────── */
    case 'audio-player-waveform':
      return (
        <div className="w-full max-w-[252px] rounded-[16px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-2.5 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--apple-blue-fill)] text-white shadow-xs">
              <Play size={11} strokeWidth={2} fill="currentColor" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <AudioWaveform
                profile={PREVIEW_WAVEFORM}
                progressRatio={0.44}
                isPlaying={false}
                isSpeaking={false}
                muted={false}
                volume={0.9}
                rate={1}
                speechPulseTick={0}
              />
            </div>
            <WaveformIcon size={13} strokeWidth={2} aria-hidden="true" className="shrink-0 text-[var(--apple-label-tertiary)]" />
          </div>
        </div>
      );

    case 'cassette-player':
      return (
        <div className="relative aspect-[1.58] w-full max-w-[186px] overflow-hidden rounded-[12px] border border-[#0B0A09] bg-[linear-gradient(165deg,#38332D_0%,#231F1B_55%,#141210_100%)] shadow-md">
          {/* Miniature cassette label */}
          <div className="absolute top-[11%] right-[8.5%] bottom-[26%] left-[8.5%] overflow-hidden rounded-[6px] bg-[#FAF8F6] px-2 pt-1.5 shadow-2xs">
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#9C4A2B]" />
                <span className="text-[7px] font-semibold tracking-tight text-[#181715]">
                  StallSync · 02
                </span>
              </div>
              <span className="rounded-full bg-[#181715] px-1.5 py-[1px] font-mono text-[6.5px] font-semibold text-[#FAF8F6]">
                1.25×
              </span>
            </div>

            {/* 3-Band Stripe + Twin Reels */}
            <div className="relative mt-2 grid h-[38%] grid-rows-3 gap-y-[1.5px]">
              <span className="bg-[#9C4A2B]" />
              <span className="bg-[#C88A4B]" />
              <span className="bg-[#54504A]" />
              <div className="absolute inset-x-[18%] -inset-y-[3px] flex items-center justify-between rounded-full bg-[#191816] px-2">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-[#FAF8F6]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#24201C]" />
                </span>
                <span className="h-1.5 flex-1 mx-1.5 rounded-full bg-white/15" />
                <span className="grid h-4 w-4 place-items-center rounded-full bg-[#FAF8F6]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#24201C]" />
                </span>
              </div>
            </div>

            {/* Miniature chapter scrubber */}
            <div className="mt-2 flex items-center gap-1.5">
              <div className="relative h-[3px] flex-1 rounded-full bg-black/15">
                <div className="h-full w-[42%] rounded-full bg-[#181715]" />
                <span className="absolute top-1/2 left-[42%] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#181715] bg-white" />
              </div>
            </div>
          </div>

          {/* Miniature v2 5-key trapezoid transport deck */}
          <div className="absolute right-[17%] bottom-[4%] left-[17%] flex h-[17%] items-center justify-center gap-1.5 rounded-t-[6px] bg-white/10 px-2">
            <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
            <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-white text-[#141210]">
              <Play size={6} strokeWidth={2.5} fill="currentColor" aria-hidden="true" />
            </span>
            <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--apple-blue)] shadow-[0_0_6px_rgba(0,113,227,0.75)]" />
          </div>
        </div>
      );

    case 'ipod-player':
      return (
        <div
          className="relative flex h-[126px] w-[76px] flex-col items-center justify-between rounded-[11px] border border-black/15 bg-[linear-gradient(155deg,#ffffff_0%,#f4f5f7_60%,#e6e7ec_100%)] p-[6px] shadow-[0_8px_18px_rgba(0,0,0,0.2),2px_3px_0_#b5b9c0]"
          style={{ transform: 'perspective(320px) rotateY(-8deg) rotateX(4deg)' }}
        >
          {/* Miniature backlit LCD */}
          <div className="flex h-[50px] w-full flex-col overflow-hidden rounded-[4px] border border-[#8d9299] bg-[#c5e0f5] text-[#0a3667]">
            <div className="flex h-[10px] items-center justify-between border-b border-[#0a3667]/60 px-1 text-[5.5px] font-bold">
              <span>▶</span>
              <span>iPod</span>
              <span className="h-[4px] w-[7px] rounded-[1px] bg-[#0a3667]" />
            </div>
            <div className="flex flex-1 flex-col gap-[2px] p-[2px]">
              <span className="rounded-[1px] bg-[#0a3667] px-1 py-[1px] text-[5px] font-semibold text-[#c5e0f5]">
                Music ›
              </span>
              <span className="px-1 text-[5px] font-medium">All Songs</span>
              <span className="px-1 text-[5px] font-medium opacity-75">Settings</span>
            </div>
          </div>

          {/* Miniature Click Wheel */}
          <div className="relative flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[linear-gradient(145deg,#ebebef,#d0d2d8)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.14)]">
            <span className="absolute top-[3px] text-[4.5px] font-bold tracking-wider text-[#666]">
              MENU
            </span>
            <span className="h-[19px] w-[19px] rounded-full border border-black/10 bg-[linear-gradient(145deg,#ffffff,#ededf0)] shadow-2xs" />
          </div>
        </div>
      );

    case 'interactive-book':
      return (
        <div className="relative flex items-center justify-center">
          {/* Miniature Fawn back book silhouette */}
          <div
            className="absolute -right-4 top-2 h-[108px] w-[80px] rounded-l-[3px] rounded-r-[9px] border border-black/10 bg-[linear-gradient(145deg,#d2b594_0%,#b89670_100%)] shadow-[0_8px_16px_rgba(0,0,0,0.16)]"
            style={{ transform: 'rotate(7deg)' }}
          >
            <div className="absolute inset-y-0 left-0 w-[6px] rounded-l-[3px] bg-black/15" />
          </div>
          {/* Miniature Deep Rich Brown front journal */}
          <div
            className="relative flex h-[116px] w-[86px] flex-col items-center justify-center rounded-l-[3px] rounded-r-[10px] border border-white/10 bg-[linear-gradient(145deg,#472b1c_0%,#2f1a10_60%,#1c0f09_100%)] p-2 shadow-[0_12px_24px_rgba(0,0,0,0.34),2px_2px_0_#f2ede4]"
            style={{ transform: 'perspective(360px) rotateY(-10deg) rotate(-3deg)' }}
          >
            <div className="absolute inset-y-0 left-0 w-[7px] rounded-l-[3px] bg-[linear-gradient(90deg,rgba(255,255,255,0.08),rgba(0,0,0,0.42),rgba(255,255,255,0.05))]" />
            <div className="flex h-[34px] w-[46px] -rotate-3 flex-col overflow-hidden rounded-[4px] border border-black/10 bg-[#fffdf9] shadow-xs">
              <span className="bg-[#ef5343] py-[2px] text-center text-[5px] font-bold tracking-wider text-white">
                HELLO
              </span>
              <span className="flex flex-1 items-center justify-center text-[8px] font-semibold text-[#1c1917]">
                Aarav
              </span>
            </div>
            <span className="mt-2.5 text-[5.5px] tracking-[0.06em] text-[#e0c080]/90">
              Field Notes
            </span>
          </div>
        </div>
      );

    case 'before-after-comparator':
      return (
        <div className="relative flex h-[102px] w-full max-w-[246px] overflow-hidden rounded-[14px] border border-[var(--apple-separator)] shadow-2xs">
          <div className="flex w-1/2 flex-col justify-between bg-[var(--apple-bg-tertiary)] p-2.5 text-left">
            <span className="h-2 w-10 rounded-full bg-[var(--apple-label-tertiary)]/35" />
            <span className="text-[10.5px] font-medium text-[var(--apple-label-secondary)]">
              Before
            </span>
          </div>
          <div className="flex w-1/2 flex-col justify-between bg-[var(--apple-surface-elevated)] p-2.5 text-right">
            <span className="ml-auto h-2 w-12 rounded-full bg-[var(--apple-blue-fill)]/60" />
            <span className="text-[10.5px] font-semibold text-[var(--apple-link)]">After</span>
          </div>
          <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-[var(--apple-blue-fill)]" />
          <span className="absolute top-1/2 left-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--apple-separator-strong)] bg-[var(--apple-surface-elevated)] text-[var(--apple-label-primary)] shadow-sm">
            <SlidersHorizontal size={11} strokeWidth={2} aria-hidden="true" />
          </span>
        </div>
      );

    case 'case-study-prototypes':
      return (
        <div className="w-full max-w-[248px] rounded-[14px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-3 shadow-2xs">
          <div className="flex items-center justify-between text-[10.5px] text-[var(--apple-label-tertiary)]">
            <span className="inline-flex items-center gap-1.5 font-medium text-[var(--apple-link)]">
              <Sparkles size={11} strokeWidth={2} aria-hidden="true" />
              <span>Interactive Study</span>
            </span>
            <span className="tabular-nums">Live sandbox</span>
          </div>
          <div className="mt-2.5 grid grid-cols-3 gap-2">
            <div className="flex h-11 items-center justify-center rounded-[8px] border border-[var(--apple-blue)]/35 bg-[var(--apple-blue)]/10 text-[10px] font-semibold text-[var(--apple-link)]">
              A1
            </div>
            <div className="flex h-11 items-center justify-center rounded-[8px] bg-[var(--apple-bg-tertiary)] text-[10px] text-[var(--apple-label-secondary)]">
              A2
            </div>
            <div className="flex h-11 items-center justify-center rounded-[8px] bg-[var(--apple-bg-tertiary)] text-[10px] text-[var(--apple-label-secondary)]">
              A3
            </div>
          </div>
        </div>
      );

    case 'architecture-diagrams':
      return (
        <div className="flex items-center gap-2 text-[11px] font-medium text-[var(--apple-label-primary)]">
          <span className="rounded-[9px] border border-[var(--apple-separator-strong)] bg-[var(--apple-surface-elevated)] px-3 py-2 shadow-2xs">
            Capture
          </span>
          <span className="text-[var(--apple-label-tertiary)]">→</span>
          <span className="rounded-[9px] border border-[var(--apple-blue)]/45 bg-[var(--apple-blue)]/10 px-3 py-2 font-semibold text-[var(--apple-link)]">
            Model
          </span>
          <span className="text-[var(--apple-label-tertiary)]">→</span>
          <span className="rounded-[9px] border border-[var(--apple-separator-strong)] bg-[var(--apple-surface-elevated)] px-3 py-2 shadow-2xs">
            Surface
          </span>
        </div>
      );

    case 'local-time-clock':
      return (
        <div className="rounded-[12px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-4 py-2.5 shadow-2xs">
          <LocalTimeClock variant="inline" />
        </div>
      );

    case 'reading-depth-switcher':
      return (
        <div className="flex flex-col items-center gap-2">
          <div className="apple-segmented">
            <span className="apple-segmented-item apple-pill-shadow !min-h-[30px] bg-[var(--apple-control-thumb)] px-3.5 text-[12px] text-[var(--apple-label-primary)]">
              2-Min Skim
            </span>
            <span className="apple-segmented-item !min-h-[30px] px-3.5 text-[12px] text-[var(--apple-label-secondary)]">
              Full Case Study
            </span>
          </div>
          <span className="text-[11px] text-[var(--apple-label-tertiary)]">
            Syncs chapters &amp; audio length
          </span>
        </div>
      );

    /* ── H. Editorial & Data ─────────────────────────────── */
    case 'section-headers-dividers':
      return (
        <div className="w-full max-w-[240px] space-y-1.5 text-left">
          <p className="text-[11px] font-medium text-[var(--apple-link)]">
            01 · Selected Work
          </p>
          <p className="font-display text-[17px] font-semibold tracking-[-0.02em] text-[var(--apple-label-primary)]">
            Calm product craft
          </p>
          <div className="h-px w-full bg-[var(--apple-separator)]" />
        </div>
      );

    case 'structured-tables-lists':
      return (
        <div className="w-full max-w-[244px] divide-y divide-[var(--apple-separator-subtle)] rounded-[13px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-3.5 text-[11.5px] shadow-2xs">
          {[
            ['Semantic Tokens', '25'],
            ['Production Components', '40'],
            ['Route Templates', '6'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-2">
              <span className="text-[var(--apple-label-secondary)]">{k}</span>
              <span className="font-mono font-semibold tabular-nums text-[var(--apple-label-primary)]">
                {v}
              </span>
            </div>
          ))}
        </div>
      );

    case 'practice-timeline':
      return (
        <div className="w-full max-w-[235px] space-y-2.5 text-[11.5px]">
          {[
            ['2025–Now', 'Independent Practice'],
            ['2022–2025', 'Senior Product Designer'],
            ['2020–2022', 'Systems & UX Designer'],
          ].map(([yr, role], idx) => (
            <div key={yr} className="flex items-baseline gap-3">
              <span className="w-16 shrink-0 font-mono text-[10.5px] tabular-nums text-[var(--apple-link)]">
                {yr}
              </span>
              <span
                className={
                  idx === 0
                    ? 'font-semibold text-[var(--apple-label-primary)]'
                    : 'text-[var(--apple-label-secondary)]'
                }
              >
                {role}
              </span>
            </div>
          ))}
        </div>
      );

    case 'verified-metrics-callouts':
      return (
        <div className="flex items-center gap-6 text-center">
          <div>
            <p className="font-display text-[24px] font-semibold tracking-[-0.03em] tabular-nums text-[var(--apple-label-primary)]">
              38%
            </p>
            <p className="text-[11px] text-[var(--apple-label-tertiary)]">Faster triage</p>
          </div>
          <div className="h-9 w-px bg-[var(--apple-separator)]" />
          <div>
            <p className="font-display text-[24px] font-semibold tracking-[-0.03em] tabular-nums text-[var(--apple-label-primary)]">
              4.8:1
            </p>
            <p className="text-[11px] text-[var(--apple-label-tertiary)]">AA contrast</p>
          </div>
        </div>
      );

    case 'pull-quote-callout':
      return (
        <div className="w-full max-w-[244px] rounded-[14px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-3.5 text-left shadow-2xs">
          <p className="text-[12px] font-medium leading-[1.48] text-[var(--apple-label-primary)]">
            “Hierarchy should come from space and typography before adding another surface.”
          </p>
        </div>
      );

    default:
      return (
        <div className="flex items-center gap-2 text-[12px] text-[var(--apple-label-secondary)]">
          <Copy size={14} strokeWidth={1.75} aria-hidden="true" />
          <Sparkles size={14} strokeWidth={1.75} aria-hidden="true" />
        </div>
      );
  }
}
