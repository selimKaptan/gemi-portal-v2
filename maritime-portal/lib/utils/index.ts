import type { DemandStatus, PriorityLevel } from '@/types'

/**
 * Serializes data through JSON to eliminate non-serializable values
 * (Date objects, undefined, etc.) for safe hydration in Client Components.
 */
export function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data))
}

/**
 * Merges class names, filtering out falsy values.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Formats a date string into a readable Turkish locale string.
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Formats a date-time string into a readable Turkish locale string.
 */
export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Returns the CSS badge class for a demand status.
 */
export function getStatusBadgeClass(status: DemandStatus): string {
  const map: Record<DemandStatus, string> = {
    pending:   'badge-status badge-pending',
    reviewing: 'badge-status badge-reviewing',
    approved:  'badge-status badge-approved',
    rejected:  'badge-status badge-rejected',
    completed: 'badge-status badge-completed',
    cancelled: 'badge-status badge-cancelled',
    expired:   'badge-status badge-expired',
  }
  return map[status] ?? 'badge-status badge-pending'
}

/**
 * Returns the Turkish label for a demand status.
 */
export function getStatusLabel(status: DemandStatus): string {
  const map: Record<DemandStatus, string> = {
    pending:   'Beklemede',
    reviewing: 'Teklif Verildi',
    approved:  'Onaylı',
    rejected:  'Reddedildi',
    completed: 'Tamamlandı',
    cancelled: 'İptal',
    expired:   'Süresi Doldu',
  }
  return map[status] ?? status
}

/**
 * Returns remaining time string from an ISO date, or null if expired/no deadline.
 */
export function formatTimeRemaining(expiresAt: string | null | undefined): string | null {
  if (!expiresAt) return null
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return null
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  if (h > 0) return `${h}s ${m}d kaldı`
  if (m > 0) return `${m}d kaldı`
  return '< 1d kaldı'
}

/**
 * Returns the CSS badge class for a priority level.
 */
export function getPriorityBadgeClass(priority: PriorityLevel): string {
  const map: Record<PriorityLevel, string> = {
    low:    'badge-status badge-low',
    normal: 'badge-status badge-normal',
    high:   'badge-status badge-high',
    urgent: 'badge-status badge-urgent',
  }
  return map[priority] ?? 'badge-status badge-normal'
}

/**
 * Returns the Turkish label for a priority level.
 */
export function getPriorityLabel(priority: PriorityLevel): string {
  const map: Record<PriorityLevel, string> = {
    low:    'Düşük',
    normal: 'Normal',
    high:   'Yüksek',
    urgent: 'Acil',
  }
  return map[priority] ?? priority
}

/**
 * Truncates a string to a given max length, appending "…".
 */
export function truncate(str: string, max = 60): string {
  if (str.length <= max) return str
  return str.slice(0, max) + '…'
}

/**
 * Formats a numeric tonnage value.
 */
export function formatTonnage(value: number | null | undefined): string {
  if (value == null) return '—'
  return value.toLocaleString('tr-TR')
}
