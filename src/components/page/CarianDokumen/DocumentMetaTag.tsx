import { PdfIcon } from '@govtechmy/myds-react/icon'
import { clx } from '@govtechmy/myds-react/utils'

interface DocumentMetaTagProps {
  jenisDokumen: string
  tarikh: string
}

const ITEM_CLASS_NAME =
  'flex shrink-0 items-center gap-1 whitespace-nowrap rounded bg-bg-washed px-1.5 py-0.5 text-[10px] font-semibold leading-none'

export default function DocumentMetaTag({ jenisDokumen, tarikh }: DocumentMetaTagProps) {
  return (
    <div className="flex min-w-0 flex-nowrap items-center gap-1.5">
      <span className={clx(ITEM_CLASS_NAME, 'text-txt-black-700')}>
        <PdfIcon className="size-4" aria-hidden="true" />
        PDF
      </span>
      <span
        title={jenisDokumen}
        className={clx(ITEM_CLASS_NAME, 'min-w-0 shrink text-txt-black-700')}
      >
        <span className="truncate">{jenisDokumen}</span>
      </span>
      <span className={clx(ITEM_CLASS_NAME, 'text-txt-black-500')}>{tarikh}</span>
    </div>
  )
}
