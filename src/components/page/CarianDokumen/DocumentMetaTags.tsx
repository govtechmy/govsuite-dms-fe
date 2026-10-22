import {
  CalendarIcon,
  DocumentFilledIcon,
  ExcelIcon,
  FolderIcon,
  GalleryIcon,
  PdfIcon,
  WordIcon,
} from '@govtechmy/myds-react/icon'
import { clx } from '@govtechmy/myds-react/utils'
import normalizeWord from '@/utils/NormalizeWord'

interface DocumentMetaTagsProps {
  documentProfile?: string
  recordDate?: string
  unit?: string
  fileType?: string
  fileExtension?: string
  variant?: 'chip' | 'plain'
}

const VARIANT_CLASS_NAME = {
  chip: 'rounded bg-bg-washed px-1.5 py-0.5 text-[10px] font-semibold leading-none',
  plain: 'text-body-xs',
}

const WORD_EXTENSIONS = ['doc', 'docx']
const EXCEL_EXTENSIONS = ['xls', 'xlsx']
const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg', 'tif', 'tiff']

// Matches on the MIME type first, falling back to the extension when the type is missing
const getFileTypeIcon = (fileType: string, extension: string) => {
  if (fileType === 'application/pdf' || extension === 'pdf') return PdfIcon
  if (
    fileType === 'application/msword' ||
    fileType.includes('wordprocessingml') ||
    WORD_EXTENSIONS.includes(extension)
  ) {
    return WordIcon
  }
  if (
    fileType === 'application/vnd.ms-excel' ||
    fileType.includes('spreadsheetml') ||
    EXCEL_EXTENSIONS.includes(extension)
  ) {
    return ExcelIcon
  }
  if (fileType.startsWith('image/') || IMAGE_EXTENSIONS.includes(extension)) {
    return GalleryIcon
  }
  return DocumentFilledIcon
}

export default function DocumentMetaTags({
  documentProfile,
  recordDate,
  unit,
  fileType = '',
  fileExtension = '',
  variant = 'chip',
}: DocumentMetaTagsProps) {
  const isPlain = variant === 'plain'
  const extension = fileExtension.replace(/^\./, '').toLowerCase()
  const FileTypeIcon = getFileTypeIcon(fileType.toLowerCase(), extension)
  const fileTypeLabel = extension ? extension.toUpperCase() : 'Dokumen'
  const itemClassName = clx(
    'flex shrink-0 items-center gap-1 whitespace-nowrap',
    VARIANT_CLASS_NAME[variant]
  )

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
    <div
      className={clx(
        'flex items-center',
        isPlain ? 'flex-wrap gap-3' : 'min-w-0 flex-nowrap gap-1.5'
      )}
    >
      <span className={clx(itemClassName, isPlain ? 'text-txt-black-500' : 'text-txt-black-700')}>
        <FileTypeIcon className="size-4" aria-hidden="true" />
        {fileTypeLabel}
      </span>
      {documentProfile && (
        <span
          title={normalizeWord(documentProfile)}
          className={clx(itemClassName, 'min-w-0 shrink text-txt-black-700')}
        >
          <span className="truncate">{normalizeWord(documentProfile)}</span>
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
