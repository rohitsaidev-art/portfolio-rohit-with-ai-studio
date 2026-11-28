import { playTick, setSoundEnabled } from '../utils/soundEngine';
import { useSoundEnabled } from '../utils/useSoundEnabled';
import { AppleTooltip } from './AppleTooltip';
import { AnimatedMuteIcon } from './icons/MuteToggle';

interface SoundToggleButtonProps {
  /** Compact 32px desktop icon vs. 44px mobile touch target */
  size?: 'desktop' | 'mobile';
}

/**
 * Tactile single-click toggle for site-wide UI feedback sounds
 * with animated speaker/slash choreography and dynamic Apple-style tooltip.
 */
export function SoundToggleButton({ size = 'desktop' }: SoundToggleButtonProps) {
  const soundEnabled = useSoundEnabled();

  const handleToggle = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) {
      playTick();
    }
  };

  const sizeClass = size === 'mobile' ? 'h-11 w-11' : 'h-8 w-8';
  const tooltipText = soundEnabled ? 'UI sounds: On' : 'UI sounds: Off';

  const button = (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={!soundEnabled}
      aria-label={soundEnabled ? 'Mute website UI sounds' : 'Enable website UI sounds'}
      className={`nav-icon-btn inline-flex ${sizeClass} shrink-0 cursor-pointer items-center justify-center rounded-full transition-[background-color,color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.92] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--apple-focus-ring)] print:hidden ${
        soundEnabled
          ? 'text-[var(--apple-label-secondary)]'
          : 'text-[var(--apple-label-tertiary)]'
      }`}
    >
      <AnimatedMuteIcon
        muted={!soundEnabled}
        size={size === 'mobile' ? 17.5 : 15.5}
        strokeWidth={1.75}
      />
    </button>
  );

  if (size === 'mobile') {
    return button;
  }

  return <AppleTooltip label={tooltipText}>{button}</AppleTooltip>;
}
