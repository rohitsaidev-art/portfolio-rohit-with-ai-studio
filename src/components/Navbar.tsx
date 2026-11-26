import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { SITE_CONFIG } from '../data/site';
import { EASE_APPLE } from '../utils/motion';
import type { RouteMatch } from '../utils/portfolio';
import { useShortlistSlugs } from '../utils/shortlist';
import { playTick } from '../utils/soundEngine';
import { getPrimaryNavItems } from '../utils/studioNavigation';
import { GlobalPreferencesPopover } from './GlobalPreferencesPopover';
import {
  SFBookmarkFill,
  SFMagnifyingGlass,
  SFMenu,
  SFXmark,
} from './SFSymbols';

interface NavbarProps {
  route: RouteMatch;
  onNavigate: (path: string) => void;
  onOpenCommandPalette: () => void;
  onOpenShortlist: () => void;
}

export function Navbar({
  route,
  onNavigate,
  onOpenCommandPalette,
  onOpenShortlist,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMac, setIsMac] = useState(true);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const shortlistedSlugs = useShortlistSlugs();
  const shortlistCount = shortlistedSlugs.length;
  const navItems = getPrimaryNavItems();

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setIsMac(/Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent));
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    setMobileOpen(false);
    onNavigate(path);
  };

  const shortcutLabel = isMac ? '⌘K' : 'Ctrl K';

  return (
    <header
      data-sticky-nav="true"
      data-focus-chrome="true"
      className={`sticky top-0 z-40 bg-[var(--apple-surface-glass)] backdrop-blur-xl backdrop-saturate-[180%] transition-[box-shadow,opacity] duration-300 print:hidden ${
        scrolled ? 'apple-nav-scrolled' : 'border-b border-[var(--apple-separator-subtle)]'
      }`}
    >
      <div className="mx-auto flex h-[52px] max-w-[1160px] items-center justify-between gap-8 px-5 sm:px-8">
        {/* Zone 1: Single-line Apple Display Wordmark */}
        <a
          href="/"
          onClick={(e) => handleLinkClick(e, '/')}
          className="apple-link font-display shrink-0 whitespace-nowrap text-[16px] font-semibold tracking-[-0.022em] text-[var(--apple-label-primary)] hover:opacity-70"
        >
          {SITE_CONFIG.name}
        </a>

        {/* Zone 2: Primary navigation */}
        <nav aria-label="Primary navigation" className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => {
            const isActive = item.match(route);
            return (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => handleLinkClick(e, item.path)}
                aria-current={isActive ? 'page' : undefined}
                className={`apple-link relative shrink-0 whitespace-nowrap py-1 text-[13px] tracking-[-0.008em] ${
                  isActive
                    ? 'font-semibold text-[var(--apple-label-primary)]'
                    : 'font-normal text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                }`}
              >
                {item.label}
                {isActive && (
                  <motion.span
                    layoutId="apple-nav-active-underline"
                    transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                    className="absolute -bottom-[14px] left-0 right-0 h-[1.5px] rounded-full bg-[var(--apple-label-primary)]"
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Optional Shortlist Badge + Command Palette + Unified Global Preferences + Primary CTA */}
        <div className="hidden shrink-0 items-center gap-2 md:flex">
          {shortlistCount > 0 && (
            <button
              type="button"
              onClick={() => {
                playTick();
                onOpenShortlist();
              }}
              aria-label={`Open recruiter shortlist (${shortlistCount} saved ${
                shortlistCount === 1 ? 'project' : 'projects'
              })`}
              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[var(--apple-blue)]/10 px-2.5 text-[12px] font-medium text-[var(--apple-link)] transition-colors duration-150 hover:bg-[var(--apple-blue)]/16"
            >
              <SFBookmarkFill size={12} />
              <span>Shortlist</span>
              <span className="tabular-nums font-semibold">{shortlistCount}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              playTick();
              onOpenCommandPalette();
            }}
            aria-label={`Open command palette (${shortcutLabel})`}
            title={`Quick search & actions (${shortcutLabel})`}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[var(--apple-control-tonal)] px-2.5 text-[12px] font-medium text-[var(--apple-label-secondary)] transition-colors duration-150 hover:bg-[var(--apple-control-tonal-hover)] hover:text-[var(--apple-label-primary)]"
          >
            <SFMagnifyingGlass size={13} />
            <span className="tabular-nums text-[11px] text-[var(--apple-label-tertiary)]">
              {shortcutLabel}
            </span>
          </button>

          <GlobalPreferencesPopover placement="bottom-right" variant="icon" />

          <a
            href="/contact"
            onClick={(e) => handleLinkClick(e, '/contact')}
            className="apple-btn-primary !min-h-[30px] !h-[30px] !px-3.5 !py-0 !text-[12px] !font-medium !tracking-[-0.004em]"
          >
            Get in touch
          </a>
        </div>

        {/* Mobile controls: Optional Shortlist + Search + Unified Preferences + Menu trigger (44px touch targets) */}
        <div className="flex items-center gap-0.5 md:hidden">
          {shortlistCount > 0 && (
            <button
              type="button"
              onClick={() => {
                playTick();
                setMobileOpen(false);
                onOpenShortlist();
              }}
              aria-label={`Open recruiter shortlist (${shortlistCount} saved)`}
              className="inline-flex h-11 items-center gap-1 rounded-full bg-[var(--apple-blue)]/10 px-3 text-[12px] font-semibold text-[var(--apple-link)]"
            >
              <SFBookmarkFill size={12} />
              <span className="tabular-nums">{shortlistCount}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              playTick();
              setMobileOpen(false);
              onOpenCommandPalette();
            }}
            aria-label="Open command palette"
            className="apple-btn-icon h-11 w-11 text-[var(--apple-label-primary)]"
          >
            <SFMagnifyingGlass size={17} />
          </button>

          <GlobalPreferencesPopover placement="bottom-right" variant="icon" />

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="apple-btn-icon h-11 w-11 shrink-0 text-[var(--apple-label-primary)]"
          >
            {mobileOpen ? <SFXmark size={18} /> : <SFMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-nav-drawer"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: EASE_APPLE }}
            className="border-t border-[var(--apple-separator-subtle)] bg-[var(--apple-bg)] px-5 pb-7 pt-4 md:hidden"
            style={{ boxShadow: 'var(--shadow-apple-nav)' }}
          >
            <nav aria-label="Mobile navigation" className="flex flex-col gap-1.5">
              {navItems.map((item) => {
                const isActive = item.match(route);
                return (
                  <a
                    key={item.path}
                    href={item.path}
                    onClick={(e) => handleLinkClick(e, item.path)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`apple-link flex min-h-[46px] items-center justify-between rounded-2xl px-4 text-[17px] font-medium tracking-[-0.02em] transition-colors ${
                      isActive
                        ? 'bg-[var(--apple-bg-secondary)] text-[var(--apple-label-primary)]'
                        : 'text-[var(--apple-label-secondary)] hover:bg-[var(--apple-bg-secondary)] hover:text-[var(--apple-label-primary)]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="text-[13px] font-medium text-[var(--apple-link)]">Current</span>
                    )}
                  </a>
                );
              })}
            </nav>

            <div className="mt-5 border-t border-[var(--apple-separator-subtle)] pt-5">
              <p className="type-footnote px-2 text-[var(--apple-label-secondary)]">
                {SITE_CONFIG.availabilityShort}
              </p>
              <a
                href="/contact"
                onClick={(e) => handleLinkClick(e, '/contact')}
                className="apple-btn-primary mt-3 w-full"
              >
                Get in touch
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
