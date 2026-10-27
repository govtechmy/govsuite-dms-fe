import { Button } from '@govtechmy/myds-react/button'
import { clx } from '@govtechmy/myds-react/utils'
import { useSearchStore } from '@/store/SearchStore'
import { useEffect, useRef } from 'react'
import DocumentMetaTags from './DocumentMetaTags'

// Relevance dot colour: 0–50 red, 51–69 yellow, 70–100 green
const HIGH_RELEVANCE_SCORE = 70
const LOW_RELEVANCE_SCORE = 50

const getRelevanceDotClass = (score: number) =>
  score >= HIGH_RELEVANCE_SCORE
    ? 'bg-success-600'
    : score >= LOW_RELEVANCE_SCORE
      ? 'bg-warning-600'
      : 'bg-danger-600'

export default function HybridRecordResultSearch() {
  const documentRecords = useSearchStore((state) => state.documentRecords)
  const totalItems = useSearchStore((state) => state.searchMeta?.totalItems ?? 0)
  const hasNextPage = useSearchStore((state) => state.searchMeta?.hasNextPage ?? false)
  const isLoadingMoreRecords = useSearchStore((state) => state.isLoadingMoreRecords)
  const loadMoreRecordsFailed = useSearchStore((state) => state.loadMoreRecordsFailed)
  const loadMoreDocumentRecords = useSearchStore((state) => state.loadMoreDocumentRecords)
  const selectedResultIndex = useSearchStore((state) => state.selectedResultIndex)
  const selectDocument = useSearchStore((state) => state.selectDocument)
  const selectedItemRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const loadMoreSentinelRef = useRef<HTMLLIElement>(null)

  const canLoadMore = hasNextPage && !isLoadingMoreRecords && !loadMoreRecordsFailed

  // Load the next page when the end of the list scrolls near the bottom of the list
  useEffect(() => {
    const sentinel = loadMoreSentinelRef.current
    if (!sentinel || !canLoadMore) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void loadMoreDocumentRecords(true)
        }
      },
      { root: listRef.current, rootMargin: '0px 0px 200px 0px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [canLoadMore, loadMoreDocumentRecords])

  // Keep the selection visible when it is moved from the preview card's record navigation
  useEffect(() => {
    selectedItemRef.current?.scrollIntoView({ block: 'nearest' })
  }, [selectedResultIndex])

  return (
    <div className="flex w-full flex-col gap-3 md:min-h-0 md:flex-1">
      <h2 className="text-body-md font-semibold text-txt-black-900">
        Hasil Carian ({totalItems} rekod)
      </h2>

      <ul
        ref={listRef}
        className="flex max-h-[640px] flex-col gap-3 overflow-y-auto md:max-h-none md:min-h-0 md:flex-1"
        aria-label="Senarai hasil carian"
        aria-busy={isLoadingMoreRecords}
      >
        {documentRecords.map((record, index) => {
          const isSelected = selectedResultIndex === index
          const score = record.relevancePercent ?? 0
          return (
            // Hybrid results are per matched page, so a record can appear more than once
            <li key={`${record.documentId}-${record.pageNumber}`}>
              <button
                ref={isSelected ? selectedItemRef : undefined}
                type="button"
                aria-current={isSelected ? 'true' : undefined}
                onClick={() => selectDocument(record.documentId, index)}
                className={clx(
                  'relative flex w-full flex-col gap-2 rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-primary',
                  isSelected
                    ? 'border-otl-primary-300 bg-bg-primary-50 shadow-sm'
                    : 'border-otl-gray-200 bg-bg-white hover:bg-bg-washed'
                )}
              >
                <span className="flex items-center gap-1.5 self-end text-body-xs font-semibold text-txt-black-900">
                  <span
                    className={clx('size-2 rounded-full', getRelevanceDotClass(score))}
                    aria-hidden="true"
                  />
                  <span className="sr-only">Skor relevan</span>
                  {score}%
                </span>
                {record.snippet && (
                  <p className="text-body-xs font-normal text-txt-black-700">“{record.snippet}”</p>
                )}
                <p className="text-body-sm font-semibold text-txt-primary underline underline-offset-2">
                  {record.title}
                </p>
                <DocumentMetaTags
                  documentProfile={record.documentProfile}
                  recordDate={record.recordDate}
                  fileType={record.fileType}
                  fileExtension={record.fileExtension}
                />
              </button>
            </li>
          )
        })}
        {hasNextPage && (
          <li
            ref={loadMoreSentinelRef}
            role={loadMoreRecordsFailed ? 'alert' : 'status'}
            className="flex flex-col items-center gap-2 py-4 text-center text-body-sm text-txt-black-500"
          >
            {loadMoreRecordsFailed ? (
              <>
                <span>Rekod seterusnya gagal dimuatkan.</span>
                <Button
                  variant="default-outline"
                  size="small"
                  onClick={() => void loadMoreDocumentRecords(true)}
                >
                  Cuba Lagi
                </Button>
              </>
            ) : (
              'Memuatkan rekod seterusnya...'
            )}
          </li>
        )}
      </ul>
    </div>
  )
}
