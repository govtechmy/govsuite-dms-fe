export const buildYearRange = (oldest: number, newest: number): number[] => {
  if (!Number.isInteger(oldest) || !Number.isInteger(newest) || newest < oldest) {
    return []
  }

  const years: number[] = []
  for (let currentYear = newest; currentYear >= oldest; currentYear -= 1) {
    years.push(currentYear)
  }

  return years
}
