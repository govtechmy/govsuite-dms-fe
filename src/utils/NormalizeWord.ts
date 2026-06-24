export default function normalizeWord(value?: string | null): string {
  if (!value) return ''

  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}
