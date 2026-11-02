import { clx } from '@govtechmy/myds-react/utils'
import { useEffect, useRef } from 'react'
import DocumentMetaTags from './DocumentMetaTags'

export interface HybridSearchRecord {
  documentId: string
  title: string
  pageNumber: number
  snippet: string
  relevancePercent: number
  documentProfile: string
  recordDate: string
  unit: string
  fileType: string
  fileExtension: string
}

interface HybridRecordResultSearchProps {
  records: HybridSearchRecord[]
  selectedIndex: number
  onSelect: (index: number) => void
}

// Relevance dot colour: 0–49 red, 50–69 yellow, 70–100 green
const HIGH_RELEVANCE_SCORE = 70
const LOW_RELEVANCE_SCORE = 50

const getRelevanceDotClass = (score: number) =>
  score >= HIGH_RELEVANCE_SCORE
    ? 'bg-success-600'
    : score >= LOW_RELEVANCE_SCORE
      ? 'bg-warning-600'
      : 'bg-danger-600'

export default function HybridRecordResultSearch({
  records,
  selectedIndex,
  onSelect,
}: HybridRecordResultSearchProps) {
  const selectedItemRef = useRef<HTMLButtonElement>(null)

  // Keep the selection visible when it is moved from the preview card's record navigation
  useEffect(() => {
    selectedItemRef.current?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  return (
    <div className="flex w-full flex-col gap-3 md:min-h-0 md:flex-1">
      <h2 className="text-body-md font-semibold text-txt-black-900">
        Hasil Carian ({records.length} rekod)
      </h2>

      <ul
        className="flex max-h-[640px] flex-col gap-3 overflow-y-auto md:max-h-none md:min-h-0 md:flex-1"
        aria-label="Senarai hasil carian"
      >
        {records.map((record, index) => {
          const isSelected = selectedIndex === index
          return (
            // Hybrid results are per matched page, so a record can appear more than once
            <li key={`${record.documentId}-${record.pageNumber}`}>
              <button
                ref={isSelected ? selectedItemRef : undefined}
                type="button"
                aria-current={isSelected ? 'true' : undefined}
                onClick={() => onSelect(index)}
                className={clx(
                  'relative flex w-full flex-col gap-2 rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-primary',
                  isSelected
                    ? 'border-otl-primary-300 bg-bg-primary-50 shadow-sm'
                    : 'border-otl-gray-200 bg-bg-white hover:bg-bg-washed'
                )}
              >
                <span className="flex items-center gap-1.5 self-end text-body-xs font-semibold text-txt-black-900">
                  <span
                    className={clx(
                      'size-2 rounded-full',
                      getRelevanceDotClass(record.relevancePercent)
                    )}
                    aria-hidden="true"
                  />
                  <span className="sr-only">Skor relevan</span>
                  {record.relevancePercent}%
                </span>
                <p className="text-body-xs font-normal text-txt-black-700">“{record.snippet}”</p>
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
      </ul>
    </div>
  )
}
