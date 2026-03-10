import { format, parseISO, startOfDay } from 'date-fns'

import type { Locale } from 'date-fns'

/**
 * Returns today's date as a "YYYY-MM-DD" string (local timezone, no time component).
 */
export function getTodayStr(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

/**
 * Returns a Date object representing the start of today (00:00:00 local time).
 */
export function getStartOfToday(): Date {
  return startOfDay(new Date())
}

/**
 * Returns true when a dueDate string (YYYY-MM-DD) is strictly before today.
 * Today itself is NOT considered overdue.
 */
export function isOverdueDate(dueDate: string | null | undefined): boolean {
  if (!dueDate) return false
  // String comparison works because the format is lexicographically ordered.
  return dueDate < getTodayStr()
}

/**
 * Formats a dueDate string (YYYY-MM-DD) using date-fns with the provided locale.
 * Falls back to 'PPP' pattern (e.g. "March 4th, 2026").
 */
export function formatDueDate(
  dueDate: string,
  locale?: Locale,
  pattern = 'PPP'
): string {
  return format(parseISO(dueDate), pattern, locale ? { locale } : undefined)
}
