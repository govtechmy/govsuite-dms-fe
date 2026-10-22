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
import { useSearchParams } from 'react-router-dom'
import DocumentMetaTags from './DocumentMetaTags'
import CompactPagination from './CompactPagination'
import { useSearchPage } from './useSearchPage'

export default function RecordResultSearch() {
  const [searchParams, setSearchParams] = useSearchParams()
  const documentRecords = useSearchStore((state) => state.documentRecords)
  const totalItems = useSearchStore((state) => state.searchMeta?.totalItems ?? 0)
  const { pageNumber, pageSize, goToPage } = useSearchPage()
  const selectedDocumentId = useSearchStore((state) => state.selectedDocumentId)
  const sortBy = useSearchStore((state) => state.sort)
  const setSort = useSearchStore((state) => state.setSort)
  const selectDocument = useSearchStore((state) => state.selectDocument)

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
    <div className="flex max-h-[640px] w-full flex-col gap-3 rounded-lg border border-otl-gray-200 bg-bg-dialog p-4 shadow-sm md:max-h-none md:min-h-0 md:flex-1 xl:w-[334px]">
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

      <ul className="flex min-h-0 flex-1 flex-col overflow-y-auto" aria-label="Senarai rekod">
        {documentRecords.map((record) => {
          const isSelected = selectedDocumentId === record.documentId
          return (
            <li key={record.documentId} className="border-b border-otl-gray-200 last:border-b-0">
              <button
                type="button"
                aria-current={isSelected ? 'true' : undefined}
                onClick={() => selectDocument(record.documentId)}
                className={clx(
                  'flex w-full items-center gap-2 border-l-2 px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-primary',
                  isSelected
                    ? 'rounded-r-lg border-l-primary-600 bg-bg-primary-50'
                    : 'border-l-transparent hover:bg-bg-washed'
                )}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <p
                    title={record.title}
                    className={clx(
                      'line-clamp-2 break-words text-body-sm font-medium',
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
      </ul>

      {totalItems > pageSize && (
        <CompactPagination
          page={pageNumber}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={goToPage}
          fullWidth
        />
      )}
    </div>
  )
}
