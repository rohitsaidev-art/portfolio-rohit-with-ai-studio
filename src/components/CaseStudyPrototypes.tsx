import { useState } from 'react';
import { motion } from 'motion/react';
import type { PrototypeKind } from '../data/projects';
import { EASE_APPLE, SPRING_SEGMENT } from '../utils/motion';
import { playSuccessChime, playTap, playTick } from '../utils/soundEngine';
import {
  SFCheckmark,
  SFExclamationTriangle,
  SFHandRaised,
  SFLeaf,
  SFReset,
  SFShieldCheck,
  SFSliders,
  SFSpeakerWave,
} from './SFSymbols';

interface CaseStudyPrototypeProps {
  kind: PrototypeKind;
}

export type PrototypeViewState = 'happy' | 'empty' | 'loading' | 'error';

const PROTOTYPE_STATE_OPTIONS: readonly { id: PrototypeViewState; label: string }[] = [
  { id: 'happy', label: 'Happy' },
  { id: 'empty', label: 'Empty' },
  { id: 'loading', label: 'Loading' },
  { id: 'error', label: 'Error' },
];

export function CaseStudyPrototype({ kind }: CaseStudyPrototypeProps) {
  switch (kind) {
    case 'stallsync':
      return <StallSyncStudy />;
    case 'music-discovery-pwa':
      return <MusicPwaStudy />;
    case 'curse-of-the-mudradhaar':
      return <MudradhaarStudy />;
    case 'precognition-labs':
      return <PrecognitionStudy />;
    case 'hubapps':
      return <HubAppsStudy />;
    case 'mycroharvest':
      return <MycroHarvestStudy />;
  }
}

/* Reusable iOS Rounded Segmented Control with fluid spring thumb */
interface SegmentedOption<T extends string> {
  id: T;
  label: string;
}

function AppleSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  layoutGroupId,
  ariaLabel,
  compact = false,
}: {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (next: T) => void;
  layoutGroupId: string;
  ariaLabel: string;
  compact?: boolean;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`apple-segmented ${compact ? '!p-0.5' : ''}`}
    >
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
            className={`apple-segmented-item ${
              compact
                ? '!min-h-[30px] px-3 py-0.5 text-[12px]'
                : 'min-h-[34px] px-4 py-1 text-[13px]'
            } ${
              active
                ? 'text-[var(--apple-label-primary)]'
                : 'text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
            }`}
          >
            {active && (
              <motion.span
                layoutId={layoutGroupId}
                transition={SPRING_SEGMENT}
                className="apple-pill-shadow absolute inset-0 rounded-full bg-[var(--apple-control-thumb)]"
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* Reusable Multi-State Inspector Bar (P2.11 — StallSync, Precognition Labs, HubApps) */
function PrototypeStateBar({
  state,
  onChange,
  layoutGroupId,
}: {
  state: PrototypeViewState;
  onChange: (next: PrototypeViewState) => void;
  layoutGroupId: string;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-2.5 border-y border-[var(--apple-separator-subtle)] py-3">
      <span className="type-caption text-[var(--apple-label-tertiary)]">
        Inspect UI State
      </span>
      <AppleSegmentedControl
        compact
        ariaLabel="Inspect prototype UI state"
        layoutGroupId={layoutGroupId}
        value={state}
        onChange={onChange}
        options={PROTOTYPE_STATE_OPTIONS}
      />
    </div>
  );
}

/* 1. StallSync Interactive Floor-Plan Inspector (Upgraded with Multi-State Inspector — P2.11) */
interface BoothUnit {
  id: string;
  zone: string;
  dimensions: string;
  power: string;
  status: 'Available' | 'Reserved' | 'In Review';
  vendor: string;
  category: string;
  fee: string;
}

const BOOTHS: BoothUnit[] = [
  { id: 'A-01', zone: 'North Entry · Corner', dimensions: '3m × 3m', power: '15A Dedicated', status: 'Reserved', vendor: 'Kora Ceramic Studio', category: 'Craft & Home', fee: 'Standard Corner' },
  { id: 'A-02', zone: 'North Aisle', dimensions: '3m × 2m', power: '10A Shared', status: 'Available', vendor: 'Open for applications', category: 'Design & Print', fee: 'Standard Inline' },
  { id: 'A-03', zone: 'North Aisle', dimensions: '3m × 2m', power: '10A Shared', status: 'In Review', vendor: 'Nila Paper Co.', category: 'Stationery', fee: 'Standard Inline' },
  { id: 'B-01', zone: 'Courtyard Edge', dimensions: '4m × 3m', power: '20A + Water', status: 'Reserved', vendor: 'Banyan Roasters', category: 'Food & Coffee', fee: 'Culinary Anchor' },
  { id: 'B-02', zone: 'Central Pavilion', dimensions: '3m × 3m', power: '15A Dedicated', status: 'Available', vendor: 'Open for applications', category: 'Apparel & Textile', fee: 'Pavilion Core' },
  { id: 'B-03', zone: 'Central Pavilion', dimensions: '3m × 3m', power: '10A Shared', status: 'Reserved', vendor: 'Atelier Loom', category: 'Apparel & Textile', fee: 'Pavilion Core' },
];

function StallSyncStudy() {
  const [role, setRole] = useState<'organizer' | 'vendor'>('organizer');
  const [viewState, setViewState] = useState<PrototypeViewState>('happy');
  const [selectedId, setSelectedId] = useState<string>('A-02');
  const [heldBooths, setHeldBooths] = useState<Record<string, boolean>>({});

  const activeBooth = BOOTHS.find((b) => b.id === selectedId) ?? BOOTHS[0];
  const isActionApplied = Boolean(heldBooths[activeBooth.id]);

  return (
    <div className="rounded-[28px] bg-[var(--apple-bg-secondary)] p-6 sm:p-8">
      <div className="flex flex-col gap-4 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="type-headline font-display">
            Pavilion Hall 02 · Spatial Allocation
          </p>
          <p className="type-footnote mt-1 font-normal text-[var(--apple-label-secondary)]">
            Select any booth to inspect spatial constraints, role actions, and operational states.
          </p>
        </div>

        <AppleSegmentedControl
          ariaLabel="Switch role perspective"
          layoutGroupId="stallsync-role-pill"
          value={role}
          onChange={setRole}
          options={[
            { id: 'organizer', label: 'Organizer view' },
            { id: 'vendor', label: 'Vendor view' },
          ]}
        />
      </div>

      <PrototypeStateBar
        state={viewState}
        onChange={setViewState}
        layoutGroupId="stallsync-state-pill"
      />

      {viewState === 'loading' ? (
        <div
          aria-busy="true"
          className="grid grid-cols-1 gap-5 lg:grid-cols-12"
        >
          <div className="apple-surface-subtle rounded-[22px] p-5 sm:p-6 lg:col-span-7">
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-36 animate-pulse rounded-full bg-[var(--apple-separator)]" />
              <div className="h-3.5 w-20 animate-pulse rounded-full bg-[var(--apple-separator)]" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-[116px] animate-pulse rounded-[18px] bg-[var(--apple-bg-secondary)] p-4"
                >
                  <div className="h-4 w-12 rounded-full bg-[var(--apple-separator)]" />
                  <div className="mt-2 h-3 w-16 rounded-full bg-[var(--apple-separator-subtle)]" />
                  <div className="mt-6 h-3 w-20 rounded-full bg-[var(--apple-separator-subtle)]" />
                </div>
              ))}
            </div>
          </div>
          <div className="apple-surface-subtle flex flex-col justify-between rounded-[22px] p-6 lg:col-span-5">
            <div className="space-y-3">
              <div className="h-5 w-28 animate-pulse rounded-full bg-[var(--apple-separator)]" />
              <div className="h-3.5 w-full animate-pulse rounded-full bg-[var(--apple-separator-subtle)]" />
              <div className="h-3.5 w-4/5 animate-pulse rounded-full bg-[var(--apple-separator-subtle)]" />
              <div className="h-3.5 w-3/4 animate-pulse rounded-full bg-[var(--apple-separator-subtle)]" />
            </div>
            <p className="type-footnote mt-6 flex items-center gap-2 font-normal text-[var(--apple-label-tertiary)]">
              <span className="apple-spinner" aria-hidden="true" />
              <span>Syncing Pavilion Hall 02 electrical &amp; stall reservations…</span>
            </p>
          </div>
        </div>
      ) : viewState === 'empty' ? (
        <div className="apple-surface-subtle rounded-[22px] px-6 py-12 text-center sm:px-10">
          <p className="type-caption text-[var(--apple-label-tertiary)]">
            No matching stalls
          </p>
          <h4 className="type-title-3 mt-2">
            {role === 'organizer'
              ? 'No unallocated booths match “20A + Water” in North Aisle.'
              : 'All stalls matching your current utility filter are reserved.'}
          </h4>
          <p className="type-callout mx-auto mt-2 max-w-[46ch]">
            {role === 'organizer'
              ? 'Clear active utility filters or open Courtyard Edge zones to review available floor inventory.'
              : 'Reset filters to inspect open inline booths or join the waitlist for culinary anchor spaces.'}
          </p>
          <button
            type="button"
            onClick={() => {
              playSuccessChime();
              setViewState('happy');
            }}
            className="apple-btn-primary mt-5"
          >
            <SFReset size={14} />
            <span>Reset floor filters</span>
          </button>
        </div>
      ) : viewState === 'error' ? (
        <div
          role="alert"
          className="apple-surface-subtle rounded-[22px] border border-[var(--apple-error)]/25 px-6 py-10 text-center sm:px-10"
        >
          <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--apple-error)]/10 text-[var(--apple-error)]">
            <SFExclamationTriangle size={18} />
          </div>
          <h4 className="type-title-3 mt-3">
            Floor-plan sync interrupted
          </h4>
          <p className="type-callout mx-auto mt-2 max-w-[48ch]">
            Live reservation locks could not be verified from the venue server. Booth holds are paused temporarily to prevent double-booking.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                playSuccessChime();
                setViewState('happy');
              }}
              className="apple-btn-primary"
            >
              <SFReset size={14} />
              <span>Retry floor sync</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playTick();
                setViewState('loading');
              }}
              className="apple-btn-tonal"
            >
              Inspect reconnecting state
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Floor Grid */}
          <div className="apple-surface-subtle rounded-[22px] p-5 sm:p-6 lg:col-span-7">
            <div className="type-footnote flex items-center justify-between text-[var(--apple-label-tertiary)]">
              <span>North Entrance Corridor</span>
              <span className="tabular-nums">6 Sample Units</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {BOOTHS.map((booth) => {
                const selected = booth.id === activeBooth.id;
                const applied = Boolean(heldBooths[booth.id]);
                const effectiveStatus =
                  applied && booth.status === 'Available'
                    ? role === 'organizer'
                      ? 'Held'
                      : 'Requested'
                    : booth.status;

                return (
                  <button
                    key={booth.id}
                    type="button"
                    onClick={() => {
                      playTick();
                      setSelectedId(booth.id);
                    }}
                    className={`flex flex-col items-start rounded-[18px] p-3.5 text-left transition-all duration-200 active:scale-[0.98] sm:p-4 ${
                      selected
                        ? 'bg-[var(--apple-blue)]/[0.08] ring-2 ring-[var(--apple-blue)]'
                        : 'bg-[var(--apple-bg-secondary)] hover:bg-[var(--apple-bg-tertiary)]'
                    }`}
                  >
                    <span className="tabular-nums whitespace-nowrap text-[15px] font-semibold leading-tight tracking-[-0.015em] text-[var(--apple-label-primary)]">
                      {booth.id}
                    </span>
                    <span
                      className={`type-caption mt-1 whitespace-nowrap font-medium ${
                        effectiveStatus === 'Available'
                          ? 'text-[var(--apple-link)]'
                          : 'text-[var(--apple-label-secondary)]'
                      }`}
                    >
                      {effectiveStatus}
                    </span>
                    <span className="type-caption mt-3 whitespace-nowrap font-normal text-[var(--apple-label-secondary)] tabular-nums">
                      {booth.dimensions}
                    </span>
                    <span className="mt-0.5 whitespace-nowrap text-[11.5px] text-[var(--apple-label-tertiary)]">
                      {booth.power}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Inspector Rail */}
          <div className="apple-surface-subtle flex flex-col justify-between rounded-[22px] p-6 lg:col-span-5">
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="type-title-3 whitespace-nowrap">
                  Booth {activeBooth.id}
                </h4>
                <span className="type-footnote text-right font-normal text-[var(--apple-label-secondary)]">
                  {activeBooth.zone}
                </span>
              </div>

              <dl className="type-footnote mt-5 space-y-3 border-t border-[var(--apple-separator-subtle)] pt-4 font-normal">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="shrink-0 text-[var(--apple-label-tertiary)]">Footprint</dt>
                  <dd className="text-right font-medium text-[var(--apple-label-primary)] tabular-nums">
                    {activeBooth.dimensions}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="shrink-0 text-[var(--apple-label-tertiary)]">Utilities</dt>
                  <dd className="text-right font-medium text-[var(--apple-label-primary)]">{activeBooth.power}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="shrink-0 text-[var(--apple-label-tertiary)]">Recommended fit</dt>
                  <dd className="text-right font-medium text-[var(--apple-label-primary)]">{activeBooth.category}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="shrink-0 text-[var(--apple-label-tertiary)]">Allocation tier</dt>
                  <dd className="text-right font-medium text-[var(--apple-label-primary)]">{activeBooth.fee}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="shrink-0 text-[var(--apple-label-tertiary)]">Current occupant</dt>
                  <dd className="text-right font-medium text-[var(--apple-label-primary)]">{activeBooth.vendor}</dd>
                </div>
              </dl>
            </div>

            <div className="mt-6 border-t border-[var(--apple-separator-subtle)] pt-5">
              {activeBooth.status === 'Available' ? (
                <button
                  type="button"
                  onClick={() => {
                    playSuccessChime();
                    setHeldBooths((prev) => ({ ...prev, [activeBooth.id]: !prev[activeBooth.id] }));
                  }}
                  className={isActionApplied ? 'apple-btn-tonal w-full' : 'apple-btn-primary w-full'}
                >
                  {isActionApplied ? (
                    <>
                      <SFCheckmark size={15} className="text-[var(--apple-blue)]" />
                      <span>
                        {role === 'organizer' ? 'Booth placed on hold' : 'Application request noted'}
                      </span>
                    </>
                  ) : (
                    <span>
                      {role === 'organizer' ? 'Place organizer hold' : 'Apply for this booth'}
                    </span>
                  )}
                </button>
              ) : (
                <p className="type-footnote font-normal text-[var(--apple-label-secondary)]">
                  {role === 'organizer'
                    ? 'Assigned in current floor plan. Load-in window confirmed for 07:00.'
                    : 'Currently unavailable. Select an open booth to preview application constraints.'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* 2. Music Discovery PWA Capture & Match Study (Kept clean — no arbitrary state inspector) */
function MusicPwaStudy() {
  const [stage, setStage] = useState<'ready' | 'listening' | 'matched'>('ready');
  const [saved, setSaved] = useState(false);

  const barHeights = stage === 'listening' ? [18, 36, 24, 44, 28, 38, 20] : [8, 13, 10, 15, 10, 13, 8];

  return (
    <div className="rounded-[28px] bg-[var(--apple-bg-secondary)] p-6 sm:p-8">
      <div className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <SFSpeakerWave size={20} className="text-[var(--apple-blue)]" />
          <p className="type-headline font-display">
            PWA Capture State Flow
          </p>
        </div>

        <AppleSegmentedControl
          ariaLabel="Switch audio capture state"
          layoutGroupId="music-pwa-stage-pill"
          value={stage}
          onChange={setStage}
          options={[
            { id: 'ready', label: 'Ready' },
            { id: 'listening', label: 'Listening' },
            { id: 'matched', label: 'Matched' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 items-center gap-7 md:grid-cols-12">
        <div className="apple-surface-subtle mx-auto w-full max-w-[350px] rounded-[26px] p-6 md:col-span-6">
          <div className="type-caption flex items-center justify-between font-medium text-[var(--apple-label-tertiary)]">
            <span>Ambient Capture</span>
            <span>Offline Ready</span>
          </div>

          <div className="my-7 flex flex-col items-center">
            <div className="flex h-16 items-center gap-1.5">
              {barHeights.map((height, idx) => (
                <motion.span
                  key={idx}
                  animate={{ height }}
                  transition={{ duration: 0.36, ease: EASE_APPLE }}
                  className={`w-1.5 rounded-full ${
                    stage === 'listening'
                      ? 'bg-[var(--apple-blue)]'
                      : 'bg-[var(--apple-separator-strong)]'
                  }`}
                />
              ))}
            </div>

            {stage === 'ready' && (
              <div className="mt-5 text-center">
                <p className="type-title-3">
                  Tap to identify audio
                </p>
                <p className="type-footnote mt-1.5 font-normal text-[var(--apple-label-secondary)]">
                  Opens directly into listening readiness with zero interstitial chrome.
                </p>
              </div>
            )}

            {stage === 'listening' && (
              <div className="mt-5 text-center">
                <p className="type-title-3">
                  Listening to cadence…
                </p>
                <p className="type-footnote mt-1.5 font-normal text-[var(--apple-label-secondary)]">
                  Sampling 4-second harmonic signature locally before matching.
                </p>
              </div>
            )}

            {stage === 'matched' && (
              <div className="mt-5 w-full rounded-[18px] bg-[var(--apple-bg-secondary)] p-4 text-left">
                <p className="type-caption font-medium text-[var(--apple-label-tertiary)]">
                  Match resolved · Evening café
                </p>
                <p className="type-headline font-display mt-1">
                  Morning Light in Kyoto
                </p>
                <p className="type-footnote font-normal text-[var(--apple-label-secondary)]">
                  Haruka Nakamura · Quiet Studies, 2024
                </p>
              </div>
            )}
          </div>

          {stage !== 'matched' ? (
            <button
              type="button"
              onClick={() => {
                playTap();
                setStage(stage === 'ready' ? 'listening' : 'matched');
              }}
              className="apple-btn-primary w-full"
            >
              {stage === 'ready' ? 'Start listening' : 'Simulate match resolved'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                playSuccessChime();
                setSaved((prev) => !prev);
              }}
              className={saved ? 'apple-btn-tonal w-full' : 'apple-btn-primary w-full'}
            >
              {saved ? 'Saved to listening shelf' : 'Save to listening shelf'}
            </button>
          )}
        </div>

        <div className="space-y-4 md:col-span-6">
          <h4 className="type-title-3">
            Design rationale behind each state
          </h4>
          <p className="type-callout">
            Rather than navigating to a separate results screen, the capture surface transitions smoothly in place. Preserving spatial continuity keeps the interaction feeling immediate even on modest mobile networks.
          </p>
          <div className="type-footnote border-t border-[var(--apple-separator)] pt-4 font-normal text-[var(--apple-label-secondary)]">
            Current state:{' '}
            <span className="font-medium text-[var(--apple-label-primary)]">
              {stage === 'ready'
                ? 'Idle readiness — thumb-aligned primary trigger.'
                : stage === 'listening'
                  ? 'Active sampling — restrained vertical cadence feedback.'
                  : 'Resolved match — contextual capture note attached automatically.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 3. Mudradhaar Gesture Calibration & Lock-in Study (Kept clean) */
const MUDRAS = [
  {
    id: 'abhaya',
    name: 'Abhaya · Ward',
    posture: 'Open palm facing camera with extended fingers.',
    holdMs: '260 ms',
    stability: 'High silhouette separation',
    response: 'Raises a calm directional barrier against incoming projectiles.',
  },
  {
    id: 'jnana',
    name: 'Jnana · Focus',
    posture: 'Thumb and index tip joined in a clear ring, remaining three fingers extended.',
    holdMs: '300 ms',
    stability: 'Reliable tip-distance ratio',
    response: 'Slows encounter tempo briefly to line up precise counter timing.',
  },
  {
    id: 'shunya',
    name: 'Shunya · Break',
    posture: 'Middle finger tucked to thumb base while index and ring stay distinct.',
    holdMs: '320 ms',
    stability: 'Verified against wrist tilt',
    response: 'Disperses active curse seals once the lock-in arc completes.',
  },
] as const;

function MudradhaarStudy() {
  const [activeId, setActiveId] = useState<'abhaya' | 'jnana' | 'shunya'>('abhaya');
  const current = MUDRAS.find((m) => m.id === activeId) ?? MUDRAS[0];

  return (
    <div className="rounded-[28px] bg-[var(--apple-bg-secondary)] p-6 sm:p-8">
      <div className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <SFHandRaised size={20} className="text-[var(--apple-blue)]" />
          <p className="type-headline font-display">
            Core Mudra Vocabulary
          </p>
        </div>

        <AppleSegmentedControl
          ariaLabel="Select mudra posture"
          layoutGroupId="mudra-select-pill"
          value={activeId}
          onChange={setActiveId}
          options={[
            { id: 'abhaya', label: 'Abhaya' },
            { id: 'jnana', label: 'Jnana' },
            { id: 'shunya', label: 'Shunya' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
        <div className="apple-surface-subtle rounded-[22px] p-6 md:col-span-7">
          <p className="type-caption text-[var(--apple-label-tertiary)]">
            Selected Gesture Profile
          </p>
          <h4 className="type-title-3 mt-1.5">
            {current.name}
          </h4>
          <p className="type-callout mt-3">{current.posture}</p>
          <p className="type-callout mt-5 border-t border-[var(--apple-separator-subtle)] pt-4 text-[var(--apple-label-primary)]">
            {current.response}
          </p>
        </div>

        <div className="apple-surface-subtle flex flex-col justify-between rounded-[22px] p-6 md:col-span-5">
          <dl className="type-footnote space-y-4 font-normal">
            <div>
              <dt className="text-[var(--apple-label-tertiary)]">Debounce lock-in window</dt>
              <dd className="type-title-3 tabular-nums mt-1">
                {current.holdMs}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--apple-label-tertiary)]">Detection characteristic</dt>
              <dd className="mt-1 font-medium text-[var(--apple-label-primary)]">{current.stability}</dd>
            </div>
            <div>
              <dt className="text-[var(--apple-label-tertiary)]">Visual cue</dt>
              <dd className="mt-1 text-[var(--apple-label-secondary)]">
                Concentric seal ring fills smoothly around reticle rather than flashing debug lines.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

/* 4. Precognition Labs Signal Triage & Explainability Study (Upgraded with Multi-State Inspector — P2.11) */
const TRIAGE_CASES = [
  {
    id: 'routine',
    level: 'Routine Review',
    caseCode: 'Case 4091',
    summary: 'New disbursement destination added shortly after credential refresh.',
    policy: 'Policy 4.2 · Payout Instrument Verification',
    factors: [
      'Device fingerprint matches prior 90-day session history',
      'Bank routing region aligns with registered entity profile',
      'Single-step confirmation recommended before clearing hold',
    ],
    recommendation: 'Verify via out-of-band confirmation',
  },
  {
    id: 'elevated',
    level: 'Elevated Signal',
    caseCode: 'Case 4094',
    summary: 'Automated credential retries observed across three distinct client subnets.',
    policy: 'Policy 2.8 · Coordinated Access Anomalies',
    factors: [
      'Request cadence deviated from baseline workspace pattern',
      'Two API keys rotated outside scheduled maintenance window',
      'No confirmed data exfiltration observed in audit trail',
    ],
    recommendation: 'Require secondary reviewer sign-off',
  },
] as const;

function PrecognitionStudy() {
  const [selectedCase, setSelectedCase] = useState<'routine' | 'elevated'>('routine');
  const [viewState, setViewState] = useState<PrototypeViewState>('happy');
  const [resolved, setResolved] = useState<Record<string, string>>({});

  const item = TRIAGE_CASES.find((c) => c.id === selectedCase) ?? TRIAGE_CASES[0];

  return (
    <div className="rounded-[28px] bg-[var(--apple-bg-secondary)] p-6 sm:p-8">
      <div className="flex flex-col gap-4 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <SFShieldCheck size={20} className="text-[var(--apple-blue)]" />
          <p className="type-headline font-display">
            Evidence-First Triage Ledger
          </p>
        </div>

        <AppleSegmentedControl
          ariaLabel="Switch review case"
          layoutGroupId="precognition-case-pill"
          value={selectedCase}
          onChange={setSelectedCase}
          options={[
            { id: 'routine', label: 'Routine Review' },
            { id: 'elevated', label: 'Elevated Signal' },
          ]}
        />
      </div>

      <PrototypeStateBar
        state={viewState}
        onChange={setViewState}
        layoutGroupId="precognition-state-pill"
      />

      {viewState === 'loading' ? (
        <div
          aria-busy="true"
          className="apple-surface-subtle rounded-[22px] p-6 sm:p-7"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="h-4 w-24 animate-pulse rounded-full bg-[var(--apple-separator)]" />
            <div className="h-3.5 w-48 animate-pulse rounded-full bg-[var(--apple-separator-subtle)]" />
          </div>
          <div className="mt-4 h-6 w-3/4 animate-pulse rounded-full bg-[var(--apple-separator)]" />
          <div className="mt-5 space-y-2.5 border-t border-[var(--apple-separator-subtle)] pt-4">
            <div className="h-3.5 w-full animate-pulse rounded-full bg-[var(--apple-separator-subtle)]" />
            <div className="h-3.5 w-5/6 animate-pulse rounded-full bg-[var(--apple-separator-subtle)]" />
            <div className="h-3.5 w-2/3 animate-pulse rounded-full bg-[var(--apple-separator-subtle)]" />
          </div>
          <p className="type-footnote mt-6 flex items-center gap-2 font-normal text-[var(--apple-label-tertiary)]">
            <span className="apple-spinner" aria-hidden="true" />
            <span>Evaluating policy citations and audit trail lineage…</span>
          </p>
        </div>
      ) : viewState === 'empty' ? (
        <div className="apple-surface-subtle rounded-[22px] px-6 py-12 text-center sm:px-10">
          <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--apple-blue)]/10 text-[var(--apple-blue)]">
            <SFCheckmark size={18} />
          </div>
          <h4 className="type-title-3 mt-3">
            Triage queue clear
          </h4>
          <p className="type-callout mx-auto mt-2 max-w-[46ch]">
            All {selectedCase === 'elevated' ? 'elevated signals' : 'routine reviews'} in this policy bucket have been attributed and signed off.
          </p>
          <button
            type="button"
            onClick={() => {
              playSuccessChime();
              setViewState('happy');
            }}
            className="apple-btn-primary mt-5"
          >
            <SFReset size={14} />
            <span>Load sample case</span>
          </button>
        </div>
      ) : viewState === 'error' ? (
        <div
          role="alert"
          className="apple-surface-subtle rounded-[22px] border border-[var(--apple-error)]/25 px-6 py-10 text-center sm:px-10"
        >
          <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--apple-error)]/10 text-[var(--apple-error)]">
            <SFExclamationTriangle size={18} />
          </div>
          <h4 className="type-title-3 mt-3">
            Policy attribution ledger unavailable
          </h4>
          <p className="type-callout mx-auto mt-2 max-w-[48ch]">
            Resolution buttons remain locked until complete supporting evidence can be verified. No automated actions were triggered.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                playSuccessChime();
                setViewState('happy');
              }}
              className="apple-btn-primary"
            >
              <SFReset size={14} />
              <span>Reconnect evidence stream</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playTick();
                setViewState('loading');
              }}
              className="apple-btn-tonal"
            >
              View loading state
            </button>
          </div>
        </div>
      ) : (
        <div className="apple-surface-subtle rounded-[22px] p-6 sm:p-7">
          <div className="type-footnote flex flex-wrap items-center justify-between gap-2 font-normal text-[var(--apple-label-tertiary)]">
            <span className="tabular-nums font-semibold text-[var(--apple-label-primary)]">{item.caseCode}</span>
            <span>{item.policy}</span>
          </div>

          <p className="type-title-3 mt-3">
            {item.summary}
          </p>

          <ul className="type-callout mt-5 space-y-2.5 border-t border-[var(--apple-separator-subtle)] pt-4">
            {item.factors.map((factor) => (
              <li key={factor} className="flex items-start gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--apple-label-tertiary)]" aria-hidden="true" />
                <span>{factor}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-4 border-t border-[var(--apple-separator-subtle)] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <span className="type-footnote font-normal text-[var(--apple-label-secondary)]">
              Guidance: <strong className="font-semibold text-[var(--apple-label-primary)]">{item.recommendation}</strong>
            </span>

            <div className="flex items-center gap-2.5">
              {(['Approve', 'Escalate'] as const).map((action) => {
                const active = resolved[item.id] === action;
                return (
                  <button
                    key={action}
                    type="button"
                    onClick={() => {
                      playSuccessChime();
                      setResolved((prev) => ({ ...prev, [item.id]: action }));
                    }}
                    className={
                      active
                        ? 'apple-btn-primary !min-h-[38px] !px-5 !py-1.5 !text-[14px]'
                        : 'apple-btn-tonal !min-h-[38px] !px-5 !py-1.5 !text-[14px]'
                    }
                  >
                    {active ? `${action}d` : action}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* 5. HubApps Density & Modular Token Explorer (Upgraded with Multi-State Inspector — P2.11) */
const WORKSPACE_ROWS = [
  { module: 'Billing Ledger', owner: 'Finance Ops', status: 'Synced', updated: '14:20' },
  { module: 'Partner Portal', owner: 'Account Team', status: 'Active', updated: '13:45' },
  { module: 'Asset Approvals', owner: 'Brand Studio', status: 'In Review', updated: '11:10' },
];

function HubAppsStudy() {
  const [density, setDensity] = useState<'compact' | 'balanced' | 'spacious'>('balanced');
  const [viewState, setViewState] = useState<PrototypeViewState>('happy');

  const rowPadding =
    density === 'compact' ? 'py-3' : density === 'balanced' ? 'py-4' : 'py-5';

  return (
    <div className="rounded-[28px] bg-[var(--apple-bg-secondary)] p-6 sm:p-8">
      <div className="flex flex-col gap-4 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <SFSliders size={20} className="text-[var(--apple-blue)]" />
          <p className="type-headline font-display">
            Unified Density Scale
          </p>
        </div>

        <AppleSegmentedControl
          ariaLabel="Select workspace density"
          layoutGroupId="hubapps-density-pill"
          value={density}
          onChange={setDensity}
          options={[
            { id: 'compact', label: 'Compact' },
            { id: 'balanced', label: 'Balanced' },
            { id: 'spacious', label: 'Spacious' },
          ]}
        />
      </div>

      <PrototypeStateBar
        state={viewState}
        onChange={setViewState}
        layoutGroupId="hubapps-state-pill"
      />

      <div className="apple-surface-subtle overflow-hidden rounded-[22px]">
        <div className="type-caption grid grid-cols-12 border-b border-[var(--apple-separator-subtle)] px-6 py-3.5 text-[var(--apple-label-tertiary)]">
          <span className="col-span-5">Workspace Module</span>
          <span className="col-span-3">Team</span>
          <span className="col-span-2">State</span>
          <span className="col-span-2 text-right">Updated</span>
        </div>

        {viewState === 'loading' ? (
          <div aria-busy="true" className="divide-y divide-[var(--apple-separator-subtle)]">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-12 items-center gap-3 px-6 ${rowPadding}`}
              >
                <div className="col-span-5 h-3.5 w-32 animate-pulse rounded-full bg-[var(--apple-separator)]" />
                <div className="col-span-3 h-3.5 w-20 animate-pulse rounded-full bg-[var(--apple-separator-subtle)]" />
                <div className="col-span-2 h-3.5 w-14 animate-pulse rounded-full bg-[var(--apple-separator-subtle)]" />
                <div className="col-span-2 ml-auto h-3.5 w-10 animate-pulse rounded-full bg-[var(--apple-separator-subtle)]" />
              </div>
            ))}
          </div>
        ) : viewState === 'empty' ? (
          <div className="px-6 py-12 text-center">
            <p className="type-headline text-[var(--apple-label-primary)]">
              No workspace modules connected
            </p>
            <p className="type-callout mx-auto mt-1.5 max-w-[44ch]">
              Connect Billing Ledger, Partner Portal, or Asset Approvals to populate this shared operational view.
            </p>
            <button
              type="button"
              onClick={() => {
                playSuccessChime();
                setViewState('happy');
              }}
              className="apple-btn-primary mt-5"
            >
              <SFReset size={14} />
              <span>Restore sample modules</span>
            </button>
          </div>
        ) : viewState === 'error' ? (
          <div role="alert" className="px-6 py-10 text-center">
            <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--apple-error)]/10 text-[var(--apple-error)]">
              <SFExclamationTriangle size={18} />
            </div>
            <p className="type-headline mt-3 text-[var(--apple-label-primary)]">
              Module status sync timed out
            </p>
            <p className="type-callout mx-auto mt-1.5 max-w-[46ch]">
              Could not fetch latest timestamps from connected HubApps services. Your density preset ({density}) remains preserved locally.
            </p>
            <button
              type="button"
              onClick={() => {
                playSuccessChime();
                setViewState('happy');
              }}
              className="apple-btn-primary mt-5"
            >
              <SFReset size={14} />
              <span>Retry module sync</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[var(--apple-separator-subtle)]">
            {WORKSPACE_ROWS.map((row) => (
              <div
                key={row.module}
                className={`type-callout grid grid-cols-12 items-center px-6 transition-all duration-200 ${rowPadding}`}
              >
                <span className="col-span-5 font-medium text-[var(--apple-label-primary)]">{row.module}</span>
                <span className="col-span-3 text-[var(--apple-label-secondary)]">{row.owner}</span>
                <span className="col-span-2 text-[var(--apple-label-secondary)]">{row.status}</span>
                <span className="type-footnote col-span-2 text-right tabular-nums font-normal text-[var(--apple-label-tertiary)]">
                  {row.updated}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* 6. MycroHarvest Cultivation Timeline Study (Kept clean) */
const GROWTH_STAGES = [
  {
    id: 'inoculation',
    label: 'Inoculation',
    temp: '23.0 °C',
    humidity: '65%',
    airflow: 'Low · Sealed',
    note: 'Maintain clean-room stability and minimal disturbance while substrate settles.',
  },
  {
    id: 'colonization',
    label: 'Colonization',
    temp: '24.5 °C',
    humidity: '72%',
    airflow: 'Passive Exchange',
    note: 'Monitor mycelial spread evenly across trays; no misting required during this window.',
  },
  {
    id: 'pinning',
    label: 'Pinning',
    temp: '18.5 °C',
    humidity: '90%',
    airflow: '6 cycles / hr',
    note: 'Step down chamber temperature and increase fresh air exchange to initiate fruiting.',
  },
  {
    id: 'harvest',
    label: 'Harvest',
    temp: '17.0 °C',
    humidity: '84%',
    airflow: '8 cycles / hr',
    note: 'Ready for morning floor harvest. Log fresh yield weight before initiating rest cycle.',
  },
] as const;

function MycroHarvestStudy() {
  const [stageId, setStageId] = useState<'inoculation' | 'colonization' | 'pinning' | 'harvest'>('pinning');
  const activeStage = GROWTH_STAGES.find((s) => s.id === stageId) ?? GROWTH_STAGES[0];

  return (
    <div className="rounded-[28px] bg-[var(--apple-bg-secondary)] p-6 sm:p-8">
      <div className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <SFLeaf size={20} className="text-[var(--apple-blue)]" />
          <p className="type-headline font-display">
            Batch Lifecycle &amp; Environment
          </p>
        </div>

        <AppleSegmentedControl
          ariaLabel="Select cultivation stage"
          layoutGroupId="mycroharvest-stage-pill"
          value={stageId}
          onChange={setStageId}
          options={GROWTH_STAGES.map((s) => ({ id: s.id, label: s.label }))}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="apple-surface-subtle rounded-[20px] p-5">
          <p className="type-footnote text-[var(--apple-label-tertiary)]">Target Temperature</p>
          <p className="type-title-2 tabular-nums mt-2">
            {activeStage.temp}
          </p>
        </div>
        <div className="apple-surface-subtle rounded-[20px] p-5">
          <p className="type-footnote text-[var(--apple-label-tertiary)]">Relative Humidity</p>
          <p className="type-title-2 tabular-nums mt-2">
            {activeStage.humidity}
          </p>
        </div>
        <div className="apple-surface-subtle rounded-[20px] p-5">
          <p className="type-footnote text-[var(--apple-label-tertiary)]">Fresh Air Exchange</p>
          <p className="type-title-3 tabular-nums mt-2">
            {activeStage.airflow}
          </p>
        </div>
      </div>

      <p className="apple-surface-subtle type-callout mt-4 rounded-[18px] px-5 py-4">
        <span className="font-semibold text-[var(--apple-label-primary)]">Stage note: </span>
        {activeStage.note}
      </p>
    </div>
  );
}
