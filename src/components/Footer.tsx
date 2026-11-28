import { useState } from 'react';
import { SITE_CONFIG } from '../data/site';
import { scrollToTop } from '../utils/scroll';
import { playSuccessChime, playTick } from '../utils/soundEngine';
import { showToast } from '../utils/toast';
import { useResolvedTheme } from '../utils/useAppearance';
import { useSoundEnabled } from '../utils/useSoundEnabled';
import { Copier } from '../copier/Copier';
import { AppleTooltip } from './AppleTooltip';
import { GlobalPreferencesPopover } from './GlobalPreferencesPopover';
import { ArrowUp, Info } from 'lucide-react';
import { AnimatedCheckIcon, AnimatedCopyIcon } from './icons/AnimatedLucide';

interface FooterProps {
  onNavigate: (path: string) => void;
  onOpenColophon: () => void;
}

function SocialPlatformIcon({ label }: { label: string }) {
  const key = label.toLowerCase();

  if (key.includes('linkedin')) {
    return (
      <svg
        width={16}
        height={16}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    );
  }

  if (key.includes('twitter') || key.startsWith('x')) {
    return (
      <svg
        width={15}
        height={15}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }

  if (key.includes('read.cv') || key.includes('cv')) {
    return (
      <svg
        width={16}
        height={16}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="4" y="3" width="16" height="18" rx="3" />
        <path d="M8.5 8.5h7" />
        <path d="M8.5 12.5h7" />
        <path d="M8.5 16.5h4.5" />
      </svg>
    );
  }

  // GitHub default
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export function Footer({ onNavigate, onOpenColophon }: FooterProps) {
  const [copied, setCopied] = useState(false);
  const [copyHovered, setCopyHovered] = useState(false);
  const resolvedTheme = useResolvedTheme();
  const soundEnabled = useSoundEnabled();

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

  const handleCopierCopied = (copiedValue: string) => {
    setCopied(true);
    showToast({ message: `Copied ${copiedValue}`, tone: 'success' });
    window.setTimeout(() => setCopied(false), 2200);
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
    <footer className="overflow-x-clip bg-[var(--apple-bg-secondary)] print:hidden">
      <div className="mx-auto max-w-[1160px] px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid grid-cols-1 gap-12 border-t border-[var(--apple-separator)] pt-12 lg:grid-cols-12 lg:items-center lg:gap-10">
          {/* Left Editorial Column: Identity, Navigation, Direct Contact */}
          <div className="flex flex-col justify-between gap-10 lg:col-span-7 lg:py-4">
            <div>
              <a
                href="/"
                onClick={(e) => handleLinkClick(e, '/')}
                className="apple-link type-headline font-display text-[var(--apple-label-primary)] hover:opacity-75"
              >
                {SITE_CONFIG.name}
              </a>
              <p className="type-callout mt-2.5 max-w-[38ch]">
                {SITE_CONFIG.roleTitle}. {SITE_CONFIG.location}.
              </p>
              <p className="type-footnote mt-4 max-w-[44ch] text-[var(--apple-label-tertiary)]">
                Take a fresh copy of my email from the desk copier — drop the card onto the scanner glass or press Start, then pull a sheet from the tray.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 border-t border-[var(--apple-separator-subtle)] pt-8 sm:grid-cols-12">
              {/* Public Navigation Only */}
              <div className="sm:col-span-5">
                <p className="type-caption text-[var(--apple-label-primary)]">
                  Explore
                </p>
                <ul className="type-footnote mt-3 flex flex-col gap-2.5 font-normal text-[var(--apple-label-secondary)]">
                  <li>
                    <a
                      href="/work"
                      onClick={(e) => handleLinkClick(e, '/work')}
                      className="apple-link hover:text-[var(--apple-label-primary)]"
                    >
                      Work
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
              <div className="sm:col-span-7">
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
                    onMouseEnter={() => {
                      if (
                        typeof window === 'undefined' ||
                        window.matchMedia('(hover: hover) and (pointer: fine)').matches
                      ) {
                        setCopyHovered(true);
                      }
                    }}
                    onMouseLeave={() => setCopyHovered(false)}
                    aria-label="Copy email address"
                    className="apple-surface-subtle type-caption inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3.5 py-1 font-medium text-[var(--apple-label-primary)] transition-[background-color,border-color,color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-[var(--apple-separator-strong)] hover:bg-[var(--apple-control-hover)] active:scale-[0.97] sm:min-h-[32px] sm:px-3"
                  >
                    {copied ? (
                      <>
                        <AnimatedCheckIcon
                          size={13.5}
                          strokeWidth={2}
                          className="text-[var(--apple-blue)]"
                        />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <AnimatedCopyIcon
                          size={13.5}
                          strokeWidth={1.85}
                          active={copyHovered}
                          className={`transition-colors duration-150 ${
                            copyHovered
                              ? 'text-[var(--apple-label-primary)]'
                              : 'text-[var(--apple-label-secondary)]'
                          }`}
                        />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <ul
                  aria-label="Social profiles"
                  className="mt-4 flex flex-wrap items-center gap-2"
                >
                  {SITE_CONFIG.socials.map((social) => (
                    <li key={social.label}>
                      <AppleTooltip label={social.label} placement="top">
                        <a
                          href={social.href}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={social.label}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-[var(--apple-label-secondary)] transition-[background-color,border-color,color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-[var(--apple-separator)] hover:bg-[var(--apple-control-hover)] hover:text-[var(--apple-label-primary)] active:scale-[0.95] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--apple-blue)]"
                        >
                          <SocialPlatformIcon label={social.label} />
                        </a>
                      </AppleTooltip>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Tactile Desk Column: JB·01 Interactive 3D Copier */}
          <div className="flex flex-col items-center lg:col-span-5 lg:items-end">
            <div className="w-full max-w-[330px] sm:max-w-[350px]">
              <Copier
                label="Email"
                value={SITE_CONFIG.email}
                mark="JB·01 COPIER"
                theme={resolvedTheme}
                sound={soundEnabled}
                haptics={true}
                keepCopies={true}
                onCopy={handleCopierCopied}
              />
              <p className="mt-1 text-center text-[11.5px] text-[var(--apple-label-tertiary)]">
                Drag card to glass or press Start · Click or pull sheet to copy
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-[var(--apple-separator)] pt-6 sm:flex-row sm:items-center sm:justify-between">
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
              className="type-footnote inline-flex min-h-[44px] w-fit items-center gap-1.5 rounded-full px-3.5 py-1 text-[var(--apple-label-secondary)] transition-[background-color,color,transform] duration-150 hover:bg-[var(--apple-control-hover)] hover:text-[var(--apple-label-primary)] active:scale-[0.97] sm:min-h-[34px] sm:px-3"
            >
              <Info size={14} strokeWidth={1.75} aria-hidden="true" />
              <span>Colophon</span>
            </button>
            <GlobalPreferencesPopover placement="top-right" variant="pill" />
            <button
              type="button"
              onClick={handleBackToTop}
              className="type-footnote inline-flex min-h-[44px] w-fit items-center gap-1.5 rounded-full px-3.5 py-1 text-[var(--apple-label-secondary)] transition-[background-color,color,transform] duration-150 hover:bg-[var(--apple-control-hover)] hover:text-[var(--apple-label-primary)] active:scale-[0.97] sm:min-h-[34px] sm:px-3"
            >
              <span>Back to top</span>
              <ArrowUp size={13} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

