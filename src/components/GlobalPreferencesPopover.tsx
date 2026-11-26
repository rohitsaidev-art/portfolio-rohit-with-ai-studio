import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { setAppearanceMode, type AppearanceMode } from '../utils/appearance';
import { useAppearanceMode } from '../utils/useAppearance';
import {
  setFocusReading,
  setReaderTextSize,
  useReaderPreferences,
} from '../utils/readerPreferences';
import { playTick, setSoundEnabled } from '../utils/soundEngine';
import { useSoundEnabled } from '../utils/useSoundEnabled';
import { showToast } from '../utils/toast';
import { EASE_APPLE } from '../utils/motion';
import { prefersReducedMotion } from '../utils/scroll';
import {
  SFDisplay,
  SFMoon,
  SFSliders,
  SFSpeakerSlash,
  SFSpeakerWave,
  SFSunMax,
} from './SFSymbols';

interface GlobalPreferencesPopoverProps {
  /** Popover placement direction relative to trigger button */
  placement?: 'bottom-right' | 'top-right';
  /** Compact icon trigger for Navbar vs. labeled tonal button for Footer */
  variant?: 'icon' | 'pill';
}

const APPEARANCE_OPTIONS: readonly {
  id: AppearanceMode;
  label: string;
  icon: typeof SFSunMax;
}[] = [
  { id: 'light', label: 'Light', icon: SFSunMax },
  { id: 'system', label: 'Auto', icon: SFDisplay },
  { id: 'dark', label: 'Dark', icon: SFMoon },
];

/**
 * Unified Global Preferences Popover (P2.12).
 * Consolidates Appearance (Light / Auto / Dark), UI Sound On/Off,
 * and Reader Comfort (Default / Larger text + Focus Reading) in one
 * synchronized, accessible popover without competing duplicate controls.
 */
