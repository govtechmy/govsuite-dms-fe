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
