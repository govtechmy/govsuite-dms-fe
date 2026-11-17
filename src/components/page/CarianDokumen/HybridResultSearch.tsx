import { clx } from '@govtechmy/myds-react/utils'
import { useRef, type UIEvent } from 'react'
import { useSearchStore } from '@/store/SearchStore'
import { getHybridSearchItemKey, type HybridSearchItem } from '@/services/search.svc'
import getRelevanceDotClass from '@/utils/getRelevanceDotClass'
import { formatISODateString } from '@/utils/formatDate'
import DocumentMetaTag from './DocumentMetaTag'

const SCROLL_THRESHOLD = 40

interface HybridResultSearchProps {
  onLazyLoad: () => void
}

export default function HybridResultSearch({ onLazyLoad }: HybridResultSearchProps) {
  const lazyLoadRequestedRef = useRef(false)
  const lastScrollTopRef = useRef(0)
  const hybridRecords = useSearchStore((state) => state.hybridRecords)
  const totalItems = useSearchStore((state) => state.searchMeta?.totalItems ?? 0)
  const selectedDocumentId = useSearchStore((state) => state.selectedDocumentId)
  const selectedHybridKey = useSearchStore((state) => state.selectedHybridKey)
  const setSelectedDocumentId = useSearchStore((state) => state.setSelectedDocumentId)
  const setSelectedHybridKey = useSearchStore((state) => state.setSelectedHybridKey)
  const setSelectedKeywordId = useSearchStore((state) => state.setSelectedKeywordId)
  const fetchDocumentInfo = useSearchStore((state) => state.fetchDocumentInfo)

  const handleRecordSelect = (record: HybridSearchItem) => {
    const recordKey = getHybridSearchItemKey(record)
    if (selectedHybridKey === recordKey) {
      return
    }

    setSelectedHybridKey(recordKey)

    if (selectedDocumentId !== record.record_id) {
      setSelectedDocumentId(record.record_id)
      setSelectedKeywordId(null)
      void fetchDocumentInfo(record.record_id)
    }
  }

  const handleLazyLoadScroll = (event: UIEvent<HTMLUListElement>) => {
    const target = event.currentTarget
    const isScrollingDown = target.scrollTop > lastScrollTopRef.current
    lastScrollTopRef.current = target.scrollTop
    const distanceToBottom = target.scrollHeight - target.scrollTop - target.clientHeight

    if (distanceToBottom > SCROLL_THRESHOLD) {
      lazyLoadRequestedRef.current = false
    }

    if (distanceToBottom <= SCROLL_THRESHOLD && isScrollingDown && !lazyLoadRequestedRef.current) {
      lazyLoadRequestedRef.current = true
      onLazyLoad()
    }
  }

  return (
    <section className="flex h-[560px] w-full flex-col gap-3 lg:h-full lg:min-h-0">
      <h2 className="text-body-md font-semibold text-txt-black-900">
        Hasil Carian ({totalItems} rekod)
      </h2>

      <ul
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1"
        aria-label="Senarai hasil carian"
        onScroll={handleLazyLoadScroll}
      >
        {hybridRecords.map((record) => {
          const recordKey = getHybridSearchItemKey(record)
          const isSelected = selectedHybridKey === recordKey

          return (
            <li key={recordKey}>
              <button
                type="button"
                onClick={() => handleRecordSelect(record)}
                aria-current={isSelected ? 'true' : undefined}
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
                      getRelevanceDotClass(record.relevance_score)
                    )}
                    aria-hidden="true"
                  />
                  <span className="sr-only">Skor relevan</span>
                  {Math.round(record.relevance_score)}%
                </span>
                {record.snippet && (
                  <p className="line-clamp-3 text-body-xs text-txt-black-700">{record.snippet}</p>
                )}
                <p className="line-clamp-2 text-body-sm font-semibold text-txt-primary underline underline-offset-2">
                  {record.title}
                </p>
                <DocumentMetaTag
                  jenisDokumen={record.documentProfileName}
                  tarikh={formatISODateString(record.recordDate)}
                  mukaSurat={record.page_number}
                />
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
