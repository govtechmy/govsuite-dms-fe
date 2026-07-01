const NO_INFO = 'TIADA INFO'

const toTitleCaseWords = (value: string): string => {
  return value.toLowerCase().replace(/\b([a-z])/g, (char) => char.toUpperCase())
}

export default function formatRejectReason(reason?: unknown): string {
  const stringifiedReason = JSON.stringify(reason)

  if (!stringifiedReason) {
    return NO_INFO
  }

  const withoutBraces = stringifiedReason.replace(/[{}]/g, '')
  const withSpaceFromUnderscore = withoutBraces.replace(/_/g, ' ')
  const titleCased = toTitleCaseWords(withSpaceFromUnderscore)
  const withoutStringQuotes = titleCased.replace(/"/g, '')
  const withoutBooleanFlags = withoutStringQuotes.replace(/:\s*(true|false)\b/gi, '')
  const normalized = withoutBooleanFlags.replace(/\s+/g, ' ').trim()

  return normalized || NO_INFO
}
