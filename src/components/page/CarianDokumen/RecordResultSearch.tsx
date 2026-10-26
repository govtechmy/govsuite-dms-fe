import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shared/SelectMydsFix'
import { Button } from '@govtechmy/myds-react/button'
import { ChevronRightIcon } from '@govtechmy/myds-react/icon'
import { clx } from '@govtechmy/myds-react/utils'
import { useSearchStore } from '@/store/SearchStore'
import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import DocumentMetaTags from './DocumentMetaTags'
import { useSearchPage } from './useSearchPage'

export default function RecordResultSearch() {
  const [searchParams, setSearchParams] = useSearchParams()
  const documentRecords = useSearchStore((state) => state.documentRecords)
  const totalItems = useSearchStore((state) => state.searchMeta?.totalItems ?? 0)
  const hasNextPage = useSearchStore((state) => state.searchMeta?.hasNextPage ?? false)
  const isLoadingMoreRecords = useSearchStore((state) => state.isLoadingMoreRecords)
  const loadMoreRecordsFailed = useSearchStore((state) => state.loadMoreRecordsFailed)
  const loadMoreDocumentRecords = useSearchStore((state) => state.loadMoreDocumentRecords)
  const { pageSize } = useSearchPage()
  const selectedDocumentId = useSearchStore((state) => state.selectedDocumentId)
  const sortBy = useSearchStore((state) => state.sort)
  const setSort = useSearchStore((state) => state.setSort)
  const selectDocument = useSearchStore((state) => state.selectDocument)
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
          void loadMoreDocumentRecords()
        }
      },
      { root: listRef.current, rootMargin: '0px 0px 200px 0px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [canLoadMore, loadMoreDocumentRecords])

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set('sort', value)
    } else {
      params.delete('sort')
    }
    params.set('page', '1')
    params.set('limit', String(pageSize))

    setSort(value)
    setSearchParams(params)
  }

  return (
    <div className="flex max-h-[640px] w-full flex-col gap-2 rounded-lg border border-otl-gray-200 bg-bg-dialog p-3 shadow-sm md:max-h-none md:min-h-0 md:flex-1">
      <div className="flex w-full items-center gap-6">
        <p className="flex-1 text-body-sm font-medium text-txt-black-700">
          {totalItems > 0 ? `${totalItems} rekod ditemui` : 'Tiada rekod ditemui'}
        </p>
        <Select size="small" variant="outline" value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger>
            <SelectValue placeholder="Terkini" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Terkini</SelectItem>
            <SelectItem value="asc">Terdahulu</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ul
        ref={listRef}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto"
        aria-label="Senarai rekod"
        aria-busy={isLoadingMoreRecords}
      >
        {documentRecords.map((record) => {
          const isSelected = selectedDocumentId === record.documentId
          return (
            <li key={record.documentId} className="border-b border-otl-gray-200 last:border-b-0">
              <button
                type="button"
                aria-current={isSelected ? 'true' : undefined}
                onClick={() => selectDocument(record.documentId)}
                className={clx(
                  'flex w-full items-center gap-2 border-l-2 px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-primary',
                  isSelected
                    ? 'rounded-r-lg border-l-primary-600 bg-bg-primary-50'
                    : 'border-l-transparent hover:bg-bg-washed'
                )}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p
                    title={record.title}
                    className={clx(
                      'line-clamp-1 break-words text-body-sm font-medium',
                      isSelected ? 'text-txt-primary' : 'text-txt-black-900'
                    )}
                  >
                    {record.title}
                  </p>
                  <DocumentMetaTags
                    documentProfile={record.documentProfile}
                    recordDate={record.recordDate}
                    fileType={record.fileType}
                    fileExtension={record.fileExtension}
                  />
                </div>
                {isSelected && (
                  <ChevronRightIcon
                    className="size-5 shrink-0 text-txt-black-700"
                    aria-hidden="true"
                  />
                )}
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
                  onClick={() => void loadMoreDocumentRecords()}
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
