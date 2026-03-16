// Shared todo domain constants — used by form, list, filter, API

export const PRIORITY_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  value: i + 1,
  label: String(i + 1)
}))

export type Priority = number

// Priority color mapping (1-3: red/critical, 4-6: orange/medium, 7-9: yellow/low, 10: green/minimal)
export function getPriorityColor(priority: number): string {
  if (priority <= 3) return '#ef4444' // red
  if (priority <= 6) return '#f97316' // orange
  if (priority <= 8) return '#eab308' // yellow
  return '#22c55e' // green
}

export function getPriorityLabel(priority: number): string {
  if (priority <= 3) return `🚩 ${priority}`
  if (priority <= 6) return `🚩 ${priority}`
  if (priority <= 8) return `🚩 ${priority}`
  return `🚩 ${priority}`
}

export const SORT_OPTIONS = [
  { value: 'createdAt_desc', labelKey: 'sortNewest' },
  { value: 'createdAt_asc', labelKey: 'sortOldest' },
  { value: 'priority_desc', labelKey: 'sortPriorityHighLow' },
  { value: 'priority_asc', labelKey: 'sortPriorityLowHigh' }
] as const

export type SortOption = (typeof SORT_OPTIONS)[number]['value']
