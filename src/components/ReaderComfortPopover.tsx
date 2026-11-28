import {
  setReaderTextSize,
  useReaderPreferences,
} from '../utils/readerPreferences';
import { playTick } from '../utils/soundEngine';

interface ReaderComfortPopoverProps {
  align?: 'left' | 'right';
}

/**
 * Direct inline "Aa" text-size toggle for Case Studies and Notes.
 * Left button increases page reading font size; right (smaller) button
 * stays subtly selected as the default reading scale.
 */
export function ReaderComfortPopover({
  align: _align = 'right',
}: ReaderComfortPopoverProps) {
  const prefs = useReaderPreferences();
  const isLarge = prefs.textSize === 'large';

  const handleSelect = (nextSize: 'default' | 'large') => {
    if (prefs.textSize === nextSize) return;
    playTick();
    setReaderTextSize(nextSize);
  };

  return (
    <div
      role="group"
      aria-label="Text size"
      className="inline-flex items-center gap-0.5 print:hidden"
    >
      <button
        type="button"
        aria-pressed={isLarge}
        aria-label="Larger text size"
        title="Larger text size"
        onClick={() => handleSelect('large')}
        className={`inline-flex h-8 min-w-[34px] items-center justify-center rounded-full border px-2 font-display text-[15px] leading-none tracking-[-0.02em] transition-[color,border-color,opacity] duration-150 ${
          isLarge
            ? 'border-[var(--apple-separator)] font-semibold text-[var(--apple-label-primary)]'
            : 'border-transparent font-medium text-[var(--apple-label-tertiary)] hover:text-[var(--apple-label-primary)]'
        }`}
      >
        Aa
      </button>

      <button
        type="button"
        aria-pressed={!isLarge}
        aria-label="Default text size"
        title="Default text size"
        onClick={() => handleSelect('default')}
        className={`inline-flex h-8 min-w-[30px] items-center justify-center rounded-full border px-2 font-display text-[12px] leading-none tracking-[-0.01em] transition-[color,border-color,opacity] duration-150 ${
          !isLarge
            ? 'border-[var(--apple-separator)] font-semibold text-[var(--apple-label-primary)]'
            : 'border-transparent font-medium text-[var(--apple-label-tertiary)] hover:text-[var(--apple-label-primary)]'
        }`}
      >
        Aa
      </button>
    </div>
  );
}
