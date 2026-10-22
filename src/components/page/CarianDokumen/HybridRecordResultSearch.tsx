import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shared/SelectMydsFix'
import { clx } from '@govtechmy/myds-react/utils'
import { useSearchStore } from '@/store/SearchStore'
import { useEffect, useRef } from 'react'
import CompactPagination from './CompactPagination'
import DocumentMetaTags from './DocumentMetaTags'
import { SEARCH_PAGE_SIZE_OPTIONS, useSearchPage } from './useSearchPage'

// Temporary placeholders until the hybrid search API returns the matched passage and
// relevance score for each record.
const PLACEHOLDER_PASSAGE =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
const PLACEHOLDER_SCORE = 90

const HIGH_RELEVANCE_SCORE = 80

export default function HybridRecordResultSearch() {
  const documentRecords = useSearchStore((state) => state.documentRecords)
  const totalItems = useSearchStore((state) => state.searchMeta?.totalItems ?? 0)
  const selectedDocumentId = useSearchStore((state) => state.selectedDocumentId)
  const selectDocument = useSearchStore((state) => state.selectDocument)
  const { pageNumber, pageSize, goToPage, changePageSize } = useSearchPage()
  const selectedItemRef = useRef<HTMLButtonElement>(null)

  // Keep the selection visible when it is moved from the preview card's record navigation
  useEffect(() => {
    selectedItemRef.current?.scrollIntoView({ block: 'nearest' })
  }, [selectedDocumentId])

  return (
    <div className="flex w-full flex-col gap-3 md:min-h-0 md:flex-1">
      <h2 className="text-body-md font-semibold text-txt-black-900">
        Hasil Carian ({totalItems} rekod)
      </h2>

      <ul
        className="flex max-h-[640px] flex-col gap-3 overflow-y-auto md:max-h-none md:min-h-0 md:flex-1"
        aria-label="Senarai hasil carian"
      >
        {documentRecords.map((record) => {
          const isSelected = selectedDocumentId === record.documentId
          const score = PLACEHOLDER_SCORE
          return (
            <li key={record.documentId}>
              <button
                ref={isSelected ? selectedItemRef : undefined}
                type="button"
                aria-current={isSelected ? 'true' : undefined}
                onClick={() => selectDocument(record.documentId)}
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
                      score >= HIGH_RELEVANCE_SCORE ? 'bg-success-600' : 'bg-warning-600'
                    )}
                    aria-hidden="true"
                  />
                  <span className="sr-only">Skor relevan</span>
                  {score}%
                </span>
                <p className="text-body-sm text-txt-black-700">“{PLACEHOLDER_PASSAGE}”</p>
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

      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="text-body-xs leading-tight text-txt-black-500">
            Baris Setiap Halaman
          </span>
          <Select
            size="small"
            variant="outline"
            value={String(pageSize)}
            onValueChange={(value) => changePageSize(Number(value))}
          >
            <SelectTrigger aria-label="Baris setiap halaman">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEARCH_PAGE_SIZE_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {totalItems > pageSize && (
          <CompactPagination
            page={pageNumber}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={goToPage}
            size="small"
          />
        )}
      </div>
    </div>
  )
}
