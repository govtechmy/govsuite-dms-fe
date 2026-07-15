/**
 * Converts an ISO date string to date components (month, day, year)
 * @param dateString - ISO date string or any date parseable by Date constructor
 * @returns Array with [dayOfWeek, month, day, year] from toDateString().split(' ')
 */
export const formatISODate = (dateString: string): string[] => {
  const _date = (dateString ? new Date(dateString) : new Date()).toDateString().split(' ')
  return _date
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

/**
 * Parses a YYYY-MM-DD date string to a Date object.
 * Returns undefined if the input is invalid.
 */
export const parseDateValue = (value: string): Date | undefined => {
  if (!value) return undefined
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return undefined
  const parsed = new Date(year, month - 1, day)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
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
