import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CaseStudyProject } from '../data/projects';
import { startCaseStudyTransition } from '../utils/caseStudyTransition';
import { prefersReducedMotion } from '../utils/scroll';
import { playTap, playTick } from '../utils/soundEngine';
import {
  LiquidLens,
  type LiquidLensAxis,
  type LiquidLensCardDescriptor,
  type LiquidLensOpticalConfig,
} from './LiquidLens';

export interface HomeLiquidLensDeckProps {
  projects: readonly CaseStudyProject[];
  styledTextureMap: Record<string, string>;
  texturesReady?: boolean;
  onNavigate: (path: string) => void;
  onPrefetchCaseStudy?: () => void;
}

/**
 * Exact calibrated Liquid Lens (v2) homepage configuration.
 */
const HOME_LIQUID_LENS_OPTICAL: LiquidLensOpticalConfig = {
  stripSize: 0.08,
  refraction: 1,
  dispersion: 0.8,
  meltBlur: 12,
  liquidRipple: 0,
  glassSheen: 0,
  edgeFade: 0.62,
  meniscusCurve: 1.35,
};

const HOME_LIQUID_LENS_DECK = {
  axis: 'horizontal' as LiquidLensAxis,
  cardVariant: 'styled-card' as const,
  cardGap: 24,
  cardRadius: 22,
  autoGlide: true,
  glideSpeed: 0.85,
  stepAside: false,
} as const;

function wrapSigned(value: number, span: number): number {
  if (span <= 0) return value;
  let v = (((value + span * 0.5) % span) + span) % span - span * 0.5;
  if (v < -span * 0.5) v += span;
  return v;
}

/**
 * Matches v1 FlexCarousel's exact responsive 16:9 widescreen card dimensions:
 * - xl (>=1280px): 1054 × 593px
 * - lg (>=1024px):  887 × 499px
 * - sm (>=640px):   665 × 374px
 * - mobile (<640px): 392 × 220px (clamped cleanly to viewport width)
 *
 * Stage height adds tight vertical breathing room for card drop shadows so
 * the subtle switcher sits right below the cards without excess empty space.
 */
function getResponsiveStageMetrics(viewportWidth: number): {
  stageHeight: number;
  cardW: number;
  cardH: number;
} {
  if (viewportWidth >= 1280) {
    const cardH = 593;
    const cardW = Math.round(cardH * (16 / 9)); // 1054px
    return { stageHeight: cardH + 16, cardW, cardH };
  }
  if (viewportWidth >= 1024) {
    const cardH = 499;
    const cardW = Math.round(cardH * (16 / 9)); // 887px
    return { stageHeight: cardH + 16, cardW, cardH };
  }
  if (viewportWidth >= 640) {
    const cardH = 374;
    const cardW = Math.round(cardH * (16 / 9)); // 665px
    return { stageHeight: cardH + 14, cardW, cardH };
  }
  const cardW = Math.min(392, Math.max(280, Math.round(viewportWidth * 0.88)));
  const cardH = Math.round(cardW * (9 / 16));
  return { stageHeight: cardH + 12, cardW, cardH };
}

/**
 * Homepage Featured Work deck (v2) powered by the WebGL2 LiquidLens.
 *
 * Cards match v1's exact widescreen editorial scale and glide continuously
 * through refracting liquid-glass strips at the outer edges while the center
 * stays 100% clear, live, and directly clickable.
 */
