import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Pause,
  Play,
} from 'lucide-react';
import { PROJECTS } from '../data/projects';
import { renderCaseStudyCardTexture } from '../utils/caseStudyCardTexture';
import { playTick } from '../utils/soundEngine';
import {
  LiquidLens,
  type LiquidLensAxis,
  type LiquidLensCardDescriptor,
  type LiquidLensOpticalConfig,
  type LiquidLensStatus,
} from './LiquidLens';

export type LiquidLensCardVariant = 'styled-card' | 'cover-only';

export interface LiquidLensLabStageProps {
  axis: LiquidLensAxis;
  cardVariant: LiquidLensCardVariant;
  stageHeight: number;
  cardGap: number;
  cardRadius: number;
  autoGlide: boolean;
  glideSpeed: number;
  stepAside: boolean;
  showGuides: boolean;
  opticalConfig: LiquidLensOpticalConfig;
  onNavigate: (path: string) => void;
  onActiveProjectChange?: (index: number) => void;
  onStatusChange?: (status: LiquidLensStatus) => void;
}

function wrapSigned(value: number, span: number): number {
  if (span <= 0) return value;
  let v = ((value + span * 0.5) % span + span) % span - span * 0.5;
  if (v < -span * 0.5) v += span;
  return v;
}

function wrapIndex(index: number, count: number): number {
  return ((index % count) + count) % count;
}

/**
 * Interactive Home Deck stage wired to the host-agnostic WebGL2 LiquidLens.
 *
 * Keeps real interactive DOM cards in the clear center while mirroring baked
 * rest textures into the LiquidLens FBO so cards sliding under the left/right
 * (or top/bottom on portrait) glass strips refract, disperse, and melt.
 */
