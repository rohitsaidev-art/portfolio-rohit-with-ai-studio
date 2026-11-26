import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { EASE_APPLE } from '../utils/motion';
import { playTick } from '../utils/soundEngine';
import {
  SFChevronLeft,
  SFChevronRight,
  SFXmark,
  SFZoomIn,
  SFZoomOut,
} from './SFSymbols';

export interface LightboxImage {
  src: string;
  alt: string;
  caption?: string;
}

interface LightboxProps {
  images: LightboxImage[];
  activeIndex: number | null;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
}

const ZOOM_STEPS = [1, 1.75, 2.5] as const;

/**
 * Upgraded Accessible Lightbox (P2.6).
 * Features:
 * - Multi-step zoom controls (1× / 1.75× / 2.5×) with scroll/pan inspection.
 * - Thumbnail filmstrip when multiple genuine assets exist.
 * - Touch swipe left/right navigation.
 * - Full keyboard navigation (Esc, Arrows, +, -, 0), Tab focus trap, and focus restoration.
 */
export function Lightbox({
  images,
  activeIndex,
  onClose,
  onSelectIndex,
}: LightboxProps) {
  const isOpen = activeIndex !== null && images[activeIndex] !== undefined;
  const [zoomIndex, setZoomIndex] = useState(0);

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  const zoomLevel = ZOOM_STEPS[zoomIndex];

  // Reset zoom whenever image changes or lightbox closes
  useEffect(() => {
    setZoomIndex(0);
  }, [activeIndex, isOpen]);

  // Capture trigger focus, lock body scroll, focus close button, restore focus on close
  useEffect(() => {
    if (!isOpen) return;

    returnFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const rafId = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(rafId);
      document.body.style.overflow = previousOverflow;
      const target = returnFocusRef.current;
      if (target && document.contains(target)) {
        target.focus();
      }
    };
  }, [isOpen]);

  const handleZoomIn = useCallback(() => {
    setZoomIndex((prev) => {
      const next = Math.min(ZOOM_STEPS.length - 1, prev + 1);
      if (next !== prev) playTick();
      return next;
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomIndex((prev) => {
      const next = Math.max(0, prev - 1);
      if (next !== prev) playTick();
      return next;
    });
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoomIndex((prev) => {
      if (prev !== 0) playTick();
      return 0;
    });
  }, []);

  // Keyboard navigation + focus trap
  useEffect(() => {
    if (!isOpen || activeIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === 'ArrowRight' && images.length > 1) {
        event.preventDefault();
        playTick();
        onSelectIndex((activeIndex + 1) % images.length);
        return;
      }

      if (event.key === 'ArrowLeft' && images.length > 1) {
        event.preventDefault();
        playTick();
        onSelectIndex((activeIndex - 1 + images.length) % images.length);
        return;
      }

      if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        handleZoomIn();
        return;
      }

      if (event.key === '-' || event.key === '_') {
        event.preventDefault();
        handleZoomOut();
        return;
      }

      if (event.key === '0') {
        event.preventDefault();
        handleResetZoom();
        return;
      }

      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isOpen,
    activeIndex,
    images.length,
    onClose,
    onSelectIndex,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
  ]);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (zoomLevel > 1 || images.length <= 1) return;
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (zoomLevel > 1 || images.length <= 1 || activeIndex === null) return;
    const startX = touchStartXRef.current;
    touchStartXRef.current = null;
    if (startX === null) return;
    const endX = event.changedTouches[0]?.clientX ?? startX;
    const deltaX = endX - startX;
    if (Math.abs(deltaX) < 44) return;

    playTick();
    if (deltaX < 0) {
      onSelectIndex((activeIndex + 1) % images.length);
    } else {
      onSelectIndex((activeIndex - 1 + images.length) % images.length);
    }
  };

  const activeImage = activeIndex !== null ? images[activeIndex] : null;

  return (
    <AnimatePresence>
      {isOpen && activeImage && activeIndex !== null && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Full-screen image viewer"
          data-modal-open="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24, ease: EASE_APPLE }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1D1D1F]/80 p-4 sm:p-8 print:hidden"
        >
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.34, ease: EASE_APPLE }}
            onClick={(event) => event.stopPropagation()}
            className="apple-modal relative flex max-h-[92vh] w-full max-w-[1140px] flex-col overflow-hidden rounded-[28px] bg-[var(--apple-surface-elevated)]"
          >
            {/* Header with Zoom Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--apple-separator-subtle)] px-5 py-3.5 sm:px-7">
              <div className="type-footnote flex items-center gap-2.5 font-normal text-[var(--apple-label-secondary)]">
                <span className="font-semibold text-[var(--apple-label-primary)]">
                  Visual Inspection
                </span>
                {images.length > 1 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      {activeIndex + 1} of {images.length}
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <div
                  role="group"
                  aria-label="Image zoom controls"
                  className="inline-flex items-center gap-1 rounded-full bg-[var(--apple-control-tonal)] p-1"
                >
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    disabled={zoomIndex === 0}
                    aria-label="Zoom out"
                    title="Zoom out (-)"
                    className="apple-btn-icon h-9 w-9 text-[var(--apple-label-primary)] disabled:opacity-35 sm:h-7 sm:w-7"
                  >
                    <SFZoomOut size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={handleResetZoom}
                    aria-label={`Current zoom ${zoomLevel}x. Click to reset to 1x`}
                    className="type-caption min-h-[36px] min-w-[44px] rounded-full px-2 py-0.5 tabular-nums text-[var(--apple-label-primary)] hover:bg-[var(--apple-control-hover)] sm:min-h-[28px]"
                  >
                    {Math.round(zoomLevel * 100)}%
                  </button>
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    disabled={zoomIndex === ZOOM_STEPS.length - 1}
                    aria-label="Zoom in"
                    title="Zoom in (+)"
                    className="apple-btn-icon h-9 w-9 text-[var(--apple-label-primary)] disabled:opacity-35 sm:h-7 sm:w-7"
                  >
                    <SFZoomIn size={14} />
                  </button>
                </div>

                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={onClose}
                  aria-label="Close image viewer"
                  className="apple-btn-icon h-11 w-11 bg-[var(--apple-control-tonal)] text-[var(--apple-label-primary)] hover:bg-[var(--apple-control-tonal-hover)] sm:h-9 sm:w-9"
                >
                  <SFXmark size={15} />
                </button>
              </div>
            </div>

            {/* Viewport (supports zoom scroll & touch swipe) */}
            <div
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className={`relative flex flex-1 items-center justify-center bg-[var(--apple-bg-secondary)] px-5 py-6 sm:px-8 ${
                zoomLevel > 1 ? 'overflow-auto' : 'overflow-hidden'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  playTick();
                  setZoomIndex((prev) => (prev + 1) % ZOOM_STEPS.length);
                }}
                aria-label={
                  zoomLevel === ZOOM_STEPS[ZOOM_STEPS.length - 1]
                    ? 'Reset image zoom to 100%'
                    : 'Zoom in on image'
                }
                className={`block rounded-[20px] focus-visible:outline-2 ${
                  zoomLevel > 1 ? 'cursor-zoom-out' : 'cursor-zoom-in'
                }`}
              >
                <img
                  src={activeImage.src}
                  alt={activeImage.alt}
                  referrerPolicy="no-referrer"
                  style={
                    zoomLevel > 1
                      ? {
                          width: `${Math.round(zoomLevel * 100)}%`,
                          maxWidth: 'none',
                        }
                      : undefined
                  }
                  className={`rounded-[20px] object-contain transition-all duration-200 ${
                    zoomLevel === 1 ? 'max-h-[64vh] w-auto max-w-full' : 'h-auto'
                  }`}
                />
              </button>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      playTick();
                      onSelectIndex(
                        (activeIndex - 1 + images.length) % images.length,
                      );
                    }}
                    aria-label="Previous image"
                    className="apple-pill-shadow absolute left-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--apple-surface-elevated)] text-[var(--apple-label-primary)] transition-transform duration-150 hover:scale-105 active:scale-95 sm:left-5"
                  >
                    <SFChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playTick();
                      onSelectIndex((activeIndex + 1) % images.length);
                    }}
                    aria-label="Next image"
                    className="apple-pill-shadow absolute right-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--apple-surface-elevated)] text-[var(--apple-label-primary)] transition-transform duration-150 hover:scale-105 active:scale-95 sm:right-5"
                  >
                    <SFChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Filmstrip (shown when > 1 genuine image exists) */}
            {images.length > 1 && (
              <div
                aria-label="Image filmstrip"
                className="flex items-center justify-center gap-2.5 overflow-x-auto border-t border-[var(--apple-separator-subtle)] bg-[var(--apple-surface-elevated)] px-5 py-3"
              >
                {images.map((img, idx) => {
                  const selected = idx === activeIndex;
                  return (
                    <button
                      key={`${img.src}-${idx}`}
                      type="button"
                      onClick={() => {
                        if (!selected) {
                          playTick();
                          onSelectIndex(idx);
                        }
                      }}
                      aria-label={`View image ${idx + 1}: ${img.alt}`}
                      aria-current={selected ? 'true' : undefined}
                      className={`relative h-12 w-16 shrink-0 overflow-hidden rounded-[10px] transition-all duration-150 ${
                        selected
                          ? 'ring-2 ring-[var(--apple-blue)] ring-offset-2 ring-offset-[var(--apple-surface-elevated)]'
                          : 'opacity-60 hover:opacity-95'
                      }`}
                    >
                      <img
                        src={img.src}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Caption */}
            {activeImage.caption && (
              <div className="border-t border-[var(--apple-separator-subtle)] bg-[var(--apple-surface-elevated)] px-5 py-3.5 sm:px-7">
                <p className="type-footnote measure-prose font-normal text-[var(--apple-label-secondary)]">
                  {activeImage.caption}
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
