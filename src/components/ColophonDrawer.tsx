import { useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { SITE_CONFIG } from '../data/site';
import { EASE_APPLE } from '../utils/motion';
import { prefersReducedMotion } from '../utils/scroll';
import { useDialogFocusTrap } from '../utils/useFocusTrap';
import { X } from 'lucide-react';

interface ColophonDrawerProps {
  open: boolean;
  onClose: () => void;
}

const COLOPHON_SECTIONS = [
  {
    index: '01',
    title: 'Typography & Reading Scale',
    summary:
      'Set in optical SF Pro Display (20pt+) and SF Pro Text (<20pt) with Inter fallback for cross-platform consistency.',
    details: [
      'Fluid clamp() Dynamic Type scale from Display (2.75–4.5rem) down to 12px Captions, with tabular numerals across dates, reading times, and audio timecodes.',
      'Disciplined editorial line lengths: 20ch display measure, 50ch leads, and ~60ch long-form case study prose.',
      'Persistent Reader Comfort controls allow switching between Default and Larger body scales plus Focus Reading mode.',
    ],
  },
  {
    index: '02',
    title: 'Surfaces, Elevation & Approved Tokens',
    summary:
      'Production runs on Warm Gallery Paper (#FAF8F6 / #FFFFFF) in Light mode and Warm Obsidian (#11100E / #1D1B18) in Dark mode, paired with editorial ink CTAs, refined cobalt interactive accents, and a restrained warm editorial accent.',
    details: [
      'Architectural elevation pairs a crisp 0.5px hairline border with a tightened two-tier ambient shadow stack—reserving elevated cards for interactive case studies, forms, and overlays while text sections breathe between horizontal rules.',
      'All foreground label, link, button, and error tokens are calibrated to pass WCAG 2.2 AA (≥ 4.5:1) contrast ratios across primary, secondary, and elevated surfaces.',
      'Navigation glass uses an opaque baseline with progressive @supports (backdrop-filter) frosting and @media (prefers-reduced-transparency: reduce) solid overrides, while all interface icons run on a unified Lucide system at 1.75 default stroke weight.',
    ],
  },
  {
    index: '03',
    title: 'Motion & Interaction Philosophy',
    summary:
      'Motion explains spatial change and stays out of the way of reading.',
    details: [
      'Interruptible spring physics govern segmented controls while a restrained Apple deceleration curve (cubic-bezier(0.22, 1, 0.36, 1)) handles route transitions and disclosures.',
      'Interactive controls provide tactile press feedback (scale 0.97) with consistent hover, focus-visible, disabled, and loading states.',
      'All transitions honor prefers-reduced-motion via MotionConfig reducedMotion="user" and dedicated CSS overrides.',
    ],
  },
  {
    index: '04',
    title: 'Procedural UI Sound Design',
    summary:
      'Subtle mechanical cues synthesized directly in the browser via the Web Audio API—zero external audio files.',
    details: [
      'AudioContext initializes lazily after the first user gesture and fires only on intentional state changes or confirmations—never on page navigation, scrolling, or hover.',
      'A persisted global UI sound toggle in Preferences stays completely independent from the AudioPlayer speech narration controls.',
    ],
  },
  {
    index: '05',
    title: 'Engineering Foundations',
    summary:
      'Built as a responsive single-page application in React 19, TypeScript, Tailwind CSS v4, and Motion.',
    details: [
      'Route-level code splitting keeps non-essential views out of the initial load, while explicit image dimensions prevent cumulative layout shift.',
      'Clean print stylesheets allow visitors to print a structured resume directly from the About page.',
      'Every project scope, reading time, artifact count, and practice timeline entry is derived directly from factual source data.',
    ],
  },
] as const;

/**
 * Quiet Editorial Craft Colophon Drawer (P3.4).
 * Documents strictly what is genuinely implemented and approved in production.
 */
export function ColophonDrawer({ open, onClose }: ColophonDrawerProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const reduced = prefersReducedMotion();

  useDialogFocusTrap({
    open,
    containerRef: panelRef,
    initialFocusRef: closeButtonRef,
    onClose,
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="colophon-drawer-title"
          data-modal-open="true"
          initial={reduced ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={
            reduced ? { duration: 0.01 } : { duration: 0.22, ease: EASE_APPLE }
          }
          onClick={onClose}
          className="fixed inset-0 z-50 flex justify-end bg-[#1D1D1F]/45 backdrop-blur-[3px] print:hidden"
        >
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            initial={reduced ? { opacity: 1 } : { x: '100%' }}
            animate={{ x: 0 }}
            exit={reduced ? { opacity: 0 } : { x: '100%' }}
            transition={
              reduced ? { duration: 0.01 } : { duration: 0.3, ease: EASE_APPLE }
            }
            onClick={(event) => event.stopPropagation()}
            className="apple-modal flex h-full w-full max-w-[520px] flex-col bg-[var(--apple-bg)] outline-none"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[var(--apple-separator)] px-6 py-5 sm:px-8">
              <div>
                <p className="type-caption text-[var(--apple-link)]">
                  Craft Colophon
                </p>
                <h2
                  id="colophon-drawer-title"
                  className="type-title-3 mt-1"
                >
                  How this portfolio is built
                </h2>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Close colophon drawer"
                className="apple-btn-icon h-11 w-11 shrink-0 bg-[var(--apple-control-tonal)] text-[var(--apple-label-primary)] hover:bg-[var(--apple-control-tonal-hover)] sm:h-9 sm:w-9"
              >
                <X size={15} strokeWidth={1.75} aria-hidden="true" />
              </button>
            </div>

            {/* Editorial Content */}
            <div className="flex-1 overflow-y-auto px-6 py-7 sm:px-8">
              <p className="type-callout measure-prose">
                A concise record of the approved design tokens, interaction choices, and engineering architecture running in production for {SITE_CONFIG.name}’s portfolio.
              </p>

              <div className="mt-7 divide-y divide-[var(--apple-separator)] border-t border-[var(--apple-separator)]">
                {COLOPHON_SECTIONS.map((section) => (
                  <section key={section.index} className="py-6">
                    <div className="flex items-baseline gap-2.5">
                      <span className="type-caption tabular-nums text-[var(--apple-link)]">
                        {section.index}
                      </span>
                      <h3 className="type-headline font-display text-[17px]">
                        {section.title}
                      </h3>
                    </div>
                    <p className="type-footnote mt-2 font-medium text-[var(--apple-label-primary)]">
                      {section.summary}
                    </p>
                    <ul className="mt-3 space-y-2 text-[14px] leading-[1.55] text-[var(--apple-label-secondary)]">
                      {section.details.map((detail) => (
                        <li key={detail} className="flex items-start gap-2.5">
                          <span
                            aria-hidden="true"
                            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--apple-label-tertiary)]"
                          />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </div>

            {/* Quiet Footer */}
            <div className="flex items-center justify-between border-t border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] px-6 py-4 sm:px-8">
              <p className="type-caption font-normal text-[var(--apple-label-tertiary)]">
                Approved production specification
              </p>
              <button
                type="button"
                onClick={onClose}
                className="apple-btn-tonal !min-h-[36px] !px-4 !py-1 !text-[13px]"
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
