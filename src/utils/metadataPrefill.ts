import type { MetadataField } from '@/services/upload.svc'
import { normalizeMetadataKey } from '@/utils/normalizeMetadataKey'

export type MetadataValueMap = Record<string, string>

export const toMetadataValueMap = (source: unknown): MetadataValueMap => {
  if (!source) {
    return {}
  }

  if (Array.isArray(source)) {
    return source.reduce<MetadataValueMap>((acc, item) => {
      if (!item || typeof item !== 'object') {
        return acc
      }

      const key = (item as { key?: unknown }).key
      if (typeof key !== 'string' || !key.trim()) {
        return acc
      }

      const value = (item as { value?: unknown }).value
      acc[key] = value === null || value === undefined ? '' : String(value)
      return acc
    }, {})
  }

  if (typeof source !== 'object') {
    return {}
  }

  return Object.entries(source as Record<string, unknown>).reduce<MetadataValueMap>(
    (acc, entry) => {
      const [key, value] = entry
      if (!key.trim()) {
        return acc
      }

      acc[key] = value === null || value === undefined ? '' : String(value)
      return acc
    },
    {}
  )
}

export const buildPrefilledMetadataValues = (
  fields: MetadataField[],
  metadataValues: MetadataValueMap
): MetadataValueMap => {
  const normalizedMetadataMap = new Map<string, string>()

  Object.entries(metadataValues).forEach(([key, value]) => {
    normalizedMetadataMap.set(normalizeMetadataKey(key), value)
  })

  return fields.reduce<MetadataValueMap>((acc, field) => {
    acc[field.key] = normalizedMetadataMap.get(normalizeMetadataKey(field.key)) ?? ''
    return acc
  }, {})
}
