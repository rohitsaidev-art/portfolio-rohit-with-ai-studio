import { useState, type ReactNode } from 'react';
import { copyTextToClipboard, type FoundationGapSpec } from '../../utils/foundationsCatalog';
import { playTick } from '../../utils/soundEngine';
import { showToast } from '../../utils/toast';
import { SFCheckmark, SFDocOnDoc, SFXmark } from '../SFSymbols';

interface CopyTokenButtonProps {
  value: string;
  label?: string;
  ariaLabel?: string;
  toastLabel?: string;
  mono?: boolean;
  compact?: boolean;
}

export function CopyTokenButton({
  value,
  label,
  ariaLabel,
  toastLabel,
  mono = true,
  compact = false,
}: CopyTokenButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    playTick();
    const ok = await copyTextToClipboard(value);
    if (ok) {
      setCopied(true);
      showToast({
        message: `Copied ${toastLabel ?? value}`,
        tone: 'success',
        durationMs: 2200,
      });
      window.setTimeout(() => setCopied(false), 1600);
    } else {
      showToast({
        message: `Copy unavailable — value: ${value}`,
        tone: 'info',
        durationMs: 2800,
      });
    }
  };

  return (
    <button
      type="button"
      onClick={() => {
        void handleCopy();
      }}
      aria-label={ariaLabel ?? `Copy ${value}`}
      title={`Copy ${value}`}
      className={`apple-link inline-flex items-center gap-1.5 rounded-[8px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] text-left transition-colors hover:border-[var(--apple-separator-strong)] hover:bg-[var(--apple-bg-secondary)] ${
        compact ? 'min-h-[28px] px-2 py-0.5 text-[11.5px]' : 'min-h-[32px] px-2.5 py-1 text-[12px]'
      }`}
    >
      <span
        className={`truncate ${
          mono
            ? 'font-mono text-[var(--apple-label-primary)]'
            : 'font-medium text-[var(--apple-label-primary)]'
        }`}
      >
        {label ?? value}
      </span>
      {copied ? (
        <SFCheckmark
          size={12}
          className="shrink-0 text-[var(--apple-blue)]"
        />
      ) : (
        <SFDocOnDoc
          size={12}
          className="shrink-0 text-[var(--apple-label-tertiary)]"
        />
      )}
    </button>
  );
}

interface FoundationSectionBlockProps {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  actions?: ReactNode;
  isFirst?: boolean;
  children: ReactNode;
}

export function FoundationSectionBlock({
  id,
  eyebrow,
  title,
  summary,
  actions,
  isFirst = false,
  children,
}: FoundationSectionBlockProps) {
  return (
    <section
      aria-labelledby={id}
      className={isFirst ? '' : 'border-t border-[var(--apple-separator)] pt-14'}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-link)]">
            {eyebrow}
          </p>
          <h2
            id={id}
            className="type-title-2 mt-1.5 text-[var(--apple-label-primary)]"
          >
            {title}
          </h2>
          <p className="type-callout measure-prose mt-2 text-[var(--apple-label-secondary)]">
            {summary}
          </p>
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>

      <div className="mt-8">{children}</div>
    </section>
  );
}

export interface DoDontItem {
  doText: string;
  dontText: string;
}

interface DocumentationStandardsPanelProps {
  headingId: string;
  usageGuidance: readonly string[];
  doDonts: readonly DoDontItem[];
  accessibilityNotes: readonly string[];
  responsiveNotes: readonly string[];
}

