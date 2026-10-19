import { CalendarIcon, FolderIcon, PdfIcon } from '@govtechmy/myds-react/icon'
import { clx } from '@govtechmy/myds-react/utils'
import normalizeWord from '@/utils/NormalizeWord'

interface DocumentMetaTagsProps {
  documentProfile?: string
  recordDate?: string
  unit?: string
  variant?: 'chip' | 'plain'
}

const VARIANT_CLASS_NAME = {
  chip: 'rounded bg-bg-washed px-1.5 py-0.5 font-medium',
  plain: '',
}

export default function DocumentMetaTags({
  documentProfile,
  recordDate,
  unit,
  variant = 'chip',
}: DocumentMetaTagsProps) {
  const isPlain = variant === 'plain'
  const itemClassName = clx('flex items-center gap-1 text-body-xs', VARIANT_CLASS_NAME[variant])

  const parsedRecordDate = recordDate ? new Date(recordDate) : null
  const formattedRecordDate =
    parsedRecordDate && !Number.isNaN(parsedRecordDate.getTime())
      ? parsedRecordDate.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : ''

  return (
    <div className={clx('flex flex-wrap items-center', isPlain ? 'gap-3' : 'gap-1.5')}>
      <span className={clx(itemClassName, isPlain ? 'text-txt-black-500' : 'text-txt-black-700')}>
        <PdfIcon className="size-4" aria-hidden="true" />
        PDF
      </span>
      {documentProfile && (
        <span className={clx(itemClassName, 'text-txt-black-700')}>
          {normalizeWord(documentProfile)}
        </span>
      )}
      {formattedRecordDate && (
        <time dateTime={recordDate} className={clx(itemClassName, 'text-txt-black-500')}>
          {isPlain && <CalendarIcon className="size-4 text-txt-black-900" aria-hidden="true" />}
          {formattedRecordDate}
        </time>
      )}
      {unit && (
        <span className={clx(itemClassName, 'text-txt-black-500')}>
          {isPlain && <FolderIcon className="size-4 text-txt-black-900" aria-hidden="true" />}
          {unit}
        </span>
      )}
    </div>
  )
}
