import { useState } from 'react';
import { SITE_CONFIG } from '../data/site';
import { scrollToTop } from '../utils/scroll';
import { playSuccessChime, playTick } from '../utils/soundEngine';
import { showToast } from '../utils/toast';
import { GlobalPreferencesPopover } from './GlobalPreferencesPopover';
import {
  SFArrowUp,
  SFCheckmark,
  SFDocOnDoc,
  SFInfoCircle,
} from './SFSymbols';

interface FooterProps {
  onNavigate: (path: string) => void;
  onOpenColophon: () => void;
}

export function Footer({ onNavigate, onOpenColophon }: FooterProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SITE_CONFIG.email);
      playSuccessChime();
      setCopied(true);
      showToast({ message: `Copied ${SITE_CONFIG.email}`, tone: 'success' });
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    onNavigate(path);
  };

  const handleBackToTop = () => {
    scrollToTop('smooth');
  };

  return (
    <footer className="bg-[var(--apple-bg-secondary)] print:hidden">
      <div className="mx-auto max-w-[1160px] px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid grid-cols-1 gap-10 border-t border-[var(--apple-separator)] pt-12 md:grid-cols-12 md:items-start">
          {/* Identity */}
          <div className="md:col-span-5">
            <a
              href="/"
              onClick={(e) => handleLinkClick(e, '/')}
              className="apple-link type-headline font-display text-[var(--apple-label-primary)] hover:opacity-75"
            >
              {SITE_CONFIG.name}
            </a>
            <p className="type-callout mt-2.5 max-w-[36ch]">
              {SITE_CONFIG.roleTitle}. {SITE_CONFIG.location}.
            </p>
            <p className="type-footnote mt-2 font-normal text-[var(--apple-label-tertiary)]">
              {SITE_CONFIG.availabilityFull}
            </p>
          </div>

          {/* Public Navigation Only */}
          <div className="md:col-span-3">
            <p className="type-caption text-[var(--apple-label-primary)]">
              Explore
            </p>
            <ul className="type-footnote mt-3 flex flex-col gap-2.5 font-normal text-[var(--apple-label-secondary)]">
              <li>
                <a
                  href="/"
                  onClick={(e) => handleLinkClick(e, '/')}
                  className="apple-link hover:text-[var(--apple-label-primary)]"
                >
                  Selected Work
                </a>
              </li>
              <li>
                <a
                  href="/notes"
                  onClick={(e) => handleLinkClick(e, '/notes')}
                  className="apple-link hover:text-[var(--apple-label-primary)]"
                >
                  Notes
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  onClick={(e) => handleLinkClick(e, '/about')}
                  className="apple-link hover:text-[var(--apple-label-primary)]"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  onClick={(e) => handleLinkClick(e, '/contact')}
                  className="apple-link hover:text-[var(--apple-label-primary)]"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Direct & Socials */}
          <div className="md:col-span-4">
            <p className="type-caption text-[var(--apple-label-primary)]">
              Connect
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="apple-link type-footnote text-[var(--apple-link)] hover:underline"
              >
                {SITE_CONFIG.email}
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                aria-label="Copy email address"
                className="apple-surface-subtle type-caption inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3.5 py-1 font-medium text-[var(--apple-label-primary)] transition-all duration-150 hover:opacity-90 active:scale-95 sm:min-h-[32px] sm:px-3"
              >
                {copied ? (
                  <>
                    <SFCheckmark size={13} className="text-[var(--apple-blue)]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <SFDocOnDoc size={13} className="text-[var(--apple-label-secondary)]" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <ul className="type-footnote mt-4 flex flex-wrap gap-x-5 gap-y-2 font-normal text-[var(--apple-label-secondary)]">
              {SITE_CONFIG.socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="apple-link hover:text-[var(--apple-label-primary)]"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-[var(--apple-separator)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="type-footnote font-normal text-[var(--apple-label-tertiary)]">
            &copy; {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                playTick();
                onOpenColophon();
              }}
              aria-label="Open craft colophon"
              className="type-footnote inline-flex min-h-[44px] w-fit items-center gap-1.5 rounded-full px-3.5 py-1 text-[var(--apple-label-secondary)] transition-all duration-150 hover:bg-[var(--apple-control-hover)] hover:text-[var(--apple-label-primary)] active:scale-95 sm:min-h-[34px] sm:px-3"
            >
              <SFInfoCircle size={14} />
              <span>Colophon</span>
            </button>
            <GlobalPreferencesPopover placement="top-right" variant="pill" />
            <button
              type="button"
              onClick={handleBackToTop}
              className="type-footnote inline-flex min-h-[44px] w-fit items-center gap-1.5 rounded-full px-3.5 py-1 text-[var(--apple-label-secondary)] transition-all duration-150 hover:bg-[var(--apple-control-hover)] hover:text-[var(--apple-label-primary)] active:scale-95 sm:min-h-[34px] sm:px-3"
            >
              <span>Back to top</span>
              <SFArrowUp size={13} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
