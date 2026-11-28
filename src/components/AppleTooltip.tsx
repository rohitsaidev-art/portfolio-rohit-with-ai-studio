import { useEffect, useId, useRef, useState } from 'react';

/**
 * Shared toolbar tooltip warm-window state (Emil Kowalski pattern):
 * First tooltip waits a gentle delay to prevent accidental flicker;
 * hovering an adjacent toolbar control within 420ms opens instantaneously.
 */
let lastTooltipDismissedAt = 0;
let activeTooltipCount = 0;

const INITIAL_DELAY_MS = 220;
const WARM_WINDOW_MS = 420;

interface AppleTooltipProps {
  label: string;
  children: React.ReactNode;
  placement?: 'bottom' | 'top';
  /** Optional controlled visibility override (e.g. for compound controls) */
  disabled?: boolean;
  className?: string;
}

export function AppleTooltip({
  label,
  children,
  placement = 'bottom',
  disabled = false,
  className = '',
}: AppleTooltipProps) {
  const [visible, setVisible] = useState(false);
  const [instant, setInstant] = useState(false);
  const timerRef = useRef<number | null>(null);
  const tooltipId = useId();

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearTimer();
      if (visible) {
        activeTooltipCount = Math.max(0, activeTooltipCount - 1);
        lastTooltipDismissedAt = Date.now();
      }
    };
  }, [visible]);

  useEffect(() => {
    if (disabled && visible) {
      clearTimer();
      setVisible(false);
    }
  }, [disabled, visible]);

  const show = (fromKeyboard = false) => {
    if (disabled) return;
    clearTimer();
    const isWarm =
      fromKeyboard ||
      activeTooltipCount > 0 ||
      Date.now() - lastTooltipDismissedAt < WARM_WINDOW_MS;

    if (isWarm) {
      setInstant(true);
      activeTooltipCount += 1;
      setVisible(true);
      return;
    }

    setInstant(false);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      activeTooltipCount += 1;
      setVisible(true);
    }, INITIAL_DELAY_MS);
  };

  const hide = () => {
    clearTimer();
    if (visible) {
      activeTooltipCount = Math.max(0, activeTooltipCount - 1);
      lastTooltipDismissedAt = Date.now();
      setVisible(false);
    }
  };

  return (
    <span
      className={`relative inline-flex items-center justify-center ${className}`}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') show(false);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') hide();
      }}
      onPointerDown={hide}
      onFocus={(event) => {
        if (
          event.target instanceof HTMLElement &&
          event.target.matches(':focus-visible')
        ) {
          show(true);
        }
      }}
      onBlur={hide}
      aria-describedby={visible ? tooltipId : undefined}
    >
      {children}

      <span
        id={tooltipId}
        role="tooltip"
        data-visible={visible && !disabled ? 'true' : 'false'}
        data-instant={instant ? 'true' : 'false'}
        data-placement={placement}
        className="apple-tooltip"
      >
        {label}
      </span>
    </span>
  );
}
