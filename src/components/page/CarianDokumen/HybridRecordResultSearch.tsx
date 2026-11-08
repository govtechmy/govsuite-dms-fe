import { clx } from '@govtechmy/myds-react/utils'
import DocumentMetaTag from './DocumentMetaTag'
import getRelevanceDotClass from '@/utils/getRelevanceDotClass'
import { formatDateDisplay } from '@/utils/formatDate'
import type { RecordResultListProps } from './searchMode'

interface HybridRecordResultSearchProps extends RecordResultListProps {
  selectedPageNumber: number | null
}

export default function HybridRecordResultSearch({
  records,
  totalItems,
  selectedDocumentId,
  selectedPageNumber,
  onRecordSelect,
}: HybridRecordResultSearchProps) {
  return (
    <section className="flex h-[560px] w-full flex-col gap-3 lg:h-full lg:min-h-0">
      <h2 className="text-body-md font-semibold text-txt-black-900">
        Hasil Carian {totalItems} rekod
      </h2>

      <ul
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1"
        aria-label="Senarai hasil carian"
      >
        {records.map((record) => {
          const isSelected =
            record.recordId === selectedDocumentId && record.pageNumber === selectedPageNumber
          return (
            <li key={`${record.recordId}-${record.pageNumber}`}>
              <button
                type="button"
                onClick={() => onRecordSelect(record)}
                aria-pressed={isSelected}
                className={clx(
                  'relative flex w-full cursor-pointer flex-col gap-2 rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fr-primary',
                  isSelected
                    ? 'border-otl-primary-300 bg-bg-primary-50'
                    : 'border-otl-gray-200 bg-bg-white hover:bg-bg-washed'
                )}
              >
                <span className="flex items-center gap-1.5 self-end text-body-xs font-semibold text-txt-black-900">
                  <span
                    className={clx(
                      'size-2 rounded-full',
                      getRelevanceDotClass(record.relevanceScore ?? 0)
                    )}
                    aria-hidden="true"
                  />
                  <span className="sr-only">Skor relevan</span>
                  {Math.round(record.relevanceScore ?? 0)}%
                </span>
                <p className="line-clamp-3 text-body-xs text-txt-black-700">{record.snippet}</p>
                <p className="line-clamp-2 text-body-sm font-semibold text-txt-primary underline underline-offset-2">
                  {record.title || '-'}
                </p>
                <DocumentMetaTag
                  jenisDokumen={record.documentProfileName || '-'}
                  tarikh={formatDateDisplay(record.recordDate)}
                  fileExtension={record.fileExtension ?? ''}
                  fileType={record.fileType ?? ''}
                />
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
