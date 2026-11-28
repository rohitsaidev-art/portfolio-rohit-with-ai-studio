import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { PROJECTS, type PrototypeKind } from '../../data/projects';
import { EXPERIMENTS } from '../../data/site';
import { SPRING_SEGMENT } from '../../utils/motion';
import { buildWaveformProfile, type NarrationSegment } from '../../utils/readAloud';
import { playSuccessChime, playTick } from '../../utils/soundEngine';
import { showToast } from '../../utils/toast';
import { AudioPlayer } from '../AudioPlayer';
import { AudioWaveform, MiniAudioEqualizer } from '../AudioWaveform';
import { BeforeAfterComparator } from '../BeforeAfterComparator';
import { CaseStudyDiagram } from '../CaseStudyDiagrams';
import { CaseStudyPrototype } from '../CaseStudyPrototypes';
import {
  CASSETTE_THEMES,
  CassettePlayer,
  type CassetteChapter,
  type CassettePlayerVariant,
} from '../CassettePlayer';
import {
  CASSETTE_DEMO_TRACKS,
  STALLSYNC_CASSETTE_CHAPTERS,
  getSynthesizedTrackUrl,
} from '../../utils/cassetteSynthAudio';
import {
  IPodPlayer,
  type IPodSize,
  type IPodTheme,
} from '../IPodPlayer';
import {
  IPodClassicV2,
  type IPodWheelCaptureMode,
} from '../ipod/IPodClassicV2';
import type { IPodMetalFinish } from '../ipod/IPodWebGLShell';
import { InteractiveBookSpecimen } from './InteractiveBookSpecimen';
import { ColophonDrawer } from '../ColophonDrawer';
import { Lightbox, type LightboxImage } from '../Lightbox';
import { LocalTimeClock } from '../LocalTimeClock';
import { ReaderComfortPopover } from '../ReaderComfortPopover';
import {
  AlertTriangle,
  AudioWaveform as WaveformIcon,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Headphones,
  Info,
  List,
  Maximize2,
  RotateCcw,
  X,
} from 'lucide-react';
import type { SpecimenRenderProps } from './ComponentSpecimensPrimary';

const SAMPLE_NARRATION: NarrationSegment[] = [
  {
    id: 'lib-seg-1',
    num: '01',
    title: 'Overview',
    text: 'StallSync coordinates physical floor allocation with shared role-aware geometry.',
  },
  {
    id: 'lib-seg-2',
    num: '02',
    title: 'The Challenge',
    text: 'Static spreadsheets and floor plan PDFs broke down whenever booth assignments changed mid-setup.',
  },
  {
    id: 'lib-seg-3',
    num: '03',
    title: 'Understanding',
    text: 'Organizers and vendors inspect the same booth grid with tailored action affordances.',
  },
  {
    id: 'lib-seg-4',
    num: '04',
    title: 'Design Approach',
    text: 'A calm spatial booking workspace anchors availability, power specs, and load-in windows to each stall.',
  },
  {
    id: 'lib-seg-5',
    num: '05',
    title: 'Exploration',
    text: 'Iterative floor-plan density studies balanced legibility across desktop planning and mobile check-in.',
  },
  {
    id: 'lib-seg-6',
    num: '06',
    title: 'The Solution',
    text: 'Real-time allocation state keeps both sides synchronized without manual messaging threads.',
  },
];

function ControlBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--apple-separator-subtle)] pb-4">
      {children}
    </div>
  );
}