export function LiquidLensLabStage({
  axis,
  cardVariant,
  stageHeight,
  cardGap,
  cardRadius,
  autoGlide,
  glideSpeed,
  stepAside,
  showGuides,
  opticalConfig,
  onNavigate,
  onActiveProjectChange,
  onStatusChange,
}: LiquidLensLabStageProps) {
  const stageContainerRef = useRef<HTMLDivElement | null>(null);
  const cardElRefs = useRef<(HTMLElement | null)[]>([]);

  // Viewport portrait detection for 'auto' axis layout
  const [viewportPortrait, setViewportPortrait] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 640;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setViewportPortrait(window.innerWidth < 640);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isVerticalLayout =
    axis === 'vertical' || (axis === 'auto' && viewportPortrait);

  // Bake rest textures for every card (matching the deck card's 4:3 landscape proportion)
  const [styledTextureMap, setStyledTextureMap] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    const createdBlobUrls: string[] = [];

    Promise.all(
      PROJECTS.map(async (project) => {
        const url = await renderCaseStudyCardTexture(project, 'landscape');
        return [project.slug, url] as const;
      }),
    ).then((entries) => {
      if (cancelled) {
        entries.forEach(([, url]) => {
          if (url.startsWith('blob:')) URL.revokeObjectURL(url);
        });
        return;
      }
      const nextMap: Record<string, string> = {};
      entries.forEach(([slug, url]) => {
        nextMap[slug] = url;
        if (url.startsWith('blob:')) createdBlobUrls.push(url);
      });
      setStyledTextureMap(nextMap);
    });

    return () => {
      cancelled = true;
      createdBlobUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  // Card dimensions tailored cleanly to horizontal vs vertical phone stage
  const cardW = isVerticalLayout
    ? 304
    : Math.min(540, Math.max(320, Math.round(stageHeight * 0.72 * (4 / 3))));
  const cardH = isVerticalLayout
    ? 228
    : Math.round(cardW * (3 / 4));
  const stride = (isVerticalLayout ? cardH : cardW) + cardGap;
  const count = PROJECTS.length;
  const totalSpan = stride * count;

  // Physics state kept strictly in refs (zero React re-renders per frame)
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);
  const targetSnapRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const dragMovedRef = useRef(false);
  const lastPointerCoordRef = useRef(0);
  const lastPointerTimeRef = useRef(0);
  const isHoveringStageRef = useRef(false);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const [pausedByClick, setPausedByClick] = useState(false);

  const autoGlideRef = useRef(autoGlide);
  autoGlideRef.current = autoGlide && !pausedByClick;
  const glideSpeedRef = useRef(glideSpeed);
  glideSpeedRef.current = glideSpeed;
  const isVerticalRef = useRef(isVerticalLayout);
  isVerticalRef.current = isVerticalLayout;
  const strideRef = useRef(stride);
  strideRef.current = stride;
  const totalSpanRef = useRef(totalSpan);
  totalSpanRef.current = totalSpan;
  const onActiveChangeRef = useRef(onActiveProjectChange);
  onActiveChangeRef.current = onActiveProjectChange;

  // Position all cards using compositor-only translate3d every frame
  const applyCardTransforms = useCallback(() => {
    const s = strideRef.current;
    const span = totalSpanRef.current;
    const vertical = isVerticalRef.current;
    const offset = offsetRef.current;

    let closestIdx = 0;
    let closestDist = Infinity;

    for (let i = 0; i < count; i++) {
      const el = cardElRefs.current[i];
      const raw = i * s - offset;
      const wrapped = wrapSigned(raw, span);
      const absDist = Math.abs(wrapped);

      if (absDist < closestDist) {
        closestDist = absDist;
        closestIdx = i;
      }

      if (el) {
        if (vertical) {
          el.style.transform = `translate3d(-50%, calc(-50% + ${wrapped.toFixed(2)}px), 0)`;
        } else {
          el.style.transform = `translate3d(calc(-50% + ${wrapped.toFixed(2)}px), -50%, 0)`;
        }
      }
    }

    if (closestIdx !== activeIndexRef.current) {
      activeIndexRef.current = closestIdx;
      setActiveIndex(closestIdx);
      onActiveChangeRef.current?.(closestIdx);
    }
  }, [count]);

  // Re-apply immediately when layout dimensions change
  useEffect(() => {
    applyCardTransforms();
  }, [applyCardTransforms, cardW, cardH, cardGap, isVerticalLayout]);

  // Main inertia + auto-glide physics rAF loop
  useEffect(() => {
    let rafId = 0;
    let lastTs = performance.now();

    const step = (now: number) => {
      rafId = window.requestAnimationFrame(step);
      const dt = Math.min((now - lastTs) / 1000, 0.05);
      lastTs = now;

      if (!isDraggingRef.current) {
        if (targetSnapRef.current !== null) {
          const diff = targetSnapRef.current - offsetRef.current;
          offsetRef.current += diff * Math.min(1, dt * 9.5);
          velocityRef.current = 0;
          if (Math.abs(diff) < 0.35) {
            offsetRef.current = targetSnapRef.current;
            targetSnapRef.current = null;
          }
        } else {
          // Momentum decay
          if (Math.abs(velocityRef.current) > 0.08) {
            offsetRef.current += velocityRef.current * dt;
            velocityRef.current *= Math.pow(0.06, dt);
          } else {
            velocityRef.current = 0;
            // Gentle continuous auto-glide when enabled and not hovered
            if (autoGlideRef.current && !isHoveringStageRef.current) {
              offsetRef.current += glideSpeedRef.current * 44 * dt;
            }
          }
        }
      }

      applyCardTransforms();
    };

    rafId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafId);
  }, [applyCardTransforms]);

  const stepByCard = useCallback(
    (delta: number) => {
      playTick();
      const s = strideRef.current;
      const baseSlot =
        targetSnapRef.current !== null
          ? Math.round(targetSnapRef.current / s)
          : Math.round(offsetRef.current / s);
      targetSnapRef.current = (baseSlot + delta) * s;
      velocityRef.current = 0;
    },
    [],
  );

  // Pointer drag interaction
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, a')) return;
    isDraggingRef.current = true;
    dragMovedRef.current = false;
    targetSnapRef.current = null;
    velocityRef.current = 0;
    lastPointerCoordRef.current = isVerticalLayout ? e.clientY : e.clientX;
    lastPointerTimeRef.current = performance.now();
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const coord = isVerticalLayout ? e.clientY : e.clientX;
    const delta = coord - lastPointerCoordRef.current;
    if (Math.abs(delta) > 2) dragMovedRef.current = true;

    const now = performance.now();
    const dt = Math.max(0.008, (now - lastPointerTimeRef.current) / 1000);
    offsetRef.current -= delta;
    velocityRef.current = (-delta / dt) * 0.42;
    lastPointerCoordRef.current = coord;
    lastPointerTimeRef.current = now;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  // Gentle horizontal / axis-aligned wheel scrubbing (never traps normal page vertical scroll in horizontal mode)
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (isVerticalLayout) {
      if (Math.abs(e.deltaY) > 1) {
        e.preventDefault();
        targetSnapRef.current = null;
        offsetRef.current += e.deltaY * 0.85;
      }
      return;
    }
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 1) {
      e.preventDefault();
      targetSnapRef.current = null;
      offsetRef.current += e.deltaX * 0.9;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isVerticalLayout) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        stepByCard(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        stepByCard(-1);
      }
    } else {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        stepByCard(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepByCard(-1);
      }
    }
  };

  // Build host-supplied card descriptors with active variant, proximity (`near`), and download `priority`
  const lensCards = useMemo<LiquidLensCardDescriptor[]>(() => {
    return PROJECTS.map((project, idx) => {
      // Shortest modular distance on the 6-card ring from activeIndex
      const rawDist = Math.abs(idx - activeIndex);
      const ringDist = Math.min(rawDist, count - rawDist);
      return {
        id: project.slug,
        getElement: () => cardElRefs.current[idx] ?? null,
        variant: cardVariant,
        textures: {
          'styled-card': styledTextureMap[project.slug] ?? project.coverImage,
          'cover-only': project.coverImage,
        },
        // Host decides which cards are close enough to load & retain textures
        near: ringDist <= 2,
        // Host dictates download priority (0 = active center card, 1 = immediate glass-edge neighbors, 2 = outer)
        priority: ringDist,
        borderRadius: cardRadius,
      };
    });
  }, [activeIndex, cardVariant, styledTextureMap, cardRadius, count]);

  const activeProject = PROJECTS[wrapIndex(activeIndex, count)] ?? PROJECTS[0];
  const stripPct = Math.round(opticalConfig.stripSize * 100);

  return (
    <div className="flex flex-col items-center justify-center py-6 sm:py-8">
      {/* Stage Frame: full-bleed horizontal deck OR tall portrait phone frame */}
      <div
        ref={stageContainerRef}
        tabIndex={0}
        role="region"
        aria-label="Liquid Lens interactive case study deck"
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        onMouseEnter={() => {
          isHoveringStageRef.current = true;
        }}
        onMouseLeave={() => {
          isHoveringStageRef.current = false;
        }}
        style={{
          height: isVerticalLayout ? 640 : stageHeight,
        }}
        className={`relative select-none overflow-hidden bg-[var(--apple-bg-secondary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--apple-blue)] ${
          isVerticalLayout
            ? 'w-[376px] max-w-[calc(100vw-2rem)] cursor-ns-resize rounded-[34px] border border-[var(--apple-separator)] shadow-sm'
            : 'w-full max-w-[1440px] cursor-grab active:cursor-grabbing'
        }`}
      >
        {/* Live Interactive DOM Deck Layer (Center stays 100% clear & live) */}
        <div className="relative h-full w-full">
          {PROJECTS.map((project, idx) => {
            const isActive = idx === activeIndex;
            const src =
              cardVariant === 'styled-card'
                ? styledTextureMap[project.slug] ?? project.coverImage
                : project.coverImage;

            return (
              <article
                key={project.slug}
                ref={(node) => {
                  cardElRefs.current[idx] = node;
                }}
                style={{
                  width: cardW,
                  height: cardH,
                  borderRadius: cardRadius,
                }}
                className="group absolute top-1/2 left-1/2 overflow-hidden bg-[#141416] shadow-[0_14px_38px_-16px_rgba(0,0,0,0.34)] transition-shadow duration-200 hover:shadow-[0_20px_46px_-14px_rgba(0,0,0,0.42)]"
              >
                <img
                  src={src}
                  alt={project.coverAlt}
                  draggable={false}
                  referrerPolicy="no-referrer"
                  className="pointer-events-none h-full w-full object-cover"
                />

                {/* Live Interactive Hover Action strictly on the real DOM card in the center */}
                <a
                  href={`/work/${project.slug}`}
                  onClick={(e) => {
                    if (dragMovedRef.current) {
                      e.preventDefault();
                      return;
                    }
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                    e.preventDefault();
                    playTick();
                    onNavigate(`/work/${project.slug}`);
                  }}
                  aria-label={`Open ${project.title} case study`}
                  className="absolute inset-0 flex items-start justify-end p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/80"
                >
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border border-white/25 bg-black/50 px-3 py-1.5 text-[11.5px] font-medium text-white backdrop-blur-md transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isActive
                        ? 'opacity-0 translate-y-1 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100'
                        : 'opacity-0'
                    }`}
                  >
                    <span>Open Case Study</span>
                    <ArrowUpRight size={12.5} strokeWidth={2} aria-hidden="true" />
                  </span>
                </a>
              </article>
            );
          })}
        </div>

        {/* Host-Agnostic WebGL2 Liquid Lens Overlay */}
        <LiquidLens
          cards={lensCards}
          containerRef={stageContainerRef}
          axis={axis}
          stepAside={stepAside}
          config={opticalConfig}
          onStatusChange={onStatusChange}
        />

        {/* Optional Strip Boundary Guide Overlay for Optical Calibration */}
        {showGuides && !stepAside && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-30"
          >
            {isVerticalLayout ? (
              <>
                <div
                  style={{ top: `${stripPct}%` }}
                  className="absolute right-0 left-0 border-t border-dashed border-[var(--apple-blue)]/65"
                >
                  <span className="ml-3 inline-block -translate-y-full pb-1 font-mono text-[10px] font-medium text-[var(--apple-blue)]">
                    Top Glass · {stripPct}%
                  </span>
                </div>
                <div
                  style={{ bottom: `${stripPct}%` }}
                  className="absolute right-0 left-0 border-b border-dashed border-[var(--apple-blue)]/65"
                >
                  <span className="ml-3 inline-block pt-1 font-mono text-[10px] font-medium text-[var(--apple-blue)]">
                    Bottom Glass · {stripPct}%
                  </span>
                </div>
              </>
            ) : (
              <>
                <div
                  style={{ left: `${stripPct}%` }}
                  className="absolute top-0 bottom-0 border-l border-dashed border-[var(--apple-blue)]/65"
                >
                  <span className="mt-3 ml-2 inline-block font-mono text-[10.5px] font-medium text-[var(--apple-blue)]">
                    Left Glass ({stripPct}%) ← Clear Center
                  </span>
                </div>
                <div
                  style={{ right: `${stripPct}%` }}
                  className="absolute top-0 bottom-0 border-r border-dashed border-[var(--apple-blue)]/65"
                >
                  <span className="mt-3 mr-2 inline-block font-mono text-[10.5px] font-medium text-[var(--apple-blue)]">
                    Right Glass ({stripPct}%)
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Quiet Stage Controls (Prev / Next / Auto-Glide / Active Card Link) */}
        <div className="pointer-events-none absolute right-4 bottom-3.5 left-4 z-30 flex items-center justify-between gap-3">
          <div className="pointer-events-auto flex items-center gap-1.5">
            <button
              type="button"
              aria-label={isVerticalLayout ? 'Previous card up' : 'Previous card'}
              onClick={() => stepByCard(-1)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)]/92 text-[var(--apple-label-primary)] shadow-xs transition-transform duration-150 hover:bg-[var(--apple-surface-elevated)] active:scale-[0.94]"
            >
              {isVerticalLayout ? (
                <ChevronUp size={15} strokeWidth={2} aria-hidden="true" />
              ) : (
                <ChevronLeft size={15} strokeWidth={2} aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              aria-label={isVerticalLayout ? 'Next card down' : 'Next card'}
              onClick={() => stepByCard(1)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)]/92 text-[var(--apple-label-primary)] shadow-xs transition-transform duration-150 hover:bg-[var(--apple-surface-elevated)] active:scale-[0.94]"
            >
              {isVerticalLayout ? (
                <ChevronDown size={15} strokeWidth={2} aria-hidden="true" />
              ) : (
                <ChevronRight size={15} strokeWidth={2} aria-hidden="true" />
              )}
            </button>

            {autoGlide && (
              <button
                type="button"
                aria-label={pausedByClick ? 'Resume glide' : 'Pause glide'}
                onClick={() => {
                  playTick();
                  setPausedByClick((p) => !p);
                }}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)]/92 text-[var(--apple-label-primary)] shadow-xs transition-transform duration-150 hover:bg-[var(--apple-surface-elevated)] active:scale-[0.94]"
              >
                {pausedByClick ? (
                  <Play size={13} strokeWidth={2} aria-hidden="true" />
                ) : (
                  <Pause size={13} strokeWidth={2} aria-hidden="true" />
                )}
              </button>
            )}
          </div>

          <div className="pointer-events-auto flex items-center gap-2.5">
            <span className="hidden font-mono text-[11.5px] tabular-nums text-[var(--apple-label-secondary)] sm:inline">
              {String(activeIndex + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
            </span>
            {activeProject && (
              <a
                href={`/work/${activeProject.slug}`}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                  e.preventDefault();
                  onNavigate(`/work/${activeProject.slug}`);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--apple-separator)] bg-[var(--apple-surface-elevated)]/92 px-3 py-1.5 text-[12px] font-medium text-[var(--apple-label-primary)] shadow-xs transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.97]"
              >
                <span className="max-w-[160px] truncate">{activeProject.title}</span>
                <ArrowUpRight size={13} strokeWidth={2} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Quiet caption explaining interaction & portrait axis behavior */}
      <p className="mt-3 px-5 text-center text-[12px] text-[var(--apple-label-tertiary)]">
        {isVerticalLayout
          ? 'Drag vertically or use Up/Down arrows · Top & bottom strips refract while the centered card stays live'
          : 'Drag horizontally, scroll sideways, or use Left/Right arrows · Outer strips refract while the center stays live & clickable'}
      </p>
    </div>
  );
}

export default LiquidLensLabStage;