export function HomeLiquidLensDeck({
  projects,
  styledTextureMap,
  texturesReady = true,
  onNavigate,
  onPrefetchCaseStudy,
}: HomeLiquidLensDeckProps) {
  const stageContainerRef = useRef<HTMLDivElement | null>(null);
  const cardElRefs = useRef<(HTMLElement | null)[]>([]);
  const navigatingRef = useRef(false);

  const [metrics, setMetrics] = useState(() =>
    getResponsiveStageMetrics(
      typeof window !== 'undefined' ? window.innerWidth : 1440,
    ),
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      const next = getResponsiveStageMetrics(window.innerWidth);
      setMetrics((prev) =>
        prev.stageHeight === next.stageHeight &&
        prev.cardW === next.cardW &&
        prev.cardH === next.cardH
          ? prev
          : next,
      );
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const stride = metrics.cardW + HOME_LIQUID_LENS_DECK.cardGap;

  // Repeat slots only if total span is too narrow to prevent visible wrapping
  const ringSlots = useMemo(() => {
    if (projects.length === 0) return [];
    const repeatCount = projects.length * stride < 2400 ? 2 : 1;
    const slots: { slotId: string; project: CaseStudyProject }[] = [];
    for (let r = 0; r < repeatCount; r++) {
      for (let i = 0; i < projects.length; i++) {
        slots.push({
          slotId: repeatCount > 1 ? `${projects[i].slug}-${r}` : projects[i].slug,
          project: projects[i],
        });
      }
    }
    return slots;
  }, [projects, stride]);

  const count = ringSlots.length;
  const totalSpan = stride * count;

  // Physics state kept in refs to avoid per-frame React re-renders
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);
  const targetSnapRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const dragMovedRef = useRef(false);
  const pointerDownXRef = useRef(0);
  const pointerCapturedRef = useRef(false);
  const lastPointerXRef = useRef(0);
  const lastPointerTimeRef = useRef(0);
  const isHoveringStageRef = useRef(false);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

  const strideRef = useRef(stride);
  strideRef.current = stride;
  const totalSpanRef = useRef(totalSpan);
  totalSpanRef.current = totalSpan;

  const applyCardTransforms = useCallback(() => {
    const s = strideRef.current;
    const span = totalSpanRef.current;
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
        el.style.transform = `translate3d(calc(-50% + ${wrapped.toFixed(2)}px), -50%, 0)`;
      }
    }

    if (closestIdx !== activeIndexRef.current) {
      activeIndexRef.current = closestIdx;
      setActiveIndex(closestIdx);
    }
  }, [count]);

  useEffect(() => {
    applyCardTransforms();
  }, [applyCardTransforms, metrics.cardW, metrics.cardH]);

  // Smooth inertia + auto-glide rAF loop
  useEffect(() => {
    if (count === 0) return;
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
        } else if (Math.abs(velocityRef.current) > 0.08) {
          offsetRef.current += velocityRef.current * dt;
          velocityRef.current *= Math.pow(0.06, dt);
        } else {
          velocityRef.current = 0;
          if (
            HOME_LIQUID_LENS_DECK.autoGlide &&
            !isHoveringStageRef.current &&
            !prefersReducedMotion()
          ) {
            offsetRef.current += HOME_LIQUID_LENS_DECK.glideSpeed * 44 * dt;
          }
        }
      }

      applyCardTransforms();
    };

    rafId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafId);
  }, [applyCardTransforms, count]);

  const stepByCard = useCallback((delta: number) => {
    playTick();
    const s = strideRef.current;
    const baseSlot =
      targetSnapRef.current !== null
        ? Math.round(targetSnapRef.current / s)
        : Math.round(offsetRef.current / s);
    targetSnapRef.current = (baseSlot + delta) * s;
    velocityRef.current = 0;
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    dragMovedRef.current = false;
    pointerCapturedRef.current = false;
    pointerDownXRef.current = e.clientX;
    targetSnapRef.current = null;
    velocityRef.current = 0;
    lastPointerXRef.current = e.clientX;
    lastPointerTimeRef.current = performance.now();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    if (
      !dragMovedRef.current &&
      Math.abs(e.clientX - pointerDownXRef.current) > 4
    ) {
      dragMovedRef.current = true;
      if (!pointerCapturedRef.current) {
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
          pointerCapturedRef.current = true;
        } catch {
          // Pointer capture may not be available on synthetic events
        }
      }
    }
    if (!dragMovedRef.current) return;

    const delta = e.clientX - lastPointerXRef.current;
    const now = performance.now();
    const dt = Math.max(0.008, (now - lastPointerTimeRef.current) / 1000);
    offsetRef.current -= delta;
    velocityRef.current = (-delta / dt) * 0.42;
    lastPointerXRef.current = e.clientX;
    lastPointerTimeRef.current = now;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (
      pointerCapturedRef.current &&
      e.currentTarget.hasPointerCapture(e.pointerId)
    ) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    pointerCapturedRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 1) {
      e.preventDefault();
      targetSnapRef.current = null;
      offsetRef.current += e.deltaX * 0.9;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      stepByCard(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      stepByCard(-1);
    }
  };

  const handleOpenCaseStudy = useCallback(
    (
      e: React.MouseEvent<HTMLAnchorElement>,
      project: CaseStudyProject,
      slotIdx: number,
    ) => {
      if (dragMovedRef.current) {
        e.preventDefault();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();

      if (navigatingRef.current) return;
      navigatingRef.current = true;

      playTap();
      onPrefetchCaseStudy?.();

      if (prefersReducedMotion()) {
        onNavigate(`/work/${project.slug}`);
        return;
      }

      const cardEl = cardElRefs.current[slotIdx];
      const bounds = cardEl?.getBoundingClientRect();
      if (!bounds || bounds.width < 10 || bounds.height < 10) {
        onNavigate(`/work/${project.slug}`);
        return;
      }

      startCaseStudyTransition({
        slug: project.slug,
        imageSrc: styledTextureMap[project.slug] ?? project.coverImage,
        title: project.title,
        rect: {
          left: bounds.left,
          top: bounds.top,
          width: bounds.width,
          height: bounds.height,
        },
        borderRadius: HOME_LIQUID_LENS_DECK.cardRadius,
        onNavigateNow: () => {
          onNavigate(`/work/${project.slug}`);
        },
      });
    },
    [onNavigate, onPrefetchCaseStudy, styledTextureMap],
  );

  // Build host-supplied descriptors for LiquidLens
  const lensCards = useMemo<LiquidLensCardDescriptor[]>(() => {
    return ringSlots.map(({ slotId, project }, idx) => {
      const rawDist = Math.abs(idx - activeIndex);
      const ringDist = Math.min(rawDist, count - rawDist);
      return {
        id: slotId,
        getElement: () => cardElRefs.current[idx] ?? null,
        variant: HOME_LIQUID_LENS_DECK.cardVariant,
        textures: {
          'styled-card': styledTextureMap[project.slug] ?? project.coverImage,
          'cover-only': project.coverImage,
        },
        near: ringDist <= 2,
        priority: ringDist,
        borderRadius: HOME_LIQUID_LENS_DECK.cardRadius,
      };
    });
  }, [ringSlots, activeIndex, count, styledTextureMap]);

  return (
    <div
      ref={stageContainerRef}
      tabIndex={0}
      role="region"
      aria-label="Featured work showcase"
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      onMouseEnter={() => {
        isHoveringStageRef.current = true;
        onPrefetchCaseStudy?.();
      }}
      onMouseLeave={() => {
        isHoveringStageRef.current = false;
      }}
      style={{ height: metrics.stageHeight }}
      className="relative w-full cursor-grab select-none overflow-hidden bg-[var(--apple-bg)] outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--apple-focus-ring)]"
    >
      {/* Live Interactive DOM Deck Layer (Center remains 100% clear & clickable) */}
      <div
        className="relative h-full w-full transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ opacity: texturesReady ? 1 : 0 }}
      >
        {ringSlots.map(({ slotId, project }, idx) => {
          const src = styledTextureMap[project.slug];
          return (
            <article
              key={slotId}
              ref={(node) => {
                cardElRefs.current[idx] = node;
              }}
              style={{
                width: metrics.cardW,
                height: metrics.cardH,
                borderRadius: HOME_LIQUID_LENS_DECK.cardRadius,
              }}
              className="group absolute top-1/2 left-1/2 overflow-hidden bg-[#141416]"
            >
              {src ? (
                <img
                  src={src}
                  alt={project.coverAlt}
                  draggable={false}
                  referrerPolicy="no-referrer"
                  className="pointer-events-none h-full w-full object-cover"
                />
              ) : null}
              <a
                href={`/work/${project.slug}`}
                draggable={false}
                onClick={(e) => handleOpenCaseStudy(e, project, idx)}
                aria-label={`Open ${project.title} case study`}
                className="absolute inset-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/80"
              />
            </article>
          );
        })}
      </div>

      {/* Host-Agnostic WebGL2 Liquid Lens Strips */}
      {texturesReady && (
        <LiquidLens
          cards={lensCards}
          containerRef={stageContainerRef}
          axis={HOME_LIQUID_LENS_DECK.axis}
          stepAside={HOME_LIQUID_LENS_DECK.stepAside}
          config={HOME_LIQUID_LENS_OPTICAL}
        />
      )}
    </div>
  );
}

export default HomeLiquidLensDeck;
