import { useState } from 'react';
import type { PrototypeKind } from '../data/projects';
import { playTick } from '../utils/soundEngine';

interface CaseStudyDiagramProps {
  kind: PrototypeKind;
}

/**
 * Crisp responsive SVG architecture diagrams & design token demonstrations (P3.6).
 * Strictly limited to systems supported by genuine project data:
 * - StallSync: Dual-role spatial allocation & 4-state linear approval cadence.
 * - Precognition Labs: Explainable signal triage & human-in-the-loop audit flow.
 * - HubApps: Interactive spacing, surface tier, and corner-radius token demonstration.
 *
 * Returns null for projects where no system architecture diagram is supported.
 */
export function CaseStudyDiagram({ kind }: CaseStudyDiagramProps) {
  switch (kind) {
    case 'stallsync':
      return <StallSyncArchitectureDiagram />;
    case 'precognition-labs':
      return <PrecognitionFlowDiagram />;
    case 'hubapps':
      return <HubAppsTokenDemo />;
    default:
      return null;
  }
}

/* ==========================================================================
   1. StallSync — Dual-Role Spatial Allocation & 4-State Approval Cadence
   Grounded strictly in src/data/projects.ts (StallSync chapters 03–06)
   ========================================================================== */
const STALLSYNC_CADENCE = [
  {
    id: 'draft',
    num: '01',
    label: 'Draft',
    note: 'Organizer configures zone layout, booth dimensions, power limits, and category rules.',
  },
  {
    id: 'review',
    num: '02',
    label: 'In Review',
    note: 'Vendor submits booth request with table footprint & electrical needs visible upfront.',
  },
  {
    id: 'reserved',
    num: '03',
    label: 'Reserved',
    note: 'Organizer confirms booth allocation on the shared floor grid; both sides see live state.',
  },
  {
    id: 'load-in',
    num: '04',
    label: 'Ready for Load-in',
    note: 'Confirmed booth assignment surfaces load-in window and power specs for event morning.',
  },
] as const;