export function DocumentationStandardsPanel({
  headingId,
  usageGuidance,
  doDonts,
  accessibilityNotes,
  responsiveNotes,
}: DocumentationStandardsPanelProps) {
  return (
    <section
      aria-labelledby={headingId}
      className="border-t border-[var(--apple-separator)] pt-14"
    >
      <p className="text-[11.5px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-link)]">
        Implementation Standards
      </p>
      <h2
        id={headingId}
        className="type-title-2 mt-1.5 text-[var(--apple-label-primary)]"
      >
        Usage, Do / Don&apos;t, Accessibility &amp; Responsive Rules
      </h2>

      {/* Editorial Usage Guidance */}
      <div className="mt-8 grid grid-cols-1 gap-10 border-b border-[var(--apple-separator)] pb-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-label-tertiary)]">
            Usage Guidance
          </h3>
          <p className="mt-1.5 text-[13.5px] leading-[1.52] text-[var(--apple-label-secondary)]">
            When and why to apply these tokens across public portfolio views.
          </p>
        </div>
        <ul className="space-y-3 lg:col-span-8">
          {usageGuidance.map((line) => (
            <li
              key={line}
              className="flex items-baseline gap-3 text-[14.5px] leading-[1.58] text-[var(--apple-label-primary)]"
            >
              <span
                aria-hidden="true"
                className="text-[var(--apple-label-tertiary)]"
              >
                —
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Do / Don't Editorial Comparison */}
      <div className="grid grid-cols-1 gap-10 border-b border-[var(--apple-separator)] py-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-label-tertiary)]">
            Do &amp; Don&apos;t
          </h3>
          <p className="mt-1.5 text-[13.5px] leading-[1.52] text-[var(--apple-label-secondary)]">
            Concrete guardrails preserving restraint and visual calibration.
          </p>
        </div>
        <div className="divide-y divide-[var(--apple-separator-subtle)] lg:col-span-8">
          {doDonts.map((pair) => (
            <div
              key={pair.doText}
              className="grid grid-cols-1 gap-4 py-4 first:pt-0 last:pb-0 sm:grid-cols-2 sm:gap-6"
            >
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--apple-blue)]/10 text-[var(--apple-link)]">
                  <SFCheckmark size={11} />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-link)]">
                    Do
                  </p>
                  <p className="mt-1 text-[13.5px] leading-[1.52] text-[var(--apple-label-primary)]">
                    {pair.doText}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--apple-error)]/10 text-[var(--apple-error)]">
                  <SFXmark size={11} />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-error)]">
                    Don&apos;t
                  </p>
                  <p className="mt-1 text-[13.5px] leading-[1.52] text-[var(--apple-label-secondary)]">
                    {pair.dontText}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accessibility & Responsive Columns */}
      <div className="grid grid-cols-1 gap-10 pt-10 md:grid-cols-2">
        <div>
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-label-tertiary)]">
            Accessibility Considerations
          </h3>
          <ul className="mt-4 space-y-2.5">
            {accessibilityNotes.map((note) => (
              <li
                key={note}
                className="flex items-baseline gap-2.5 text-[14px] leading-[1.55] text-[var(--apple-label-secondary)]"
              >
                <span
                  aria-hidden="true"
                  className="text-[var(--apple-label-tertiary)]"
                >
                  ·
                </span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-label-tertiary)]">
            Responsive &amp; Environment Considerations
          </h3>
          <ul className="mt-4 space-y-2.5">
            {responsiveNotes.map((note) => (
              <li
                key={note}
                className="flex items-baseline gap-2.5 text-[14px] leading-[1.55] text-[var(--apple-label-secondary)]"
              >
                <span
                  aria-hidden="true"
                  className="text-[var(--apple-label-tertiary)]"
                >
                  ·
                </span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

interface FoundationGapsSectionProps {
  headingId: string;
  gaps: readonly FoundationGapSpec[];
}

export function FoundationGapsSection({
  headingId,
  gaps,
}: FoundationGapsSectionProps) {
  if (gaps.length === 0) return null;

  return (
    <section
      aria-labelledby={headingId}
      className="border-t border-[var(--apple-separator)] pt-14"
    >
      <p className="text-[11.5px] font-semibold uppercase tracking-[0.07em] text-[var(--apple-label-tertiary)]">
        Foundation Audit &amp; Resolution Ledger
      </p>
      <h2
        id={headingId}
        className="type-title-3 mt-1.5 text-[var(--apple-label-primary)]"
      >
        Audited Gaps &amp; Stage 2.5 Decisions
      </h2>
      <p className="type-footnote measure-prose mt-1.5 font-normal text-[var(--apple-label-secondary)]">
        Every finding audited directly against <code className="font-mono text-[12px]">src/index.css</code> — genuine inconsistencies resolved before Stage 3, intentional Tailwind conventions documented without token bloat.
      </p>

      <div className="mt-6 divide-y divide-[var(--apple-separator)] border-y border-[var(--apple-separator)]">
        {gaps.map((gap) => {
          const isFixed = gap.resolution === 'fixed';
          return (
            <div
              key={gap.id}
              className="grid grid-cols-1 gap-4 py-6 lg:grid-cols-12 lg:gap-8"
            >
              <div className="lg:col-span-4">
                <p className="text-[15px] font-semibold tracking-[-0.015em] text-[var(--apple-label-primary)]">
                  {gap.title}
                </p>
                <p
                  className={`mt-1.5 inline-flex items-center gap-1.5 text-[12px] font-semibold ${
                    isFixed
                      ? 'text-[var(--apple-success)]'
                      : 'text-[var(--apple-label-tertiary)]'
                  }`}
                >
                  {isFixed && <SFCheckmark size={11} />}
                  <span>
                    {isFixed
                      ? 'Resolved · Stage 2.5'
                      : 'Retained Convention · Stage 2.5'}
                  </span>
                </p>
              </div>
              <div className="space-y-2.5 text-[13.5px] leading-[1.55] lg:col-span-8">
                <p className="text-[var(--apple-label-secondary)]">
                  <strong className="font-medium text-[var(--apple-label-primary)]">
                    Audit finding:
                  </strong>{' '}
                  {gap.observedInCode}
                </p>
                <p className="text-[var(--apple-label-secondary)]">
                  <strong className="font-medium text-[var(--apple-label-primary)]">
                    Context:
                  </strong>{' '}
                  {gap.impact}
                </p>
                <p className="text-[var(--apple-label-secondary)]">
                  <strong
                    className={`font-medium ${
                      isFixed
                        ? 'text-[var(--apple-success)]'
                        : 'text-[var(--apple-link)]'
                    }`}
                  >
                    {isFixed ? 'Resolution:' : 'Decision:'}
                  </strong>{' '}
                  {gap.resolutionSummary}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
