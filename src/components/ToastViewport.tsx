import { AnimatePresence, motion } from 'motion/react';
import {
  useFloatingAudioDockVisible,
  useMobileReadingBarVisible,
} from '../utils/floatingDock';
import { EASE_APPLE } from '../utils/motion';
import { prefersReducedMotion } from '../utils/scroll';
import { dismissToast, useActiveToast } from '../utils/toast';
import { SFCheckmarkCircleFill, SFXmark } from './SFSymbols';

/**
 * Reusable, accessible single non-stacking toast notification viewport (P2.3).
 * Positions cleanly above any active floating AudioPlayer dock or mobile bottom
 * reading bar so controls never collide.
 */
export function ToastViewport() {
  const toast = useActiveToast();
  const audioDockVisible = useFloatingAudioDockVisible();
  const mobileBarVisible = useMobileReadingBarVisible();
  const reduced = prefersReducedMotion();

  let offsetClass = 'bottom-6 sm:bottom-7';
  if (audioDockVisible && mobileBarVisible) {
    offsetClass = 'bottom-[180px] md:bottom-[108px]';
  } else if (audioDockVisible) {
    offsetClass = 'bottom-[114px] sm:bottom-[108px]';
  } else if (mobileBarVisible) {
    offsetClass = 'bottom-[82px] md:bottom-7';
  }

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className={`pointer-events-none fixed left-1/2 z-50 -translate-x-1/2 px-4 transition-[bottom] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] print:hidden ${offsetClass}`}
    >
      <AnimatePresence mode="wait">
        {toast && (
          <motion.div
            key={toast.id}
            role="status"
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.96 }}
            transition={
              reduced ? { duration: 0.01 } : { duration: 0.22, ease: EASE_APPLE }
            }
            className="apple-ios-bar pointer-events-auto flex max-w-[min(92vw,420px)] items-center gap-2.5 rounded-full py-2.5 pl-4 pr-2.5 text-[13.5px] font-medium tracking-[-0.01em] text-[var(--apple-label-primary)]"
          >
            {toast.tone === 'success' ? (
              <SFCheckmarkCircleFill
                size={16}
                className="shrink-0 text-[var(--apple-blue)]"
              />
            ) : (
              <span
                aria-hidden="true"
                className="h-2 w-2 shrink-0 rounded-full bg-[var(--apple-blue)]"
              />
            )}
            <span className="truncate">{toast.message}</span>
            <button
              type="button"
              onClick={dismissToast}
              aria-label="Dismiss notification"
              className="apple-btn-icon ml-0.5 h-9 w-9 shrink-0 text-[var(--apple-label-tertiary)] hover:text-[var(--apple-label-primary)] sm:h-7 sm:w-7"
            >
              <SFXmark size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
