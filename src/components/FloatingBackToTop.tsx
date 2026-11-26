import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  useFloatingAudioDockVisible,
  useMobileReadingBarVisible,
} from '../utils/floatingDock';
import { EASE_APPLE } from '../utils/motion';
import { prefersReducedMotion, scrollToTop } from '../utils/scroll';
import { playTick } from '../utils/soundEngine';
import { SFArrowUp } from './SFSymbols';

interface FloatingBackToTopProps {
  /** Scroll distance in pixels before revealing the floating control */
  threshold?: number;
}

/**
 * Context-aware floating Back-to-Top control (P1.8, P2.8).
 * - Appears unobtrusively after scrolling past the threshold.
 * - Subscribes to floating AudioPlayer dock and MobileReadingBar visibility
 *   and shifts upward smoothly so floating controls never overlap.
 * - Uses smooth scrolling and honors prefers-reduced-motion.
 */
export function FloatingBackToTop({ threshold = 480 }: FloatingBackToTopProps) {
  const [visible, setVisible] = useState(false);
  const audioDockVisible = useFloatingAudioDockVisible();
  const mobileBarVisible = useMobileReadingBarVisible();

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > threshold);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const reduced = prefersReducedMotion();

  const handleClick = () => {
    playTick();
    scrollToTop('smooth');
  };

  let bottomOffsetClass = 'bottom-6 sm:bottom-7';
  if (audioDockVisible && mobileBarVisible) {
    bottomOffsetClass = 'bottom-[178px] md:bottom-[104px]';
  } else if (audioDockVisible) {
    bottomOffsetClass = 'bottom-[112px] sm:bottom-[104px]';
  } else if (mobileBarVisible) {
    bottomOffsetClass = 'bottom-[80px] md:bottom-7';
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 12, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.94 }}
          transition={
            reduced
              ? { duration: 0.01 }
              : { duration: 0.24, ease: EASE_APPLE }
          }
          className={`fixed right-5 z-30 transition-[bottom] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:right-7 print:hidden ${bottomOffsetClass}`}
        >
          <button
            type="button"
            onClick={handleClick}
            aria-label="Back to top"
            title="Back to top"
            className="apple-ios-bar group inline-flex h-11 items-center gap-2 rounded-full px-3.5 text-[13px] font-medium tracking-[-0.01em] text-[var(--apple-label-primary)] transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.96] sm:px-4"
          >
            <SFArrowUp
              size={14}
              className="text-[var(--apple-label-secondary)] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:text-[var(--apple-link)]"
            />
            <span className="hidden sm:inline">Top</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
