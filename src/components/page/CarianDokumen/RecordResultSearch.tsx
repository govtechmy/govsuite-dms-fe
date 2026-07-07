import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shared/SelectMydsFix'
import { clx } from '@govtechmy/myds-react/utils'
import { useSearchStore } from '@/store/SearchStore'
import type { UIEvent } from 'react'
import { useSearchParams } from 'react-router-dom'

const SCROLL_THRESHOLD = 40
const LAZY_BATCH_SIZE = 10

interface RecordResultSearchProps {
  onLazyLoad: () => void
}

export default function RecordResultSearch({ onLazyLoad }: RecordResultSearchProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const documentRecords = useSearchStore((state) => state.documentRecords)
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
    setSelectedKeywordId('1')
    void fetchDocumentInfo(id)
  }

  const handleLazyLoadScroll = (event: UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget
    const distanceToBottom = target.scrollHeight - target.scrollTop - target.clientHeight

    if (distanceToBottom <= SCROLL_THRESHOLD) {
      onLazyLoad()
    }
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex w-full items-center justify-center gap-6">
        <p className="flex-1 text-body-md font-semibold text-txt-black-900">
          {documentRecords.length} Rekod Ditemui
        </p>
        <Select size="small" variant="outline" value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger>
            <SelectValue placeholder="Terkini" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Terkini</SelectItem>
            <SelectItem value="oldest">Terlama</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Documents List */}
      <div className="flex w-full flex-col overflow-hidden rounded-xl border border-otl-gray-200 bg-bg-dialog p-2 h-[300px]">
        <div className="flex h-full flex-col gap-0 overflow-y-auto" onScroll={handleLazyLoadScroll}>
          {documentRecords.map((record) => (
            <button
              key={record.documentId}
              onClick={() => handleDocumentSelect(record.documentId)}
              className={clx(
                'flex w-full cursor-pointer items-center gap-2 rounded px-2.5 py-1.5 text-left transition-colors',
                selectedDocumentId === record.documentId
                  ? 'bg-primary-600 text-txt-white'
                  : 'text-txt-black-900 hover:bg-bg-washed'
              )}
            >
              <p className="flex-1 truncate text-body-xs font-medium">{record.title}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
