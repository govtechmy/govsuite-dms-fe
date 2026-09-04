export interface FormattedDateParts {
  weekday: string
  day: string
  month: string
  year: string
}

/**
 * Converts an ISO date string to date components (weekday, day, month, year).
 * @param dateString - ISO date string or any date parseable by Date constructor
 * @param lang - Locale-aware language: 'en' -> 'en-GB', 'ms' -> 'ms-MY'. Defaults to 'en'.
 * @returns Named date parts, not a positional array, since part ordering differs between locales
 */
export const formatISODate = (dateString: string, lang: 'en' | 'ms' = 'en'): FormattedDateParts => {
  const date = dateString ? new Date(dateString) : new Date()
  const locale = lang === 'ms' ? 'ms-MY' : 'en-GB'
  const parts = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).formatToParts(date)

  const month = parts.find((part) => part.type === 'month')?.value ?? ''

  // just for OGOS we chaange it to OGOS, not OGO
  const normalizedMonth = lang === 'ms' && month === 'Ogo' ? 'Ogos' : month

  return {
    weekday: parts.find((part) => part.type === 'weekday')?.value ?? '',
    day: parts.find((part) => part.type === 'day')?.value ?? '',
    month: normalizedMonth,
    year: parts.find((part) => part.type === 'year')?.value ?? '',
  }
}

/**
 * Converts an ISO date string to a readable date string (DD Mon YYYY).
 * Returns an empty string when the input cannot be parsed.
 */
export const formatISODateString = (dateString: string): string => {
  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Converts a dd-mm-yy or dd-mm-yyyy date string to ISO format.
 * Returns null when the input is invalid.
 */
export const convertDdMmYyToIso = (value: string): string | null => {
  const [dayString, monthString, yearString] = value.split('-')
  const day = Number(dayString)
  const month = Number(monthString)
  const parsedYear = Number(yearString)

  if (!day || !month || !parsedYear) {
    return null
  }

  const year = yearString.length === 2 ? 2000 + parsedYear : parsedYear
  const parsed = new Date(Date.UTC(year, month - 1, day))

  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null
  }

  return parsed.toISOString()
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

/**
 * Parses a YYYY-MM-DD date string to a Date object.
 * Returns undefined if the input is invalid.
 */
export const parseDateValue = (value: string): Date | undefined => {
  if (!value || !ISO_DATE_PATTERN.test(value)) return undefined
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return undefined
  const parsed = new Date(year, month - 1, day)
  if (Number.isNaN(parsed.getTime())) return undefined
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return undefined
  }
  return parsed
}

/**
 * Validates whether a string is a strict ISO date in YYYY-MM-DD format.
 */
export const isValidIsoDate = (value: string): boolean => {
  if (!ISO_DATE_PATTERN.test(value)) {
    return false
  }

  return parseDateValue(value) !== undefined
}

/**
 * Formats a Date object to YYYY-MM-DD format.
 */
export const formatDateValue = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Parses a DD-MM-YYYY date string to a Date object.
 * Returns undefined if the input is invalid.
 */
export const parseDocumentDateValue = (value: string): Date | undefined => {
  if (!value) return undefined
  const [day, month, year] = value.split('-').map(Number)
  if (!day || !month || !year) return undefined
  const parsed = new Date(year, month - 1, day)
  if (Number.isNaN(parsed.getTime())) return undefined
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return undefined
  }
  return parsed
}

/**
 * Formats a Date object to DD-MM-YYYY format.
 */
export const formatDocumentDateValue = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

/**
 * Formats an ISO date-time string for read-only display as "dd/mm/yyyy, HH:mm hrs"
 * (24-hour clock, local time). Returns '-' when the input is missing or invalid.
 */
export const formatDateTimeDisplay = (value?: string): string => {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${day}/${month}/${year}, ${hours}:${minutes}`
}

/**
 * Formats an ISO date-time string for read-only display as "dd/mm/yyyy, hh:mm AM/PM"
 * (12-hour clock, UTC time). Returns '-' when the input is missing or invalid.
 */
export const formatDateTimeUpdatedDisplay = (value?: string): string => {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  const day = String(date.getUTCDate()).padStart(2, '0')
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const year = date.getUTCFullYear()
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')

  const period = date.getUTCHours() >= 12 ? 'PM' : 'AM'
  const hours12 = date.getUTCHours() % 12 || 12
  const hours = String(hours12).padStart(2, '0')

  return `${day}/${month}/${year}, ${hours}:${minutes} ${period}`
}
