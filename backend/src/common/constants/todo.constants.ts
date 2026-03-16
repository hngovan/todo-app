/**
 * Shared constants and types for the Todos domain.
 * Import from here — never inline these values in DTOs, entities, or controllers.
 */

// ── Priority ──────────────────────────────────────────────────────────────────

/** Priority is a number from 1 (highest) to 10 (lowest). */
export type Priority = number

/** Min and max priority values */
export const PRIORITY_MIN = 1
export const PRIORITY_MAX = 10
export const PRIORITY_DEFAULT = 5

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
  PriorityAsc: 'priority_asc',
  DueDateDesc: 'dueDate_desc',
  DueDateAsc: 'dueDate_asc'
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
