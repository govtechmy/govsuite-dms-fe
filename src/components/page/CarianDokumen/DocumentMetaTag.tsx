import { DocumentIcon, ExcelIcon, PdfIcon, WordIcon } from '@govtechmy/myds-react/icon'

interface DocumentMetaTagProps {
  fileExtension: string
  jenisDokumen: string
  tarikh: string
  mukaSurat?: number
}

const FILE_TYPE_ICONS: Record<string, typeof PdfIcon> = {
  pdf: PdfIcon,
  doc: WordIcon,
  docx: WordIcon,
  xls: ExcelIcon,
  xlsx: ExcelIcon,
}

export default function DocumentMetaTag({
  fileExtension,
  jenisDokumen,
  tarikh,
  mukaSurat,
}: DocumentMetaTagProps) {
  const normalizedExtension = fileExtension.trim().replace(/^\./, '').toLowerCase()
  const FileTypeIcon = FILE_TYPE_ICONS[normalizedExtension] ?? DocumentIcon

  return (
    <div className="flex min-w-0 flex-nowrap items-center gap-1.5">
      <span className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded bg-bg-washed h-6 px-1.5 text-[10px] font-semibold leading-none text-txt-black-700">
        <FileTypeIcon className="size-4" aria-hidden="true" />
        {normalizedExtension.toUpperCase()}
      </span>
      <span
        title={jenisDokumen}
        className="flex items-center gap-1 whitespace-nowrap rounded bg-bg-washed h-6 px-1.5 py-0.5 text-[10px] font-semibold leading-none min-w-0 shrink text-txt-black-700"
      >
        <span className="truncate">{jenisDokumen}</span>
      </span>
      <span className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded bg-bg-washed h-6 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-txt-black-500">
        {tarikh}
      </span>
      {mukaSurat !== undefined && (
        <span className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded bg-bg-washed h-6 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-txt-black-500">
          Muka Surat {mukaSurat}
        </span>
      )}
    </div>
  )
}
