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
import { Check, Copy, Download, Upload } from 'lucide-react';

interface DecisionLogSectionProps {
  entries: readonly DecisionLogEntry[];
  onUpdateStatus: (id: string, status: DecisionStatus) => void;
  onUpdateRationale: (id: string, rationale: string) => void;
  onDeleteEntry: (id: string) => void;
  onImportEntries: (entries: DecisionLogEntry[]) => void;
  onRevisitEffectTrack: (trackId: EffectTrackId) => void;
  onRevisitExperiment?: (experimentId: string) => void;
  onPromoteApproved?: () => void;
}

const STATUS_LABELS: Record<DecisionStatus, string> = {
  exploring: 'Exploring',
  approved: 'Approved',
  rejected: 'Rejected',
  promoted: 'Promoted',
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
  onRevisitExperiment,
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
    <div className="space-y-6">
      {/* Top Filter & Export Bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="apple-segmented overflow-x-auto" role="group" aria-label="Filter decisions by status">
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
                className={`apple-segmented-item !min-h-[30px] whitespace-nowrap px-3 text-[12px] ${
                  active
                    ? 'apple-pill-shadow bg-[var(--apple-control-thumb)] text-[var(--apple-label-primary)]'
                    : 'text-[var(--apple-label-secondary)]'
                }`}
              >
                <span>{item.label}</span>
                <span className="tabular-nums text-[11px] opacity-65">
                  {counts[item.id]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={handleDownloadJson}
            className="apple-btn-tonal !min-h-[34px] whitespace-nowrap !px-3 !py-1 !text-[12px]"
          >
            <Download size={12} strokeWidth={2} aria-hidden="true" />
            <span>JSON</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="apple-btn-tonal !min-h-[34px] whitespace-nowrap !px-3 !py-1 !text-[12px]"
          >
            <Download size={12} strokeWidth={2} aria-hidden="true" />
            <span>Markdown</span>
          </button>
          <button
            type="button"
            onClick={() => handleCopy('md')}
            className="apple-btn-tonal !min-h-[34px] whitespace-nowrap !px-3 !py-1 !text-[12px]"
          >
            {copiedFormat === 'md' ? (
              <>
                <Check size={12} strokeWidth={2} aria-hidden="true" className="text-[var(--apple-blue)]" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy size={12} strokeWidth={2} aria-hidden="true" />
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
            className="apple-btn-outline !min-h-[34px] whitespace-nowrap !px-3 !py-1 !text-[12px]"
          >
            <Upload size={12} strokeWidth={2} aria-hidden="true" />
            <span>Import</span>
          </button>
        </div>
      </div>

      {/* Inline Promotion Action (shown only when approved items exist) */}
      {counts.approved > 0 && onPromoteApproved && (
        <div className="flex flex-col gap-3 rounded-[16px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-[var(--apple-label-primary)]">
            <strong className="font-semibold">{counts.approved} approved</strong>{' '}
            {counts.approved === 1 ? 'decision' : 'decisions'} ready for manual token promotion.
          </p>
          <button
            type="button"
            onClick={() => {
              playSuccessChime();
              onPromoteApproved();
            }}
            className="apple-btn-primary !min-h-[32px] shrink-0 whitespace-nowrap !px-3.5 !py-1 !text-[12px]"
          >
            Mark Approved as Promoted
          </button>
        </div>
      )}

      {/* JSON Import Drawer */}
      {showImportDrawer && (
        <div className="rounded-[18px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[14.5px] font-semibold text-[var(--apple-label-primary)]">
                Import Decision Log JSON
              </p>
              <p className="text-[12.5px] text-[var(--apple-label-secondary)]">
                Scoped to Decision Log entries only.
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
            placeholder="Paste exported Decision Log JSON…"
            aria-label="Paste Decision Log JSON"
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
              onClick={() => handleApplyImport(importText)}
              disabled={!importText.trim()}
              className="apple-btn-primary !min-h-[34px] !px-4 !py-1 !text-[12.5px]"
            >
              Validate &amp; Import
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

      {/* Decision Entries */}
      {visibleEntries.length === 0 ? (
        <div className="rounded-[18px] border border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] px-6 py-12 text-center">
          <p className="text-[14.5px] font-medium text-[var(--apple-label-primary)]">
            No decisions logged here yet.
          </p>
          <p className="mx-auto mt-1.5 max-w-[44ch] text-[13px] text-[var(--apple-label-secondary)]">
            Approve or reject treatments in Colour &amp; Themes, Materials &amp; Effects, or Experiments to track design decisions here.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {visibleEntries.map((entry) => (
            <article
              key={entry.id}
              className="rounded-[18px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-5"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 text-[12px] text-[var(--apple-label-tertiary)]">
                    <span className="font-medium text-[var(--apple-link)]">
                      {STATUS_LABELS[entry.status]}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{entry.paletteContext === 'cool' ? 'Cool' : 'Warm'}</span>
                    <span aria-hidden="true">·</span>
                    <span>{entry.themeContext === 'dark' ? 'Dark' : 'Light'}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      {new Date(entry.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="mt-1 text-[16px] font-semibold text-[var(--apple-label-primary)]">
                    {entry.title}{' '}
                    <span className="font-normal text-[var(--apple-label-secondary)]">
                      — {entry.variantLabel}
                    </span>
                  </h3>

                  <div className="mt-2 flex flex-wrap gap-x-3.5 gap-y-1 font-mono text-[11.5px] text-[var(--apple-label-secondary)]">
                    {Object.entries(entry.parameters).map(([key, val]) => (
                      <span key={key}>
                        {key}:{' '}
                        <strong className="font-medium text-[var(--apple-label-primary)]">
                          {String(val)}
                        </strong>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
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
                    className="apple-input !w-auto min-h-[32px] rounded-full px-3 py-0.5 text-[12px] font-medium"
                  >
                    <option value="exploring">Exploring</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="promoted">Promoted</option>
                  </select>

                  {entry.trackId && (
                    <button
                      type="button"
                      onClick={() => {
                        playTick();
                        onRevisitEffectTrack(entry.trackId!);
                      }}
                      className="apple-btn-tonal !min-h-[32px] whitespace-nowrap !px-3 !py-0.5 !text-[12px]"
                    >
                      Open Track
                    </button>
                  )}

                  {entry.experimentId && onRevisitExperiment && (
                    <button
                      type="button"
                      onClick={() => {
                        playTick();
                        onRevisitExperiment(entry.experimentId!);
                      }}
                      className="apple-btn-tonal !min-h-[32px] whitespace-nowrap !px-3 !py-0.5 !text-[12px]"
                    >
                      Open Study
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      playTap();
                      onDeleteEntry(entry.id);
                    }}
                    className="apple-btn-outline !min-h-[32px] !px-2.5 !py-0.5 !text-[12px] text-[var(--apple-label-secondary)]"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="mt-3.5 border-t border-[var(--apple-separator-subtle)] pt-3.5">
                <input
                  id={`decision-rationale-${entry.id}`}
                  type="text"
                  aria-label="Decision rationale"
                  placeholder="Add decision rationale…"
                  value={entry.rationale}
                  onChange={(e) => onUpdateRationale(entry.id, e.target.value)}
                  className="apple-input min-h-[36px] rounded-[10px] px-3 py-1.5 text-[13px]"
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
