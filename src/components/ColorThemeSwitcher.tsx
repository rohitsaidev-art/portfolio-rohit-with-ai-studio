import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { setAppearanceMode } from '../utils/appearance';
import { useAppearanceMode, useResolvedTheme } from '../utils/useAppearance';
import { setColorTheme, type ColorTheme } from '../utils/colorTheme';
import { useColorTheme } from '../utils/useColorTheme';
import { playTick } from '../utils/soundEngine';

type PaletteChoice = ColorTheme | 'black';

const PALETTE_OPTIONS: readonly {
  id: PaletteChoice;
  label: string;
  tooltip: string;
  swatch: string;
}[] = [
  {
    id: 'apple',
    label: 'Neutral light theme',
    tooltip: 'Neutral',
    swatch: '#0071e3',
  },
  {
    id: 'warm',
    label: 'Warm light theme',
    tooltip: 'Warm',
    swatch: '#c07a52',
  },
  {
    id: 'cool',
    label: 'Cool light theme',
    tooltip: 'Cool',
    swatch: '#6b7c99',
  },
  {
    id: 'black',
    label: 'Black dark theme',
    tooltip: 'Black',
    swatch: '#141416',
  },
];

/**
 * 4-swatch color theme picker (Neutral · Warm · Cool · Black) that smoothly
 * expands to the LEFT of the resting dot inside a single unified pill.
 * Order stays frozen during an open hover session so clicking swatches never
 * shifts buttons underneath the cursor; updates cleanly after collapse.
 */
export function ColorThemeSwitcher() {
  const colorTheme = useColorTheme();
  const appearanceMode = useAppearanceMode();
  const resolvedTheme = useResolvedTheme();

  const activeChoice: PaletteChoice =
    resolvedTheme === 'dark' ? 'black' : colorTheme;

  const [expanded, setExpanded] = useState(false);
  const [anchorChoice, setAnchorChoice] = useState<PaletteChoice>(activeChoice);
  const [hoveredId, setHoveredId] = useState<PaletteChoice | null>(null);

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

  // Keep the resting right-most anchor synced with activeChoice whenever collapsed
  useEffect(() => {
    if (!expanded) {
      if (syncAnchorTimerRef.current !== null) {
        window.clearTimeout(syncAnchorTimerRef.current);
      }
      syncAnchorTimerRef.current = window.setTimeout(() => {
        setAnchorChoice(activeChoice);
        syncAnchorTimerRef.current = null;
      }, 190);
    }
  }, [activeChoice, expanded]);

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
      setAnchorChoice(activeChoice);
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

  const handleSelect = (choice: PaletteChoice) => {
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

  const anchorOption =
    PALETTE_OPTIONS.find((opt) => opt.id === anchorChoice) ?? PALETTE_OPTIONS[0];
  const leftOptions = PALETTE_OPTIONS.filter((opt) => opt.id !== anchorOption.id);
  const hoveredOption =
    PALETTE_OPTIONS.find((opt) => opt.id === hoveredId) ??
    PALETTE_OPTIONS.find((opt) => opt.id === activeChoice) ??
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
        aria-label="Color theme"
        className="theme-switcher-pill"
      >
        {/* Left-expanding options track */}
        <div className="theme-switcher-track" aria-hidden={!expanded}>
          <div className="theme-switcher-track-inner">
            {leftOptions.map((option, idx) => {
              const isActive = option.id === activeChoice;
              // Stagger from right-to-left (closest to trigger appears first)
              const staggerMs = (leftOptions.length - 1 - idx) * 24;

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
                  <span
                    aria-hidden="true"
                    className="theme-swatch-dot"
                    style={{ backgroundColor: option.swatch }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right-anchored resting/active button (never moves on hover start) */}
        <button
          type="button"
          role="radio"
          aria-checked={anchorOption.id === activeChoice}
          aria-expanded={expanded}
          aria-label={anchorOption.label}
          data-active={anchorOption.id === activeChoice ? 'true' : 'false'}
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
          <span
            aria-hidden="true"
            className="theme-swatch-dot"
            style={{ backgroundColor: anchorOption.swatch }}
          />
        </button>
      </div>

      <span role="tooltip" className="theme-switcher-caption">
        {hoveredOption.tooltip}
      </span>
    </div>
  );
}
