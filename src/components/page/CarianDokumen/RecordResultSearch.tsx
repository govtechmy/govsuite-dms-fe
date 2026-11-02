import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shared/SelectMydsFix'
import { ChevronRightIcon } from '@govtechmy/myds-react/icon'
import { clx } from '@govtechmy/myds-react/utils'
import { useSearchStore } from '@/store/SearchStore'
import { useRef, type UIEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import DocumentMetaTags from './DocumentMetaTags'

const SCROLL_THRESHOLD = 40
const LAZY_BATCH_SIZE = 10

interface RecordResultSearchProps {
  onLazyLoad: () => void
}

export default function RecordResultSearch({ onLazyLoad }: RecordResultSearchProps) {
  const lazyLoadRequestedRef = useRef(false)
  const lastScrollTopRef = useRef(0)
  const [searchParams, setSearchParams] = useSearchParams()
  const documentRecords = useSearchStore((state) => state.documentRecords)
  const totalItems = useSearchStore((state) => state.searchMeta?.totalItems)
  const selectedDocumentId = useSearchStore((state) => state.selectedDocumentId)
  const sortBy = useSearchStore((state) => state.sort)
  const setSort = useSearchStore((state) => state.setSort)
  const setSelectedDocumentId = useSearchStore((state) => state.setSelectedDocumentId)
  const setSelectedKeywordId = useSearchStore((state) => state.setSelectedKeywordId)
  const fetchDocumentInfo = useSearchStore((state) => state.fetchDocumentInfo)

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set('sort', value)
    } else {
      params.delete('sort')
    }
    params.set('page', '1')
    params.set('limit', String(LAZY_BATCH_SIZE))

    setSort(value)
    setSearchParams(params)
  }

  const handleDocumentSelect = (id: string) => {
    if (selectedDocumentId === id) {
      return
    }

    setSelectedDocumentId(id)
    setSelectedKeywordId(null)
    void fetchDocumentInfo(id)
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
    <div className="flex max-h-[640px] w-full flex-col gap-2 rounded-lg border border-otl-gray-200 bg-bg-dialog p-3 shadow-sm md:max-h-none md:min-h-0 md:flex-1">
      <div className="flex w-full items-center gap-6">
        <p className="flex-1 text-body-sm font-medium text-txt-black-700">
          {totalItems && totalItems > 0 ? `${totalItems} rekod ditemui` : 'Tiada rekod ditemui'}
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
        className="flex min-h-0 flex-1 flex-col overflow-y-auto"
        aria-label="Senarai rekod"
        onScroll={handleLazyLoadScroll}
      >
        {documentRecords.map((record) => {
          const isSelected = selectedDocumentId === record.documentId
          return (
            <li key={record.documentId} className="border-b border-otl-gray-200 last:border-b-0">
              <button
                type="button"
                aria-current={isSelected ? 'true' : undefined}
                onClick={() => handleDocumentSelect(record.documentId)}
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
                  <DocumentMetaTags />
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
      </ul>
    </div>
  )
}
