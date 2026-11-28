import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { BookStage } from './BookStage';
import type { BookEngineApi, BookHotspot, BookStickerConfig } from './types';
import { getLenisInstance } from '../utils/smoothScroll';
import { playTick } from '../utils/soundEngine';

export interface InteractiveBookProps {
  collapsedWidth?: number;
  collapsedHeight?: number;
  sidesSpread: string[];
  sidesSingle: string[];
  backCover?: string;
  coverBare: string;
  coverSticker: BookStickerConfig;
  hotspots: BookHotspot[];
  pageWidth?: number;
  pageHeight?: number;
  glossAlpha?: number;
  emailToCopy?: string;
  stickerAlt?: string;
  onEmailCopied?: (email: string) => void;
}

let cachedWebGL2Support: boolean | null = null;

function useHasFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    setFine(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setFine(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return fine;
}

function openExternalLinkSafely(href: string) {
  const link = document.createElement('a');
  link.href = href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function InteractiveBook({
  collapsedWidth = 240,
  collapsedHeight = 320,
  sidesSpread,
  sidesSingle,
  backCover,
  coverBare,
  coverSticker,
  hotspots,
  pageWidth = 420,
  pageHeight = 560,
  glossAlpha = 160,
  emailToCopy = 'hello@example.com',
  stickerAlt = 'Hello, my name is Aarav',
  onEmailCopied,
}: InteractiveBookProps) {
  const hasFinePointer = useHasFinePointer();
  const [mounted, setMounted] = useState(false);
  const [webglReady, setWebglReady] = useState(false);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [stageActive, setStageActive] = useState(false);
  const [pendingOpen, setPendingOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [closingControls, setClosingControls] = useState(false);
  const [pressedKey, setPressedKey] = useState<'previous' | 'next' | 'close' | null>(null);
  const [copiedToast, setCopiedToast] = useState(false);

  const apiRef = useRef<BookEngineApi | null>(null);
  const restHostRef = useRef<HTMLDivElement | null>(null);
  const closingLockRef = useRef(false);
  const pressedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isOpenOrActive = modalOpen || stageActive;

  useEffect(() => {
    setMounted(true);
    if (cachedWebGL2Support === null) {
      cachedWebGL2Support = document.createElement('canvas').getContext('webgl2') !== null;
    }
    if (!cachedWebGL2Support) {
      setFallbackMode(true);
    }
    return () => {
      if (pressedTimerRef.current) clearTimeout(pressedTimerRef.current);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  const flashKey = useCallback((key: 'previous' | 'next' | 'close') => {
    if (pressedTimerRef.current) clearTimeout(pressedTimerRef.current);
    setPressedKey(key);
    pressedTimerRef.current = setTimeout(() => setPressedKey(null), 180);
  }, []);

  const handleEngineError = useCallback(() => {
    setFallbackMode(true);
    setStageActive(false);
  }, []);

  // Trigger peel-and-stick cover sticker animation shortly after WebGL canvas is ready
  useEffect(() => {
    if (!webglReady) return;
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const targetTime = (nav?.loadEventEnd || performance.now()) + 650;
    const delay = Math.max(targetTime - performance.now(), 250);
    const timer = setTimeout(() => apiRef.current?.stickOn(), delay);
    return () => clearTimeout(timer);
  }, [webglReady]);

  // Lock page scroll & pause Lenis while journal is open
  useEffect(() => {
    if (!isOpenOrActive) return;
    const lenis = getLenisInstance();
    lenis?.stop();

    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.documentElement.style.overflow = 'hidden';

    const preventTouch = (e: TouchEvent) => e.preventDefault();
    document.addEventListener('touchmove', preventTouch, { passive: false });

    return () => {
      const top = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.documentElement.style.overflow = '';
      document.removeEventListener('touchmove', preventTouch);
      if (top) window.scrollTo(0, -parseInt(top, 10) || 0);
      lenis?.start();
    };
  }, [isOpenOrActive]);

  const openBook = useCallback(() => {
    apiRef.current?.open();
    setStageActive(true);
    setModalOpen(true);
  }, []);

  const handleTriggerClick = () => {
    if (isOpenOrActive || fallbackMode) return;
    if (!webglReady) {
      setPendingOpen(true);
      return;
    }
    openBook();
  };

  useEffect(() => {
    if (pendingOpen && webglReady) {
      setPendingOpen(false);
      openBook();
    }
  }, [pendingOpen, webglReady, openBook]);

  const closeBook = useCallback(async () => {
    if (!modalOpen || closingLockRef.current) return;
    closingLockRef.current = true;
    setClosingControls(true);
    const finished = await apiRef.current?.close(() => setModalOpen(false));
    closingLockRef.current = false;
    setClosingControls(false);
    if (finished !== false) {
      setStageActive(false);
      setModalOpen(false);
    }
  }, [modalOpen]);

  const handleReopen = useCallback(() => {
    closingLockRef.current = false;
    setClosingControls(false);
    setModalOpen(true);
  }, []);

  const handleHotspot = useCallback(
    async (hotspot: BookHotspot) => {
      if (hotspot.action === 'copy-email') {
        try {
          await navigator.clipboard.writeText(emailToCopy);
          onEmailCopied?.(emailToCopy);
          setCopiedToast(true);
          if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
          copiedTimerRef.current = setTimeout(() => setCopiedToast(false), 1800);
        } catch {
          // Clipboard permission denied
        }
      } else if (hotspot.href) {
        openExternalLinkSafely(hotspot.href);
      }
    },
    [emailToCopy, onEmailCopied],
  );

  const stepPage = useCallback((dir: 1 | -1) => {
    if (dir === 1) apiRef.current?.flipNext();
    else apiRef.current?.flipPrev();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!modalOpen) return;
      if (e.key === 'Escape') {
        flashKey('close');
        closeBook();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        flashKey('next');
        stepPage(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        flashKey('previous');
        stepPage(-1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalOpen, stepPage, closeBook, flashKey]);

  const visible = webglReady || fallbackMode;

  const portal = mounted
    ? createPortal(
        <>
          {modalOpen && (
            <>
              {/* Blurred dark backdrop */}
              <div
                data-lenis-prevent=""
                className="fixed inset-0 z-[9998] h-[100dvh] w-full touch-none overscroll-none bg-black/58 backdrop-blur-md transition-opacity duration-300"
                onClick={closeBook}
              />

              {/* Floating Apple-style Frosted Glass Toolbar */}
              {!closingControls && (
                <div
                  data-journal-controls=""
                  role="toolbar"
                  aria-label="Journal controls"
                  className="fixed left-1/2 top-6 z-[10000] inline-flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/14 bg-[#1c1c1e]/82 p-1 text-white/90 shadow-[0_12px_34px_rgba(0,0,0,0.44),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl sm:top-9"
                >
                  <button
                    type="button"
                    aria-label="Previous page"
                    title="Previous page (←)"
                    onClick={() => {
                      playTick();
                      stepPage(-1);
                    }}
                    className={`inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-[background-color,color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-white/12 hover:text-white active:scale-[0.93] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 ${
                      pressedKey === 'previous' ? 'scale-[0.93] bg-white/18 text-white' : ''
                    }`}
                  >
                    <ChevronLeft size={18} strokeWidth={1.9} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next page"
                    title="Next page (→)"
                    onClick={() => {
                      playTick();
                      stepPage(1);
                    }}
                    className={`inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-[background-color,color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-white/12 hover:text-white active:scale-[0.93] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 ${
                      pressedKey === 'next' ? 'scale-[0.93] bg-white/18 text-white' : ''
                    }`}
                  >
                    <ChevronRight size={18} strokeWidth={1.9} aria-hidden="true" />
                  </button>

                  <span
                    aria-hidden="true"
                    className="mx-0.5 h-4 w-px bg-white/16"
                  />

                  <button
                    type="button"
                    aria-label="Close journal"
                    title="Close (Esc)"
                    onClick={() => {
                      playTick();
                      closeBook();
                    }}
                    className={`inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-white/85 transition-[background-color,color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-white/14 hover:text-white active:scale-[0.93] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 ${
                      pressedKey === 'close' ? 'scale-[0.93] bg-white/20 text-white' : ''
                    }`}
                  >
                    <X size={17} strokeWidth={1.95} aria-hidden="true" />
                  </button>
                </div>
              )}

              {/* Toast notification for email copy hotspot */}
              {copiedToast && (
                <div
                  role="status"
                  className="pointer-events-none fixed bottom-10 left-1/2 z-[10000] -translate-x-1/2 rounded-full border border-white/14 bg-[#1c1c1e]/85 px-4 py-2 text-[12.5px] font-medium tracking-[-0.01em] text-white/95 shadow-[0_10px_28px_rgba(0,0,0,0.4)] backdrop-blur-xl"
                >
                  Email copied ({emailToCopy})
                </div>
              )}
            </>
          )}

          {!fallbackMode && (
            <BookStage
              apiRef={apiRef}
              restHostRef={restHostRef}
              restWidth={collapsedWidth}
              active={stageActive}
              sidesSpread={sidesSpread}
              sidesSingle={sidesSingle}
              backCover={backCover}
              coverBare={coverBare}
              coverSticker={coverSticker}
              hotspots={hotspots}
              pageWidth={pageWidth}
              pageHeight={pageHeight}
              glossAlpha={glossAlpha}
              onReady={() => setWebglReady(true)}
              onError={handleEngineError}
              onDismiss={closeBook}
              onReopen={handleReopen}
              onHotspot={handleHotspot}
            />
          )}
        </>,
        document.body,
      )
    : null;

  return (
    <>
      {portal}
      <div
        className="relative transition-[opacity,transform] duration-200 ease-out"
        style={{
          width: collapsedWidth,
          height: collapsedHeight,
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1)' : 'scale(0.95)',
        }}
      >
        {fallbackMode ? (
          <div className="relative -ml-2 h-full w-full rotate-3 overflow-hidden rounded-l-sm rounded-r-lg shadow-md">
            <img src={coverBare} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <img
              src={coverSticker.src}
              alt={stickerAlt}
              className="absolute left-1/2 top-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 rotate-3 object-contain"
            />
          </div>
        ) : (
          <div
            role="button"
            aria-label="Open interactive 3D journal"
            tabIndex={isOpenOrActive ? -1 : 0}
            className="relative cursor-pointer opacity-0 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--apple-focus-ring)]"
            style={{
              width: collapsedWidth,
              height: collapsedHeight,
              borderRadius: 12,
              transform: 'rotate(3deg)',
            }}
            onClick={handleTriggerClick}
            onPointerMove={(e) => {
              if (e.pointerType === 'mouse' && hasFinePointer) {
                apiRef.current?.hover({ x: e.clientX, y: e.clientY });
              }
            }}
            onPointerLeave={() => apiRef.current?.hover(null)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTriggerClick();
              }
            }}
          />
        )}

        {/* WebGL rest canvas mount point (oversized to allow tilt + drop shadows without clipping) */}
        <div
          ref={restHostRef}
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            top: -72,
            bottom: -72,
            left: -80,
            right: -64,
            visibility: webglReady ? 'visible' : 'hidden',
          }}
        />
      </div>
    </>
  );
}
