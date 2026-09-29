/**
 * Normalize allowedFormats into lowercase extensions without dot (e.g. ['pdf', 'docx']).
 * Accepts either plain strings or { key, title, value } objects (only enabled ones are kept).
 */
const normalizeAllowedFormats = (formats: unknown): string[] => {
  if (!Array.isArray(formats)) {
    return []
  }

  const extensions = formats
    .map((item) => {
      if (typeof item === 'string') {
        return item
      }
      if (item && typeof item === 'object') {
        const format = item as { key?: unknown; title?: unknown; value?: unknown }
        if (format.value === false) {
          return ''
        }
        return String(format.key ?? format.title ?? '')
      }
      return ''
    })
    .map((value) => value.trim().toLowerCase().replace(/^\./, ''))
    .filter(Boolean)

  return Array.from(new Set(extensions))
}

export default normalizeAllowedFormats
