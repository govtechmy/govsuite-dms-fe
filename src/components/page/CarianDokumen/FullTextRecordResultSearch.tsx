import { clx } from '@govtechmy/myds-react/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shared/SelectMydsFix'
import { ChevronRightIcon } from '@govtechmy/myds-react/icon'
import DocumentMetaTag from './DocumentMetaTag'
import { useSearchStore } from '@/store/SearchStore'
import { useSearchParams } from 'react-router-dom'
import { formatDateDisplay } from '@/utils/formatDate'
import { AutoPagination } from '@govtechmy/myds-react/pagination'
import type { CatalogListMeta, RecordSearchItem } from '@/services/catalog.svc'

// TODO: only written to the URL `limit` in handleSortChange; nothing reads it back, the page
// size comes from LAZY_BATCH_SIZE in pages/CarianDokumen.tsx. Remove both with lazy loading.
const LAZY_BATCH_SIZE = 10

interface FullTextRecordResultSearchProps {
  records: RecordSearchItem[]
  totalItems: number
  selectedDocumentId: string | null
  onRecordSelect: (record: RecordSearchItem) => void
  meta: CatalogListMeta | null
  onPaginationChange: (page: number) => void
}

export default function FullTextRecordResultSearch({
  records,
  totalItems,
  selectedDocumentId,
  onRecordSelect,
  meta,
  onPaginationChange,
}: FullTextRecordResultSearchProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const sortBy = useSearchStore((state) => state.sort)
  const setSort = useSearchStore((state) => state.setSort)

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

  return (
    <section className="flex h-[360px] w-full flex-col gap-3 rounded-xl border border-otl-gray-200 bg-bg-white p-3 lg:h-auto lg:min-h-0">
      <div className="flex w-full items-center gap-3 p-1">
        <h2 className="flex-1 text-body-sm font-semibold text-txt-black-900">
          {totalItems} rekod ditemui
        </h2>
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

      <div className="min-h-0 flex-1 overflow-y-auto">
        {records.map((record) => {
          const isSelected = record.recordId === selectedDocumentId
          return (
            <button
              key={record.recordId}
              type="button"
              onClick={() => onRecordSelect(record)}
              aria-pressed={isSelected}
              className={clx(
                'flex w-full cursor-pointer items-center gap-2 border-b border-l-2 border-b-otl-gray-200 px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fr-primary',
                isSelected
                  ? 'rounded-r-md border-b-transparent border-l-primary-600 bg-bg-primary-50'
                  : 'border-l-transparent hover:bg-bg-washed'
              )}
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <p className="line-clamp-2 text-body-sm font-semibold text-txt-primary underline underline-offset-2">
                  {record.title || '-'}
                </p>
                <DocumentMetaTag
                  jenisDokumen={record.documentProfileName || '-'}
                  tarikh={formatDateDisplay(record.recordDate)}
                  fileExtension={record.fileExtension ?? ''}
                  fileType={record.fileType ?? ''}
                />
              </div>
              {isSelected && <ChevronRightIcon className="size-5 shrink-0 text-txt-black-700" />}
            </button>
          )
        })}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex shrink-0 justify-center border-t border-otl-gray-200 pt-3">
          <AutoPagination
            page={meta.currentPage}
            limit={meta.pageSize}
            count={meta.totalItems}
            type="simple"
            onPageChange={onPaginationChange}
          />
        </div>
      )}
    </section>
  )
}
