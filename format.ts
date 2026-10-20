import { differenceInCalendarDays, format, formatDistanceToNow, parseISO } from 'date-fns';

export function formatEventWhen(iso: string) {
  return format(parseISO(iso), 'EEE, MMM d · h:mm a');
}

export function formatShortDate(iso: string) {
  return format(parseISO(iso), 'MMM d');
}

export function formatRelative(iso: string) {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true });
}

export function daysUntil(iso: string) {
  return differenceInCalendarDays(parseISO(iso), new Date());
}

export function countdownLabel(iso: string) {
  const days = daysUntil(iso);
  if (days < 0) return 'Event passed';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `${days} days away`;
}

export function levelFromPoints(points: number) {
  return Math.max(1, Math.floor(points / 100) + 1);
}
