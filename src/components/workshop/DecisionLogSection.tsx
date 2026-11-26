import { useRef, useState } from 'react';
import {
  generateTokenPromotionMarkdown,
  parseImportedDecisionLogJson,
  serializeDecisionLogJson,
  type DecisionLogEntry,
  type DecisionStatus,
  type EffectTrackId,
} from '../../utils/workshopStore';
import { playSuccessChime, playTap, playTick } from '../../utils/soundEngine';
import {
  SFCheckmark,
  SFDocOnDoc,
  SFDownload,
  SFUpload,
} from '../SFSymbols';

interface DecisionLogSectionProps {
  entries: readonly DecisionLogEntry[];
  onUpdateStatus: (id: string, status: DecisionStatus) => void;
  onUpdateRationale: (id: string, rationale: string) => void;
  onDeleteEntry: (id: string) => void;
  onImportEntries: (entries: DecisionLogEntry[]) => void;
  onRevisitEffectTrack: (trackId: EffectTrackId) => void;
  onPromoteApproved?: () => void;
}

const STATUS_META: Record<
  DecisionStatus,
  { label: string; description: string }
> = {
  exploring: {
    label: 'Exploring',
    description: 'Active visual study under comparison.',
  },
  approved: {
    label: 'Approved',
    description: 'Approved for intentional token promotion (not live yet).',
  },
  rejected: {
    label: 'Rejected',
    description: 'Excluded from production; retained for reference.',
  },
  promoted: {
    label: 'Promoted to Production',
    description: 'Manually implemented in shared production tokens.',
  },
};

