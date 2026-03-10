// Shared todo domain constants — used by form, list, filter, API

export const PRIORITY_OPTIONS = [
  { value: 'high', labelKey: 'priorityHigh' },
  { value: 'medium', labelKey: 'priorityMedium' },
  { value: 'low', labelKey: 'priorityLow' }
] as const

export type Priority = (typeof PRIORITY_OPTIONS)[number]['value']

export const SORT_OPTIONS = [
  { value: 'createdAt_desc', labelKey: 'sortNewest' },
  { value: 'createdAt_asc', labelKey: 'sortOldest' },
  { value: 'priority_desc', labelKey: 'sortPriorityHighLow' },
  { value: 'priority_asc', labelKey: 'sortPriorityLowHigh' }
] as const

export type SortOption = (typeof SORT_OPTIONS)[number]['value']

// Map priority → badge style
export const PRIORITY_STYLES: Record<
  Priority,
  { className: string; icon: string }
> = {
  high: {
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: '🔴'
  },
  medium: {
    className:
      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: '🟡'
  },
  low: {
    className:
      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon: '🟢'
  }
}

// Priority sort order for client-side use (high=1, medium=2, low=3)
export const PRIORITY_ORDER: Record<Priority, number> = {
  high: 1,
  medium: 2,
  low: 3
}
