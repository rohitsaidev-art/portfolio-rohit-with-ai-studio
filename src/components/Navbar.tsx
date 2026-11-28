import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { SITE_CONFIG } from '../data/site';
import { EASE_APPLE } from '../utils/motion';
import type { RouteMatch } from '../utils/portfolio';
import { playTick } from '../utils/soundEngine';
import { getPrimaryNavItems } from '../utils/studioNavigation';
import { HeaderSettingsMenu } from './HeaderSettingsMenu';
import { Menu, Search, X } from 'lucide-react';

interface NavbarProps {
  route: RouteMatch;
  onNavigate: (path: string) => void;
  onPrefetchRoute?: (path: string) => void;
  onOpenCommandPalette: () => void;
}

export function Navbar({
  route,
  onNavigate,
  onPrefetchRoute,
  onOpenCommandPalette,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const navItems = getPrimaryNavItems();

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

  return (
    <header
      data-sticky-nav="true"
      data-focus-chrome="true"
      className={`editorial-nav-surface sticky top-0 z-40 transition-[box-shadow,opacity] duration-300 print:hidden ${
        scrolled ? 'apple-nav-scrolled' : 'border-b border-[var(--apple-separator-subtle)]'
      }`}
    >
      <div className="relative mx-auto flex h-[52px] max-w-[1160px] items-center justify-between gap-8 px-5 sm:px-8">
        {/* Zone 1: Single-line Apple Display Wordmark */}
        <a
          href="/"
          onClick={(e) => handleLinkClick(e, '/')}
          className="apple-link font-display shrink-0 whitespace-nowrap text-[16px] font-semibold tracking-[-0.022em] text-[var(--apple-label-primary)] hover:opacity-70"
        >
          {SITE_CONFIG.name}
        </a>

        {/* Zone 2: Right-aligned Primary Navigation + Unified Settings Icon at extreme right */}
        <div className="hidden shrink-0 items-center md:flex">
          <nav
            aria-label="Primary navigation"
            className="flex items-center gap-7"
          >
            {navItems.map((item) => {
              const isActive = item.match(route);
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onPointerEnter={() => onPrefetchRoute?.(item.path)}
                  onFocus={() => onPrefetchRoute?.(item.path)}
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
            <a
              href="/flex-carousel"
              onPointerEnter={() => onPrefetchRoute?.('/flex-carousel')}
              onFocus={() => onPrefetchRoute?.('/flex-carousel')}
              onClick={(e) => handleLinkClick(e, '/flex-carousel')}
              aria-current={route.page === 'flex-carousel' ? 'page' : undefined}
              className={`apple-link relative shrink-0 whitespace-nowrap py-1 text-[13px] tracking-[-0.008em] ${
                route.page === 'flex-carousel'
                  ? 'font-semibold text-[var(--apple-label-primary)]'
                  : 'font-normal text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
              }`}
            >
              Carousel Lab
              {route.page === 'flex-carousel' && (
                <motion.span
                  layoutId="apple-nav-active-underline"
                  transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                  className="absolute -bottom-[14px] left-0 right-0 h-[1.5px] rounded-full bg-[var(--apple-label-primary)]"
                />
              )}
            </a>
          </nav>

          <span
            aria-hidden="true"
            className="mx-4 h-4 w-px bg-[var(--apple-separator)]"
          />

          <HeaderSettingsMenu size="desktop" />
        </div>

        {/* Mobile controls: Search + Unified Settings + Menu trigger (44px touch targets) */}
        <div className="flex items-center gap-0.5 md:hidden">
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
            <Search size={17} strokeWidth={1.75} aria-hidden="true" />
          </button>

          <HeaderSettingsMenu size="mobile" onOpen={() => setMobileOpen(false)} />

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="apple-btn-icon h-11 w-11 shrink-0 text-[var(--apple-label-primary)]"
          >
            {mobileOpen ? (
              <X size={18} strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <Menu size={20} strokeWidth={1.75} aria-hidden="true" />
            )}
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
              <a
                href="/flex-carousel"
                onClick={(e) => handleLinkClick(e, '/flex-carousel')}
                aria-current={route.page === 'flex-carousel' ? 'page' : undefined}
                className={`apple-link flex min-h-[46px] items-center justify-between rounded-2xl px-4 text-[17px] font-medium tracking-[-0.02em] transition-colors ${
                  route.page === 'flex-carousel'
                    ? 'bg-[var(--apple-bg-secondary)] text-[var(--apple-label-primary)]'
                    : 'text-[var(--apple-label-secondary)] hover:bg-[var(--apple-bg-secondary)] hover:text-[var(--apple-label-primary)]'
                }`}
              >
                <span>Carousel Lab</span>
                {route.page === 'flex-carousel' && (
                  <span className="text-[13px] font-medium text-[var(--apple-link)]">Current</span>
                )}
              </a>
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
