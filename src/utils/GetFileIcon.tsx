import { DocumentIcon, ExcelIcon, PdfIcon, WordIcon } from '@govtechmy/myds-react/icon'
import type { ReactElement } from 'react'

export default function getFileIcon(fileType: string): ReactElement {
  const lowerType = fileType.toLowerCase()

  if (lowerType.includes('excel') || lowerType.includes('xlsx') || lowerType.includes('xls')) {
    return <ExcelIcon className="shrink-0 size-[30px]" />
  } else if (lowerType.includes('pdf')) {
    return <PdfIcon className="shrink-0 size-[30px]" />
  } else if (
    lowerType.includes('word') ||
    lowerType.includes('docx') ||
    lowerType.includes('doc')
  ) {
    return <WordIcon className="shrink-0 size-[30px]" />
  }

  return <DocumentIcon className="shrink-0 size-[30px]" />
}
