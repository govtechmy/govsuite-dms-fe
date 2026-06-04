import { DocumentIcon, ExcelIcon, PdfIcon, WordIcon } from '@govtechmy/myds-react/icon'
import type { ReactElement } from 'react'
import type { UnifiedUploadFileProps } from '@/store/UploadStore'

export default function getFileIcon(file: UnifiedUploadFileProps | null): ReactElement {
  const lowerType = [
    file?.type,
    file?.name,
    file?.body?.fileType,
    file?.body?.originalFileName,
    file?.body?.fileExtension,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (
    lowerType.includes('excel') ||
    lowerType.includes('spreadsheet') ||
    lowerType.includes('xlsx') ||
    lowerType.includes('xls')
  ) {
    return <ExcelIcon className="shrink-0 size-[30px]" />
  } else if (lowerType.includes('pdf')) {
    return <PdfIcon className="shrink-0 size-[30px]" />
  } else if (
    lowerType.includes('word') ||
    lowerType.includes('wordprocessingml') ||
    lowerType.includes('docx') ||
    lowerType.includes('doc')
  ) {
    return <WordIcon className="shrink-0 size-[30px]" />
  }

  return <DocumentIcon className="shrink-0 size-[30px]" />
}
