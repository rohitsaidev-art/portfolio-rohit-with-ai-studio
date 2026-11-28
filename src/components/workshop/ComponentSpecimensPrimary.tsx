import { useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { PROJECTS } from '../../data/projects';
import { CAPABILITIES, SITE_CONFIG } from '../../data/site';
import { VERIFIED_TESTIMONIALS } from '../../data/testimonials';
import { SPRING_SEGMENT } from '../../utils/motion';
import {
  getRelatedProjects,
  validateContactForm,
  type ContactFormValues,
  type TocVariant,
} from '../../utils/portfolio';
import { playSuccessChime, playTap, playTick } from '../../utils/soundEngine';
import { showToast } from '../../utils/toast';
import { Breadcrumbs } from '../Breadcrumbs';
import { CommandPalette } from '../CommandPalette';
import { GlobalPreferencesPopover } from '../GlobalPreferencesPopover';
import { ProjectCard } from '../ProjectCard';
import { ProjectCreditsSection } from '../ProjectCreditsSection';
import { ReaderComfortPopover } from '../ReaderComfortPopover';
import { RelatedProjectsSection } from '../RelatedProjectsSection';
import {
  ArrowUp,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  Menu,
  Search,
  SlidersHorizontal,
  Volume2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  TableOfContents,
  TOC_VARIANTS,
  type TocChapter,
} from '../TableOfContents';
import { TestimonialsSection } from '../TestimonialsSection';

export interface SpecimenRenderProps {
  componentId: string;
  viewportMode: 'desktop' | 'tablet' | 'mobile';
  onPreviewNavigate: (path: string) => void;
}

const SAMPLE_TOC_CHAPTERS: readonly TocChapter[] = [
  {
    id: 'overview',
    num: '01',
    label: 'Overview',
    subtitle: 'Framing the product challenge, constraints, and measurable scope.',
  },
  {
    id: 'problem',
    num: '02',
    label: 'Problem & Context',
    subtitle: 'Field observations, friction bottlenecks, and baseline user journeys.',
  },
  {
    id: 'architecture',
    num: '03',
    label: 'Spatial Architecture',
    subtitle: 'Information hierarchy, navigation primitives, and system tokens.',
  },
  {
    id: 'prototype',
    num: '04',
    label: 'Interactive Study',
    subtitle: 'Tactile micro-interactions validated through live prototyping.',
  },
  {
    id: 'outcomes',
    num: '05',
    label: 'Outcomes & Craft',
    subtitle: 'Production results, accessibility verification, and design learnings.',
  },
];

function ControlBar({
  children,
}: {
  children: React.ReactNode;
}) {
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
   A1. Buttons & Editorial Links
   ========================================================================== */
function ButtonsSpecimen() {
  const [variant, setVariant] = useState<'primary' | 'outline' | 'tonal' | 'link'>('primary');
  const [stateMode, setStateMode] = useState<'default' | 'disabled' | 'loading'>('default');
  const [withIcon, setWithIcon] = useState(true);
  const [compact, setCompact] = useState(false);
  const [clicks, setClicks] = useState(0);
  const targetRef = useRef<HTMLButtonElement | null>(null);

  const isDisabled = stateMode === 'disabled';
  const isLoading = stateMode === 'loading';

  const compactClass = compact
    ? '!min-h-[34px] !px-3.5 !py-1 !text-[13px]'
    : '';

  return (
    <div>
      <ControlBar>
        <div className="flex flex-wrap items-center gap-2">
          <MiniChoiceGroup
            ariaLabel="Button variant"
            value={variant}
            onChange={setVariant}
            options={[
              { id: 'primary', label: 'Primary' },
              { id: 'outline', label: 'Outline' },
              { id: 'tonal', label: 'Tonal' },
              { id: 'link', label: 'Editorial Link' },
            ]}
          />
          <MiniChoiceGroup
            ariaLabel="Button state"
            value={stateMode}
            onChange={setStateMode}
            options={[
              { id: 'default', label: 'Interactive' },
              { id: 'disabled', label: 'Disabled' },
              { id: 'loading', label: 'Loading' },
            ]}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={withIcon}
            onClick={() => {
              playTick();
              setWithIcon((prev) => !prev);
            }}
            className="apple-link rounded-[8px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-2.5 py-1 text-[12px] font-medium text-[var(--apple-label-primary)]"
          >
            Icon: {withIcon ? 'On' : 'Off'}
          </button>
          {variant !== 'link' && (
            <button
              type="button"
              aria-pressed={compact}
              onClick={() => {
                playTick();
                setCompact((prev) => !prev);
              }}
              className="apple-link rounded-[8px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-2.5 py-1 text-[12px] font-medium text-[var(--apple-label-primary)]"
            >
              Size: {compact ? 'Compact' : 'Default 44px'}
            </button>
          )}
          <button
            type="button"
            onClick={() => targetRef.current?.focus()}
            className="apple-link text-[12px] font-medium text-[var(--apple-link)] hover:underline"
          >
            Test Focus
          </button>
        </div>
      </ControlBar>

      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          {variant === 'link' ? (
            <button
              ref={targetRef}
              type="button"
              disabled={isDisabled}
              aria-disabled={isDisabled || undefined}
              onClick={() => {
                playTick();
                setClicks((c) => c + 1);
              }}
              className="apple-link inline-flex items-center gap-1 text-[15.5px] font-medium text-[var(--apple-link)] hover:underline"
            >
              {isLoading && <span className="apple-spinner" aria-hidden="true" />}
              <span>{isLoading ? 'Opening case study…' : 'Read case study'}</span>
              {withIcon && !isLoading && <ChevronRight size={14} strokeWidth={1.75} aria-hidden="true" />}
            </button>
          ) : (
            <button
              ref={targetRef}
              type="button"
              disabled={isDisabled}
              aria-busy={isLoading || undefined}
              data-loading={isLoading ? 'true' : undefined}
              onClick={() => {
                playTick();
                setClicks((c) => c + 1);
              }}
              className={`${
                variant === 'primary'
                  ? 'apple-btn-primary'
                  : variant === 'outline'
                    ? 'apple-btn-outline'
                    : 'apple-btn-tonal'
              } ${compactClass}`}
            >
              {isLoading && <span className="apple-spinner" aria-hidden="true" />}
              <span>
                {isLoading
                  ? 'Preparing inquiry…'
                  : variant === 'primary'
                    ? 'Explore Selected Work'
                    : variant === 'outline'
                      ? 'Get in touch'
                      : 'Copy email address'}
              </span>
              {withIcon && !isLoading && (
                <ChevronRight size={compact ? 13 : 15} strokeWidth={compact ? 2 : 1.75} aria-hidden="true" />
              )}
            </button>
          )}
        </div>

        <p className="type-footnote tabular-nums font-normal text-[var(--apple-label-tertiary)]">
          Activations: <strong className="font-semibold text-[var(--apple-label-primary)]">{clicks}</strong>
        </p>
      </div>

      {/* Hierarchy Strip Comparison */}
      <div className="mt-7 border-t border-[var(--apple-separator-subtle)] pt-5">
        <p className="type-caption text-[var(--apple-label-tertiary)]">
          Paired Action Hierarchy (Primary + Outline + Tonal + Link)
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => playTick()} className="apple-btn-primary">
            Primary CTA
          </button>
          <button type="button" onClick={() => playTick()} className="apple-btn-outline">
            Outline Action
          </button>
          <button type="button" onClick={() => playTick()} className="apple-btn-tonal">
            Tonal Utility
          </button>
          <a
            href="#buttons-preview"
            onClick={(e) => {
              e.preventDefault();
              playTick();
            }}
            className="apple-link inline-flex items-center gap-1 px-1 text-[15px] font-medium text-[var(--apple-link)] hover:underline"
          >
            <span>Editorial link</span>
            <ChevronRight size={14} strokeWidth={1.75} aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   A2. Icon Buttons & Action Groups
   ========================================================================== */
function IconButtonsSpecimen() {
  const [saved, setSaved] = useState(false);
  const [zoom, setZoom] = useState<100 | 175 | 250>(100);
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <ControlBar>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={saved}
            onClick={() => {
              playTick();
              setSaved((prev) => !prev);
            }}
            className="apple-link rounded-[8px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-2.5 py-1 text-[12px] font-medium text-[var(--apple-label-primary)]"
          >
            Toggle Selected: {saved ? 'On' : 'Off'}
          </button>
          <button
            type="button"
            aria-pressed={disabled}
            onClick={() => {
              playTick();
              setDisabled((prev) => !prev);
            }}
            className="apple-link rounded-[8px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-2.5 py-1 text-[12px] font-medium text-[var(--apple-label-primary)]"
          >
            Disabled: {disabled ? 'On' : 'Off'}
          </button>
          <button
            type="button"
            aria-pressed={loading}
            onClick={() => {
              playTick();
              setLoading((prev) => !prev);
            }}
            className="apple-link rounded-[8px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-2.5 py-1 text-[12px] font-medium text-[var(--apple-label-primary)]"
          >
            Loading: {loading ? 'On' : 'Off'}
          </button>
        </div>
      </ControlBar>

      <div className="flex flex-wrap items-center gap-5">
        <div className="space-y-2">
          <p className="type-caption text-[var(--apple-label-tertiary)]">Ghost Icon</p>
          <button
            type="button"
            disabled={disabled}
            aria-busy={loading || undefined}
            aria-label="Audio output control"
            onClick={() => playTick()}
            className="apple-btn-icon h-11 w-11 text-[var(--apple-label-primary)]"
          >
            {loading ? <span className="apple-spinner" aria-hidden="true" /> : <Volume2 size={17} strokeWidth={1.75} aria-hidden="true" />}
          </button>
        </div>

        <div className="space-y-2">
          <p className="type-caption text-[var(--apple-label-tertiary)]">Tonal Close</p>
          <button
            type="button"
            disabled={disabled}
            aria-label="Close modal preview"
            onClick={() => playTick()}
            className="apple-btn-icon h-11 w-11 bg-[var(--apple-control-tonal)] text-[var(--apple-label-primary)] hover:bg-[var(--apple-control-tonal-hover)]"
          >
            <X size={15} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-2">
          <p className="type-caption text-[var(--apple-label-tertiary)]">Active Toggle</p>
          <button
            type="button"
            disabled={disabled}
            aria-pressed={saved}
            aria-label={saved ? 'Disable active icon state' : 'Enable active icon state'}
            onClick={() => {
              playTick();
              setSaved((prev) => !prev);
            }}
            className={`apple-pill-shadow inline-flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-45 ${
              saved
                ? 'border-transparent bg-[var(--apple-blue-fill)] text-white'
                : 'border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] text-[var(--apple-label-secondary)]'
            }`}
          >
            <Volume2 size={15} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-2">
          <p className="type-caption text-[var(--apple-label-tertiary)]">Grouped Zoom Pill</p>
          <div
            role="group"
            aria-label="Specimen zoom controls"
            className="inline-flex items-center gap-1 rounded-full bg-[var(--apple-control-tonal)] p-1"
          >
            <button
              type="button"
              disabled={disabled || zoom === 100}
              aria-label="Zoom out specimen"
              onClick={() => {
                playTick();
                setZoom((z) => (z === 250 ? 175 : 100));
              }}
              className="apple-btn-icon h-8 w-8 text-[var(--apple-label-primary)]"
            >
              <ZoomOut size={14} strokeWidth={1.75} aria-hidden="true" />
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                playTick();
                setZoom(100);
              }}
              aria-label={`Reset zoom from ${zoom}%`}
              className="type-caption min-w-[44px] rounded-full px-2 py-1 tabular-nums text-[var(--apple-label-primary)] hover:bg-[var(--apple-control-hover)]"
            >
              {zoom}%
            </button>
            <button
              type="button"
              disabled={disabled || zoom === 250}
              aria-label="Zoom in specimen"
              onClick={() => {
                playTick();
                setZoom((z) => (z === 100 ? 175 : 250));
              }}
              className="apple-btn-icon h-8 w-8 text-[var(--apple-label-primary)]"
            >
              <ZoomIn size={14} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   A3. Segmented Control
   ========================================================================== */
function SegmentedControlSpecimen() {
  const [preset, setPreset] = useState<'work' | 'depth' | 'density'>('work');
  const [compact, setCompact] = useState(false);
  const [disableLast, setDisableLast] = useState(false);
  const [activeOption, setActiveOption] = useState<string>('all');

  const options = useMemo(() => {
    if (preset === 'depth') {
      return [
        { id: 'skim', label: '2-Min Skim', count: undefined },
        { id: 'full', label: 'Full Story', count: undefined },
      ];
    }
    if (preset === 'density') {
      return [
        { id: 'compact', label: 'Compact', count: undefined },
        { id: 'balanced', label: 'Balanced', count: undefined },
        { id: 'spacious', label: 'Spacious', count: undefined },
      ];
    }
    return [
      { id: 'all', label: 'All Work', count: 6 },
      { id: 'product', label: 'Product', count: 2 },
      { id: 'systems', label: 'Systems', count: 2 },
      { id: 'interactive', label: 'Interactive', count: 2 },
    ];
  }, [preset]);

  const currentVal = options.some((o) => o.id === activeOption)
    ? activeOption
    : options[0].id;

  return (
    <div>
      <ControlBar>
        <MiniChoiceGroup
          ariaLabel="Segmented control preset"
          value={preset}
          onChange={(next) => {
            setPreset(next);
            setActiveOption(next === 'depth' ? 'full' : next === 'density' ? 'balanced' : 'all');
          }}
          options={[
            { id: 'work', label: 'Work Filter (4)' },
            { id: 'depth', label: 'Reading Depth (2)' },
            { id: 'density', label: 'Density (3)' },
          ]}
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={compact}
            onClick={() => {
              playTick();
              setCompact((prev) => !prev);
            }}
            className="apple-link rounded-[8px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-2.5 py-1 text-[12px] font-medium text-[var(--apple-label-primary)]"
          >
            Density: {compact ? 'Compact' : 'Standard'}
          </button>
          <button
            type="button"
            aria-pressed={disableLast}
            onClick={() => {
              playTick();
              setDisableLast((prev) => !prev);
            }}
            className="apple-link rounded-[8px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-2.5 py-1 text-[12px] font-medium text-[var(--apple-label-primary)]"
          >
            Disable Last: {disableLast ? 'Yes' : 'No'}
          </button>
        </div>
      </ControlBar>

      <div className="space-y-4">
        <div
          role="group"
          aria-label="Live segmented control specimen"
          className={`apple-segmented ${compact ? '!p-0.5' : ''}`}
        >
          {options.map((opt, idx) => {
            const isSelected = opt.id === currentVal;
            const isItemDisabled = disableLast && idx === options.length - 1;
            return (
              <button
                key={opt.id}
                type="button"
                disabled={isItemDisabled}
                aria-pressed={isSelected}
                onClick={() => {
                  if (!isSelected) {
                    playTick();
                    setActiveOption(opt.id);
                  }
                }}
                className={`apple-segmented-item ${
                  compact ? '!min-h-[30px] px-3 py-0.5 text-[12px]' : 'px-4 py-1.5 text-[13.5px]'
                } ${
                  isSelected
                    ? 'text-[var(--apple-label-primary)]'
                    : 'text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                }`}
              >
                {isSelected && (
                  <motion.span
                    layoutId={`lib-seg-specimen-${preset}`}
                    transition={SPRING_SEGMENT}
                    className="apple-pill-shadow absolute inset-0 rounded-full bg-[var(--apple-control-thumb)]"
                  />
                )}
                <span className="relative z-10 inline-flex items-center gap-1.5">
                  <span>{opt.label}</span>
                  {opt.count !== undefined && (
                    <span className="tabular-nums text-[11.5px] text-[var(--apple-label-tertiary)]">
                      {opt.count}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <p className="type-footnote font-normal text-[var(--apple-label-secondary)]">
          Selected value:{' '}
          <strong className="font-mono text-[12.5px] font-semibold text-[var(--apple-label-primary)]">
            {currentVal}
          </strong>
        </p>
      </div>
    </div>
  );
}

/* ==========================================================================
   A4. iOS Toggle Switch
   ========================================================================== */
function ToggleSwitchSpecimen() {
  const [focusReading, setFocusReading] = useState(true);
  const [uiSounds, setUiSounds] = useState(false);
  const [disabled, setDisabled] = useState(false);

  return (
    <div>
      <ControlBar>
        <button
          type="button"
          aria-pressed={disabled}
          onClick={() => {
            playTick();
            setDisabled((prev) => !prev);
          }}
          className="apple-link rounded-[8px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-2.5 py-1 text-[12px] font-medium text-[var(--apple-label-primary)]"
        >
          Disabled State: {disabled ? 'On' : 'Off'}
        </button>
      </ControlBar>

      <div className="max-w-[420px] divide-y divide-[var(--apple-separator-subtle)] rounded-[20px] bg-[var(--apple-surface-elevated)] px-5 py-2 shadow-[var(--shadow-apple-subtle)]">
        {[
          {
            id: 'focus',
            title: 'Focus Reading',
            desc: 'Softens surrounding navigation chrome while reading.',
            checked: focusReading,
            onToggle: () => setFocusReading((prev) => !prev),
          },
          {
            id: 'sounds',
            title: 'UI Sound Effects',
            desc: 'Subtle procedural cues, independent of AudioPlayer.',
            checked: uiSounds,
            onToggle: () => setUiSounds((prev) => !prev),
          },
        ].map((row) => (
          <div key={row.id} className="flex items-center justify-between gap-4 py-3.5">
            <div className="min-w-0">
              <p className="type-footnote font-medium text-[var(--apple-label-primary)]">
                {row.title}
              </p>
              <p className="mt-0.5 text-[12px] leading-[1.4] text-[var(--apple-label-tertiary)]">
                {row.desc}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              disabled={disabled}
              aria-checked={row.checked}
              aria-label={`Toggle ${row.title}`}
              onClick={() => {
                playTick();
                row.onToggle();
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45 ${
                row.checked
                  ? 'bg-[var(--apple-blue)]'
                  : 'bg-[var(--apple-separator-strong)]'
              }`}
            >
              <span
                aria-hidden="true"
                className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  row.checked ? 'translate-x-[22px]' : 'translate-x-[2px]'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   A5. Search Field & Select Control
   ========================================================================== */
function SearchSelectSpecimen() {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [fieldState, setFieldState] = useState<'default' | 'error' | 'disabled'>('default');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = PROJECTS.filter(
      (p) =>
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
    if (sortBy === 'newest') {
      return [...list].sort((a, b) => Number(b.year) - Number(a.year));
    }
    if (sortBy === 'alpha') {
      return [...list].sort((a, b) => a.title.localeCompare(b.title));
    }
    return list;
  }, [query, sortBy]);

  return (
    <div>
      <ControlBar>
        <MiniChoiceGroup
          ariaLabel="Search and select state"
          value={fieldState}
          onChange={setFieldState}
          options={[
            { id: 'default', label: 'Interactive' },
            { id: 'error', label: 'Error' },
            { id: 'disabled', label: 'Disabled' },
          ]}
        />
      </ControlBar>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-[340px]">
          <Search
            size={15}
            strokeWidth={1.75}
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--apple-label-tertiary)]"
          />
          <input
            type="search"
            disabled={fieldState === 'disabled'}
            aria-invalid={fieldState === 'error' || undefined}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search case studies (e.g. StallSync, Systems)…"
            aria-label="Search specimen case studies"
            className="apple-input min-h-[42px] rounded-full py-2 pl-10 pr-9 text-[13.5px]"
          />
          {query && fieldState !== 'disabled' && (
            <button
              type="button"
              onClick={() => {
                playTick();
                setQuery('');
              }}
              aria-label="Clear search query"
              className="apple-btn-icon absolute right-1.5 top-1/2 h-8 w-8 -translate-y-1/2 text-[var(--apple-label-tertiary)] hover:text-[var(--apple-label-primary)]"
            >
              <X size={12} strokeWidth={2} aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="relative sm:w-[200px]">
          <select
            aria-label="Sort specimen projects"
            disabled={fieldState === 'disabled'}
            aria-invalid={fieldState === 'error' || undefined}
            value={sortBy}
            onChange={(e) => {
              playTick();
              setSortBy(e.target.value);
            }}
            className="apple-input min-h-[42px] appearance-none rounded-full py-2 pl-4 pr-9 text-[13.5px]"
          >
            <option value="featured">Sort: Featured</option>
            <option value="newest">Sort: Newest</option>
            <option value="alpha">Sort: A – Z</option>
          </select>
          <ChevronDown
            size={14}
            strokeWidth={1.75}
            aria-hidden="true"
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--apple-label-secondary)]"
          />
        </div>
      </div>

      {fieldState === 'error' && (
        <p role="alert" className="type-footnote mt-2 text-[var(--apple-error)]">
          Please refine your filter criteria or select a valid sort mode.
        </p>
      )}

      <p className="type-footnote mt-4 font-normal text-[var(--apple-label-secondary)]">
        Showing{' '}
        <strong className="tabular-nums font-semibold text-[var(--apple-label-primary)]">
          {filtered.length}
        </strong>{' '}
        matching studies:{' '}
        {filtered.length > 0
          ? filtered.map((p) => p.title).join(' · ')
          : 'No matching titles'}
      </p>
    </div>
  );
}

/* ==========================================================================
   A6. Range Slider & Scrubber Track
   ========================================================================== */
function RangeSliderSpecimen() {
  const [volume, setVolume] = useState(85);
  const [progress, setProgress] = useState(38);
  const [disabled, setDisabled] = useState(false);

  return (
    <div>
      <ControlBar>
        <button
          type="button"
          aria-pressed={disabled}
          onClick={() => {
            playTick();
            setDisabled((prev) => !prev);
          }}
          className="apple-link rounded-[8px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-2.5 py-1 text-[12px] font-medium text-[var(--apple-label-primary)]"
        >
          Disabled: {disabled ? 'On' : 'Off'}
        </button>
      </ControlBar>

      <div className="grid max-w-[560px] grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[13px]">
            <label htmlFor="specimen-volume" className="font-medium text-[var(--apple-label-primary)]">
              Narration Volume
            </label>
            <span className="tabular-nums font-mono text-[12px] text-[var(--apple-link)]">
              {volume}%
            </span>
          </div>
          <input
            id="specimen-volume"
            type="range"
            min={0}
            max={100}
            disabled={disabled}
            value={volume}
            aria-valuetext={`${volume}% volume`}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full cursor-pointer accent-[var(--apple-blue)] disabled:cursor-not-allowed disabled:opacity-45"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-[13px]">
            <label htmlFor="specimen-scrub" className="font-medium text-[var(--apple-label-primary)]">
              Playback Position
            </label>
            <span className="tabular-nums font-mono text-[12px] text-[var(--apple-label-secondary)]">
              01:{String(Math.round((progress / 100) * 59)).padStart(2, '0')} / 02:30
            </span>
          </div>
          <input
            id="specimen-scrub"
            type="range"
            min={0}
            max={100}
            disabled={disabled}
            value={progress}
            aria-valuetext={`${progress}% elapsed`}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full cursor-pointer accent-[var(--apple-blue)] disabled:cursor-not-allowed disabled:opacity-45"
          />
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   A7. Experimental Checkboxes & Radio Buttons (Studio Reference Only)
   ========================================================================== */
function ExperimentalCheckboxRadioSpecimen() {
  const [checkedScopes, setCheckedScopes] = useState<string[]>([
    'architecture',
    'tokens',
  ]);
  const [radioValue, setRadioValue] = useState<'async' | 'workshop'>('async');
  const [stateMode, setStateMode] = useState<'default' | 'error' | 'disabled'>('default');

  const toggleScope = (id: string) => {
    playTick();
    setCheckedScopes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <div>
      <ControlBar>
        <MiniChoiceGroup
          ariaLabel="Experimental control state"
          value={stateMode}
          onChange={setStateMode}
          options={[
            { id: 'default', label: 'Interactive' },
            { id: 'error', label: 'Error' },
            { id: 'disabled', label: 'Disabled' },
          ]}
        />
        <span className="type-caption font-normal text-[var(--apple-warning)]">
          Experimental reference · Not mounted on public pages
        </span>
      </ControlBar>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <fieldset className="space-y-2">
          <legend className="type-footnote mb-2 font-semibold text-[var(--apple-label-primary)]">
            Multi-Select Checkboxes (Experimental)
          </legend>
          {[
            { id: 'architecture', label: 'Information architecture audit' },
            { id: 'tokens', label: 'Design token & contrast parity' },
            { id: 'prototypes', label: 'Interactive code prototypes' },
          ].map((opt) => {
            const isChecked = checkedScopes.includes(opt.id);
            return (
              <label
                key={opt.id}
                className={`flex min-h-[44px] cursor-pointer items-center gap-3 rounded-[12px] border px-3.5 py-2 text-[14px] transition-colors ${
                  stateMode === 'error'
                    ? 'border-[var(--apple-error)] bg-[var(--apple-surface-elevated)]'
                    : isChecked
                      ? 'border-[var(--apple-blue)]/40 bg-[var(--apple-blue)]/[0.06]'
                      : 'border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)]'
                } ${stateMode === 'disabled' ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={stateMode === 'disabled'}
                  aria-invalid={stateMode === 'error' || undefined}
                  onChange={() => toggleScope(opt.id)}
                  className="h-4 w-4 shrink-0 accent-[var(--apple-blue)]"
                />
                <span className="text-[var(--apple-label-primary)]">{opt.label}</span>
              </label>
            );
          })}
          {stateMode === 'error' && (
            <p role="alert" className="type-footnote text-[var(--apple-error)]">
              Select at least one collaboration area.
            </p>
          )}
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="type-footnote mb-2 font-semibold text-[var(--apple-label-primary)]">
            Vertical Radio Group (Experimental)
          </legend>
          {[
            {
              id: 'async' as const,
              title: 'Async written review',
              note: 'Annotated Loom & written architectural notes.',
            },
            {
              id: 'workshop' as const,
              title: 'Live pairing session',
              note: '60-minute collaborative critique in IST/UTC overlap.',
            },
          ].map((opt) => {
            const selected = radioValue === opt.id;
            return (
              <label
                key={opt.id}
                className={`flex min-h-[44px] cursor-pointer items-start gap-3 rounded-[12px] border px-3.5 py-2.5 transition-colors ${
                  selected
                    ? 'border-[var(--apple-blue)]/45 bg-[var(--apple-blue)]/[0.06]'
                    : 'border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)]'
                } ${stateMode === 'disabled' ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <input
                  type="radio"
                  name="specimen-collab-mode"
                  checked={selected}
                  disabled={stateMode === 'disabled'}
                  onChange={() => {
                    playTick();
                    setRadioValue(opt.id);
                  }}
                  className="mt-1 h-4 w-4 shrink-0 accent-[var(--apple-blue)]"
                />
                <div>
                  <p className="text-[14px] font-medium text-[var(--apple-label-primary)]">
                    {opt.title}
                  </p>
                  <p className="text-[12px] text-[var(--apple-label-secondary)]">
                    {opt.note}
                  </p>
                </div>
              </label>
            );
          })}
        </fieldset>
      </div>
    </div>
  );
}

/* ==========================================================================
   B1. Desktop & Mobile Navigation Bar Specimen
   ========================================================================== */
function NavbarSpecimen({
  viewportMode,
}: {
  viewportMode: 'desktop' | 'tablet' | 'mobile';
}) {
  const [activeNav, setActiveNav] = useState<'Work' | 'Notes' | 'About' | 'Contact'>('Work');
  const [scrolled, setScrolled] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const isMobileFrame = viewportMode === 'mobile';

  return (
    <div>
      <ControlBar>
        <div className="flex flex-wrap items-center gap-2">
          <MiniChoiceGroup
            ariaLabel="Active navbar link"
            value={activeNav}
            onChange={setActiveNav}
            options={[
              { id: 'Work', label: 'Work' },
              { id: 'Notes', label: 'Notes' },
              { id: 'About', label: 'About' },
              { id: 'Contact', label: 'Contact' },
            ]}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={scrolled}
            onClick={() => {
              playTick();
              setScrolled((prev) => !prev);
            }}
            className="apple-link rounded-[8px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-2.5 py-1 text-[12px] font-medium text-[var(--apple-label-primary)]"
          >
            Scrolled Shadow: {scrolled ? 'On' : 'Off'}
          </button>
        </div>
      </ControlBar>

      <div className="overflow-hidden rounded-[20px] border border-[var(--apple-separator)] bg-[var(--apple-bg)]">
        <div
          className={`bg-[var(--apple-surface-glass)] backdrop-blur-xl transition-shadow ${
            scrolled
              ? 'apple-nav-scrolled'
              : 'border-b border-[var(--apple-separator-subtle)]'
          }`}
        >
          <div className="flex h-[52px] items-center justify-between gap-4 px-5">
            <span className="font-display shrink-0 text-[15.5px] font-semibold tracking-[-0.022em] text-[var(--apple-label-primary)]">
              {SITE_CONFIG.name}
            </span>

            {!isMobileFrame && (
              <nav aria-label="Specimen primary nav" className="flex items-center gap-6">
                {(['Work', 'Notes', 'About', 'Contact'] as const).map((label) => {
                  const isActive = activeNav === label;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        playTick();
                        setActiveNav(label);
                      }}
                      className={`relative py-1 text-[13px] ${
                        isActive
                          ? 'font-semibold text-[var(--apple-label-primary)]'
                          : 'text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                      }`}
                    >
                      {label}
                      {isActive && (
                        <span className="absolute -bottom-[14px] left-0 right-0 h-[1.5px] rounded-full bg-[var(--apple-label-primary)]" />
                      )}
                    </button>
                  );
                })}
              </nav>
            )}

            <div className="flex items-center gap-1.5">
              <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[var(--apple-control-tonal)] px-2.5 text-[11.5px] text-[var(--apple-label-secondary)]">
                <Search size={12} strokeWidth={2} aria-hidden="true" />
                {!isMobileFrame && <span className="tabular-nums">⌘K</span>}
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--apple-label-secondary)]">
                <SlidersHorizontal size={14} strokeWidth={1.75} aria-hidden="true" />
              </span>
              {isMobileFrame ? (
                <button
                  type="button"
                  aria-expanded={mobileDrawerOpen}
                  aria-label="Toggle mobile navbar drawer specimen"
                  onClick={() => {
                    playTick();
                    setMobileDrawerOpen((prev) => !prev);
                  }}
                  className="apple-btn-icon h-9 w-9 text-[var(--apple-label-primary)]"
                >
                  {mobileDrawerOpen ? (
                    <X size={16} strokeWidth={1.75} aria-hidden="true" />
                  ) : (
                    <Menu size={18} strokeWidth={1.75} aria-hidden="true" />
                  )}
                </button>
              ) : (
                <span className="apple-btn-primary !min-h-[30px] !h-[30px] !px-3.5 !py-0 !text-[12px] !font-medium">
                  Get in touch
                </span>
              )}
            </div>
          </div>

          {isMobileFrame && mobileDrawerOpen && (
            <div className="border-t border-[var(--apple-separator-subtle)] bg-[var(--apple-bg)] px-4 pb-5 pt-3">
              <div className="space-y-1">
                {(['Work', 'Notes', 'About', 'Contact'] as const).map((label) => {
                  const isActive = activeNav === label;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        playTick();
                        setActiveNav(label);
                      }}
                      className={`flex min-h-[44px] w-full items-center justify-between rounded-2xl px-3.5 text-left text-[15.5px] font-medium ${
                        isActive
                          ? 'bg-[var(--apple-bg-secondary)] text-[var(--apple-label-primary)]'
                          : 'text-[var(--apple-label-secondary)]'
                      }`}
                    >
                      <span>{label}</span>
                      {isActive && (
                        <span className="text-[12px] text-[var(--apple-link)]">Current</span>
                      )}
                    </button>
                  );
                })}
              </div>
              <button type="button" className="apple-btn-primary mt-4 w-full">
                Get in touch
              </button>
            </div>
          )}
        </div>

        <div className="px-5 py-6 text-[13px] text-[var(--apple-label-tertiary)]">
          {isMobileFrame
            ? 'Mobile (<768px) collapses Zone 2 links into the drawer — tap the menu icon above to inspect.'
            : 'Desktop 3-zone contract: Wordmark · Primary Links · Utilities + Single CTA.'}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   B2. Breadcrumbs Specimen (Real Production Component)
   ========================================================================== */
function BreadcrumbsSpecimen({
  onPreviewNavigate,
}: {
  onPreviewNavigate: (path: string) => void;
}) {
  const [depth, setDepth] = useState<'case-study' | 'studio'>('case-study');

  const items =
    depth === 'case-study'
      ? [
          { label: 'Work', href: '/' },
          { label: 'StallSync' },
        ]
      : [
          { label: 'Design Studio', href: '/design-system' },
          { label: 'Library', href: '/design-system/components' },
          { label: 'Components' },
        ];

  return (
    <div>
      <ControlBar>
        <MiniChoiceGroup
          ariaLabel="Breadcrumb depth"
          value={depth}
          onChange={setDepth}
          options={[
            { id: 'case-study', label: '2-Level (Case Study)' },
            { id: 'studio', label: '3-Level (Studio)' },
          ]}
        />
      </ControlBar>
      <div className="rounded-[16px] bg-[var(--apple-surface-elevated)] px-5 py-4 shadow-[var(--shadow-apple-subtle)]">
        <Breadcrumbs items={items} onNavigate={onPreviewNavigate} />
      </div>
    </div>
  );
}

/* ==========================================================================
   B3. Table of Contents Specimen (Real Production Component — 5 Architectures)
   ========================================================================== */
function TocSpecimen() {
  const [variant, setVariant] = useState<TocVariant>('scroll-index');
  const [activeChapter, setActiveChapter] = useState<string>('architecture');
  const [narrating, setNarrating] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0.54);

  return (
    <div>
      <ControlBar>
        <MiniChoiceGroup
          ariaLabel="TOC architecture variant"
          value={variant}
          onChange={setVariant}
          options={TOC_VARIANTS.map((v) => ({ id: v.id, label: v.shortName }))}
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            aria-pressed={narrating}
            onClick={() => {
              playTick();
              setNarrating((prev) => !prev);
            }}
            className="apple-link rounded-[8px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-2.5 py-1 text-[12px] font-medium text-[var(--apple-label-primary)]"
          >
            Narrating Badge: {narrating ? 'On' : 'Off'}
          </button>
          <label className="flex items-center gap-2 text-[12px] text-[var(--apple-label-secondary)]">
            <span>Progress</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(progress * 100)}
              onChange={(e) => setProgress(Number(e.target.value) / 100)}
              className="w-24 accent-[var(--apple-blue)]"
            />
            <span className="tabular-nums font-mono text-[11.5px]">
              {Math.round(progress * 100)}%
            </span>
          </label>
        </div>
      </ControlBar>

      <div className="min-h-[320px] rounded-[20px] border border-[var(--apple-separator-subtle)] bg-[var(--apple-bg)] p-5">
        <div
          className={
            variant === 'apple-local-nav' || variant === 'ios-capsule'
              ? 'w-full'
              : variant === 'chapter-scrubber' || variant === 'scroll-index'
                ? 'max-w-[360px]'
                : 'max-w-[260px]'
          }
        >
          <TableOfContents
            variant={variant}
            chapters={SAMPLE_TOC_CHAPTERS}
            activeChapter={activeChapter}
            readingProgress={progress}
            narratingChapterId={narrating ? activeChapter : null}
            onSelectChapter={(id) => {
              playTick();
              setActiveChapter(id);
            }}
            layoutNamespace="studio-lib-toc"
          />
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   B4. Command Palette Specimen (Launches Real Production Component)
   ========================================================================== */
function CommandPaletteSpecimen({
  onPreviewNavigate,
}: {
  onPreviewNavigate: (path: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] bg-[var(--apple-surface-elevated)] p-5 shadow-[var(--shadow-apple-subtle)]">
        <div className="min-w-0">
          <p className="type-headline text-[var(--apple-label-primary)]">
            Launch Live Command Palette
          </p>
          <p className="type-footnote mt-1 font-normal text-[var(--apple-label-secondary)]">
            Inspect instant search across public Case Studies, Notes, Chapters, Pages, and Actions — /design-system stays strictly excluded.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            playTick();
            setOpen(true);
          }}
          className="apple-btn-primary !min-h-[40px] !px-4 !text-[13.5px]"
        >
          <Search size={14} strokeWidth={1.75} aria-hidden="true" />
          <span>Open Command Palette (⌘K)</span>
        </button>
      </div>

      {/* Static inline anatomy summary so the layout is visible even before opening */}
      <div className="rounded-[20px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] p-4">
        <div className="flex items-center gap-2.5 border-b border-[var(--apple-separator-subtle)] pb-3 text-[13.5px] text-[var(--apple-label-tertiary)]">
          <Search size={14} strokeWidth={1.75} aria-hidden="true" />
          <span>Search case studies, chapters, notes, or actions…</span>
          <span className="ml-auto rounded-[6px] border border-[var(--apple-separator)] px-1.5 py-0.5 font-mono text-[10.5px]">
            ESC
          </span>
        </div>
        <div className="mt-3 space-y-1">
          {[
            { group: 'Case Studies', title: 'StallSync', meta: 'Product Design · 2025', active: true },
            { group: 'Actions', title: 'Toggle Dark / Light Appearance', meta: 'Synced site-wide', active: false },
          ].map((row) => (
            <div
              key={row.title}
              className={`flex items-center justify-between rounded-[12px] px-3 py-2 text-[13px] ${
                row.active
                  ? 'bg-[var(--apple-blue)]/10 text-[var(--apple-label-primary)]'
                  : 'text-[var(--apple-label-secondary)]'
              }`}
            >
              <div>
                <span className="font-medium">{row.title}</span>
                <span className="ml-2 text-[12px] text-[var(--apple-label-tertiary)]">
                  {row.meta}
                </span>
              </div>
              <span className="text-[11px] text-[var(--apple-label-tertiary)]">
                {row.group}
              </span>
            </div>
          ))}
        </div>
      </div>

      <CommandPalette
        open={open}
        onClose={() => setOpen(false)}
        onNavigate={(path) => {
          setOpen(false);
          onPreviewNavigate(path);
        }}
      />
    </div>
  );
}

/* ==========================================================================
   B5. Preferences & Reader Comfort Popovers (Real Production Components)
   ========================================================================== */
function PopoversSpecimen() {
  return (
    <div className="flex min-h-[120px] flex-wrap items-center justify-between gap-6 rounded-[20px] bg-[var(--apple-surface-elevated)] p-6 shadow-[var(--shadow-apple-subtle)]">
      <div className="space-y-1.5">
        <p className="type-caption text-[var(--apple-label-tertiary)]">
          Global Preferences (Icon &amp; Pill Variants)
        </p>
        <div className="flex items-center gap-3 pt-1">
          <GlobalPreferencesPopover placement="bottom-right" variant="icon" />
          <GlobalPreferencesPopover placement="bottom-right" variant="pill" />
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="type-caption text-[var(--apple-label-tertiary)]">
          Reader Comfort Popover (Aa Reading)
        </p>
        <div className="flex items-center gap-3 pt-1">
          <ReaderComfortPopover align="right" />
        </div>
      </div>

      <p className="type-footnote w-full border-t border-[var(--apple-separator-subtle)] pt-3 font-normal text-[var(--apple-label-tertiary)]">
        Click either real production trigger above to inspect Appearance, UI Sound, Text Size, Focus Reading, and Escape focus return.
      </p>
    </div>
  );
}

/* ==========================================================================
   B6. Floating Back-to-Top Specimen
   ========================================================================== */
function FloatingBackToTopSpecimen() {
  const [dockState, setDockState] = useState<'idle' | 'audio-dock' | 'mobile-bar'>('idle');

  const clearanceLabel =
    dockState === 'idle'
      ? 'bottom-6 (24px)'
      : dockState === 'audio-dock'
        ? 'bottom-[104px] (clears AudioPlayer dock)'
        : 'bottom-[80px] (clears MobileReadingBar)';

  return (
    <div>
      <ControlBar>
        <MiniChoiceGroup
          ariaLabel="Floating dock clearance simulation"
          value={dockState}
          onChange={setDockState}
          options={[
            { id: 'idle', label: 'Default' },
            { id: 'audio-dock', label: 'Audio Dock Active' },
            { id: 'mobile-bar', label: 'Mobile Bar Active' },
          ]}
        />
      </ControlBar>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] bg-[var(--apple-bg)] p-6 border border-[var(--apple-separator-subtle)]">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              playTick();
              showToast({ message: 'Scrolled to top (specimen preview)', tone: 'info' });
            }}
            aria-label="Back to top desktop preview"
            className="apple-ios-bar group inline-flex h-11 items-center gap-2 rounded-full px-4 text-[13px] font-medium tracking-[-0.01em] text-[var(--apple-label-primary)] transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.96]"
          >
            <ArrowUp
              size={14}
              strokeWidth={1.75}
              aria-hidden="true"
              className="text-[var(--apple-label-secondary)] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:text-[var(--apple-link)]"
            />
            <span>Top</span>
          </button>

          <button
            type="button"
            onClick={() => playTick()}
            aria-label="Back to top mobile compact preview"
            className="apple-ios-bar group inline-flex h-11 w-11 items-center justify-center rounded-full text-[var(--apple-label-primary)] transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.96]"
          >
            <ArrowUp size={14} strokeWidth={1.75} aria-hidden="true" className="text-[var(--apple-label-secondary)] group-hover:text-[var(--apple-link)]" />
          </button>
        </div>

        <p className="type-footnote font-mono text-[12px] text-[var(--apple-label-secondary)]">
          Dynamic offset: {clearanceLabel}
        </p>
      </div>
    </div>
  );
}

/* ==========================================================================
   C1. Project Card Specimen (Real Production Component)
   ========================================================================== */
function ProjectCardSpecimen({
  viewportMode,
  onPreviewNavigate,
}: {
  viewportMode: 'desktop' | 'tablet' | 'mobile';
  onPreviewNavigate: (path: string) => void;
}) {
  const [variant, setVariant] = useState<'rail' | 'featured' | 'standard' | 'wide'>('rail');
  const [projectIndex, setProjectIndex] = useState<string>('0');

  const project = PROJECTS[Number(projectIndex)] ?? PROJECTS[0];
  const effectiveVariant =
    viewportMode === 'mobile' && variant !== 'rail' ? 'standard' : variant;

  return (
    <div>
      <ControlBar>
        <MiniChoiceGroup
          ariaLabel="ProjectCard variant"
          value={variant}
          onChange={setVariant}
          options={[
            { id: 'rail', label: 'Rail' },
            { id: 'featured', label: 'Featured' },
            { id: 'standard', label: 'Standard' },
            { id: 'wide', label: 'Wide' },
          ]}
        />
        <MiniChoiceGroup
          ariaLabel="Select real case study"
          value={projectIndex}
          onChange={setProjectIndex}
          options={[
            { id: '0', label: PROJECTS[0].title },
            { id: '1', label: PROJECTS[1].title },
            { id: '3', label: PROJECTS[3].title },
          ]}
        />
      </ControlBar>

      <div
        className={
          effectiveVariant === 'rail'
            ? 'mx-auto max-w-[456px]'
            : effectiveVariant === 'standard'
              ? 'mx-auto max-w-[480px]'
              : ''
        }
      >
        <ProjectCard
          project={project}
          onNavigate={onPreviewNavigate}
          variant={effectiveVariant}
          index={0}
        />
      </div>
    </div>
  );
}

/* ==========================================================================
   C2. Related Project Cards Specimen (Real Production Component)
   ========================================================================== */
function RelatedProjectsSpecimen({
  onPreviewNavigate,
}: {
  onPreviewNavigate: (path: string) => void;
}) {
  const [baseSlug, setBaseSlug] = useState<string>(PROJECTS[0].slug);
  const recommendations = useMemo(
    () => getRelatedProjects(PROJECTS, baseSlug, 2),
    [baseSlug],
  );

  return (
    <div>
      <ControlBar>
        <MiniChoiceGroup
          ariaLabel="Source case study for related recommendations"
          value={baseSlug}
          onChange={setBaseSlug}
          options={[
            { id: PROJECTS[0].slug, label: `From ${PROJECTS[0].title}` },
            { id: PROJECTS[3].slug, label: `From ${PROJECTS[3].title}` },
          ]}
        />
      </ControlBar>
      <div className="[&>section]:!mt-0 [&>section]:!border-t-0 [&>section]:!pt-0">
        <RelatedProjectsSection
          recommendations={recommendations}
          onNavigate={onPreviewNavigate}
        />
      </div>
    </div>
  );
}

/* ==========================================================================
   C3. Feature & Editorial Surface Containers Specimen
   ========================================================================== */
function EditorialCardsSpecimen() {
  const [surface, setSurface] = useState<'interactive' | 'static' | 'subtle' | 'quiet'>('subtle');
  const [cardState, setCardState] = useState<'default' | 'disabled' | 'loading'>('default');

  const classBySurface =
    surface === 'interactive'
      ? 'apple-card'
      : surface === 'static'
        ? 'apple-card-static'
        : surface === 'subtle'
          ? 'apple-surface-subtle'
          : 'bg-[var(--apple-bg-secondary)] border border-[var(--apple-separator-subtle)]';

  return (
    <div>
      <ControlBar>
        <MiniChoiceGroup
          ariaLabel="Surface tier"
          value={surface}
          onChange={setSurface}
          options={[
            { id: 'interactive', label: '.apple-card' },
            { id: 'static', label: '.apple-card-static' },
            { id: 'subtle', label: '.apple-surface-subtle' },
            { id: 'quiet', label: 'Quiet Band' },
          ]}
        />
        {surface === 'interactive' && (
          <MiniChoiceGroup
            ariaLabel="Interactive card state"
            value={cardState}
            onChange={setCardState}
            options={[
              { id: 'default', label: 'Interactive' },
              { id: 'disabled', label: 'Disabled' },
              { id: 'loading', label: 'Loading' },
            ]}
          />
        )}
      </ControlBar>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {CAPABILITIES.slice(0, 2).map((cap, idx) => (
          <div
            key={cap.id}
            aria-disabled={surface === 'interactive' && cardState === 'disabled' ? 'true' : undefined}
            aria-busy={surface === 'interactive' && cardState === 'loading' ? 'true' : undefined}
            data-loading={surface === 'interactive' && cardState === 'loading' ? 'true' : undefined}
            className={`${classBySurface} rounded-[24px] p-6`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="type-caption tabular-nums text-[var(--apple-link)]">
                0{idx + 1}
              </p>
              {surface === 'interactive' && cardState === 'loading' && (
                <span className="apple-spinner" aria-hidden="true" />
              )}
            </div>
            <h4 className="type-headline font-display mt-2.5 text-[18px]">
              {cap.name}
            </h4>
            <p className="type-callout mt-2">{cap.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   C4. Testimonials Specimen (Real Production Component in workshopPreview)
   ========================================================================== */
function TestimonialsSpecimen() {
  return (
    <TestimonialsSection
      entries={VERIFIED_TESTIMONIALS}
      workshopPreview
      heading="Notes from collaborators."
    />
  );
}

/* ==========================================================================
   C5. Project Credits Specimen (Real Production Component)
   ========================================================================== */
function ProjectCreditsSpecimen() {
  const [layout, setLayout] = useState<'three' | 'two' | 'one'>('three');

  const credits =
    layout === 'three'
      ? {
          client: 'StallSync Exhibition Platform',
          collaborators: [
            { name: 'Product Engineering Team', role: 'Spatial Grid & API' },
            { name: 'Event Operations Lead', role: 'Floor Logistics' },
          ],
          tools: ['Figma', 'React', 'TypeScript', 'Motion'],
        }
      : layout === 'two'
        ? {
            client: 'Independent Concept Study',
            tools: ['Figma', 'Web Speech API', 'Tailwind CSS'],
          }
        : {
            tools: ['Figma', 'Design Tokens', 'WCAG 2.2 AA'],
          };

  return (
    <div>
      <ControlBar>
        <MiniChoiceGroup
          ariaLabel="Credits column count"
          value={layout}
          onChange={setLayout}
          options={[
            { id: 'three', label: '3 Columns (Full)' },
            { id: 'two', label: '2 Columns' },
            { id: 'one', label: '1 Column (Tools Only)' },
          ]}
        />
      </ControlBar>
      <div className="rounded-[20px] bg-[var(--apple-surface-elevated)] px-6 shadow-[var(--shadow-apple-subtle)]">
        <ProjectCreditsSection credits={credits} />
      </div>
    </div>
  );
}

/* ==========================================================================
   C6. Unboxed Metadata & Tag Treatments Specimen
   ========================================================================== */
function MetadataTagsSpecimen() {
  return (
    <div className="space-y-5 rounded-[20px] bg-[var(--apple-surface-elevated)] p-6 shadow-[var(--shadow-apple-subtle)]">
      <div>
        <p className="type-caption text-[var(--apple-label-tertiary)]">
          Project Card Kicker (Zero-Pill Discipline)
        </p>
        <p className="type-footnote mt-2 flex flex-wrap items-center gap-x-2 font-semibold text-[var(--apple-label-secondary)]">
          <span>Product Design</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">2025</span>
          <span aria-hidden="true">·</span>
          <span className="font-normal text-[var(--apple-label-tertiary)]">
            Lead Product Designer
          </span>
        </p>
      </div>

      <div className="border-t border-[var(--apple-separator-subtle)] pt-4">
        <p className="type-caption text-[var(--apple-label-tertiary)]">
          Related Recommendation Reason + Year
        </p>
        <p className="type-caption mt-2 flex flex-wrap items-center gap-x-2 text-[var(--apple-label-tertiary)]">
          <span className="text-[var(--apple-link)]">Shared design system focus</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">2025</span>
          <span aria-hidden="true">·</span>
          <span>6 min read</span>
        </p>
      </div>

      <div className="border-t border-[var(--apple-separator-subtle)] pt-4">
        <p className="type-caption text-[var(--apple-label-tertiary)]">
          Unboxed Tools Attribution
        </p>
        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14.5px] font-medium text-[var(--apple-label-primary)]">
          {['Figma', 'React 19', 'TypeScript', 'Tailwind CSS', 'Motion'].map(
            (tool, idx) => (
              <span key={tool} className="inline-flex items-center gap-2">
                {idx > 0 && (
                  <span aria-hidden="true" className="font-normal text-[var(--apple-label-tertiary)]">
                    ·
                  </span>
                )}
                <span>{tool}</span>
              </span>
            ),
          )}
        </p>
      </div>
    </div>
  );
}

/* ==========================================================================
   D1. Form Fields Specimen (Text, Email, Select, Textarea)
   ========================================================================== */
function FormFieldsSpecimen() {
  const [fieldType, setFieldType] = useState<'text' | 'email' | 'select' | 'textarea'>('email');
  const [stateMode, setStateMode] = useState<'default' | 'error' | 'disabled' | 'success'>('default');
  const [val, setVal] = useState('maya@studio.design');
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null>(null);

  const isError = stateMode === 'error';
  const isDisabled = stateMode === 'disabled';
  const isSuccess = stateMode === 'success';

  return (
    <div>
      <ControlBar>
        <MiniChoiceGroup
          ariaLabel="Input field type"
          value={fieldType}
          onChange={(next) => {
            setFieldType(next);
            if (next === 'text') setVal('Maya Rao');
            if (next === 'email') setVal('maya@studio.design');
            if (next === 'select') setVal('Next 1–3 months');
            if (next === 'textarea')
              setVal('Looking to streamline our multi-workspace design system tokens and case-study flows.');
          }}
          options={[
            { id: 'text', label: 'Text' },
            { id: 'email', label: 'Email' },
            { id: 'select', label: 'Select' },
            { id: 'textarea', label: 'Textarea' },
          ]}
        />
        <div className="flex flex-wrap items-center gap-2">
          <MiniChoiceGroup
            ariaLabel="Input field state"
            value={stateMode}
            onChange={setStateMode}
            options={[
              { id: 'default', label: 'Default' },
              { id: 'error', label: 'Error' },
              { id: 'disabled', label: 'Disabled' },
              { id: 'success', label: 'Validated' },
            ]}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.focus()}
            className="apple-link text-[12px] font-medium text-[var(--apple-link)] hover:underline"
          >
            Focus Field
          </button>
        </div>
      </ControlBar>

      <div className="max-w-[460px] rounded-[20px] bg-[var(--apple-surface-elevated)] p-6 shadow-[var(--shadow-apple-subtle)]">
        <label
          htmlFor="lib-specimen-field"
          className="type-footnote block text-[var(--apple-label-primary)]"
        >
          {fieldType === 'text'
            ? 'Full Name'
            : fieldType === 'email'
              ? 'Work Email'
              : fieldType === 'select'
                ? 'Expected Timeline'
                : 'Project Context'}
        </label>

        {fieldType === 'select' ? (
          <div className="relative mt-2">
            <select
              ref={(el) => {
                inputRef.current = el;
              }}
              id="lib-specimen-field"
              disabled={isDisabled}
              aria-invalid={isError || undefined}
              aria-describedby={isError ? 'lib-specimen-field-err' : undefined}
              value={val}
              onChange={(e) => setVal(e.target.value)}
              className="apple-input min-h-[46px] appearance-none rounded-[14px] py-2.5 pl-4 pr-10 text-[15.5px]"
            >
              <option value="Flexible / Exploratory">Flexible / Exploratory</option>
              <option value="Within 1 month">Within 1 month</option>
              <option value="Next 1–3 months">Next 1–3 months</option>
              <option value="Q2 2027 or later">Q2 2027 or later</option>
            </select>
            <ChevronDown
              size={15}
              strokeWidth={1.75}
              aria-hidden="true"
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--apple-label-secondary)]"
            />
          </div>
        ) : fieldType === 'textarea' ? (
          <textarea
            ref={(el) => {
              inputRef.current = el;
            }}
            id="lib-specimen-field"
            rows={4}
            disabled={isDisabled}
            aria-invalid={isError || undefined}
            aria-describedby={isError ? 'lib-specimen-field-err' : undefined}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="apple-input mt-2 rounded-[16px] px-4 py-3 text-[15px] leading-[1.55]"
          />
        ) : (
          <input
            ref={(el) => {
              inputRef.current = el;
            }}
            id="lib-specimen-field"
            type={fieldType}
            disabled={isDisabled}
            aria-invalid={isError || undefined}
            aria-describedby={isError ? 'lib-specimen-field-err' : undefined}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder={fieldType === 'email' ? 'you@company.com' : 'Your name'}
            className="apple-input mt-2 min-h-[46px] rounded-[14px] px-4 py-2.5 text-[15.5px]"
          />
        )}

        {isError && (
          <p
            id="lib-specimen-field-err"
            role="alert"
            className="type-footnote mt-1.5 text-[var(--apple-error)]"
          >
            {fieldType === 'email'
              ? 'Please enter a valid email address.'
              : 'This field is required before preparing your inquiry.'}
          </p>
        )}

        {isSuccess && (
          <p className="type-footnote mt-1.5 inline-flex items-center gap-1.5 text-[var(--apple-success)]">
            <Check size={12} strokeWidth={2} aria-hidden="true" />
            <span>Valid format confirmed</span>
          </p>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   D2. Validated Inquiry Form & Confirmation Flow
   ========================================================================== */
function ContactFormFlowSpecimen() {
  const [values, setValues] = useState<ContactFormValues>({
    name: '',
    email: '',
    projectType: 'Design System',
    timeline: 'Next 1–3 months',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormValues, string>>>({});
  const [phase, setPhase] = useState<'form' | 'loading' | 'success'>('form');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateContactForm(values);
    if (!result.isValid) {
      playTap();
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setPhase('loading');
    window.setTimeout(() => {
      playSuccessChime();
      setPhase('success');
      showToast({ message: 'Specimen inquiry prepared', tone: 'success' });
    }, 650);
  };

  const fillValidSample = () => {
    playTick();
    setErrors({});
    setPhase('form');
    setValues({
      name: 'Rohan Mehta',
      email: 'rohan@northstar.app',
      projectType: 'Design System',
      timeline: 'Next 1–3 months',
      message: 'We are aligning our web application token architecture and interactive case-study patterns.',
    });
  };

  return (
    <div>
      <ControlBar>
        <MiniChoiceGroup
          ariaLabel="Jump to form phase"
          value={phase}
          onChange={setPhase}
          options={[
            { id: 'form', label: 'Active Form' },
            { id: 'loading', label: 'Submitting' },
            { id: 'success', label: 'Confirmation' },
          ]}
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={fillValidSample}
            className="apple-link text-[12px] font-medium text-[var(--apple-link)] hover:underline"
          >
            Fill Valid Sample
          </button>
          <button
            type="button"
            onClick={() => {
              playTap();
              setPhase('form');
              setErrors(
                validateContactForm({
                  name: '',
                  email: 'invalid-email',
                  projectType: 'Design System',
                  timeline: 'Next 1–3 months',
                  message: 'Short',
                }).errors,
              );
            }}
            className="apple-link text-[12px] font-medium text-[var(--apple-error)] hover:underline"
          >
            Trigger Validation Errors
          </button>
        </div>
      </ControlBar>

      {phase === 'success' ? (
        <div className="apple-card-static max-w-[560px] rounded-[26px] p-7">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--apple-blue)]/10 text-[var(--apple-blue)]">
            <Check size={18} strokeWidth={1.75} aria-hidden="true" />
          </div>
          <h4 className="type-title-3 mt-4">
            Inquiry prepared, {values.name || 'Rohan Mehta'}.
          </h4>
          <p className="type-callout mt-2">
            Thank you for reaching out regarding{' '}
            <strong className="font-semibold text-[var(--apple-label-primary)]">
              {values.projectType}
            </strong>
            . You can open it directly in Mail or reset the form below.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => {
                playTick();
                showToast({ message: 'Mailto handoff previewed', tone: 'info' });
              }}
              className="apple-btn-primary !min-h-[40px] !px-4 !text-[14px]"
            >
              <span>Open in Mail</span>
              <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => {
                playTick();
                setPhase('form');
              }}
              className="apple-btn-tonal !min-h-[40px] !px-4 !text-[14px]"
            >
              Send another note
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="apple-card-static max-w-[560px] rounded-[26px] p-6 sm:p-7"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="lib-flow-name" className="type-footnote block text-[var(--apple-label-primary)]">
                Name
              </label>
              <input
                id="lib-flow-name"
                type="text"
                disabled={phase === 'loading'}
                value={values.name}
                onChange={(e) => {
                  setValues((v) => ({ ...v, name: e.target.value }));
                  setErrors((err) => ({ ...err, name: undefined }));
                }}
                placeholder="Your name"
                aria-invalid={Boolean(errors.name)}
                className="apple-input mt-1.5 min-h-[42px] rounded-[12px] px-3.5 py-2 text-[14.5px]"
              />
              {errors.name && (
                <p role="alert" className="type-footnote mt-1 text-[var(--apple-error)]">
                  {errors.name}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="lib-flow-email" className="type-footnote block text-[var(--apple-label-primary)]">
                Email
              </label>
              <input
                id="lib-flow-email"
                type="email"
                disabled={phase === 'loading'}
                value={values.email}
                onChange={(e) => {
                  setValues((v) => ({ ...v, email: e.target.value }));
                  setErrors((err) => ({ ...err, email: undefined }));
                }}
                placeholder="you@company.com"
                aria-invalid={Boolean(errors.email)}
                className="apple-input mt-1.5 min-h-[42px] rounded-[12px] px-3.5 py-2 text-[14.5px]"
              />
              {errors.email && (
                <p role="alert" className="type-footnote mt-1 text-[var(--apple-error)]">
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="lib-flow-msg" className="type-footnote block text-[var(--apple-label-primary)]">
              Project context
            </label>
            <textarea
              id="lib-flow-msg"
              rows={3}
              disabled={phase === 'loading'}
              value={values.message}
              onChange={(e) => {
                setValues((v) => ({ ...v, message: e.target.value }));
                setErrors((err) => ({ ...err, message: undefined }));
              }}
              placeholder="Share goals, timeline, and context…"
              aria-invalid={Boolean(errors.message)}
              className="apple-input mt-1.5 rounded-[14px] px-3.5 py-2.5 text-[14.5px]"
            />
            {errors.message && (
              <p role="alert" className="type-footnote mt-1 text-[var(--apple-error)]">
                {errors.message}
              </p>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <button
              type="submit"
              disabled={phase === 'loading'}
              aria-busy={phase === 'loading'}
              data-loading={phase === 'loading' ? 'true' : undefined}
              className="apple-btn-primary !min-h-[42px] !px-5 !text-[14.5px]"
            >
              {phase === 'loading' && <span className="apple-spinner" aria-hidden="true" />}
              <span>{phase === 'loading' ? 'Preparing inquiry…' : 'Send inquiry'}</span>
            </button>
            <span className="type-caption font-normal text-[var(--apple-label-tertiary)]">
              Uses real validateContactForm()
            </span>
          </div>
        </form>
      )}
    </div>
  );
}

/* ==========================================================================
   D3. Engagement Selector Pill Group Specimen
   ========================================================================== */
function EngagementSelectorSpecimen() {
  const TYPES = [
    'Product Design',
    'UX Architecture',
    'Web & Framer',
    'Design System',
    'Advisory / Prototype',
  ] as const;
  const [selected, setSelected] = useState<string>('Product Design');
  const [disabled, setDisabled] = useState(false);

  return (
    <div>
      <ControlBar>
        <button
          type="button"
          aria-pressed={disabled}
          onClick={() => {
            playTick();
            setDisabled((prev) => !prev);
          }}
          className="apple-link rounded-[8px] border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] px-2.5 py-1 text-[12px] font-medium text-[var(--apple-label-primary)]"
        >
          Disabled: {disabled ? 'On' : 'Off'}
        </button>
      </ControlBar>

      <div className="rounded-[20px] bg-[var(--apple-surface-elevated)] p-6 shadow-[var(--shadow-apple-subtle)]">
        <span className="type-footnote block text-[var(--apple-label-primary)]">
          What can I help with?
        </span>
        <div
          role="group"
          aria-label="Specimen engagement selector"
          className="mt-2.5 flex flex-wrap gap-2"
        >
          {TYPES.map((type) => {
            const active = selected === type;
            return (
              <button
                key={type}
                type="button"
                disabled={disabled}
                aria-pressed={active}
                onClick={() => {
                  if (!active) {
                    playTick();
                    setSelected(type);
                  }
                }}
                className={`apple-segmented-item min-h-[40px] px-4 py-1.5 text-[13.5px] ${
                  active
                    ? 'bg-[var(--apple-blue-fill)] text-white'
                    : 'bg-[var(--apple-bg-secondary)] text-[var(--apple-label-secondary)] hover:bg-[var(--apple-control-tonal)] hover:text-[var(--apple-label-primary)]'
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function renderPrimarySpecimen({
  componentId,
  viewportMode,
  onPreviewNavigate,
}: SpecimenRenderProps): React.ReactNode | null {
  switch (componentId) {
    case 'buttons':
      return <ButtonsSpecimen />;
    case 'icon-buttons':
      return <IconButtonsSpecimen />;
    case 'segmented-control':
      return <SegmentedControlSpecimen />;
    case 'toggle-switch':
      return <ToggleSwitchSpecimen />;
    case 'search-select-controls':
      return <SearchSelectSpecimen />;
    case 'range-slider':
      return <RangeSliderSpecimen />;
    case 'checkbox-radio-experimental':
      return <ExperimentalCheckboxRadioSpecimen />;
    case 'desktop-mobile-navbar':
      return <NavbarSpecimen viewportMode={viewportMode} />;
    case 'breadcrumbs':
      return <BreadcrumbsSpecimen onPreviewNavigate={onPreviewNavigate} />;
    case 'table-of-contents':
      return <TocSpecimen />;
    case 'command-palette':
      return <CommandPaletteSpecimen onPreviewNavigate={onPreviewNavigate} />;
    case 'popovers-menus':
      return <PopoversSpecimen />;
    case 'floating-back-to-top':
      return <FloatingBackToTopSpecimen />;
    case 'project-card':
      return (
        <ProjectCardSpecimen
          viewportMode={viewportMode}
          onPreviewNavigate={onPreviewNavigate}
        />
      );
    case 'related-project-cards':
      return <RelatedProjectsSpecimen onPreviewNavigate={onPreviewNavigate} />;
    case 'feature-editorial-cards':
      return <EditorialCardsSpecimen />;
    case 'testimonials-layout':
      return <TestimonialsSpecimen />;
    case 'project-credits':
      return <ProjectCreditsSpecimen />;
    case 'case-study-metadata-tags':
      return <MetadataTagsSpecimen />;
    case 'form-fields':
      return <FormFieldsSpecimen />;
    case 'contact-form-flow':
      return <ContactFormFlowSpecimen />;
    case 'engagement-selector-group':
      return <EngagementSelectorSpecimen />;
    default:
      return null;
  }
}
