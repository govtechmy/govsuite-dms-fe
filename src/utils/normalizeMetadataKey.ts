export const normalizeMetadataKey = (value: string): string =>
  value.trim().replace(/\s+/g, '').toUpperCase()
