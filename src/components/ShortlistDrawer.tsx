import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PROJECTS, type CaseStudyProject } from '../data/projects';
import {
  buildShortlistShareUrl,
  clearShortlist,
  removeShortlistSlug,
  useShortlistSlugs,
} from '../utils/shortlist';
import { trackAnalyticsEvent } from '../utils/analytics';
import { EASE_APPLE } from '../utils/motion';
import { prefersReducedMotion } from '../utils/scroll';
import { playSuccessChime, playTick } from '../utils/soundEngine';
import { showToast } from '../utils/toast';
import { useDialogFocusTrap } from '../utils/useFocusTrap';
import {
  SFBookmark,
  SFCheckmark,
  SFChevronRight,
  SFLink,
  SFXmark,
} from './SFSymbols';

interface ShortlistDrawerProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

/**
 * Unobtrusive Recruiter Shortlist Drawer (P3.5).
 * - Lets visitors & hiring teams review saved case studies, remove items,
 *   and copy a clean shareable URL (`/?shortlist=slug1,slug2`) that restores
 *   the exact shortlist on load.
 * - Slides cleanly on desktop and works comfortably on mobile viewports.
 */
export function ShortlistDrawer({
  open,
  onClose,
  onNavigate,
}: ShortlistDrawerProps) {
  const slugs = useShortlistSlugs();
  const [copiedLink, setCopiedLink] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const reduced = prefersReducedMotion();

  useDialogFocusTrap({
    open,
    containerRef: panelRef,
    initialFocusRef: closeButtonRef,
    onClose,
  });

  const savedProjects = useMemo(
    () =>
      slugs
        .map((slug) => PROJECTS.find((p) => p.slug === slug))
        .filter((item): item is CaseStudyProject => item !== undefined),
    [slugs],
  );

  const shareUrl = useMemo(() => {
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'https://aaravsen.design';
    return buildShortlistShareUrl(origin, slugs);
  }, [slugs]);

  const handleCopyShareLink = async () => {
    if (savedProjects.length === 0) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      playSuccessChime();
      setCopiedLink(true);
      showToast({
        message: `Copied shortlist link (${savedProjects.length} ${savedProjects.length === 1 ? 'project' : 'projects'})`,
        tone: 'success',
      });
      trackAnalyticsEvent('shortlist_shared', window.location.pathname, {
        count: savedProjects.length,
      });
      window.setTimeout(() => setCopiedLink(false), 2400);
    } catch {
      showToast({
        message: 'Copy the shortlist URL from the field below',
        tone: 'info',
      });
    }
  };

  const handleOpenProject = (slug: string) => {
    playTick();
    onClose();
    onNavigate(`/work/${slug}`);
  };

  const handleRemove = (project: CaseStudyProject) => {
    playTick();
    removeShortlistSlug(project.slug);
    showToast({
      message: `Removed ${project.title} from shortlist`,
      tone: 'info',
    });
  };

  const handleClearAll = () => {
    playTick();
    clearShortlist();
    showToast({ message: 'Cleared shortlist', tone: 'info' });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="shortlist-drawer-title"
          data-modal-open="true"
          initial={reduced ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={
            reduced ? { duration: 0.01 } : { duration: 0.2, ease: EASE_APPLE }
          }
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-end justify-end bg-[#1D1D1F]/45 backdrop-blur-[3px] sm:items-stretch print:hidden"
        >
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            initial={reduced ? { opacity: 1 } : { x: '100%' }}
            animate={{ x: 0 }}
            exit={reduced ? { opacity: 0 } : { x: '100%' }}
            transition={
              reduced ? { duration: 0.01 } : { duration: 0.28, ease: EASE_APPLE }
            }
            onClick={(event) => event.stopPropagation()}
            className="apple-modal flex max-h-[88vh] w-full flex-col rounded-t-[26px] bg-[var(--apple-bg)] outline-none sm:max-h-full sm:max-w-[440px] sm:rounded-none"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[var(--apple-separator)] px-6 py-5">
              <div>
                <p className="type-caption text-[var(--apple-link)]">
                  Recruiter Shortlist
                </p>
                <h2
                  id="shortlist-drawer-title"
                  className="type-title-3 mt-1 tabular-nums"
                >
                  {savedProjects.length}{' '}
                  {savedProjects.length === 1 ? 'case study' : 'case studies'} saved
                </h2>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Close shortlist drawer"
                className="apple-btn-icon h-11 w-11 shrink-0 bg-[var(--apple-control-tonal)] text-[var(--apple-label-primary)] hover:bg-[var(--apple-control-tonal-hover)] sm:h-9 sm:w-9"
              >
                <SFXmark size={15} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {savedProjects.length === 0 ? (
                <div className="rounded-[22px] bg-[var(--apple-bg-secondary)] px-6 py-10 text-center">
                  <div className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--apple-surface-elevated)] text-[var(--apple-label-secondary)]">
                    <SFBookmark size={18} />
                  </div>
                  <p className="type-headline mt-3.5 text-[var(--apple-label-primary)]">
                    No case studies shortlisted yet
                  </p>
                  <p className="type-footnote mt-2 font-normal text-[var(--apple-label-secondary)]">
                    Bookmark any project card or case study header to assemble a focused list and generate a shareable review link.
                  </p>
                </div>
              ) : (
                <>
                  <p className="type-footnote font-normal text-[var(--apple-label-secondary)]">
                    Share this curated set with hiring managers or teammates using the link below. Opening the link restores these exact projects automatically.
                  </p>

                  <ul className="mt-5 space-y-3" aria-label="Shortlisted case studies">
                    {savedProjects.map((project) => (
                      <li
                        key={project.slug}
                        className="apple-surface-subtle flex items-center gap-3.5 rounded-[20px] p-3"
                      >
                        <img
                          src={project.coverImage}
                          alt=""
                          width={120}
                          height={84}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          className="h-14 w-20 shrink-0 rounded-[12px] object-cover bg-[var(--apple-bg-secondary)]"
                        />

                        <div className="min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => handleOpenProject(project.slug)}
                            className="apple-link group flex items-center gap-1 text-left"
                          >
                            <span className="truncate text-[15px] font-semibold tracking-[-0.015em] text-[var(--apple-label-primary)] group-hover:text-[var(--apple-link)]">
                              {project.title}
                            </span>
                            <SFChevronRight
                              size={13}
                              className="shrink-0 text-[var(--apple-label-tertiary)] group-hover:text-[var(--apple-link)]"
                            />
                          </button>
                          <p className="type-caption mt-0.5 truncate font-normal text-[var(--apple-label-secondary)]">
                            {project.category} · {project.year}
                          </p>
                          <p className="truncate text-[11.5px] text-[var(--apple-label-tertiary)]">
                            {project.role}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemove(project)}
                          aria-label={`Remove ${project.title} from shortlist`}
                          className="apple-btn-icon h-10 w-10 shrink-0 text-[var(--apple-label-tertiary)] hover:text-[var(--apple-label-primary)] sm:h-8 sm:w-8"
                        >
                          <SFXmark size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>

                  {/* Shareable URL readout */}
                  <div className="mt-6 rounded-[18px] bg-[var(--apple-bg-secondary)] p-4">
                    <label
                      htmlFor="shortlist-share-url"
                      className="type-caption block text-[var(--apple-label-tertiary)]"
                    >
                      Shareable shortlist URL
                    </label>
                    <input
                      id="shortlist-share-url"
                      type="text"
                      readOnly
                      value={shareUrl}
                      onFocus={(e) => e.currentTarget.select()}
                      className="apple-input mt-2 min-h-[38px] rounded-[12px] bg-[var(--apple-surface-elevated)] px-3 py-1.5 text-[12.5px] text-[var(--apple-label-secondary)]"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-[var(--apple-separator)] bg-[var(--apple-bg-secondary)] px-6 py-4">
              {savedProjects.length > 0 ? (
                <>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="apple-link type-footnote min-h-[44px] px-2 font-medium text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)] sm:min-h-[36px]"
                  >
                    Clear all
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyShareLink}
                    className="apple-btn-primary !min-h-[44px] !px-5 !text-[14px] sm:!min-h-[38px]"
                  >
                    {copiedLink ? (
                      <>
                        <SFCheckmark size={15} />
                        <span>Link copied</span>
                      </>
                    ) : (
                      <>
                        <SFLink size={15} />
                        <span>Copy shareable link</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="apple-btn-tonal ml-auto !min-h-[40px] !px-4 !text-[13.5px]"
                >
                  Close
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
