import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Monitor, MoonStar, Sun } from 'lucide-react';
import { setAppearanceMode, type AppearanceMode } from '../utils/appearance';
import { useAppearanceMode, useResolvedTheme } from '../utils/useAppearance';
import { setColorTheme, type ColorTheme } from '../utils/colorTheme';
import { useColorTheme } from '../utils/useColorTheme';
import { playTick, setSoundEnabled } from '../utils/soundEngine';
import { useSoundEnabled } from '../utils/useSoundEnabled';
import { AppleTooltip } from './AppleTooltip';
import { AnimatedSettingsIcon } from './icons/AnimatedLucide';
import { AnimatedMuteIcon } from './icons/MuteToggle';

type PaletteChoice = ColorTheme | 'black';

const APPEARANCE_OPTIONS: readonly {
  id: AppearanceMode;
  label: string;
  ariaLabel: string;
  icon: typeof Sun;
}[] = [
  { id: 'light', label: 'Light', ariaLabel: 'Light appearance', icon: Sun },
  { id: 'dark', label: 'Dark', ariaLabel: 'Dark appearance', icon: MoonStar },
  { id: 'system', label: 'System', ariaLabel: 'System appearance', icon: Monitor },
];

const PALETTE_OPTIONS: readonly {
  id: PaletteChoice;
  label: string;
  ariaLabel: string;
  swatch: string;
}[] = [
  { id: 'apple', label: 'Neutral', ariaLabel: 'Neutral light theme', swatch: '#0071e3' },
  { id: 'warm', label: 'Warm', ariaLabel: 'Warm light theme', swatch: '#c07a52' },
  { id: 'cool', label: 'Cool', ariaLabel: 'Cool light theme', swatch: '#6b7c99' },
  { id: 'black', label: 'Black', ariaLabel: 'Black dark theme', swatch: '#141416' },
];

const EASE_POPOVER = [0.23, 1, 0.32, 1] as const;

interface HeaderSettingsMenuProps {
  /** Compact 32px desktop icon vs. 44px mobile touch target */
  size?: 'desktop' | 'mobile';
  /** Optional callback fired when the settings popover opens */
  onOpen?: () => void;
}

/**
 * Unified header settings trigger & origin-aware popover combining:
 * - Appearance (Light / Dark / System)
 * - Color Theme (Neutral / Warm / Cool / Black) with automatic Dark/Light sync
 * - UI Sounds (Mute / Unmute with animated speaker & slash choreography)
 */
