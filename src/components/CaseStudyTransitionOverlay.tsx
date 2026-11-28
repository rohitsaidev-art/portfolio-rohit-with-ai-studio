import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import {
  clearCaseStudyTransition,
  getActiveCaseStudyTransition,
  subscribeCaseStudyTransition,
  type CaseStudyTransitionRequest,
} from '../utils/caseStudyTransition';
import { EASE_APPLE } from '../utils/motion';

interface CaseStudyTransitionOverlayProps {
  /** Current active route slug when on a case-study page, or null otherwise */
  activeCaseStudySlug: string | null;
}

type TransitionPhase = 'expanding' | 'revealing';

/**
 * Hardware-accelerated root-level transition veil that seamlessly picks up
 * from FlexCarousel's WebGL2 focus-zoom card rect, expands cleanly into the
 * page canvas, triggers the route swap behind the veil, and dissolves to reveal
 * the live Case Study page with zero flash or jarring cut.
 */
export function CaseStudyTransitionOverlay({
  activeCaseStudySlug,
}: CaseStudyTransitionOverlayProps) {
  const [request, setRequest] = useState<CaseStudyTransitionRequest | null>(
    () => getActiveCaseStudyTransition(),
  );
  const [phase, setPhase] = useState<TransitionPhase>('expanding');
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    return subscribeCaseStudyTransition((next) => {
      hasNavigatedRef.current = false;
      setPhase('expanding');
      setRequest(next);
    });
  }, []);

  // Trigger navigation once the card veil has smoothly taken over and covered the viewport
  useEffect(() => {
    if (!request) return;

    const navTimer = window.setTimeout(() => {
      if (!hasNavigatedRef.current) {
        hasNavigatedRef.current = true;
        request.onNavigateNow();
      }
    }, 220);

    // Hard safety net so the overlay can never remain stuck under any condition
    const failSafeTimer = window.setTimeout(() => {
      clearCaseStudyTransition(request.id);
    }, 1250);

    return () => {
      window.clearTimeout(navTimer);
      window.clearTimeout(failSafeTimer);
    };
  }, [request]);

  // As soon as the target Case Study route is mounted, hold 2 frames for first paint then unveil
  useEffect(() => {
    if (!request || phase !== 'expanding') return;
    if (activeCaseStudySlug !== request.slug) return;

    let raf1 = 0;
    let raf2 = 0;
    let doneTimer = 0;

    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        setPhase('revealing');
        doneTimer = window.setTimeout(() => {
          clearCaseStudyTransition(request.id);
        }, 300);
      });
    });

    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      window.clearTimeout(doneTimer);
    };
  }, [request, phase, activeCaseStudySlug]);

  if (!request || typeof document === 'undefined') {
    return null;
  }

  const vw = window.innerWidth || 1440;
  const vh = window.innerHeight || 900;

  // Target expanded geometry: rises slightly toward the top editorial framing while scaling gently
  const targetWidth = Math.min(vw * 0.94, Math.max(request.rect.width * 1.07, 1120));
  const scaleFactor = targetWidth / Math.max(request.rect.width, 1);
  const centerOffsetX = vw / 2 - (request.rect.left + request.rect.width / 2);
  const centerOffsetY = vh * 0.46 - (request.rect.top + request.rect.height / 2);

  const isRevealing = phase === 'revealing';

  return createPortal(
    <motion.div
      key={request.id}
      aria-hidden="true"
      className="fixed inset-0 z-[90] overflow-hidden"
      style={{
        pointerEvents: isRevealing ? 'none' : 'auto',
      }}
      initial={{ opacity: 1 }}
      animate={{ opacity: isRevealing ? 0 : 1 }}
      transition={{ duration: 0.28, ease: EASE_APPLE }}
    >
      {/* Full-viewport page canvas veil absorbing surrounding homepage chrome */}
      <motion.div
        className="absolute inset-0 bg-[var(--apple-bg)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.22, ease: EASE_APPLE }}
      />

      {/* Exact clicked card surface expanding smoothly from its WebGL2 focus rect */}
      <motion.div
        className="absolute overflow-hidden will-change-transform"
        style={{
          left: request.rect.left,
          top: request.rect.top,
          width: request.rect.width,
          height: request.rect.height,
          borderRadius: request.borderRadius,
        }}
        initial={{
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
        }}
        animate={
          isRevealing
            ? {
                x: centerOffsetX,
                y: centerOffsetY - 18,
                scale: scaleFactor * 1.03,
                opacity: 0,
              }
            : {
                x: centerOffsetX,
                y: centerOffsetY,
                scale: scaleFactor,
                opacity: 0.94,
              }
        }
        transition={{
          duration: isRevealing ? 0.28 : 0.28,
          ease: EASE_APPLE,
        }}
      >
        <img
          src={request.imageSrc}
          alt={request.title}
          className="h-full w-full object-cover"
          decoding="sync"
        />
      </motion.div>
    </motion.div>,
    document.body,
  );
}