export function GlobalPreferencesPopover({
  placement = 'bottom-right',
  variant = 'icon',
}: GlobalPreferencesPopoverProps) {
  const [open, setOpen] = useState(false);
  const appearanceMode = useAppearanceMode();
  const soundEnabled = useSoundEnabled();
  const readerPrefs = useReaderPreferences();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverId = useId();
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleAppearanceChange = (mode: AppearanceMode) => {
    if (appearanceMode === mode) return;
    playTick();
    setAppearanceMode(mode);
    const label =
      mode === 'light' ? 'Light' : mode === 'dark' ? 'Dark' : 'Auto (System)';
    showToast({ message: `Appearance set to ${label}`, tone: 'info' });
  };

  const handleSoundChange = (nextEnabled: boolean) => {
    if (soundEnabled === nextEnabled) return;
    setSoundEnabled(nextEnabled);
    if (nextEnabled) {
      playTick();
    }
    showToast({
      message: nextEnabled ? 'UI sounds unmuted' : 'UI sounds muted',
      tone: 'info',
    });
  };

  const panelPositionClass =
    placement === 'top-right'
      ? 'bottom-[calc(100%+10px)] right-0'
      : 'top-[calc(100%+10px)] right-0';

  return (
    <div ref={containerRef} className="relative inline-flex print:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          playTick();
          setOpen((prev) => !prev);
        }}
        aria-expanded={open}
        aria-controls={popoverId}
        aria-label="Global preferences: appearance, UI sound, and reading comfort"
        title="Preferences (Appearance, UI Sound, Reader Comfort)"
        className={
          variant === 'pill'
            ? 'apple-surface-subtle type-caption inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-4 py-1 font-medium text-[var(--apple-label-primary)] transition-all duration-150 hover:opacity-90 active:scale-95 sm:min-h-[34px] sm:px-3.5'
            : `apple-btn-icon h-11 w-11 text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)] md:h-8 md:w-8 ${
                open ? 'bg-[var(--apple-control-hover)] text-[var(--apple-label-primary)]' : ''
              }`
        }
      >
        <SFSliders size={variant === 'pill' ? 13 : 15} />
        {variant === 'pill' && <span>Preferences</span>}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={popoverId}
            role="dialog"
            aria-label="Site preferences"
            initial={
              reduced
                ? { opacity: 1 }
                : { opacity: 0, y: placement === 'top-right' ? 6 : -6, scale: 0.97 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduced
                ? { opacity: 0 }
                : { opacity: 0, y: placement === 'top-right' ? 4 : -4, scale: 0.97 }
            }
            transition={
              reduced ? { duration: 0.01 } : { duration: 0.18, ease: EASE_APPLE }
            }
            className={`apple-modal absolute z-50 w-[292px] rounded-[22px] bg-[var(--apple-surface-elevated)] p-4.5 text-left ${panelPositionClass}`}
          >
            <div className="flex items-center justify-between">
              <p className="type-caption text-[var(--apple-label-tertiary)]">
                Preferences
              </p>
              <span className="text-[11px] text-[var(--apple-label-tertiary)]">
                Synced site-wide
              </span>
            </div>

            {/* 1. Appearance */}
            <div className="mt-3.5">
              <p className="type-footnote font-medium text-[var(--apple-label-primary)]">
                Appearance
              </p>
              <div
                role="group"
                aria-label="Appearance mode"
                className="apple-segmented mt-2 !w-full !p-0.5"
              >
                {APPEARANCE_OPTIONS.map((option) => {
                  const active = appearanceMode === option.id;
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => handleAppearanceChange(option.id)}
                      className={`apple-segmented-item flex-1 !min-h-[30px] px-2.5 py-1 text-[12px] ${
                        active
                          ? 'apple-pill-shadow bg-[var(--apple-control-thumb)] text-[var(--apple-label-primary)]'
                          : 'text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                      }`}
                    >
                      <Icon size={12} />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. UI Sound Effects (strictly independent of AudioPlayer narration) */}
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--apple-separator-subtle)] pt-3.5">
              <div className="min-w-0">
                <p className="type-footnote flex items-center gap-1.5 font-medium text-[var(--apple-label-primary)]">
                  {soundEnabled ? (
                    <SFSpeakerWave size={13} className="text-[var(--apple-blue)]" />
                  ) : (
                    <SFSpeakerSlash
                      size={13}
                      className="text-[var(--apple-label-tertiary)]"
                    />
                  )}
                  <span>UI Sound Effects</span>
                </p>
                <p className="mt-0.5 text-[11.5px] leading-[1.35] text-[var(--apple-label-tertiary)]">
                  Independent of AudioPlayer narration.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={soundEnabled}
                aria-label={
                  soundEnabled
                    ? 'Mute UI sound effects'
                    : 'Unmute UI sound effects'
                }
                onClick={() => handleSoundChange(!soundEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${
                  soundEnabled
                    ? 'bg-[var(--apple-blue)]'
                    : 'bg-[var(--apple-separator-strong)]'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    soundEnabled ? 'translate-x-[22px]' : 'translate-x-[2px]'
                  }`}
                />
              </button>
            </div>

            {/* 3. Reader Comfort */}
            <div className="mt-4 border-t border-[var(--apple-separator-subtle)] pt-3.5">
              <div className="flex items-center justify-between">
                <p className="type-footnote font-medium text-[var(--apple-label-primary)]">
                  Reader Text Size
                </p>
                <span className="font-display text-[12px] font-semibold text-[var(--apple-label-tertiary)]">
                  Aa
                </span>
              </div>
              <div
                role="group"
                aria-label="Reader text size"
                className="apple-segmented mt-2 !w-full !p-0.5"
              >
                {(
                  [
                    { id: 'default', label: 'Default' },
                    { id: 'large', label: 'Larger' },
                  ] as const
                ).map((option) => {
                  const active = readerPrefs.textSize === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        if (!active) {
                          playTick();
                          setReaderTextSize(option.id);
                          showToast({
                            message: `Reader text size: ${option.label}`,
                            tone: 'info',
                          });
                        }
                      }}
                      className={`apple-segmented-item flex-1 !min-h-[30px] px-3 py-1 text-[12px] ${
                        active
                          ? 'apple-pill-shadow bg-[var(--apple-control-thumb)] text-[var(--apple-label-primary)]'
                          : 'text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3.5 flex items-center justify-between gap-3">
                <div>
                  <p className="type-footnote font-medium text-[var(--apple-label-primary)]">
                    Focus Reading
                  </p>
                  <p className="text-[11.5px] leading-[1.35] text-[var(--apple-label-tertiary)]">
                    Quiets peripheral navigation chrome.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={readerPrefs.focusMode}
                  aria-label="Toggle Focus Reading mode"
                  onClick={() => {
                    playTick();
                    const next = !readerPrefs.focusMode;
                    setFocusReading(next);
                    showToast({
                      message: next
                        ? 'Focus Reading enabled'
                        : 'Focus Reading disabled',
                      tone: 'info',
                    });
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${
                    readerPrefs.focusMode
                      ? 'bg-[var(--apple-blue)]'
                      : 'bg-[var(--apple-separator-strong)]'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      readerPrefs.focusMode
                        ? 'translate-x-[22px]'
                        : 'translate-x-[2px]'
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
