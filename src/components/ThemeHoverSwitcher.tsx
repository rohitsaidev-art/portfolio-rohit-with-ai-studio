import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Monitor, MoonStar, Sun } from 'lucide-react';
import { setAppearanceMode, type AppearanceMode } from '../utils/appearance';
import { useAppearanceMode } from '../utils/useAppearance';
import { playTick } from '../utils/soundEngine';

const THEME_OPTIONS: readonly {
  id: AppearanceMode;
  label: string;
  tooltip: string;
  icon: typeof Sun;
}[] = [
  { id: 'system', label: 'System appearance', tooltip: 'System', icon: Monitor },
  { id: 'light', label: 'Light appearance', tooltip: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark appearance', tooltip: 'Dark', icon: MoonStar },
];

/**
 * Quiet appearance toggle (System / Light / Dark) that smoothly expands to
 * the LEFT of the resting icon inside a single unified pill.
 * Order stays frozen during an open hover session so clicking icons never
 * shifts buttons underneath the cursor; syncs cleanly after collapse.
 */
export function ThemeHoverSwitcher() {
  const appearanceMode = useAppearanceMode();

  const [expanded, setExpanded] = useState(false);
  const [anchorMode, setAnchorMode] = useState<AppearanceMode>(appearanceMode);
  const [hoveredId, setHoveredId] = useState<AppearanceMode | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const syncAnchorTimerRef = useRef<number | null>(null);

  const clearTimers = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (syncAnchorTimerRef.current !== null) {
      window.clearTimeout(syncAnchorTimerRef.current);
      syncAnchorTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  // Keep resting icon synced whenever collapsed (including external changes from ColorThemeSwitcher)
  useEffect(() => {
    if (!expanded) {
      if (syncAnchorTimerRef.current !== null) {
        window.clearTimeout(syncAnchorTimerRef.current);
      }
      syncAnchorTimerRef.current = window.setTimeout(() => {
        setAnchorMode(appearanceMode);
        syncAnchorTimerRef.current = null;
      }, 190);
    }
  }, [appearanceMode, expanded]);

  useEffect(() => {
    if (!expanded) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        clearTimers();
        setExpanded(false);
        setHoveredId(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        clearTimers();
        setExpanded(false);
        setHoveredId(null);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [expanded]);

  const openMenu = () => {
    clearTimers();
    if (!expanded) {
      setAnchorMode(appearanceMode);
    }
    setExpanded(true);
  };

  const handleMouseEnter = () => {
    if (
      typeof window !== 'undefined' &&
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    ) {
      return;
    }
    openMenu();
  };

  const handleMouseLeave = () => {
    if (
      typeof window !== 'undefined' &&
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    ) {
      return;
    }
    clearTimers();
    closeTimerRef.current = window.setTimeout(() => {
      setExpanded(false);
      setHoveredId(null);
    }, 110);
  };

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      clearTimers();
      setExpanded(false);
      setHoveredId(null);
    }
  };

  const handleSelect = (mode: AppearanceMode) => {
    if (appearanceMode === mode) return;
    playTick();
    setAppearanceMode(mode);
  };

  const anchorOption =
    THEME_OPTIONS.find((opt) => opt.id === anchorMode) ?? THEME_OPTIONS[1];
  const AnchorIcon = anchorOption.icon;
  const leftOptions = THEME_OPTIONS.filter((opt) => opt.id !== anchorOption.id);
  const hoveredOption =
    THEME_OPTIONS.find((opt) => opt.id === hoveredId) ??
    THEME_OPTIONS.find((opt) => opt.id === appearanceMode) ??
    anchorOption;

  return (
    <div
      ref={containerRef}
      data-expanded={expanded ? 'true' : 'false'}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={openMenu}
      onBlur={handleBlur}
      className="theme-switcher-root print:hidden"
    >
      <div
        role="radiogroup"
        aria-label="Theme appearance"
        className="theme-switcher-pill"
      >
        {/* Left-expanding options track */}
        <div className="theme-switcher-track" aria-hidden={!expanded}>
          <div className="theme-switcher-track-inner">
            {leftOptions.map((option, idx) => {
              const isActive = option.id === appearanceMode;
              const Icon = option.icon;
              const staggerMs = (leftOptions.length - 1 - idx) * 26;

              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  aria-label={option.label}
                  tabIndex={expanded ? 0 : -1}
                  data-active={isActive ? 'true' : 'false'}
                  style={
                    { '--reveal-delay': `${staggerMs}ms` } as CSSProperties
                  }
                  onMouseEnter={() => setHoveredId(option.id)}
                  onFocus={() => setHoveredId(option.id)}
                  onClick={() => handleSelect(option.id)}
                  className="theme-switcher-option theme-switcher-option--revealed"
                >
                  <Icon size={14} strokeWidth={1.65} aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right-anchored resting/active trigger */}
        <button
          type="button"
          role="radio"
          aria-checked={anchorOption.id === appearanceMode}
          aria-expanded={expanded}
          aria-label={anchorOption.label}
          data-active={anchorOption.id === appearanceMode ? 'true' : 'false'}
          onMouseEnter={() => setHoveredId(anchorOption.id)}
          onFocus={() => setHoveredId(anchorOption.id)}
          onClick={() => {
            if (!expanded) {
              playTick();
              openMenu();
            } else {
              handleSelect(anchorOption.id);
            }
          }}
          className="theme-switcher-option"
        >
          <AnchorIcon size={14} strokeWidth={1.65} aria-hidden="true" />
        </button>
      </div>

      <span role="tooltip" className="theme-switcher-caption">
        {hoveredOption.tooltip}
      </span>
    </div>
  );
}
