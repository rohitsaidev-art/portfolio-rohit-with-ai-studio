import { useEffect, useState } from 'react';
import {
  getHyderabadClockSnapshot,
  type HyderabadClockSnapshot,
} from '../utils/localTime';
import { Clock } from 'lucide-react';

interface LocalTimeClockProps {
  variant?: 'inline' | 'card';
}

/**
 * Real-time Hyderabad Local Clock (IST · Asia/Kolkata, UTC+5:30) (P2.10).
 */
export function LocalTimeClock({ variant = 'inline' }: LocalTimeClockProps) {
  const [snapshot, setSnapshot] = useState<HyderabadClockSnapshot>(() =>
    getHyderabadClockSnapshot(),
  );

  useEffect(() => {
    const update = () => setSnapshot(getHyderabadClockSnapshot(new Date()));
    update();
    const intervalId = window.setInterval(update, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  if (variant === 'card') {
    return (
      <div className="mt-4 flex items-center justify-between gap-3 rounded-[16px] bg-[var(--apple-bg-secondary)] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Clock size={15} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-[var(--apple-link)]" />
          <div>
            <p className="text-[12px] font-medium text-[var(--apple-label-primary)]">
              Hyderabad local time
            </p>
            <p className="text-[11.5px] text-[var(--apple-label-tertiary)]">
              {snapshot.dateString} · {snapshot.timezoneLabel}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="tabular-nums text-[15px] font-semibold tracking-[-0.015em] text-[var(--apple-label-primary)]">
            {snapshot.timeString}
          </p>
          <p className="text-[11px] text-[var(--apple-label-tertiary)]">
            {snapshot.partOfDay}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="type-footnote inline-flex flex-wrap items-center gap-2 font-normal text-[var(--apple-label-secondary)]">
      <Clock size={14} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-[var(--apple-link)]" />
      <span>Hyderabad</span>
      <span aria-hidden="true" className="text-[var(--apple-label-tertiary)]">
        ·
      </span>
      <span className="tabular-nums font-semibold text-[var(--apple-label-primary)]">
        {snapshot.timeString}
      </span>
      <span className="text-[var(--apple-label-tertiary)]">
        ({snapshot.timezoneLabel})
      </span>
    </div>
  );
}
