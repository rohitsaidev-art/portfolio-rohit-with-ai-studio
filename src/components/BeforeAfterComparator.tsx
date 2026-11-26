import { useCallback, useRef, useState } from 'react';
import { playTick } from '../utils/soundEngine';
import { SFChevronLeft, SFChevronRight } from './SFSymbols';

export interface BeforeAfterComparatorProps {
  beforeSrc: string;
  beforeAlt: string;
  beforeLabel?: string;
  afterSrc: string;
  afterAlt: string;
  afterLabel?: string;
  caption?: string;
  initialPosition?: number;
}

/**
 * Reusable, accessible draggable Before / After image comparator (P2.7).
 * - Supports pointer drag, touch drag, and keyboard arrows (Left/Right/Home/End).
 * - Respects global UI sound mute via playTick at center/edge detents.
 * - Rendered on public case studies ONLY when genuine before/after assets exist.
 */
export function BeforeAfterComparator({
  beforeSrc,
  beforeAlt,
  beforeLabel = 'Before',
  afterSrc,
  afterAlt,
  afterLabel = 'After',
  caption,
  initialPosition = 50,
}: BeforeAfterComparatorProps) {
  const [position, setPosition] = useState(() =>
    Math.min(100, Math.max(0, initialPosition)),
  );
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastDetentRef = useRef<number | null>(null);

  const commitPosition = useCallback((rawPct: number) => {
    const clamped = Math.round(Math.min(100, Math.max(0, rawPct)));
    setPosition(clamped);

    // Gentle acoustic detent at 0%, 50%, 100% (respects global UI sound mute)
    const detent =
      clamped === 50 ? 50 : clamped === 0 ? 0 : clamped === 100 ? 100 : null;
    if (detent !== null && lastDetentRef.current !== detent) {
      lastDetentRef.current = detent;
      playTick();
    } else if (detent === null) {
      lastDetentRef.current = null;
    }
  }, []);

  const updateFromClientX = useCallback(
    (clientX: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || rect.width <= 0) return;
      const pct = ((clientX - rect.left) / rect.width) * 100;
      commitPosition(pct);
    },
    [commitPosition],
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    updateFromClientX(event.clientX);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    updateFromClientX(event.clientX);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragging(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      playTick();
      commitPosition(position - 5);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      playTick();
      commitPosition(position + 5);
    } else if (event.key === 'PageDown') {
      event.preventDefault();
      playTick();
      commitPosition(position - 15);
    } else if (event.key === 'PageUp') {
      event.preventDefault();
      playTick();
      commitPosition(position + 15);
    } else if (event.key === 'Home') {
      event.preventDefault();
      playTick();
      commitPosition(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      playTick();
      commitPosition(100);
    }
  };

  return (
    <figure className="space-y-3">
      <div
        ref={containerRef}
        role="slider"
        tabIndex={0}
        aria-label={`Compare ${beforeLabel} and ${afterLabel}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={position}
        aria-valuetext={`${position}% ${afterLabel}, ${100 - position}% ${beforeLabel}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={handleKeyDown}
        className="apple-card-static relative aspect-[16/9] w-full touch-none select-none overflow-hidden rounded-[24px] bg-[var(--apple-bg-secondary)] cursor-ew-resize"
      >
        {/* Base Layer: After */}
        <img
          src={afterSrc}
          alt={afterAlt}
          draggable={false}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
        />

        {/* Clipped Layer: Before */}
        <div
          aria-hidden="true"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          className="absolute inset-0"
        >
          <img
            src={beforeSrc}
            alt={beforeAlt}
            draggable={false}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Labels */}
        <span className="apple-ios-bar pointer-events-none absolute left-4 top-4 rounded-full px-3 py-1 text-[12px] font-semibold tracking-[-0.01em] text-[var(--apple-label-primary)]">
          {beforeLabel}
        </span>
        <span className="apple-ios-bar pointer-events-none absolute right-4 top-4 rounded-full px-3 py-1 text-[12px] font-semibold tracking-[-0.01em] text-[var(--apple-label-primary)]">
          {afterLabel}
        </span>

        {/* Divider Line & Draggable Handle */}
        <div
          aria-hidden="true"
          style={{ left: `${position}%` }}
          className="pointer-events-none absolute bottom-0 top-0 -translate-x-1/2"
        >
          <div className="mx-auto h-full w-[2px] bg-white/90 shadow-[0_0_10px_rgba(0,0,0,0.35)]" />
          <div
            className={`apple-pill-shadow absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)] text-[var(--apple-label-primary)] transition-transform duration-150 ${
              dragging ? 'scale-110 ring-4 ring-[var(--apple-focus-ring)]' : ''
            }`}
          >
            <SFChevronLeft size={12} className="-mr-0.5" />
            <SFChevronRight size={12} className="-ml-0.5" />
          </div>
        </div>
      </div>

      {caption && (
        <figcaption className="type-footnote measure-prose font-normal text-[var(--apple-label-tertiary)]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
