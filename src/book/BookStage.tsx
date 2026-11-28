import { useEffect, useRef, useState } from 'react';
import { createBookEngine } from './bookEngine';
import type { BookEngineApi, BookHotspot, BookStickerConfig } from './types';

export interface BookStageProps {
  apiRef: React.MutableRefObject<BookEngineApi | null>;
  restHostRef: React.RefObject<HTMLDivElement | null>;
  restWidth: number;
  active: boolean;
  sidesSpread: string[];
  sidesSingle: string[];
  backCover?: string;
  coverBare: string;
  coverSticker: BookStickerConfig;
  hotspots: BookHotspot[];
  pageWidth?: number;
  pageHeight?: number;
  glossAlpha?: number;
  onReady: () => void;
  onError: (err: unknown) => void;
  onDismiss: () => void;
  onReopen: () => void;
  onHotspot: (hotspot: BookHotspot) => void;
}

export function BookStage({
  apiRef,
  restHostRef,
  restWidth,
  active,
  sidesSpread,
  sidesSingle,
  backCover,
  coverBare,
  coverSticker,
  hotspots,
  pageWidth = 420,
  pageHeight = 560,
  glossAlpha = 160,
  onReady,
  onError,
  onDismiss,
  onReopen,
  onHotspot,
}: BookStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const callbacksRef = useRef({ onReady, onError, onDismiss, onReopen, onHotspot });
  callbacksRef.current = { onReady, onError, onDismiss, onReopen, onHotspot };

  const [layout, setLayout] = useState<'spread' | 'single' | null>(null);

  useEffect(() => {
    if (active) return;
    const mq = window.matchMedia('(max-width: 640px)');
    const sync = () => setLayout(mq.matches ? 'single' : 'spread');
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [active]);

  useEffect(() => {
    const stageHost = stageRef.current;
    const restHost = restHostRef.current;
    if (!stageHost || !restHost || !layout) return;

    let engine: BookEngineApi;
    try {
      engine = createBookEngine({
        restHost,
        stageHost,
        restWidth,
        layout,
        sides: layout === 'single' ? sidesSingle : sidesSpread,
        backCover,
        coverBare,
        coverSticker,
        hotspots,
        pageWidth,
        pageHeight,
        glossAlpha,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        onReady: () => callbacksRef.current.onReady(),
        onError: (err) => callbacksRef.current.onError(err),
        onDismiss: () => callbacksRef.current.onDismiss(),
        onReopen: () => callbacksRef.current.onReopen(),
        onHotspot: (h) => callbacksRef.current.onHotspot(h),
      });
    } catch (err) {
      callbacksRef.current.onError(err);
      return;
    }

    apiRef.current = engine;
    return () => {
      apiRef.current = null;
      engine.dispose();
    };
  }, [
    apiRef,
    restHostRef,
    restWidth,
    layout,
    sidesSpread,
    sidesSingle,
    backCover,
    coverBare,
    coverSticker,
    hotspots,
    pageWidth,
    pageHeight,
    glossAlpha,
  ]);

  return (
    <div
      ref={stageRef}
      role="dialog"
      aria-modal="true"
      aria-label="Interactive 3D Book"
      aria-hidden={!active}
      data-lenis-prevent=""
      className={`fixed inset-0 h-[100dvh] w-full touch-none overscroll-none ${active ? 'z-[9999]' : ''}`}
      style={{
        visibility: active ? 'visible' : 'hidden',
        pointerEvents: active ? 'auto' : 'none',
      }}
    />
  );
}