function MiniChoiceGroup<T extends string>({
  ariaLabel,
  value,
  onChange,
  options,
}: {
  ariaLabel: string;
  value: T;
  onChange: (next: T) => void;
  options: readonly { id: T; label: string }[];
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="apple-segmented !p-0.5">
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            aria-pressed={active}
            onClick={() => {
              if (!active) {
                playTick();
                onChange(opt.id);
              }
            }}
            className={`apple-segmented-item !min-h-[30px] px-2.5 py-0.5 text-[12px] ${
              active
                ? 'apple-pill-shadow bg-[var(--apple-control-thumb)] text-[var(--apple-label-primary)]'
                : 'text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ==========================================================================
   E1. Slide-Over Drawers (Real ColophonDrawer)
   ========================================================================== */
function SlideOverDrawersSpecimen() {
  const [colophonOpen, setColophonOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="apple-surface-subtle max-w-[480px] rounded-[20px] p-5">
        <p className="type-caption text-[var(--apple-link)]">ColophonDrawer</p>
        <p className="type-headline mt-1.5">Craft Colophon</p>
        <p className="type-footnote mt-1 font-normal text-[var(--apple-label-secondary)]">
          520px editorial slide-over drawer documenting approved production typography, elevation, motion, and sound specs with keyboard focus trap.
        </p>
        <button
          type="button"
          onClick={() => {
            playTick();
            setColophonOpen(true);
          }}
          className="apple-btn-primary mt-4 !min-h-[38px] !px-4 !text-[13.5px]"
        >
          Launch ColophonDrawer
        </button>
      </div>

      <ColophonDrawer
        open={colophonOpen}
        onClose={() => setColophonOpen(false)}
      />
    </div>
  );
}

/* ==========================================================================
   E2. Full-Screen Lightbox Dialog (Real Production Component)
   ========================================================================== */
function LightboxSpecimen() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const gallery: LightboxImage[] = useMemo(
    () =>
      PROJECTS.slice(0, 3).map((p) => ({
        src: p.coverImage,
        alt: p.coverAlt,
        caption: `${p.title} — ${p.shortDescription}`,
      })),
    [],
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {gallery.map((img, idx) => (
          <button
            key={img.src}
            type="button"
            onClick={() => {
              playTick();
              setActiveIndex(idx);
            }}
            aria-label={`Open ${PROJECTS[idx].title} in full-screen Lightbox`}
            className="apple-card group overflow-hidden rounded-[20px] text-left"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-[var(--apple-bg-secondary)]">
              <img
                src={img.src}
                alt={img.alt}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <span className="apple-ios-bar absolute bottom-2.5 right-2.5 inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--apple-label-primary)]">
                <Maximize2 size={13} strokeWidth={2} aria-hidden="true" />
              </span>
            </div>
            <div className="p-3.5">
              <p className="text-[13.5px] font-semibold text-[var(--apple-label-primary)]">
                {PROJECTS[idx].title}
              </p>
              <p className="type-caption mt-0.5 font-normal text-[var(--apple-label-tertiary)]">
                Click to inspect (1×–2.5× zoom)
              </p>
            </div>
          </button>
        ))}
      </div>

      <Lightbox
        images={gallery}
        activeIndex={activeIndex}
        onClose={() => setActiveIndex(null)}
        onSelectIndex={setActiveIndex}
      />
    </div>
  );
}

/* ==========================================================================
   E3. Zero-Jank Disclosure Accordion (Real HomePage Pattern + EXPERIMENTS)
   ========================================================================== */
function DisclosureAccordionSpecimen() {
  const [expandedId, setExpandedId] = useState<string | null>(
    EXPERIMENTS[0]?.id ?? null,
  );

  return (
    <div className="divide-y divide-[var(--apple-separator-subtle)] overflow-hidden rounded-[24px] bg-[var(--apple-surface-elevated)] px-5 shadow-[var(--shadow-apple-subtle)] sm:px-7">
      {EXPERIMENTS.slice(0, 3).map((exp) => {
        const isOpen = expandedId === exp.id;
        const triggerId = `lib-acc-trigger-${exp.id}`;
        const panelId = `lib-acc-panel-${exp.id}`;
        return (
          <div key={exp.id}>
            <button
              id={triggerId}
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => {
                playTick();
                setExpandedId(isOpen ? null : exp.id);
              }}
              className="group flex w-full items-start justify-between gap-4 py-5 text-left"
            >
              <div className="min-w-0 flex-1">
                <p className="type-caption text-[var(--apple-label-tertiary)]">
                  <span className="tabular-nums">{exp.year}</span> · {exp.discipline}
                </p>
                <p className="type-headline mt-1.5 transition-colors group-hover:text-[var(--apple-link)]">
                  {exp.title}
                </p>
                <p className="type-footnote mt-1 font-normal text-[var(--apple-label-secondary)]">
                  {exp.summary}
                </p>
              </div>
              <span
                aria-hidden="true"
                className="apple-surface-subtle mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              >
                <ChevronDown
                  size={14}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className={`transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isOpen
                      ? 'rotate-180 text-[var(--apple-blue)]'
                      : 'text-[var(--apple-label-secondary)]'
                  }`}
                />
              </span>
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              hidden={!isOpen}
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <div className="measure-prose pb-5 pr-8">
                  <p className="type-callout text-[var(--apple-label-primary)]">
                    {exp.notes}
                  </p>
                  <p className="type-footnote mt-2.5 text-[var(--apple-label-tertiary)]">
                    Built with: {exp.stack}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ==========================================================================
   E4. Mobile Reading Bar & Chapter Bottom Sheet Specimen
   ========================================================================== */
function MobileBottomSheetSpecimen() {
  const CHAPTERS = [
    { id: '01', num: '01', label: 'Overview' },
    { id: '02', num: '02', label: 'Problem & Constraints' },
    { id: '03', num: '03', label: 'Spatial Architecture' },
    { id: '04', num: '04', label: 'Outcomes' },
  ] as const;

  const [sheetOpen, setSheetOpen] = useState(true);
  const [activeId, setActiveId] = useState<string>('03');
  const [audioPlaying, setAudioPlaying] = useState(false);

  const current = CHAPTERS.find((c) => c.id === activeId) ?? CHAPTERS[0];
  const pct = activeId === '01' ? 18 : activeId === '02' ? 42 : activeId === '03' ? 74 : 96;

  return (
    <div>
      <ControlBar>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={sheetOpen}
            onClick={() => {
              playTick();
              setSheetOpen((prev) => !prev);
            }}
            className="apple-link rounded-[8px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-2.5 py-1 text-[12px] font-medium text-[var(--apple-label-primary)]"
          >
            Bottom Sheet: {sheetOpen ? 'Expanded' : 'Collapsed'}
          </button>
          <button
            type="button"
            aria-pressed={audioPlaying}
            onClick={() => {
              playTick();
              setAudioPlaying((prev) => !prev);
            }}
            className="apple-link rounded-[8px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-2.5 py-1 text-[12px] font-medium text-[var(--apple-label-primary)]"
          >
            Audio State: {audioPlaying ? 'Listening' : 'Idle'}
          </button>
        </div>
      </ControlBar>

      {/* Embedded 375px Mobile Frame Simulation */}
      <div className="mx-auto max-w-[375px] overflow-hidden rounded-[28px] border border-[var(--apple-separator)] bg-[var(--apple-bg)] p-3 shadow-[var(--shadow-apple-subtle)]">
        <div className="space-y-3">
          {sheetOpen && (
            <div className="apple-modal rounded-[22px] bg-[var(--apple-surface-elevated)] p-4">
              <div className="flex items-center justify-between border-b border-[var(--apple-separator-subtle)] pb-2.5">
                <div>
                  <p className="type-caption text-[var(--apple-label-tertiary)]">
                    Jump to Chapter
                  </p>
                  <p className="type-footnote mt-0.5 tabular-nums font-normal text-[var(--apple-label-secondary)]">
                    {pct}% read · {CHAPTERS.length} sections
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playTick();
                    setSheetOpen(false);
                  }}
                  aria-label="Close specimen chapter sheet"
                  className="apple-btn-icon h-9 w-9 bg-[var(--apple-control-tonal)] text-[var(--apple-label-primary)]"
                >
                  <X size={13} strokeWidth={2} aria-hidden="true" />
                </button>
              </div>
              <div className="mt-2.5 space-y-1">
                {CHAPTERS.map((ch) => {
                  const active = ch.id === activeId;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => {
                        playTick();
                        setActiveId(ch.id);
                      }}
                      className={`flex min-h-[42px] w-full items-center justify-between rounded-[12px] px-3 text-left text-[13.5px] transition-colors ${
                        active
                          ? 'bg-[var(--apple-blue)]/10 font-semibold text-[var(--apple-link)]'
                          : 'text-[var(--apple-label-primary)] hover:bg-[var(--apple-bg-secondary)]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="type-caption tabular-nums opacity-70">{ch.num}</span>
                        <span>{ch.label}</span>
                      </span>
                      {active && audioPlaying && (
                        <WaveformIcon size={13} strokeWidth={2} aria-hidden="true" className="text-[var(--apple-link)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Compact Fixed Bottom Reading Bar Representation */}
          <div className="apple-ios-bar flex h-[52px] items-center justify-between gap-2 rounded-full px-2.5">
            <button
              type="button"
              aria-expanded={sheetOpen}
              onClick={() => {
                playTick();
                setSheetOpen((prev) => !prev);
              }}
              className="flex min-w-0 flex-1 items-center gap-2 rounded-full px-2 py-1 text-left"
            >
              <List size={15} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-[var(--apple-link)]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-semibold text-[var(--apple-label-primary)]">
                  {current.num} · {current.label}
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-[var(--apple-separator)]">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full rounded-full bg-[var(--apple-blue)]"
                    />
                  </div>
                  <span className="tabular-nums text-[10px] text-[var(--apple-label-tertiary)]">
                    {pct}%
                  </span>
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                playTick();
                setAudioPlaying((prev) => !prev);
              }}
              className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium ${
                audioPlaying
                  ? 'bg-[var(--apple-blue-fill)] text-white'
                  : 'bg-[var(--apple-control-tonal)] text-[var(--apple-label-primary)]'
              }`}
            >
              {audioPlaying ? (
                <WaveformIcon size={12} strokeWidth={2} aria-hidden="true" />
              ) : (
                <Headphones size={12} strokeWidth={2} aria-hidden="true" />
              )}
              <span>{audioPlaying ? 'Listening' : 'Listen'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   F1. Non-Stacking Toast Notification (Triggers Real Production ToastViewport)
   ========================================================================== */
function ToastSpecimen() {
  const [tone, setTone] = useState<'success' | 'info'>('success');

  return (
    <div>
      <ControlBar>
        <MiniChoiceGroup
          ariaLabel="Toast tone"
          value={tone}
          onChange={setTone}
          options={[
            { id: 'success', label: 'Success Tone' },
            { id: 'info', label: 'Info Tone' },
          ]}
        />
        <button
          type="button"
          onClick={() => {
            if (tone === 'success') playSuccessChime();
            else playTick();
            showToast({
              message:
                tone === 'success'
                  ? 'Copied email address'
                  : 'Switched to 2-Min Skim',
              tone,
            });
          }}
          className="apple-btn-primary !min-h-[34px] !px-4 !py-1 !text-[12.5px]"
        >
          Trigger Live ToastViewport
        </button>
      </ControlBar>

      {/* Inline Sandbox Specimen matching ToastViewport.tsx */}
      <div className="flex flex-col items-center gap-4 py-4">
        <div
          role="status"
          className="apple-ios-bar flex max-w-[420px] items-center gap-2.5 rounded-full py-2.5 pl-4 pr-2.5 text-[13.5px] font-medium tracking-[-0.01em] text-[var(--apple-label-primary)]"
        >
          {tone === 'success' ? (
            <CheckCircle2 size={16} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-[var(--apple-blue)]" />
          ) : (
            <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-[var(--apple-blue)]" />
          )}
          <span className="truncate">
            {tone === 'success'
              ? 'Copied email address'
              : 'Switched to 2-Min Skim'}
          </span>
          <button
            type="button"
            aria-label="Preview dismiss toast"
            onClick={() => playTick()}
            className="apple-btn-icon ml-0.5 h-7 w-7 shrink-0 text-[var(--apple-label-tertiary)] hover:text-[var(--apple-label-primary)]"
          >
            <X size={12} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
        <p className="type-caption font-normal text-[var(--apple-label-tertiary)]">
          Click &ldquo;Trigger Live ToastViewport&rdquo; above to fire the real bottom viewport (non-stacking).
        </p>
      </div>
    </div>
  );
}

/* ==========================================================================
   F2. Semantic Status Indicators & Inline Notices (Stage 2.5 AA Tokens)
   ========================================================================== */
function SemanticStatusSpecimen() {
  const [tone, setTone] = useState<'success' | 'warning' | 'info' | 'error'>('success');
  const [presentation, setPresentation] = useState<'inline' | 'banner'>('banner');

  const config = {
    success: {
      token: '--apple-success',
      title: 'WCAG 2.2 AA contrast verified',
      detail: 'All 100 surface-to-ink pairs across Cool/Warm and Light/Dark pass >= 4.5:1.',
      icon: CheckCircle2,
    },
    warning: {
      token: '--apple-warning',
      title: 'Unpublished draft note',
      detail: 'This essay carries noindex, nofollow metadata until explicitly marked published.',
      icon: AlertTriangle,
    },
    info: {
      token: '--apple-info',
      title: 'Isolated Studio sandbox active',
      detail: 'Cool Porcelain and Dark sandbox previews never mutate public portfolio pages.',
      icon: Info,
    },
    error: {
      token: '--apple-error',
      title: 'Please enter a valid email address',
      detail: 'Inline validation keeps your draft intact and moves focus to the first invalid input.',
      icon: AlertTriangle,
    },
  }[tone];

  const Icon = config.icon;

  return (
    <div>
      <ControlBar>
        <MiniChoiceGroup
          ariaLabel="Semantic status tone"
          value={tone}
          onChange={setTone}
          options={[
            { id: 'success', label: 'Success' },
            { id: 'warning', label: 'Warning' },
            { id: 'info', label: 'Info' },
            { id: 'error', label: 'Error' },
          ]}
        />
        <MiniChoiceGroup
          ariaLabel="Status layout style"
          value={presentation}
          onChange={setPresentation}
          options={[
            { id: 'banner', label: 'Inline Notice' },
            { id: 'inline', label: 'Compact Status Row' },
          ]}
        />
      </ControlBar>

      {presentation === 'inline' ? (
        <div className="space-y-3 rounded-[18px] bg-[var(--apple-surface-elevated)] p-5 shadow-[var(--shadow-apple-subtle)]">
          {(
            [
              { label: 'Resolved · Stage 2.5', color: 'var(--apple-success)', icon: Check },
              { label: 'Experimental · Not in public pages', color: 'var(--apple-warning)', icon: AlertTriangle },
              { label: 'Synced site-wide preference', color: 'var(--apple-info)', icon: Info },
              { label: 'Please enter at least 10 characters', color: 'var(--apple-error)', icon: AlertTriangle },
            ] as const
          ).map((row) => {
            const RowIcon = row.icon;
            return (
              <p
                key={row.label}
                style={{ color: row.color }}
                className="flex items-center gap-2 text-[13.5px] font-medium"
              >
                <RowIcon size={14} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
                <span>{row.label}</span>
              </p>
            );
          })}
        </div>
      ) : (
        <div
          role={tone === 'error' ? 'alert' : 'status'}
          style={{
            borderColor: `color-mix(in srgb, var(${config.token}) 28%, transparent)`,
            backgroundColor: `color-mix(in srgb, var(${config.token}) 7%, var(--apple-surface-elevated))`,
          }}
          className="flex items-start gap-3 rounded-[18px] border p-5"
        >
          <span style={{ color: `var(${config.token})` }} className="mt-0.5 shrink-0">
            <Icon size={17} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p
              style={{ color: `var(${config.token})` }}
              className="text-[14px] font-semibold tracking-[-0.012em]"
            >
              {config.title}
            </p>
            <p className="type-footnote mt-1 font-normal text-[var(--apple-label-secondary)]">
              {config.detail}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   F3. Loading Spinner & Skeleton Placeholders
   ========================================================================== */
function LoadingSkeletonSpecimen() {
  const [mode, setMode] = useState<'spinner' | 'skeleton'>('skeleton');
  const [busy, setBusy] = useState(false);

  const simulateAsync = () => {
    playTick();
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      playSuccessChime();
    }, 1100);
  };

  return (
    <div>
      <ControlBar>
        <MiniChoiceGroup
          ariaLabel="Loading indicator type"
          value={mode}
          onChange={setMode}
          options={[
            { id: 'skeleton', label: 'Structural Skeleton' },
            { id: 'spinner', label: 'Inline Spinner' },
          ]}
        />
        {mode === 'spinner' && (
          <button
            type="button"
            onClick={simulateAsync}
            disabled={busy}
            className="apple-link text-[12px] font-medium text-[var(--apple-link)] hover:underline"
          >
            {busy ? 'Simulating…' : 'Test 1.1s Async Action'}
          </button>
        )}
      </ControlBar>

      {mode === 'spinner' ? (
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={simulateAsync}
            aria-busy={busy}
            data-loading={busy ? 'true' : undefined}
            className="apple-btn-primary"
          >
            {busy && <span className="apple-spinner" aria-hidden="true" />}
            <span>{busy ? 'Preparing inquiry…' : 'Click to test loading'}</span>
          </button>

          <div
            aria-busy="true"
            className="apple-surface-subtle inline-flex items-center gap-2.5 rounded-full px-4 py-2.5 text-[13.5px] text-[var(--apple-label-secondary)]"
          >
            <span className="apple-spinner text-[var(--apple-blue)]" aria-hidden="true" />
            <span>Syncing floor reservations…</span>
          </div>
        </div>
      ) : (
        <div
          aria-busy="true"
          className="apple-surface-subtle rounded-[22px] p-6"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="h-4 w-28 animate-pulse rounded-full bg-[var(--apple-separator)]" />
            <div className="h-3.5 w-36 animate-pulse rounded-full bg-[var(--apple-separator-subtle)]" />
          </div>
          <div className="mt-4 h-6 w-2/3 animate-pulse rounded-full bg-[var(--apple-separator)]" />
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-[14px] bg-[var(--apple-bg-secondary)] p-3.5"
              >
                <div className="h-3.5 w-12 rounded-full bg-[var(--apple-separator)]" />
                <div className="mt-3 h-3 w-16 rounded-full bg-[var(--apple-separator-subtle)]" />
              </div>
            ))}
          </div>
          <p className="type-footnote mt-5 flex items-center gap-2 font-normal text-[var(--apple-label-tertiary)]">
            <span className="apple-spinner" aria-hidden="true" />
            <span>Evaluating policy citations and audit trail lineage…</span>
          </p>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   F4. Empty & Error Recovery States
   ========================================================================== */
function EmptyErrorStatesSpecimen() {
  const [stateType, setStateType] = useState<'empty' | 'error'>('empty');
  const [recovered, setRecovered] = useState(false);

  return (
    <div>
      <ControlBar>
        <MiniChoiceGroup
          ariaLabel="Recovery state type"
          value={stateType}
          onChange={(next) => {
            setStateType(next);
            setRecovered(false);
          }}
          options={[
            { id: 'empty', label: 'Empty State' },
            { id: 'error', label: 'Error Recovery' },
          ]}
        />
      </ControlBar>

      {recovered ? (
        <div className="apple-surface-subtle rounded-[22px] px-6 py-10 text-center">
          <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--apple-success)]/12 text-[var(--apple-success)]">
            <Check size={18} strokeWidth={1.75} aria-hidden="true" />
          </div>
          <h4 className="type-title-3 mt-3">State recovered cleanly</h4>
          <p className="type-callout mx-auto mt-1.5 max-w-[44ch]">
            Filters reset and live inventory restored without reloading the page.
          </p>
          <button
            type="button"
            onClick={() => {
              playTick();
              setRecovered(false);
            }}
            className="apple-btn-tonal mt-5 !min-h-[38px] !px-4 !text-[13.5px]"
          >
            Inspect {stateType} state again
          </button>
        </div>
      ) : stateType === 'empty' ? (
        <div className="apple-surface-subtle rounded-[22px] px-6 py-10 text-center">
          <div className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--apple-bg-secondary)] text-[var(--apple-label-secondary)]">
            <List size={18} strokeWidth={1.75} aria-hidden="true" />
          </div>
          <h4 className="type-title-3 mt-3">No matching case studies</h4>
          <p className="type-callout mx-auto mt-2 max-w-[44ch]">
            No published projects match your current discipline filter and search query.
          </p>
          <button
            type="button"
            onClick={() => {
              playSuccessChime();
              setRecovered(true);
            }}
            className="apple-btn-primary mt-5"
          >
            <RotateCcw size={14} strokeWidth={1.75} aria-hidden="true" />
            <span>Reset filters</span>
          </button>
        </div>
      ) : (
        <div
          role="alert"
          className="apple-surface-subtle rounded-[22px] border border-[var(--apple-error)]/25 px-6 py-10 text-center"
        >
          <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--apple-error)]/10 text-[var(--apple-error)]">
            <AlertTriangle size={18} strokeWidth={1.75} aria-hidden="true" />
          </div>
          <h4 className="type-title-3 mt-3">Floor-plan sync interrupted</h4>
          <p className="type-callout mx-auto mt-2 max-w-[46ch]">
            Live reservation locks could not be verified. Booth holds remain paused temporarily to prevent double-booking.
          </p>
          <button
            type="button"
            onClick={() => {
              playSuccessChime();
              setRecovered(true);
            }}
            className="apple-btn-primary mt-5"
          >
            <RotateCcw size={14} strokeWidth={1.75} aria-hidden="true" />
            <span>Retry floor sync</span>
          </button>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   G1. AudioPlayer & Visual Waveform Generator (Real Production Components)
   ========================================================================== */
function AudioPlayerSpecimen() {
  const [mode, setMode] = useState<'player' | 'contextual' | 'waveform'>('contextual');
  const [contextPreview, setContextPreview] = useState<'auto' | 'on-track' | 'out-of-context'>('out-of-context');
  const [pinFloating, setPinFloating] = useState(false);
  const [simPlaying, setSimPlaying] = useState(true);
  const [simMuted, setSimMuted] = useState(false);
  const [simProgress, setSimProgress] = useState(0.46);
  const [pulseTick, setPulseTick] = useState(1);

  const profile = useMemo(
    () => buildWaveformProfile(SAMPLE_NARRATION, 42),
    [],
  );

  return (
    <div>
      <ControlBar>
        <MiniChoiceGroup
          ariaLabel="Audio component iteration"
          value={mode}
          onChange={setMode}
          options={[
            { id: 'player', label: 'v1 · Editorial Player' },
            { id: 'contextual', label: 'v2 · Contextual Floating' },
            { id: 'waveform', label: 'Waveform & Equalizer' },
          ]}
        />
        {mode === 'contextual' && (
          <div className="flex flex-wrap items-center gap-2">
            <MiniChoiceGroup
              ariaLabel="Jump to speaker context state"
              value={contextPreview}
              onChange={setContextPreview}
              options={[
                { id: 'on-track', label: 'On-track' },
                { id: 'out-of-context', label: 'Out of context' },
                { id: 'auto', label: 'Live scroll' },
              ]}
            />
            <button
              type="button"
              aria-pressed={pinFloating}
              onClick={() => {
                playTick();
                setPinFloating((prev) => !prev);
              }}
              className="apple-link rounded-[8px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-2.5 py-1 text-[12px] font-medium text-[var(--apple-label-primary)]"
            >
              {pinFloating ? 'Pinned to Viewport' : 'Pin to Bottom'}
            </button>
          </div>
        )}
        {mode === 'waveform' && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              aria-pressed={simPlaying}
              onClick={() => {
                playTick();
                setSimPlaying((p) => !p);
              }}
              className="apple-link rounded-[8px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-2.5 py-1 text-[12px] font-medium text-[var(--apple-label-primary)]"
            >
              {simPlaying ? 'Pause Wave' : 'Play Wave'}
            </button>
            <button
              type="button"
              aria-pressed={simMuted}
              onClick={() => {
                playTick();
                setSimMuted((m) => !m);
              }}
              className="apple-link rounded-[8px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-2.5 py-1 text-[12px] font-medium text-[var(--apple-label-primary)]"
            >
              Muted: {simMuted ? 'On' : 'Off'}
            </button>
            <button
              type="button"
              onClick={() => {
                playTick();
                setPulseTick((t) => t + 1);
              }}
              className="apple-link text-[12px] font-medium text-[var(--apple-link)] hover:underline"
            >
              Pulse Word Cadence
            </button>
          </div>
        )}
      </ControlBar>

      {mode === 'player' ? (
        <AudioPlayer
          title="StallSync Case Study (Studio Preview)"
          segments={SAMPLE_NARRATION}
        />
      ) : mode === 'contextual' ? (
        <div className="flex flex-col items-center justify-center rounded-[20px] border border-[var(--apple-separator-subtle)] bg-[var(--apple-bg-secondary)]/60 px-4 py-12 sm:px-8">
          <div className="w-full max-w-[780px]">
            <AudioPlayer
              variant="contextual-floating"
              contextualDisplayMode={pinFloating ? 'floating' : 'inline'}
              forceOutOfContext={
                contextPreview === 'auto'
                  ? undefined
                  : contextPreview === 'out-of-context'
              }
              title="StallSync Case Study (Studio Preview)"
              segments={SAMPLE_NARRATION}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4 rounded-[20px] bg-[var(--apple-surface-elevated)] p-6 shadow-[var(--shadow-apple-subtle)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MiniAudioEqualizer active={simPlaying} muted={simMuted} />
              <span className="text-[13.5px] font-medium text-[var(--apple-label-primary)]">
                {simPlaying ? (simMuted ? 'Muted playback' : 'Listening · Chapter 02') : 'Paused'}
              </span>
            </div>
            <span className="tabular-nums font-mono text-[12px] text-[var(--apple-label-tertiary)]">
              {Math.round(simProgress * 100)}%
            </span>
          </div>
          <AudioWaveform
            profile={profile}
            progressRatio={simProgress}
            isPlaying={simPlaying}
            isSpeaking={simPlaying}
            muted={simMuted}
            volume={0.9}
            rate={1}
            speechPulseTick={pulseTick}
            onSeekRatio={(ratio) => {
              playTick();
              setSimProgress(ratio);
            }}
          />
          <p className="type-caption font-normal text-[var(--apple-label-tertiary)]">
            Click anywhere across the waveform bars to test live click-to-seek scrubbing.
          </p>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   G1b. CassettePlayer (v1 Classic & v2 Editorial Audio Deck)
   ========================================================================== */
const SPECIMEN_CASSETTE_THEMES = [
  CASSETTE_THEMES[2], // Warm Paper
  CASSETTE_THEMES[0], // Archive Classic
  CASSETTE_THEMES[3], // Braun Cream
  CASSETTE_THEMES[1], // Studio Crimson
  CASSETTE_THEMES[4], // Cobalt Slate
] as const;

function CassettePlayerSpecimen() {
  const [variant, setVariant] = useState<CassettePlayerVariant>('v2');
  const [contextState, setContextState] = useState<'on-track' | 'out-of-context'>(
    'out-of-context',
  );
  const [themeId, setThemeId] = useState<string>(SPECIMEN_CASSETTE_THEMES[0].id);
  const [activeChapter, setActiveChapter] = useState<CassetteChapter | null>(
    STALLSYNC_CASSETTE_CHAPTERS[0],
  );
  const [highlightedChapterId, setHighlightedChapterId] = useState<string | null>(
    null,
  );

  const selectedTheme = useMemo(
    () =>
      SPECIMEN_CASSETTE_THEMES.find((t) => t.id === themeId) ??
      SPECIMEN_CASSETTE_THEMES[0],
    [themeId],
  );

  const audioSrc = useMemo(
    () => getSynthesizedTrackUrl(CASSETTE_DEMO_TRACKS[0]),
    [],
  );

  const handleJumpToSpeaker = (chapter: CassetteChapter | null) => {
    const target = chapter ?? STALLSYNC_CASSETTE_CHAPTERS[0];
    setHighlightedChapterId(target.id);
    setContextState('on-track');
    showToast(`Jumped to ${target.num} · ${target.title}`);
    window.setTimeout(() => {
      setHighlightedChapterId((prev) => (prev === target.id ? null : prev));
    }, 1800);
  };

  return (
    <div>
      <ControlBar>
        <MiniChoiceGroup
          ariaLabel="CassettePlayer version"
          value={variant}
          onChange={setVariant}
          options={[
            { id: 'v2', label: 'v2 · Editorial Deck' },
            { id: 'v1', label: 'v1 · Classic Deck' },
          ]}
        />

        {variant === 'v2' && (
          <MiniChoiceGroup
            ariaLabel="Jump to speaker context state"
            value={contextState}
            onChange={setContextState}
            options={[
              { id: 'on-track', label: 'On-track' },
              { id: 'out-of-context', label: 'Out of context' },
            ]}
          />
        )}

        <div
          role="group"
          aria-label="Cassette material finish"
          className="flex flex-wrap items-center gap-1.5"
        >
          {SPECIMEN_CASSETTE_THEMES.map((theme) => {
            const selected = theme.id === selectedTheme.id;
            return (
              <button
                key={theme.id}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  if (!selected) {
                    playTick();
                    setThemeId(theme.id);
                  }
                }}
                className={`inline-flex min-h-[28px] cursor-pointer items-center gap-1.5 rounded-full border px-2.5 text-[11.5px] font-medium transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.97] ${
                  selected
                    ? 'border-[var(--apple-label-primary)] bg-[var(--apple-surface-elevated)] text-[var(--apple-label-primary)] shadow-2xs'
                    : 'border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)]/60 text-[var(--apple-label-secondary)] hover:border-[var(--apple-separator-strong)] hover:text-[var(--apple-label-primary)]'
                }`}
              >
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 rounded-full border border-black/15"
                  style={{ backgroundColor: theme.stripeOne }}
                />
                <span>{theme.name}</span>
              </button>
            );
          })}
        </div>
      </ControlBar>

      <div className="mx-auto max-w-[680px]">
        <CassettePlayer
          variant={variant}
          audioSrc={audioSrc}
          trackTitle="StallSync Case Study"
          archiveLabel="ARCHIVE · CASE AUDIO"
          sideLabel="SIDE A"
          catalogueNumber="202604"
          chapters={STALLSYNC_CASSETTE_CHAPTERS}
          isOutOfContext={variant === 'v2' && contextState === 'out-of-context'}
          onJumpToSpeaker={handleJumpToSpeaker}
          onActiveChapterChange={setActiveChapter}
          theme={selectedTheme}
          stageMode="themed"
        />

        {variant === 'v2' && (
          <div className="mt-4 rounded-[18px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--apple-label-tertiary)]">
                Synced Case Study Chapters
              </p>
              <p className="text-[12px] text-[var(--apple-label-secondary)]">
                Keys: <kbd className="rounded border border-[var(--apple-separator)] px-1 font-mono text-[11px]">J</kbd> −15s ·{' '}
                <kbd className="rounded border border-[var(--apple-separator)] px-1 font-mono text-[11px]">K</kbd> +15s ·{' '}
                <kbd className="rounded border border-[var(--apple-separator)] px-1 font-mono text-[11px]">M</kbd> Mute ·{' '}
                <kbd className="rounded border border-[var(--apple-separator)] px-1 font-mono text-[11px]">0</kbd> Rewind
              </p>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {STALLSYNC_CASSETTE_CHAPTERS.map((chap) => {
                const isActive = activeChapter?.id === chap.id;
                const isJumped = highlightedChapterId === chap.id;
                return (
                  <span
                    key={chap.id}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition-[background-color,border-color,color,box-shadow] duration-200 ${
                      isJumped
                        ? 'border-[var(--apple-blue)] bg-[var(--apple-blue)]/14 text-[var(--apple-blue)] shadow-[0_0_0_2px_rgba(0,113,227,0.18)]'
                        : isActive
                          ? 'border-[var(--apple-separator-strong)] bg-[var(--apple-bg-secondary)] text-[var(--apple-label-primary)]'
                          : 'border-transparent bg-transparent text-[var(--apple-label-tertiary)]'
                    }`}
                  >
                    <span className="font-mono text-[10.5px] opacity-75">{chap.num}</span>
                    <span>{chap.title}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   G1c. IPodPlayer (v2 Classic WebGL + v1 2001 Original)
   ========================================================================== */
function IPodPlayerSpecimen() {
  const [version, setVersion] = useState<'v2' | 'v1'>('v2');
  const [metalFinish, setMetalFinish] = useState<IPodMetalFinish>('silver');
  const [wheelMode, setWheelMode] = useState<IPodWheelCaptureMode>('hold');
  const [theme, setTheme] = useState<IPodTheme>('classic');
  const [size, setSize] = useState<IPodSize>('default');
  const [enable3dTilt, setEnable3dTilt] = useState<boolean>(true);

  return (
    <div>
      <ControlBar>
        <MiniChoiceGroup
          ariaLabel="iPod version"
          value={version}
          onChange={setVersion}
          options={[
            { id: 'v2', label: 'v2 · Classic WebGL' },
            { id: 'v1', label: 'v1 · 2001 Original' },
          ]}
        />

        {version === 'v2' ? (
          <>
            <MiniChoiceGroup
              ariaLabel="iPod metal finish"
              value={metalFinish}
              onChange={setMetalFinish}
              options={[
                { id: 'silver', label: 'Silver' },
                { id: 'graphite', label: 'Graphite' },
                { id: 'champagne', label: 'Champagne' },
              ]}
            />

            <MiniChoiceGroup
              ariaLabel="Mouse wheel capture"
              value={wheelMode}
              onChange={setWheelMode}
              options={[
                { id: 'hold', label: 'Wheel: Hold iPod' },
                { id: 'always', label: 'Wheel: Always' },
              ]}
            />
          </>
        ) : (
          <>
            <MiniChoiceGroup
              ariaLabel="iPod finish"
              value={theme}
              onChange={setTheme}
              options={[
                { id: 'classic', label: 'Classic White' },
                { id: 'black', label: 'Matte Black' },
                { id: 'u2', label: 'U2 Edition' },
              ]}
            />

            <MiniChoiceGroup
              ariaLabel="iPod scale"
              value={size}
              onChange={setSize}
              options={[
                { id: 'default', label: '100%' },
                { id: 'medium', label: '118%' },
                { id: 'large', label: '132%' },
              ]}
            />
          </>
        )}

        <button
          type="button"
          aria-pressed={enable3dTilt}
          onClick={() => {
            playTick();
            setEnable3dTilt((prev) => !prev);
          }}
          className="apple-link cursor-pointer rounded-[8px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-2.5 py-1 text-[12px] font-medium text-[var(--apple-label-primary)]"
        >
          3D Tilt: {enable3dTilt ? 'On' : 'Off'}
        </button>
      </ControlBar>

      <div className="rounded-[22px] border border-[var(--apple-separator-subtle)] bg-[var(--apple-bg-secondary)]/60 px-4 py-5">
        {version === 'v2' ? (
          <>
            <IPodClassicV2
              finish={metalFinish}
              wheelCaptureMode={wheelMode}
              enable3dTilt={enable3dTilt}
              ownerName="Rohit"
            />
            <p className="mt-2 text-center text-[12px] text-[var(--apple-label-tertiary)]">
              38px brushed-metal WebGL shell · Drag the Click Wheel to browse Cover Flow, Synced Lyrics, Brick, Music Quiz &amp; Add Song (+)
            </p>
          </>
        ) : (
          <>
            <IPodPlayer
              theme={theme}
              size={size}
              ownerName="Rohit"
              enable3dTilt={enable3dTilt}
              instantBoot
            />
            <p className="mt-1 text-center text-[12px] text-[var(--apple-label-tertiary)]">
              Move cursor to tilt in 3D · Drag around the Click Wheel to scroll or scrub ±5s · Click any song to play
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   G2. Before / After Comparator (Real Production Component)
   ========================================================================== */
function BeforeAfterSpecimen() {
  return (
    <div className="space-y-3">
      <BeforeAfterComparator
        beforeSrc={PROJECTS[0].coverImage}
        beforeAlt={PROJECTS[0].coverAlt}
        beforeLabel="Specimen A · StallSync"
        afterSrc={PROJECTS[4].coverImage}
        afterAlt={PROJECTS[4].coverAlt}
        afterLabel="Specimen B · HubApps"
        initialPosition={50}
        caption="Interactive mechanic preview only — drag handle or use Left/Right/Home/End arrow keys. Public case studies render BeforeAfterComparator strictly when genuine matched before/after assets exist."
      />
    </div>
  );
}

/* ==========================================================================
   G3. Interactive Case Study Prototypes (Real Production Component)
   ========================================================================== */
function CaseStudyPrototypesSpecimen() {
  const [kind, setKind] = useState<PrototypeKind>('stallsync');

  return (
    <div>
      <ControlBar>
        <MiniChoiceGroup
          ariaLabel="Select production prototype"
          value={kind}
          onChange={setKind}
          options={[
            { id: 'stallsync', label: 'StallSync' },
            { id: 'precognition-labs', label: 'Precognition' },
            { id: 'hubapps', label: 'HubApps' },
            { id: 'music-discovery-pwa', label: 'Music PWA' },
          ]}
        />
      </ControlBar>
      <CaseStudyPrototype kind={kind} />
    </div>
  );
}

/* ==========================================================================
   G4. Responsive SVG Architecture Diagrams (Real Production Component)
   ========================================================================== */
function ArchitectureDiagramsSpecimen() {
  const [kind, setKind] = useState<'stallsync' | 'precognition-labs' | 'hubapps'>('stallsync');

  return (
    <div>
      <ControlBar>
        <MiniChoiceGroup
          ariaLabel="Select production SVG diagram"
          value={kind}
          onChange={setKind}
          options={[
            { id: 'stallsync', label: 'StallSync Flow' },
            { id: 'precognition-labs', label: 'Precognition Pipeline' },
            { id: 'hubapps', label: 'HubApps Tokens' },
          ]}
        />
      </ControlBar>
      <div className="[&>div]:!mt-0">
        <CaseStudyDiagram kind={kind} />
      </div>
    </div>
  );
}

/* ==========================================================================
   G5. Local Time Clock Specimen (Real Production Component)
   ========================================================================== */
function LocalTimeClockSpecimen() {
  const [variant, setVariant] = useState<'card' | 'inline'>('card');

  return (
    <div>
      <ControlBar>
        <MiniChoiceGroup
          ariaLabel="LocalTimeClock variant"
          value={variant}
          onChange={setVariant}
          options={[
            { id: 'card', label: 'Card (ContactPage)' },
            { id: 'inline', label: 'Inline (AboutPage)' },
          ]}
        />
      </ControlBar>
      <div className="max-w-[440px] rounded-[20px] bg-[var(--apple-surface-elevated)] p-6 shadow-[var(--shadow-apple-subtle)]">
        <div className={variant === 'card' ? '[&>div]:!mt-0' : ''}>
          <LocalTimeClock variant={variant} />
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   G6. Reading Depth Header & Gallery Figure Specimen
   ========================================================================== */
function ReadingDepthSpecimen() {
  const [depth, setDepth] = useState<'skim' | 'full'>('full');
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const project = PROJECTS[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] bg-[var(--apple-surface-elevated)] p-5 shadow-[var(--shadow-apple-subtle)]">
        <div
          role="group"
          aria-label="Specimen reading depth"
          className="apple-segmented !p-0.5"
        >
          {(
            [
              { id: 'skim', label: '2-Min Skim' },
              { id: 'full', label: 'Full Story' },
            ] as const
          ).map((opt) => {
            const active = depth === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  if (!active) {
                    playTick();
                    setDepth(opt.id);
                  }
                }}
                className={`apple-segmented-item !min-h-[32px] px-3.5 py-1 text-[12.5px] ${
                  active
                    ? 'text-[var(--apple-label-primary)]'
                    : 'text-[var(--apple-label-secondary)]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="lib-reading-depth-thumb"
                    transition={SPRING_SEGMENT}
                    className="apple-pill-shadow absolute inset-0 rounded-full bg-[var(--apple-control-thumb)]"
                  />
                )}
                <span className="relative z-10">{opt.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <ReaderComfortPopover align="right" />
        </div>
      </div>

      <figure className="space-y-2.5">
        <button
          type="button"
          onClick={() => {
            playTick();
            setLightboxIdx(0);
          }}
          aria-label={`Inspect ${project.title} cover full screen`}
          className="apple-card-static group relative block w-full overflow-hidden rounded-[22px] text-left"
        >
          <div className="aspect-[16/9] overflow-hidden bg-[var(--apple-bg-secondary)]">
            <img
              src={project.coverImage}
              alt={project.coverAlt}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
            />
          </div>
          <span className="apple-ios-bar absolute bottom-3.5 right-3.5 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium text-[var(--apple-label-primary)]">
            <Maximize2 size={12} strokeWidth={2} aria-hidden="true" />
            <span>Inspect</span>
          </span>
        </button>
        <figcaption className="type-footnote font-normal text-[var(--apple-label-tertiary)]">
          Active depth: <strong className="text-[var(--apple-label-primary)]">{depth === 'skim' ? '2-Min Skim (Executive Summary)' : 'Full Story (Complete Chapters)'}</strong> — click figure to launch real Lightbox.
        </figcaption>
      </figure>

      <Lightbox
        images={[{ src: project.coverImage, alt: project.coverAlt, caption: project.shortDescription }]}
        activeIndex={lightboxIdx}
        onClose={() => setLightboxIdx(null)}
        onSelectIndex={setLightboxIdx}
      />
    </div>
  );
}

/* ==========================================================================
   H1. Section Headers & Hairline Dividers
   ========================================================================== */
function SectionHeadersSpecimen() {
  const [align, setAlign] = useState<'left' | 'center'>('left');
  const [dividerTier, setDividerTier] = useState<'subtle' | 'default' | 'strong'>('default');

  const dividerVar =
    dividerTier === 'subtle'
      ? 'var(--apple-separator-subtle)'
      : dividerTier === 'strong'
        ? 'var(--apple-separator-strong)'
        : 'var(--apple-separator)';

  return (
    <div>
      <ControlBar>
        <MiniChoiceGroup
          ariaLabel="Header alignment"
          value={align}
          onChange={setAlign}
          options={[
            { id: 'left', label: 'Left Editorial' },
            { id: 'center', label: 'Centered Hero' },
          ]}
        />
        <MiniChoiceGroup
          ariaLabel="Hairline divider tier"
          value={dividerTier}
          onChange={setDividerTier}
          options={[
            { id: 'subtle', label: 'Subtle (6%)' },
            { id: 'default', label: 'Default (8%)' },
            { id: 'strong', label: 'Strong (14%)' },
          ]}
        />
      </ControlBar>

      <div className="rounded-[20px] bg-[var(--apple-bg)] p-6 border border-[var(--apple-separator-subtle)]">
        <div className={align === 'center' ? 'text-center' : ''}>
          <p className="type-eyebrow text-[var(--apple-link)]">
            Selected Work · 6 Case Studies
          </p>
          <h3
            className={`type-title-2 measure-title mt-2 ${
              align === 'center' ? 'mx-auto' : ''
            }`}
          >
            Recent product and interaction studies.
          </h3>
          <p
            className={`type-lead measure-lead mt-3 ${
              align === 'center' ? 'mx-auto' : ''
            }`}
          >
            Disciplined optical sizing and constrained measures establish clear reading hierarchy without decorative framing.
          </p>
        </div>

        <hr
          style={{ borderColor: dividerVar }}
          className="my-7 border-0 border-t"
        />

        <p className="type-footnote font-mono text-[12px] text-[var(--apple-label-tertiary)]">
          Active divider token: {dividerVar}
        </p>
      </div>
    </div>
  );
}

/* ==========================================================================
   H2. Structured Tables & Editorial Lists
   ========================================================================== */
function TablesListsSpecimen() {
  const [density, setDensity] = useState<'compact' | 'balanced' | 'spacious'>('balanced');

  const pad =
    density === 'compact' ? 'py-2.5' : density === 'spacious' ? 'py-4.5' : 'py-3.5';

  const ROWS = [
    { token: '--apple-bg', light: '#FAF8F6', dark: '#11100E', ratio: '16.5:1' },
    { token: '--apple-label-secondary', light: '#57534E', dark: '#A8A29A', ratio: '7.1:1' },
    { token: '--apple-link', light: '#1D56C9', dark: '#689BFF', ratio: '6.3:1' },
    { token: '--apple-success', light: '#1B7A38', dark: '#32D74B', ratio: '5.1:1' },
  ];

  return (
    <div>
      <ControlBar>
        <MiniChoiceGroup
          ariaLabel="Table row density"
          value={density}
          onChange={setDensity}
          options={[
            { id: 'compact', label: 'Compact' },
            { id: 'balanced', label: 'Balanced' },
            { id: 'spacious', label: 'Spacious' },
          ]}
        />
      </ControlBar>

      <div className="apple-surface-subtle overflow-x-auto rounded-[20px]">
        <table className="w-full min-w-[480px] border-collapse text-left">
          <thead>
            <tr className="type-caption border-b border-[var(--apple-separator)] text-[var(--apple-label-tertiary)]">
              <th scope="col" className="px-5 py-3">Token</th>
              <th scope="col" className="px-5 py-3">Light</th>
              <th scope="col" className="px-5 py-3">Dark</th>
              <th scope="col" className="px-5 py-3 text-right">AA Ratio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--apple-separator-subtle)] text-[13.5px]">
            {ROWS.map((row) => (
              <tr key={row.token} className="transition-colors hover:bg-[var(--apple-bg-secondary)]/60">
                <td className={`px-5 font-mono text-[12.5px] font-medium text-[var(--apple-label-primary)] ${pad}`}>
                  {row.token}
                </td>
                <td className={`px-5 font-mono text-[12.5px] text-[var(--apple-label-secondary)] ${pad}`}>
                  {row.light}
                </td>
                <td className={`px-5 font-mono text-[12.5px] text-[var(--apple-label-secondary)] ${pad}`}>
                  {row.dark}
                </td>
                <td className={`px-5 text-right tabular-nums font-semibold text-[var(--apple-success)] ${pad}`}>
                  {row.ratio}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ==========================================================================
   H3. Practice & Chronology Timeline (Real PROJECTS Data)
   ========================================================================== */
function PracticeTimelineSpecimen({
  onPreviewNavigate,
}: {
  onPreviewNavigate: (path: string) => void;
}) {
  const byYear = useMemo(() => {
    const map = new Map<string, typeof PROJECTS>();
    for (const project of PROJECTS.slice(0, 4)) {
      const list = map.get(project.year) ?? [];
      list.push(project);
      map.set(project.year, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => Number(b) - Number(a));
  }, []);

  return (
    <div className="space-y-6 rounded-[20px] bg-[var(--apple-bg)] p-6 border border-[var(--apple-separator-subtle)]">
      {byYear.map(([year, items]) => (
        <div key={year} className="border-t border-[var(--apple-separator)] pt-5 first:border-t-0 first:pt-0">
          <p className="type-title-3 tabular-nums text-[var(--apple-link)]">{year}</p>
          <ol className="mt-3 divide-y divide-[var(--apple-separator-subtle)]">
            {items.map((project) => (
              <li
                key={project.slug}
                className="flex flex-col gap-1.5 py-3.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
              >
                <div className="min-w-0">
                  <a
                    href={`/work/${project.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onPreviewNavigate(`/work/${project.slug}`);
                    }}
                    className="apple-link group inline-flex items-center gap-1 text-[15.5px] font-semibold text-[var(--apple-label-primary)] hover:text-[var(--apple-link)]"
                  >
                    <span>{project.title}</span>
                    <ChevronRight
                      size={13}
                      strokeWidth={2}
                      aria-hidden="true"
                      className="text-[var(--apple-label-tertiary)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--apple-link)]"
                    />
                  </a>
                  <p className="type-footnote mt-0.5 font-normal text-[var(--apple-label-secondary)]">
                    {project.role} · {project.category}
                  </p>
                </div>
                <span className="type-caption shrink-0 font-normal text-[var(--apple-label-tertiary)]">
                  {project.timeline}
                </span>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

/* ==========================================================================
   H4. Verified Scope & Metrics Strip
   ========================================================================== */
function MetricsStripSpecimen() {
  const project = PROJECTS[0];

  return (
    <div className="rounded-[20px] bg-[var(--apple-bg)] px-6 py-2 border border-[var(--apple-separator-subtle)]">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-6 py-5 sm:grid-cols-4">
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-label-tertiary)]">
            Role
          </dt>
          <dd className="mt-1.5 text-[14.5px] font-semibold text-[var(--apple-label-primary)]">
            {project.role}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-label-tertiary)]">
            Timeline
          </dt>
          <dd className="mt-1.5 tabular-nums text-[14.5px] font-semibold text-[var(--apple-label-primary)]">
            {project.timeline}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-label-tertiary)]">
            Platform
          </dt>
          <dd className="mt-1.5 text-[14.5px] font-semibold text-[var(--apple-label-primary)]">
            {project.platform}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-label-tertiary)]">
            Contrast Verified
          </dt>
          <dd className="mt-1.5 tabular-nums text-[14.5px] font-semibold text-[var(--apple-success)]">
            100 / 100 AA
          </dd>
        </div>
      </dl>
    </div>
  );
}

/* ==========================================================================
   H5. Editorial Callout & Pull Quote
   ========================================================================== */
function PullQuoteSpecimen() {
  const [style, setStyle] = useState<'quote' | 'callout'>('quote');
  const [largeReader, setLargeReader] = useState(false);

  return (
    <div>
      <ControlBar>
        <MiniChoiceGroup
          ariaLabel="Editorial emphasis variant"
          value={style}
          onChange={setStyle}
          options={[
            { id: 'quote', label: 'Left-Rule Pull Quote' },
            { id: 'callout', label: 'Quiet Inset Callout' },
          ]}
        />
        <button
          type="button"
          aria-pressed={largeReader}
          onClick={() => {
            playTick();
            setLargeReader((prev) => !prev);
          }}
          className="apple-link rounded-[8px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-2.5 py-1 text-[12px] font-medium text-[var(--apple-label-primary)]"
        >
          Reader Scale: {largeReader ? 'Larger (19px)' : 'Default (17px)'}
        </button>
      </ControlBar>

      {style === 'quote' ? (
        <figure className="rounded-[20px] bg-[var(--apple-bg)] p-6 border border-[var(--apple-separator-subtle)]">
          <blockquote
            className={`measure-lead border-l-2 border-[var(--apple-blue)] pl-5 font-display font-medium leading-[1.46] tracking-[-0.018em] text-[var(--apple-label-primary)] ${
              largeReader ? 'text-[22px]' : 'text-[19px]'
            }`}
          >
            &ldquo;Resolution controls stay paired with observable behaviors and explicit policy clauses so human reviewers remain firmly in command.&rdquo;
          </blockquote>
          <figcaption className="type-footnote mt-3.5 pl-5 font-normal text-[var(--apple-label-tertiary)]">
            Precognition Labs · Design Invariant — Evidence Before Action
          </figcaption>
        </figure>
      ) : (
        <aside className="rounded-[22px] bg-[var(--apple-bg-secondary)] p-6">
          <p className="type-caption text-[var(--apple-link)]">
            2-Min Skim · Core Architectural Decision
          </p>
          <p
            className={`measure-prose mt-2.5 leading-[1.62] text-[var(--apple-label-primary)] ${
              largeReader ? 'text-[19px]' : 'text-[16.5px]'
            }`}
          >
            Unifying Organizer and Vendor perspectives around one anchored spatial floor grid eliminated spreadsheet drift and cut back-and-forth confirmation latency.
          </p>
        </aside>
      )}
    </div>
  );
}

export function renderSecondarySpecimen({
  componentId,
  onPreviewNavigate,
}: SpecimenRenderProps): React.ReactNode | null {
  switch (componentId) {
    case 'slide-over-drawers':
      return <SlideOverDrawersSpecimen />;
    case 'lightbox-modal':
      return <LightboxSpecimen />;
    case 'disclosure-accordion':
      return <DisclosureAccordionSpecimen />;
    case 'mobile-bottom-sheet':
      return <MobileBottomSheetSpecimen />;
    case 'toast-notification':
      return <ToastSpecimen />;
    case 'semantic-status-alerts':
      return <SemanticStatusSpecimen />;
    case 'loading-skeleton-indicators':
      return <LoadingSkeletonSpecimen />;
    case 'empty-error-states':
      return <EmptyErrorStatesSpecimen />;
    case 'audio-player-waveform':
      return <AudioPlayerSpecimen />;
    case 'cassette-player':
      return <CassettePlayerSpecimen />;
    case 'ipod-player':
      return <IPodPlayerSpecimen />;
    case 'interactive-book':
      return <InteractiveBookSpecimen />;
    case 'before-after-comparator':
      return <BeforeAfterSpecimen />;
    case 'case-study-prototypes':
      return <CaseStudyPrototypesSpecimen />;
    case 'architecture-diagrams':
      return <ArchitectureDiagramsSpecimen />;
    case 'local-time-clock':
      return <LocalTimeClockSpecimen />;
    case 'reading-depth-switcher':
      return <ReadingDepthSpecimen />;
    case 'section-headers-dividers':
      return <SectionHeadersSpecimen />;
    case 'structured-tables-lists':
      return <TablesListsSpecimen />;
    case 'practice-timeline':
      return <PracticeTimelineSpecimen onPreviewNavigate={onPreviewNavigate} />;
    case 'verified-metrics-callouts':
      return <MetricsStripSpecimen />;
    case 'pull-quote-callout':
      return <PullQuoteSpecimen />;
    default:
      return null;
  }
}
