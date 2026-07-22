import { z } from 'zod'
import type { MetadataField } from '@/services/upload.svc'
import { isValidIsoDate } from '@/utils/formatDate'
import { normalizeMetadataKey } from '@/utils/normalizeMetadataKey'

type MetadataValues = Record<string, string>

export interface CreateUploadFormSchemaOptions {
  requiredFields: MetadataField[]
  additionalFields: MetadataField[]
  enforceRequired: boolean
  hasTitleFallback: boolean
}

export interface UploadFormValues {
  selectedAccessLevel: string
  ringkasan: string
  savedRecordDate: string
  requiredMetadataValues: MetadataValues
  additionalMetadataValues: MetadataValues
}

export const buildMetadataDefaultValues = (
  fields: MetadataField[],
  values: MetadataValues
): MetadataValues => {
  return fields.reduce<MetadataValues>((acc, field) => {
    acc[field.key] = values[field.key] ?? ''
    return acc
  }, {})
}

const createMetadataSchema = (
  fields: MetadataField[],
  enforceRequired: boolean
): z.ZodType<MetadataValues, MetadataValues> => {
  return z.record(z.string(), z.string().trim()).superRefine((value, ctx) => {
    fields.forEach((field) => {
      const fieldValue = (value[field.key] ?? '').trim()

      if (!fieldValue && enforceRequired && field.required) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field.key],
          message: `${field.title} diperlukan`,
        })
        return
      }

      if (field.type === 'date' && fieldValue && !isValidIsoDate(fieldValue)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field.key],
          message: `${field.title} tidak sah`,
        })
      }
    })
  }) as z.ZodType<MetadataValues, MetadataValues>
}

export const createUploadFormSchema = ({
  requiredFields,
  additionalFields,
  enforceRequired,
  hasTitleFallback,
}: CreateUploadFormSchemaOptions): z.ZodType<UploadFormValues, UploadFormValues> => {
  const requiredMetadataSchema = createMetadataSchema(requiredFields, enforceRequired)
  const additionalMetadataSchema = createMetadataSchema(additionalFields, enforceRequired)

  const schema = z.object({
    selectedAccessLevel: enforceRequired
      ? z.string().trim().min(1, 'Tahap Keselamatan diperlukan')
      : z.string().trim(),
    ringkasan: z.string().trim(),
    savedRecordDate: z
      .string()
      .trim()
      .min(1, 'Tarikh Dokumen diperlukan')
      .refine((value) => isValidIsoDate(value), 'Tarikh Dokumen tidak sah'),
    requiredMetadataValues: requiredMetadataSchema,
    additionalMetadataValues: additionalMetadataSchema,
  })

  const tajukField = requiredFields.find((field) => normalizeMetadataKey(field.key) === 'TAJUK')

  if (!tajukField || hasTitleFallback) {
    return schema as z.ZodType<UploadFormValues, UploadFormValues>
  }

  return schema.superRefine((value, ctx) => {
    const tajukValue = value.requiredMetadataValues[tajukField.key]?.trim() ?? ''

    if (!tajukValue && enforceRequired) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['requiredMetadataValues', tajukField.key],
        message: `${tajukField.title} diperlukan`,
      })
    }
  }) as z.ZodType<UploadFormValues, UploadFormValues>
}