function StallSyncArchitectureDiagram() {
  const [activeStageIndex, setActiveStageIndex] = useState<number>(2);
  const activeStage = STALLSYNC_CADENCE[activeStageIndex];

  return (
    <div className="mt-10 rounded-[28px] bg-[var(--apple-bg-secondary)] p-6 sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="type-caption text-[var(--apple-link)]">
            System Flow Architecture
          </p>
          <h3 className="type-title-3 mt-1 text-[20px]">
            One Spatial Floor Grid, Two Role Perspectives
          </h3>
        </div>
        <p className="type-caption font-normal text-[var(--apple-label-tertiary)]">
          Select a cadence stage below to inspect state transition
        </p>
      </div>

      {/* Crisp Responsive Vector SVG Diagram */}
      <div className="apple-surface-subtle mt-5 overflow-hidden rounded-[22px] p-4 sm:p-6">
        <svg
          viewBox="0 0 880 340"
          role="img"
          aria-labelledby="stallsync-arch-title stallsync-arch-desc"
          className="h-auto w-full"
        >
          <title id="stallsync-arch-title">
            StallSync Dual-Role Spatial Allocation and Linear Approval Flow
          </title>
          <desc id="stallsync-arch-desc">
            Diagram showing Organizer View and Vendor View connecting to a shared Anchored Venue Floor Grid and Contextual Booth Inspector, feeding a four-state linear approval cadence: Draft, In Review, Reserved, and Ready for Load-in.
          </desc>

          <defs>
            <marker
              id="ss-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path
                d="M 1 1.5 L 8.5 5 L 1 8.5"
                fill="none"
                stroke="var(--apple-label-tertiary)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </marker>
            <marker
              id="ss-arrow-blue"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path
                d="M 1 1.5 L 8.5 5 L 1 8.5"
                fill="none"
                stroke="var(--apple-blue)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </marker>
          </defs>

          {/* Left Column: Dual Role Perspectives */}
          <rect
            x="24"
            y="24"
            width="220"
            height="78"
            rx="16"
            fill="var(--apple-bg-secondary)"
            stroke="var(--apple-separator-strong)"
            strokeWidth="1"
          />
          <text
            x="42"
            y="50"
            fill="var(--apple-link)"
            fontSize="11"
            fontWeight="600"
            fontFamily="var(--font-sf-text)"
          >
            ROLE PERSPECTIVE A
          </text>
          <text
            x="42"
            y="71"
            fill="var(--apple-label-primary)"
            fontSize="15"
            fontWeight="600"
            fontFamily="var(--font-sf-display)"
          >
            Event Organizer View
          </text>
          <text
            x="42"
            y="89"
            fill="var(--apple-label-secondary)"
            fontSize="11.5"
            fontFamily="var(--font-sf-text)"
          >
            Zones, utility load, hold &amp; confirm
          </text>

          <rect
            x="24"
            y="122"
            width="220"
            height="78"
            rx="16"
            fill="var(--apple-bg-secondary)"
            stroke="var(--apple-separator-strong)"
            strokeWidth="1"
          />
          <text
            x="42"
            y="148"
            fill="var(--apple-link)"
            fontSize="11"
            fontWeight="600"
            fontFamily="var(--font-sf-text)"
          >
            ROLE PERSPECTIVE B
          </text>
          <text
            x="42"
            y="169"
            fill="var(--apple-label-primary)"
            fontSize="15"
            fontWeight="600"
            fontFamily="var(--font-sf-display)"
          >
            Stall Vendor View
          </text>
          <text
            x="42"
            y="187"
            fill="var(--apple-label-secondary)"
            fontSize="11.5"
            fontFamily="var(--font-sf-text)"
          >
            Fit, exposure, power &amp; one-step apply
          </text>

          {/* Connecting lines from Roles to Shared Spatial Truth */}
          <path
            d="M 244 63 C 276 63, 276 92, 308 92"
            fill="none"
            stroke="var(--apple-blue)"
            strokeWidth="1.75"
            markerEnd="url(#ss-arrow-blue)"
          />
          <path
            d="M 244 161 C 276 161, 276 132, 308 132"
            fill="none"
            stroke="var(--apple-blue)"
            strokeWidth="1.75"
            markerEnd="url(#ss-arrow-blue)"
          />

          {/* Center Core: Anchored Venue Floor Grid */}
          <rect
            x="312"
            y="24"
            width="252"
            height="176"
            rx="20"
            fill="var(--apple-surface-elevated)"
            stroke="var(--apple-blue)"
            strokeWidth="1.5"
          />
          <text
            x="332"
            y="50"
            fill="var(--apple-link)"
            fontSize="11"
            fontWeight="600"
            fontFamily="var(--font-sf-text)"
          >
            SHARED SOURCE OF TRUTH
          </text>
          <text
            x="332"
            y="72"
            fill="var(--apple-label-primary)"
            fontSize="16"
            fontWeight="600"
            fontFamily="var(--font-sf-display)"
          >
            Anchored Venue Floor Grid
          </text>

          {/* Mini schematic floor grid inside center node */}
          {[0, 1, 2].map((col) =>
            [0, 1].map((row) => {
              const bx = 332 + col * 72;
              const by = 88 + row * 48;
              const highlighted = col === 1 && row === 0;
              return (
                <g key={`${col}-${row}`}>
                  <rect
                    x={bx}
                    y={by}
                    width="64"
                    height="38"
                    rx="8"
                    fill={highlighted ? 'var(--apple-blue)' : 'var(--apple-bg-secondary)'}
                    fillOpacity={highlighted ? '0.14' : '1'}
                    stroke={highlighted ? 'var(--apple-blue)' : 'var(--apple-separator-strong)'}
                    strokeWidth={highlighted ? '1.5' : '1'}
                  />
                  <text
                    x={bx + 32}
                    y={by + 23}
                    textAnchor="middle"
                    fill={highlighted ? 'var(--apple-link)' : 'var(--apple-label-secondary)'}
                    fontSize="11"
                    fontWeight="600"
                    fontFamily="var(--font-sf-text)"
                  >
                    {row === 0 ? `A-0${col + 1}` : `B-0${col + 1}`}
                  </text>
                </g>
              );
            }),
          )}

          {/* Arrow from Grid to Contextual Inspector */}
          <line
            x1="564"
            y1="112"
            x2="612"
            y2="112"
            stroke="var(--apple-blue)"
            strokeWidth="1.75"
            markerEnd="url(#ss-arrow-blue)"
          />

          {/* Right Column: Contextual Booth Inspector */}
          <rect
            x="616"
            y="24"
            width="240"
            height="176"
            rx="20"
            fill="var(--apple-bg-secondary)"
            stroke="var(--apple-separator-strong)"
            strokeWidth="1"
          />
          <text
            x="636"
            y="50"
            fill="var(--apple-label-tertiary)"
            fontSize="11"
            fontWeight="600"
            fontFamily="var(--font-sf-text)"
          >
            FIXED INSPECTOR RAIL
          </text>
          <text
            x="636"
            y="72"
            fill="var(--apple-label-primary)"
            fontSize="15"
            fontWeight="600"
            fontFamily="var(--font-sf-display)"
          >
            Contextual Booth Spec
          </text>
          {[
            '• Exact footprint & corner rules',
            '• Electrical access (10A / 15A / 20A)',
            '• Load-in window & pricing tier',
            '• Role-adaptive action button',
          ].map((line, idx) => (
            <text
              key={line}
              x="636"
              y={98 + idx * 22}
              fill="var(--apple-label-secondary)"
              fontSize="11.5"
              fontFamily="var(--font-sf-text)"
            >
              {line}
            </text>
          ))}

          {/* Divider line to Bottom Cadence Rail */}
          <line
            x1="24"
            y1="226"
            x2="856"
            y2="226"
            stroke="var(--apple-separator)"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <text
            x="24"
            y="248"
            fill="var(--apple-label-tertiary)"
            fontSize="11"
            fontWeight="600"
            fontFamily="var(--font-sf-text)"
          >
            LINEAR APPROVAL CADENCE (SHARED STATUS VISIBILITY)
          </text>

          {/* 4 Linear Cadence Nodes */}
          {STALLSYNC_CADENCE.map((stage, idx) => {
            const x = 24 + idx * 214;
            const isActive = idx === activeStageIndex;
            return (
              <g key={stage.id}>
                <rect
                  x={x}
                  y="262"
                  width="190"
                  height="56"
                  rx="14"
                  fill={isActive ? 'var(--apple-blue)' : 'var(--apple-bg-secondary)'}
                  fillOpacity={isActive ? '0.12' : '1'}
                  stroke={isActive ? 'var(--apple-blue)' : 'var(--apple-separator-strong)'}
                  strokeWidth={isActive ? '1.6' : '1'}
                />
                <text
                  x={x + 16}
                  y="284"
                  fill={isActive ? 'var(--apple-link)' : 'var(--apple-label-tertiary)'}
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="var(--font-sf-text)"
                >
                  {stage.num}
                </text>
                <text
                  x={x + 16}
                  y="304"
                  fill="var(--apple-label-primary)"
                  fontSize="14"
                  fontWeight="600"
                  fontFamily="var(--font-sf-display)"
                >
                  {stage.label}
                </text>

                {idx < STALLSYNC_CADENCE.length - 1 && (
                  <line
                    x1={x + 192}
                    y1="290"
                    x2={x + 210}
                    y2="290"
                    stroke="var(--apple-label-tertiary)"
                    strokeWidth="1.5"
                    markerEnd="url(#ss-arrow)"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Interactive Stage Selector Bar */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="group"
          aria-label="Inspect StallSync approval cadence stage"
          className="apple-segmented !p-0.5"
        >
          {STALLSYNC_CADENCE.map((stage, idx) => {
            const active = idx === activeStageIndex;
            return (
              <button
                key={stage.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  if (!active) {
                    playTick();
                    setActiveStageIndex(idx);
                  }
                }}
                className={`apple-segmented-item !min-h-[34px] px-3 py-1 text-[12px] ${
                  active
                    ? 'apple-pill-shadow bg-[var(--apple-control-thumb)] text-[var(--apple-label-primary)]'
                    : 'text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                }`}
              >
                {stage.num} · {stage.label}
              </button>
            );
          })}
        </div>

        <p className="type-footnote measure-prose font-normal text-[var(--apple-label-secondary)]">
          <strong className="font-semibold text-[var(--apple-label-primary)]">
            {activeStage.label}:
          </strong>{' '}
          {activeStage.note}
        </p>
      </div>
    </div>
  );
}

/* ==========================================================================
   2. Precognition Labs — Explainable Signal Triage & Human-in-the-Loop Flow
   Grounded strictly in src/data/projects.ts (Precognition Labs chapters 03–06)
   ========================================================================== */
const PRECOGNITION_STEPS = [
  {
    id: 'queue',
    num: '01',
    title: 'Split Triage Queue',
    detail: 'Scannable case list with tabular timestamps, identifiers, and measured severity labels.',
  },
  {
    id: 'ledger',
    num: '02',
    title: 'Transparent Signal Ledger',
    detail: 'Observable behaviors, plain-language summary, and explicit policy citations surfaced before action.',
  },
  {
    id: 'decision',
    num: '03',
    title: 'Human-in-the-Loop Decision',
    detail: 'Unambiguous analyst outcomes: Approve, Request Verification, or Escalate—no black-box triggers.',
  },
  {
    id: 'audit',
    num: '04',
    title: 'Structured Audit Trail',
    detail: 'Verifiable governance record preserving evidence factors, policy clauses, and final reviewer sign-off.',
  },
] as const;

function PrecognitionFlowDiagram() {
  const [selectedStep, setSelectedStep] = useState<number>(1);
  const current = PRECOGNITION_STEPS[selectedStep];

  return (
    <div className="mt-10 rounded-[28px] bg-[var(--apple-bg-secondary)] p-6 sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="type-caption text-[var(--apple-link)]">
            Decision Pipeline Schematic
          </p>
          <h3 className="type-title-3 mt-1 text-[20px]">
            Evidence-First Triage &amp; Governance Flow
          </h3>
        </div>
        <p className="type-caption font-normal text-[var(--apple-label-tertiary)]">
          Select a stage to inspect evidence &amp; policy controls
        </p>
      </div>

      <div className="apple-surface-subtle mt-5 overflow-hidden rounded-[22px] p-4 sm:p-6">
        <svg
          viewBox="0 0 880 268"
          role="img"
          aria-labelledby="precog-flow-title precog-flow-desc"
          className="h-auto w-full"
        >
          <title id="precog-flow-title">
            Precognition Labs Explainable Risk Triage and Human-in-the-Loop Flow
          </title>
          <desc id="precog-flow-desc">
            Four-stage architecture diagram illustrating Split Triage Queue, Transparent Signal Ledger with policy citations, Human-in-the-Loop Decision Controls (Approve, Request Verification, Escalate), and Structured Audit Trail.
          </desc>

          <defs>
            <marker
              id="pl-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path
                d="M 1 1.5 L 8.5 5 L 1 8.5"
                fill="none"
                stroke="var(--apple-blue)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </marker>
          </defs>

          {/* Top 4 Connected Stages */}
          {PRECOGNITION_STEPS.map((step, idx) => {
            const x = 20 + idx * 214;
            const active = idx === selectedStep;
            return (
              <g key={step.id}>
                <rect
                  x={x}
                  y="24"
                  width="192"
                  height="132"
                  rx="18"
                  fill={active ? 'var(--apple-blue)' : 'var(--apple-bg-secondary)'}
                  fillOpacity={active ? '0.11' : '1'}
                  stroke={active ? 'var(--apple-blue)' : 'var(--apple-separator-strong)'}
                  strokeWidth={active ? '1.6' : '1'}
                />
                <text
                  x={x + 16}
                  y="50"
                  fill={active ? 'var(--apple-link)' : 'var(--apple-label-tertiary)'}
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="var(--font-sf-text)"
                >
                  STAGE {step.num}
                </text>
                <text
                  x={x + 16}
                  y="74"
                  fill="var(--apple-label-primary)"
                  fontSize="14.5"
                  fontWeight="600"
                  fontFamily="var(--font-sf-display)"
                >
                  {step.title.split(' ').slice(0, 2).join(' ')}
                </text>
                <text
                  x={x + 16}
                  y="93"
                  fill="var(--apple-label-primary)"
                  fontSize="14.5"
                  fontWeight="600"
                  fontFamily="var(--font-sf-display)"
                >
                  {step.title.split(' ').slice(2).join(' ')}
                </text>

                {/* Stage-specific factual micro-tags */}
                {idx === 0 && (
                  <text
                    x={x + 16}
                    y="124"
                    fill="var(--apple-label-secondary)"
                    fontSize="11"
                    fontFamily="var(--font-sf-text)"
                  >
                    Routine · Elevated · Tabular
                  </text>
                )}
                {idx === 1 && (
                  <text
                    x={x + 16}
                    y="124"
                    fill="var(--apple-label-secondary)"
                    fontSize="11"
                    fontFamily="var(--font-sf-text)"
                  >
                    Signals + Policy Citations
                  </text>
                )}
                {idx === 2 && (
                  <text
                    x={x + 16}
                    y="124"
                    fill="var(--apple-label-secondary)"
                    fontSize="11"
                    fontFamily="var(--font-sf-text)"
                  >
                    Approve · Verify · Escalate
                  </text>
                )}
                {idx === 3 && (
                  <text
                    x={x + 16}
                    y="124"
                    fill="var(--apple-label-secondary)"
                    fontSize="11"
                    fontFamily="var(--font-sf-text)"
                  >
                    Verifiable Decision Log
                  </text>
                )}

                {idx < PRECOGNITION_STEPS.length - 1 && (
                  <line
                    x1={x + 194}
                    y1="90"
                    x2={x + 211}
                    y2="90"
                    stroke="var(--apple-blue)"
                    strokeWidth="1.7"
                    markerEnd="url(#pl-arrow)"
                  />
                )}
              </g>
            );
          })}

          {/* Lower Outcomes & Governance Bar */}
          <rect
            x="20"
            y="182"
            width="840"
            height="64"
            rx="16"
            fill="var(--apple-bg-secondary)"
            stroke="var(--apple-separator)"
            strokeWidth="1"
          />
          <text
            x="40"
            y="207"
            fill="var(--apple-label-tertiary)"
            fontSize="11"
            fontWeight="600"
            fontFamily="var(--font-sf-text)"
          >
            DESIGN INVARIANT — EVIDENCE BEFORE ACTION
          </text>
          <text
            x="40"
            y="229"
            fill="var(--apple-label-secondary)"
            fontSize="12.5"
            fontFamily="var(--font-sf-text)"
          >
            Resolution controls stay paired with observable behaviors and explicit policy clauses so human reviewers remain firmly in command.
          </text>
        </svg>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="group"
          aria-label="Inspect Precognition triage stage"
          className="apple-segmented !p-0.5"
        >
          {PRECOGNITION_STEPS.map((step, idx) => {
            const active = idx === selectedStep;
            return (
              <button
                key={step.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  if (!active) {
                    playTick();
                    setSelectedStep(idx);
                  }
                }}
                className={`apple-segmented-item !min-h-[34px] px-3 py-1 text-[12px] ${
                  active
                    ? 'apple-pill-shadow bg-[var(--apple-control-thumb)] text-[var(--apple-label-primary)]'
                    : 'text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                }`}
              >
                {step.num} · {step.title.split(' ')[0]}
              </button>
            );
          })}
        </div>

        <p className="type-footnote measure-prose font-normal text-[var(--apple-label-secondary)]">
          <strong className="font-semibold text-[var(--apple-label-primary)]">
            {current.title}:
          </strong>{' '}
          {current.detail}
        </p>
      </div>
    </div>
  );
}

/* ==========================================================================
   3. HubApps — Interactive Spacing & Corner-Radius Token Demonstration
   Grounded strictly in src/data/projects.ts (HubApps three-tier surfaces,
   semantic tokens, corner radii, hairline dividers, & density presets)
   ========================================================================== */
type HubDensity = 'compact' | 'balanced' | 'spacious';

const HUB_DENSITY_SPECS: Record<
  HubDensity,
  {
    label: string;
    containerPadPx: number;
    rowGapPx: number;
    rowHeightPx: number;
    shellRadiusPx: number;
    sheetRadiusPx: number;
    controlRadiusPx: number;
    useCase: string;
  }
> = {
  compact: {
    label: 'Compact',
    containerPadPx: 14,
    rowGapPx: 6,
    rowHeightPx: 38,
    shellRadiusPx: 20,
    sheetRadiusPx: 14,
    controlRadiusPx: 8,
    useCase: 'High-density operational tables and long billing ledgers.',
  },
  balanced: {
    label: 'Balanced',
    containerPadPx: 20,
    rowGapPx: 10,
    rowHeightPx: 46,
    shellRadiusPx: 24,
    sheetRadiusPx: 18,
    controlRadiusPx: 10,
    useCase: 'Everyday multi-app workspace shell and mixed record lists.',
  },
  spacious: {
    label: 'Spacious',
    containerPadPx: 28,
    rowGapPx: 14,
    rowHeightPx: 56,
    shellRadiusPx: 28,
    sheetRadiusPx: 22,
    controlRadiusPx: 12,
    useCase: 'Editorial module overviews and executive review summaries.',
  },
};

const SPACING_STEPS = [4, 8, 12, 16, 24, 32] as const;

function HubAppsTokenDemo() {
  const [density, setDensity] = useState<HubDensity>('balanced');
  const [showOverlay, setShowOverlay] = useState(true);
  const spec = HUB_DENSITY_SPECS[density];

  return (
    <div className="mt-10 rounded-[28px] bg-[var(--apple-bg-secondary)] p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="type-caption text-[var(--apple-link)]">
            Interactive Design Token Demonstration
          </p>
          <h3 className="type-title-3 mt-1 text-[20px]">
            Spacing Rhythm, Surface Tiers &amp; Corner Radius Geometry
          </h3>
          <p className="type-footnote mt-1 font-normal text-[var(--apple-label-secondary)]">
            {spec.useCase}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div
            role="group"
            aria-label="HubApps token density preset"
            className="apple-segmented !p-0.5"
          >
            {(['compact', 'balanced', 'spacious'] as const).map((mode) => {
              const active = density === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    if (!active) {
                      playTick();
                      setDensity(mode);
                    }
                  }}
                  className={`apple-segmented-item !min-h-[34px] px-3 py-1 text-[12px] ${
                    active
                      ? 'apple-pill-shadow bg-[var(--apple-control-thumb)] text-[var(--apple-label-primary)]'
                      : 'text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                  }`}
                >
                  {HUB_DENSITY_SPECS[mode].label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            aria-pressed={showOverlay}
            onClick={() => {
              playTick();
              setShowOverlay((prev) => !prev);
            }}
            className={`type-caption inline-flex min-h-[34px] items-center rounded-full px-3.5 py-1 transition-colors ${
              showOverlay
                ? 'bg-[var(--apple-blue)]/12 text-[var(--apple-link)]'
                : 'bg-[var(--apple-control-tonal)] text-[var(--apple-label-secondary)]'
            }`}
          >
            {showOverlay ? 'Guides: On' : 'Guides: Off'}
          </button>
        </div>
      </div>

      {/* Interactive Live Nested Surface + Concentric Radius SVG Schematic */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="apple-surface-subtle rounded-[22px] p-5 sm:p-6 lg:col-span-7">
          <p className="type-caption text-[var(--apple-label-tertiary)]">
            Three-Tier Surface &amp; Concentric Radius Preview
          </p>

          <svg
            viewBox="0 0 500 248"
            role="img"
            aria-labelledby="hubapps-token-title hubapps-token-desc"
            className="mt-3 h-auto w-full"
          >
            <title id="hubapps-token-title">
              HubApps {spec.label} Spacing and Corner Radius Schematic
            </title>
            <desc id="hubapps-token-desc">
              Vector diagram demonstrating concentric nesting across Canvas, Quiet Secondary Surface (radius {spec.shellRadiusPx}px, padding {spec.containerPadPx}px), Primary Sheet (radius {spec.sheetRadiusPx}px), and Inner Controls (radius {spec.controlRadiusPx}px) with {spec.rowGapPx}px row gap.
            </desc>

            {/* Tier 1: Canvas */}
            <rect
              x="4"
              y="4"
              width="492"
              height="240"
              rx="16"
              fill="var(--apple-bg)"
              stroke="var(--apple-separator)"
              strokeWidth="1"
            />
            <text
              x="16"
              y="22"
              fill="var(--apple-label-tertiary)"
              fontSize="10"
              fontWeight="600"
              fontFamily="var(--font-sf-text)"
            >
              TIER 1 · surface-canvas
            </text>

            {/* Tier 2: Quiet Secondary Surface Shell */}
            <rect
              x="22"
              y="32"
              width="456"
              height="196"
              rx={spec.shellRadiusPx}
              fill="var(--apple-bg-secondary)"
              stroke="var(--apple-separator-strong)"
              strokeWidth="1"
            />

            {/* Optional Padding Measurement Guide */}
            {showOverlay && (
              <g>
                <rect
                  x="22"
                  y="32"
                  width={spec.containerPadPx}
                  height="196"
                  fill="var(--apple-blue)"
                  fillOpacity="0.12"
                />
                <text
                  x={22 + spec.containerPadPx / 2}
                  y="134"
                  textAnchor="middle"
                  fill="var(--apple-link)"
                  fontSize="9.5"
                  fontWeight="700"
                  fontFamily="var(--font-sf-text)"
                >
                  {spec.containerPadPx}
                </text>
              </g>
            )}

            {/* Tier 3: Primary Elevated Sheet */}
            <rect
              x={22 + spec.containerPadPx}
              y={32 + spec.containerPadPx}
              width={456 - spec.containerPadPx * 2}
              height={196 - spec.containerPadPx * 2}
              rx={spec.sheetRadiusPx}
              fill="var(--apple-surface-elevated)"
              stroke={showOverlay ? 'var(--apple-blue)' : 'var(--apple-separator-strong)'}
              strokeWidth={showOverlay ? '1.3' : '1'}
            />

            {/* Inner Rows & Control Pill inside Tier 3 Sheet */}
            {[0, 1].map((rowIdx) => {
              const innerX = 22 + spec.containerPadPx + 14;
              const innerW = 456 - spec.containerPadPx * 2 - 28;
              const rowY =
                32 +
                spec.containerPadPx +
                14 +
                rowIdx * (spec.rowHeightPx + spec.rowGapPx);
              const clampedH = Math.min(spec.rowHeightPx, 46);
              return (
                <g key={rowIdx}>
                  <rect
                    x={innerX}
                    y={rowY}
                    width={innerW}
                    height={clampedH}
                    rx={spec.controlRadiusPx}
                    fill="var(--apple-bg-secondary)"
                    stroke="var(--apple-separator)"
                    strokeWidth="1"
                  />
                  <text
                    x={innerX + 12}
                    y={rowY + clampedH / 2 + 4}
                    fill="var(--apple-label-primary)"
                    fontSize="11.5"
                    fontWeight="600"
                    fontFamily="var(--font-sf-text)"
                  >
                    {rowIdx === 0 ? 'surface-primary · Row 01' : 'border-hairline · Row 02'}
                  </text>
                  <rect
                    x={innerX + innerW - 76}
                    y={rowY + (clampedH - 22) / 2}
                    width="64"
                    height="22"
                    rx={Math.max(6, spec.controlRadiusPx - 2)}
                    fill="var(--apple-blue)"
                    fillOpacity="0.14"
                  />
                  <text
                    x={innerX + innerW - 44}
                    y={rowY + clampedH / 2 + 3.5}
                    textAnchor="middle"
                    fill="var(--apple-link)"
                    fontSize="10"
                    fontWeight="600"
                    fontFamily="var(--font-sf-text)"
                  >
                    r-{spec.controlRadiusPx}px
                  </text>
                </g>
              );
            })}

            {/* Concentric Corner Radius Callout Badge */}
            {showOverlay && (
              <g>
                <rect
                  x="348"
                  y="10"
                  width="136"
                  height="18"
                  rx="9"
                  fill="var(--apple-blue)"
                  fillOpacity="0.14"
                />
                <text
                  x="416"
                  y="22.5"
                  textAnchor="middle"
                  fill="var(--apple-link)"
                  fontSize="10"
                  fontWeight="600"
                  fontFamily="var(--font-sf-text)"
                >
                  Shell {spec.shellRadiusPx} → Sheet {spec.sheetRadiusPx}px
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Right: Token Readout Table + Base 4px Spacing Scale */}
        <div className="apple-surface-subtle flex flex-col justify-between rounded-[22px] p-5 sm:p-6 lg:col-span-5">
          <div>
            <p className="type-caption text-[var(--apple-label-tertiary)]">
              Active Preset Tokens ({spec.label})
            </p>
            <dl className="mt-3.5 divide-y divide-[var(--apple-separator-subtle)] text-[13.5px]">
              {[
                { token: '--space-shell-pad', value: `${spec.containerPadPx}px` },
                { token: '--space-row-gap', value: `${spec.rowGapPx}px` },
                { token: '--size-row-height', value: `${spec.rowHeightPx}px` },
                { token: '--radius-shell', value: `${spec.shellRadiusPx}px` },
                { token: '--radius-sheet', value: `${spec.sheetRadiusPx}px` },
                { token: '--radius-control', value: `${spec.controlRadiusPx}px` },
              ].map((entry) => (
                <div
                  key={entry.token}
                  className="flex items-center justify-between py-2"
                >
                  <dt className="font-mono text-[12px] text-[var(--apple-label-secondary)]">
                    {entry.token}
                  </dt>
                  <dd className="tabular-nums font-semibold text-[var(--apple-label-primary)]">
                    {entry.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-5 border-t border-[var(--apple-separator-subtle)] pt-4">
            <p className="type-caption text-[var(--apple-label-tertiary)]">
              4px Base Spacing Scale
            </p>
            <div className="mt-3 space-y-2">
              {SPACING_STEPS.map((px) => (
                <div key={px} className="flex items-center gap-3">
                  <span className="w-9 shrink-0 font-mono text-[11.5px] tabular-nums text-[var(--apple-label-secondary)]">
                    {px}px
                  </span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--apple-bg-secondary)]">
                    <div
                      style={{ width: `${(px / 32) * 100}%` }}
                      className="h-full rounded-full bg-[var(--apple-blue)]/75"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
