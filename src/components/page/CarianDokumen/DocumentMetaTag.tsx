import { PdfIcon } from '@govtechmy/myds-react/icon'

interface DocumentMetaTagProps {
  jenisDokumen: string
  tarikh: string
}

export default function DocumentMetaTag({ jenisDokumen, tarikh }: DocumentMetaTagProps) {
  return (
    <div className="flex min-w-0 flex-nowrap items-center gap-1.5">
      <span className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded bg-bg-washed h-6 px-1.5 text-[10px] font-semibold leading-none text-txt-black-700">
        <PdfIcon className="size-4" aria-hidden="true" />
        PDF
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
    </div>
  )
}
