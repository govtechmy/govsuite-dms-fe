import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shared/SelectMydsFix'
import { clx } from '@govtechmy/myds-react/utils'
import { ChevronRightIcon } from '@govtechmy/myds-react/icon'
import { useSearchStore } from '@/store/SearchStore'
import { useRef, type UIEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import DocumentMetaTag from './DocumentMetaTag'

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

  const handleLazyLoadScroll = (event: UIEvent<HTMLDivElement>) => {
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
    <section className="flex w-full flex-col gap-3 lg:w-[334px] lg:shrink-0">
      <div className="flex w-full flex-col gap-3 lg:min-h-0 lg:flex-1">
        <div className="flex w-full items-center justify-center gap-6">
          <p className="flex-1 text-body-md font-semibold text-txt-black-900">
            {totalItems && totalItems > 0 ? `${totalItems} Rekod Ditemui` : 'Tiada '}
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

        {/* Documents List */}
        <div className="flex h-[250px] w-full flex-col overflow-hidden rounded-xl border border-otl-gray-200 bg-bg-white px-4 py-2.5">
          <div className="min-h-0 flex-1 overflow-y-auto" onScroll={handleLazyLoadScroll}>
            {documentRecords.map((record) => {
              const isSelected = selectedDocumentId === record.documentId

              return (
                <button
                  key={record.documentId}
                  type="button"
                  onClick={() => handleDocumentSelect(record.documentId)}
                  aria-current={isSelected ? 'true' : undefined}
                  className={clx(
                    'flex w-full cursor-pointer items-center gap-2 border-b border-l-4 border-b-otl-gray-200 px-4 py-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fr-primary',
                    isSelected
                      ? 'rounded-md border-b-transparent border-l-primary-600 bg-bg-primary-50'
                      : 'border-l-transparent hover:bg-bg-washed'
                  )}
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <p className="line-clamp-2 text-body-xs font-semibold text-txt-primary">
                      {record.title}
                    </p>
                    <DocumentMetaTag jenisDokumen="PlaceholderDokumen" tarikh="11/01/00" />
                  </div>
                  {isSelected && (
                    <ChevronRightIcon className="size-5 shrink-0 text-txt-black-700" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
