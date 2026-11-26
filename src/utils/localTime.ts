/**
 * Hyderabad Local Time (IST · Asia/Kolkata, UTC+5:30) formatting helpers (P2.10).
 * Pure Intl-based formatting with zero external dependencies.
 */

export const HYDERABAD_TIME_ZONE = 'Asia/Kolkata';

export interface HyderabadClockSnapshot {
  timeString: string;
  dateString: string;
  timezoneLabel: string;
  partOfDay: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
}

export function formatHyderabadTime(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: HYDERABAD_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
    .format(date)
    .toUpperCase();
}

export function formatHyderabadDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: HYDERABAD_TIME_ZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date);
}

export function getHyderabadHour24(date: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: HYDERABAD_TIME_ZONE,
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const hourPart = parts.find((p) => p.type === 'hour')?.value ?? '12';
  const parsed = Number.parseInt(hourPart, 10);
  return Number.isFinite(parsed) ? parsed % 24 : 12;
}

export function getHyderabadClockSnapshot(
  date: Date = new Date(),
): HyderabadClockSnapshot {
  const hour = getHyderabadHour24(date);
  const partOfDay: HyderabadClockSnapshot['partOfDay'] =
    hour >= 5 && hour < 12
      ? 'Morning'
      : hour >= 12 && hour < 17
        ? 'Afternoon'
        : hour >= 17 && hour < 21
          ? 'Evening'
          : 'Night';

  return {
    timeString: formatHyderabadTime(date),
    dateString: formatHyderabadDate(date),
    timezoneLabel: 'IST · UTC+5:30',
    partOfDay,
  };
}
