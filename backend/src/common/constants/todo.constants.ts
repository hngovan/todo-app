/**
 * Shared constants and types for the Todos domain.
 * Import from here — never inline these values in DTOs, entities, or controllers.
 */

// ── Priority ──────────────────────────────────────────────────────────────────

/** Use this object with @IsEnum(Priority) in class-validator */
export const Priority = {
  Low: 'low',
  Medium: 'medium',
  High: 'high'
} as const

/** String union type for Priority values */
export type Priority = (typeof Priority)[keyof typeof Priority]

/** Numeric weight for in-memory priority sorting (lower = higher priority). */
export const PRIORITY_ORDER: Record<Priority, number> = {
  [Priority.High]: 1,
  [Priority.Medium]: 2,
  [Priority.Low]: 3
}

// ── Filter ────────────────────────────────────────────────────────────────────

export const TodoFilter = {
  All: 'all',
  Active: 'active',
  Completed: 'completed'
} as const

export type TodoFilter = (typeof TodoFilter)[keyof typeof TodoFilter]

// ── Sort ──────────────────────────────────────────────────────────────────────

export const TodoSort = {
  CreatedAtDesc: 'createdAt_desc',
  CreatedAtAsc: 'createdAt_asc',
  PriorityDesc: 'priority_desc',
  PriorityAsc: 'priority_asc'
} as const

export type TodoSort = (typeof TodoSort)[keyof typeof TodoSort]

// ── File upload constraints ────────────────────────────────────────────────────

export const TODO_CONSTRAINTS = {
  /** Maximum number of attachments (images + files) per upload request */
  MAX_ATTACHMENTS: 5,
  /** Maximum file size per attachment: 10 MB */
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  /** Maximum title length */
  MAX_TITLE_LENGTH: 255
} as const

/** MIME types accepted for todo attachments */
export const ALLOWED_MIME_TYPES = [
  // Images — all common formats including AVIF
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
  'image/svg+xml',
  'image/bmp',
  'image/tiff',
  // Documents
  'application/pdf',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
] as const