function triggerTextDownload(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function DecisionLogSection({
  entries,
  onUpdateStatus,
  onUpdateRationale,
  onDeleteEntry,
  onImportEntries,
  onRevisitEffectTrack,
  onPromoteApproved,
}: DecisionLogSectionProps) {
  const [filter, setFilter] = useState<'all' | DecisionStatus>('all');
  const [importText, setImportText] = useState('');
  const [showImportDrawer, setShowImportDrawer] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [copiedFormat, setCopiedFormat] = useState<'json' | 'md' | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const counts = {
    all: entries.length,
    exploring: entries.filter((e) => e.status === 'exploring').length,
    approved: entries.filter((e) => e.status === 'approved').length,
    rejected: entries.filter((e) => e.status === 'rejected').length,
    promoted: entries.filter((e) => e.status === 'promoted').length,
  };

  const visibleEntries =
    filter === 'all' ? entries : entries.filter((e) => e.status === filter);

  const handleCopy = async (format: 'json' | 'md') => {
    const text =
      format === 'json'
        ? serializeDecisionLogJson(entries)
        : generateTokenPromotionMarkdown(entries);
    try {
      await navigator.clipboard.writeText(text);
      playSuccessChime();
      setCopiedFormat(format);
      window.setTimeout(() => setCopiedFormat(null), 2000);
    } catch {
      setCopiedFormat(null);
    }
  };

  const handleDownloadJson = () => {
    playSuccessChime();
    triggerTextDownload(
      'design-workshop-decision-log.json',
      serializeDecisionLogJson(entries),
      'application/json',
    );
  };

  const handleDownloadMarkdown = () => {
    playSuccessChime();
    triggerTextDownload(
      'token-promotion-summary.md',
      generateTokenPromotionMarkdown(entries),
      'text/markdown',
    );
  };

  const handleApplyImport = (raw: string) => {
    const parsed = parseImportedDecisionLogJson(raw);
    if (!parsed.ok) {
      playTap();
      setImportError(parsed.error);
      return;
    }
    setImportError(null);
    playSuccessChime();
    onImportEntries(parsed.entries);
    setImportText('');
    setShowImportDrawer(false);
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
    <div className="space-y-10">
      {/* Header & Workflow Rule */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="type-caption text-[var(--apple-link)]">
            P1.4 · Visual Approval Workflow
          </p>
          <h2 className="type-title-2 mt-1.5">
            Decision Log &amp; Token Promotion Summary
          </h2>
          <p className="type-callout measure-prose mt-2">
            Every experimental visual treatment follows{' '}
            <strong className="font-semibold text-[var(--apple-label-primary)]">
              EXPLORE → COMPARE → APPROVE / REJECT → IMPLEMENT
            </strong>
            . Approvals record intent only and never alter the public portfolio automatically.
          </p>
        </div>

        {/* Export / Import Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadJson}
            className="apple-btn-tonal !min-h-[36px] !px-3.5 !py-1.5 !text-[12.5px]"
          >
            <SFDownload size={13} />
            <span>Export JSON</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="apple-btn-tonal !min-h-[36px] !px-3.5 !py-1.5 !text-[12.5px]"
          >
            <SFDownload size={13} />
            <span>Export Markdown</span>
          </button>
          <button
            type="button"
            onClick={() => handleCopy('md')}
            className="apple-btn-tonal !min-h-[36px] !px-3.5 !py-1.5 !text-[12.5px]"
          >
            {copiedFormat === 'md' ? (
              <>
                <SFCheckmark size={13} className="text-[var(--apple-blue)]" />
                <span>Copied MD</span>
              </>
            ) : (
              <>
                <SFDocOnDoc size={13} />
                <span>Copy Summary</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              playTick();
              setShowImportDrawer((s) => !s);
              setImportError(null);
            }}
            className="apple-btn-outline !min-h-[36px] !px-3.5 !py-1.5 !text-[12.5px]"
          >
            <SFUpload size={13} />
            <span>Import JSON</span>
          </button>
        </div>
      </div>

      {/* P2.1 Production Promotion Gate Status */}
      <div className="flex flex-col gap-3 rounded-[20px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="type-footnote font-semibold text-[var(--apple-label-primary)]">
            {counts.approved > 0
              ? `${counts.approved} approved ${counts.approved === 1 ? 'treatment' : 'treatments'} ready for token promotion`
              : 'Production baseline preserved — 0 treatments approved for promotion'}
          </p>
          <p className="type-caption mt-0.5 font-normal text-[var(--apple-label-secondary)]">
            {counts.approved > 0
              ? 'After manually applying approved token values in src/index.css, mark them Promoted to Production below.'
              : 'Exploring treatments stay isolated here and rejected treatments remain excluded from production.'}
          </p>
        </div>
        {counts.approved > 0 && onPromoteApproved && (
          <button
            type="button"
            onClick={() => {
              playSuccessChime();
              onPromoteApproved();
            }}
            className="apple-btn-primary !min-h-[36px] shrink-0 !px-4 !py-1 !text-[12.5px]"
          >
            Mark Approved as Promoted
          </button>
        )}
      </div>

      {/* JSON Import Drawer */}
      {showImportDrawer && (
        <div className="rounded-[22px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="type-headline text-[15px]">Import Decision Log JSON</p>
              <p className="type-footnote font-normal text-[var(--apple-label-secondary)]">
                Upload a previously exported <code className="font-mono">.json</code> file or paste JSON below.
              </p>
            </div>
            <div>
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
                className="apple-btn-tonal !min-h-[34px] !px-3.5 !py-1 !text-[12.5px]"
              >
                Choose .json file
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
            placeholder='Paste exported Decision Log JSON here…'
            aria-label="Paste Decision Log JSON"
            className="apple-input mt-3 rounded-[14px] px-3.5 py-2.5 font-mono text-[12.5px]"
          />

          {importError && (
            <p role="alert" className="mt-2 text-[13px] text-[var(--apple-error)]">
              {importError}
            </p>
          )}

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleApplyImport(importText)}
              disabled={!importText.trim()}
              className="apple-btn-primary !min-h-[36px] !px-4 !py-1 !text-[13px]"
            >
              Validate &amp; Import
            </button>
            <button
              type="button"
              onClick={() => setShowImportDrawer(false)}
              className="apple-btn-tonal !min-h-[36px] !px-4 !py-1 !text-[13px]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Status Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="apple-segmented" role="group" aria-label="Filter decisions by status">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'exploring', label: 'Exploring' },
              { id: 'approved', label: 'Approved' },
              { id: 'rejected', label: 'Rejected' },
              { id: 'promoted', label: 'Promoted' },
            ] as const
          ).map((item) => {
            const active = filter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  playTick();
                  setFilter(item.id);
                }}
                className={`apple-segmented-item !min-h-[32px] px-3.5 text-[12.5px] ${
                  active
                    ? 'apple-pill-shadow bg-[var(--apple-control-thumb)] text-[var(--apple-label-primary)]'
                    : 'text-[var(--apple-label-secondary)]'
                }`}
              >
                <span>{item.label}</span>
                <span className="tabular-nums text-[11px] opacity-70">
                  {counts[item.id]}
                </span>
              </button>
            );
          })}
        </div>

        <p className="type-footnote tabular-nums text-[var(--apple-label-tertiary)]">
          Showing {visibleEntries.length} of {entries.length} logged decisions
        </p>
      </div>

      {/* Decision Entries List */}
      {visibleEntries.length === 0 ? (
        <div className="rounded-[24px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] px-6 py-12 text-center">
          <p className="type-headline text-[var(--apple-label-primary)]">
            No decisions recorded in this view yet.
          </p>
          <p className="type-callout mx-auto mt-2 max-w-[46ch] text-[var(--apple-label-secondary)]">
            Explore the Cool vs. Warm Foundations or any of the 7 tracks in the Effects Lab and click Approve, Reject, or Log Exploring to record parameter snapshots here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleEntries.map((entry) => (
            <article
              key={entry.id}
              className="rounded-[22px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-5 sm:p-6"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="type-caption flex flex-wrap items-center gap-x-2 text-[var(--apple-label-tertiary)]">
                    <span className="text-[var(--apple-link)]">
                      {STATUS_META[entry.status].label}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {entry.paletteContext === 'cool' ? 'Cool Neutral' : 'Warm Neutral'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{entry.themeContext === 'dark' ? 'Dark' : 'Light'}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      Updated {new Date(entry.updatedAt).toLocaleString()}
                    </span>
                  </div>

                  <h3 className="type-title-3 mt-1.5 text-[var(--apple-label-primary)]">
                    {entry.title}{' '}
                    <span className="font-normal text-[var(--apple-label-secondary)]">
                      — {entry.variantLabel}
                    </span>
                  </h3>

                  {/* Recorded Parameters */}
                  <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[12px] text-[var(--apple-label-secondary)]">
                    {Object.entries(entry.parameters).map(([key, val]) => (
                      <span key={key}>
                        {key}:{' '}
                        <strong className="font-semibold text-[var(--apple-label-primary)]">
                          {String(val)}
                        </strong>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Revisit / Status Selector */}
                <div className="flex flex-wrap items-center gap-2">
                  <label className="sr-only" htmlFor={`decision-status-${entry.id}`}>
                    Change status for {entry.variantLabel}
                  </label>
                  <select
                    id={`decision-status-${entry.id}`}
                    value={entry.status}
                    onChange={(e) => {
                      playTick();
                      onUpdateStatus(entry.id, e.target.value as DecisionStatus);
                    }}
                    className="apple-input !w-auto min-h-[36px] rounded-full px-3.5 py-1 text-[12.5px] font-medium"
                  >
                    <option value="exploring">Exploring</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="promoted">Promoted to Production</option>
                  </select>

                  {entry.trackId && (
                    <button
                      type="button"
                      onClick={() => {
                        playTick();
                        onRevisitEffectTrack(entry.trackId!);
                      }}
                      className="apple-btn-tonal !min-h-[36px] !px-3.5 !py-1 !text-[12.5px]"
                    >
                      Revisit in Lab
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      playTap();
                      onDeleteEntry(entry.id);
                    }}
                    className="apple-btn-tonal !min-h-[36px] !px-3 !py-1 !text-[12.5px] text-[var(--apple-label-secondary)]"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Editable Rationale */}
              <div className="mt-4 border-t border-[var(--apple-separator-subtle)] pt-4">
                <label
                  htmlFor={`decision-rationale-${entry.id}`}
                  className="type-caption block text-[var(--apple-label-tertiary)]"
                >
                  Rationale &amp; implementation notes
                </label>
                <input
                  id={`decision-rationale-${entry.id}`}
                  type="text"
                  value={entry.rationale}
                  onChange={(e) => onUpdateRationale(entry.id, e.target.value)}
                  className="apple-input mt-1.5 min-h-[38px] rounded-[12px] px-3.5 py-1.5 text-[13.5px]"
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
