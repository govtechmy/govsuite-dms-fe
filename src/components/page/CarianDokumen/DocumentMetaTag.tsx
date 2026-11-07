import getFileIcon from '@/utils/GetFileIcon'

interface DocumentMetaTagProps {
  jenisDokumen: string
  tarikh: string
  fileExtension: string
  fileType: string
}

export default function DocumentMetaTag({
  jenisDokumen,
  tarikh,
  fileType,
  fileExtension,
}: DocumentMetaTagProps) {
  return (
    <div className="flex min-w-0 flex-nowrap items-center gap-1.5">
      <span className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded bg-bg-washed px-1.5 py-0.5 text-[10px] font-semibold leading-none text-txt-black-700">
        {getFileIcon({ type: fileType, name: fileExtension }, 'shrink-0 size-4')}
        {fileExtension.toUpperCase() || 'DOKUMEN'}
      </span>
      <span
        title={jenisDokumen}
        className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded bg-bg-washed px-1.5 py-0.5 text-[10px] font-semibold leading-none min-w-0 shrink text-txt-black-700"
      >
        <span className="truncate">{jenisDokumen}</span>
      </span>
      <span className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded bg-bg-washed px-1.5 py-0.5 text-[10px] font-semibold leading-none text-txt-black-500">
        {tarikh}
      </span>
    </div>
  )
}