export function HeaderSettingsMenu({
  size = 'desktop',
  onOpen,
}: HeaderSettingsMenuProps) {
  const appearanceMode = useAppearanceMode();
  const resolvedTheme = useResolvedTheme();
  const colorTheme = useColorTheme();
  const soundEnabled = useSoundEnabled();
  const prefersReducedMotion = useReducedMotion();

  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverId = useId();
  const pillLayoutId = useId();

  const activeChoice: PaletteChoice =
    resolvedTheme === 'dark' ? 'black' : colorTheme;

  const activePaletteLabel =
    PALETTE_OPTIONS.find((opt) => opt.id === activeChoice)?.label ?? 'Neutral';

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
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

    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleAppearanceSelect = (mode: AppearanceMode) => {
    if (appearanceMode === mode) return;
    playTick();
    setAppearanceMode(mode, { animated: true });
  };

  const handlePaletteSelect = (choice: PaletteChoice) => {
    if (choice === 'black') {
      if (resolvedTheme === 'dark' && appearanceMode === 'dark') return;
      playTick();
      setColorTheme('apple', { animated: false });
      setAppearanceMode('dark', { animated: true });
      return;
    }

    const switchingFromDark = resolvedTheme === 'dark';
    const colorChanged = colorTheme !== choice;
    const appearanceChanged = appearanceMode !== 'light';

    if (!switchingFromDark && !colorChanged && !appearanceChanged) return;
    playTick();

    if (switchingFromDark) {
      setColorTheme(choice, { animated: false });
      setAppearanceMode('light', { animated: true });
    } else {
      if (appearanceChanged) {
        setAppearanceMode('light', { animated: false });
      }
      if (colorChanged) {
        setColorTheme(choice, { animated: true });
      }
    }
  };

  const handleSoundToggle = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) {
      playTick();
    }
  };

  const sizeClass = size === 'mobile' ? 'h-11 w-11' : 'h-8 w-8';

  const triggerButton = (
    <button
      ref={triggerRef}
      type="button"
      onClick={() => {
        playTick();
        setOpen((prev) => {
          const next = !prev;
          if (next) onOpen?.();
          return next;
        });
      }}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') setHovered(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') setHovered(false);
      }}
      aria-expanded={open}
      aria-haspopup="dialog"
      aria-controls={popoverId}
      aria-label="Display, theme, and sound settings"
      className={`nav-icon-btn inline-flex ${sizeClass} shrink-0 cursor-pointer items-center justify-center rounded-full transition-[background-color,color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.92] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--apple-focus-ring)] ${
        open
          ? 'bg-[var(--apple-control-hover)] text-[var(--apple-label-primary)]'
          : 'text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
      }`}
    >
      <AnimatedSettingsIcon
        size={size === 'mobile' ? 18 : 16}
        strokeWidth={1.75}
        animate={open || hovered}
      />
    </button>
  );

  return (
    <div ref={containerRef} className="relative inline-flex items-center print:hidden">
      {size === 'desktop' ? (
        <AppleTooltip label="Settings" placement="bottom" disabled={open}>
          {triggerButton}
        </AppleTooltip>
      ) : (
        triggerButton
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            id={popoverId}
            role="dialog"
            aria-label="Display, theme, and sound settings"
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: -5, scale: 0.96 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: -4, scale: 0.96 }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0.01 }
                : { duration: 0.18, ease: EASE_POPOVER }
            }
            className="apple-modal absolute right-0 top-[calc(100%+10px)] z-50 w-[268px] origin-top-right rounded-[20px] border border-[var(--apple-separator-subtle)] bg-[var(--apple-surface-elevated)] p-3.5 text-left"
          >
            {/* 1. Appearance: Light / Dark / System */}
            <div>
              <p className="px-0.5 text-[11px] font-medium tracking-[0.01em] text-[var(--apple-label-tertiary)]">
                Appearance
              </p>
              <div
                role="radiogroup"
                aria-label="Appearance mode"
                className="apple-segmented relative mt-2 !w-full !p-0.5"
              >
                {APPEARANCE_OPTIONS.map((option) => {
                  const isActive = appearanceMode === option.id;
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={isActive}
                      aria-label={option.ariaLabel}
                      onClick={() => handleAppearanceSelect(option.id)}
                      className={`apple-segmented-item relative z-10 flex-1 cursor-pointer !min-h-[30px] px-2 py-1 text-[12px] transition-colors duration-150 ${
                        isActive
                          ? 'font-medium text-[var(--apple-label-primary)]'
                          : 'font-normal text-[var(--apple-label-secondary)] hover:text-[var(--apple-label-primary)]'
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId={pillLayoutId}
                          aria-hidden="true"
                          transition={
                            prefersReducedMotion
                              ? { duration: 0.01 }
                              : { type: 'spring', stiffness: 480, damping: 38 }
                          }
                          className="apple-pill-shadow absolute inset-0 -z-10 rounded-full bg-[var(--apple-control-thumb)]"
                        />
                      )}
                      <Icon size={12.5} strokeWidth={1.85} aria-hidden="true" />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Theme Selector: Neutral / Warm / Cool / Black */}
            <div className="mt-3.5 border-t border-[var(--apple-separator-subtle)] pt-3.5">
              <div className="flex items-center justify-between px-0.5">
                <p className="text-[11px] font-medium tracking-[0.01em] text-[var(--apple-label-tertiary)]">
                  Theme
                </p>
                <span className="text-[11px] font-medium text-[var(--apple-label-secondary)]">
                  {activePaletteLabel}
                </span>
              </div>
              <div
                role="radiogroup"
                aria-label="Color theme"
                className="mt-2 grid grid-cols-4 gap-1"
              >
                {PALETTE_OPTIONS.map((option) => {
                  const isActive = option.id === activeChoice;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={isActive}
                      aria-label={option.ariaLabel}
                      onClick={() => handlePaletteSelect(option.id)}
                      className={`group flex cursor-pointer flex-col items-center gap-1.5 rounded-[12px] px-1 py-2 transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--apple-focus-ring)] ${
                        isActive
                          ? 'bg-[var(--apple-control-hover)]'
                          : 'hover:bg-[var(--apple-control-hover)]/65'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`flex h-[18px] w-[18px] items-center justify-center rounded-full shadow-[inset_0_1px_1.5px_rgba(0,0,0,0.16)] transition-[transform,box-shadow] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105 ${
                          isActive
                            ? ''
                            : 'ring-1 ring-black/10 dark:ring-white/15'
                        }`}
                        style={{
                          backgroundColor: option.swatch,
                          boxShadow: isActive
                            ? option.id === 'black'
                              ? 'inset 0 1px 1.5px rgba(255,255,255,0.12), 0 0 0 1.5px var(--apple-surface-elevated), 0 0 0 2.75px rgba(255, 255, 255, 0.28)'
                              : `inset 0 1px 1.5px rgba(0,0,0,0.16), 0 0 0 1.5px var(--apple-surface-elevated), 0 0 0 2.75px color-mix(in srgb, ${option.swatch} 38%, transparent)`
                            : undefined,
                        }}
                      >
                        {isActive && (
                          <span className="h-[5px] w-[5px] rounded-full bg-white shadow-[0_0.5px_1.5px_rgba(0,0,0,0.28)]" />
                        )}
                      </span>
                      <span
                        className={`text-[11px] leading-none tracking-[-0.005em] ${
                          isActive
                            ? 'font-medium text-[var(--apple-label-primary)]'
                            : 'font-normal text-[var(--apple-label-secondary)]'
                        }`}
                      >
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. UI Sounds: Mute / Unmute */}
            <div className="mt-3 border-t border-[var(--apple-separator-subtle)] pt-2.5">
              <button
                type="button"
                role="switch"
                aria-checked={soundEnabled}
                aria-label={
                  soundEnabled ? 'Mute website UI sounds' : 'Unmute website UI sounds'
                }
                onClick={handleSoundToggle}
                className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-[12px] px-2 py-2 transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[var(--apple-control-hover)] active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--apple-focus-ring)]"
              >
                <span className="flex items-center gap-2.5">
                  <AnimatedMuteIcon
                    muted={!soundEnabled}
                    size={16.5}
                    strokeWidth={1.85}
                    className={
                      soundEnabled
                        ? 'text-[var(--apple-label-primary)]'
                        : 'text-[var(--apple-label-tertiary)]'
                    }
                  />
                  <span className="text-[13px] font-medium tracking-[-0.008em] text-[var(--apple-label-primary)]">
                    UI Sounds
                  </span>
                </span>

                <span
                  aria-hidden="true"
                  className={`relative inline-flex h-[22px] w-[38px] shrink-0 items-center rounded-full transition-colors duration-200 ${
                    soundEnabled
                      ? 'bg-[var(--apple-blue)]'
                      : 'bg-[var(--apple-separator-strong)]'
                  }`}
                >
                  <span
                    className={`inline-block h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                      soundEnabled ? 'translate-x-[18px]' : 'translate-x-[2px]'
                    }`}
                  />
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
