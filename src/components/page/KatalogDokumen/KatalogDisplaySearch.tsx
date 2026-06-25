import Excerpts from '@/components/shared/Excerpts'
import PaginationControl from '@/components/shared/PaginationControl'
import { Spinner } from '@govtechmy/myds-react/spinner'
import { Callout, CalloutContent, CalloutTitle } from '@govtechmy/myds-react/callout'
import normalizeWord from '@/utils/NormalizeWord'

export interface KatalogSearchResultItem {
  id: string
  recordDate: string
  peringkat_keselamatan: string
  status: string
  recordTitle: string
  profileDocument?: string
  recordUnit: string
}

interface KatalogDisplaySearchProps {
  hasilCarianDisplay?: boolean
  documents: KatalogSearchResultItem[]
  isLoading: boolean
  error: string | null
  searchKeyword: string
  pageNumber: number
  pageSize: number
  totalRecords: number
  onPageChange: (newPage: number) => void
  onPageSizeChange: (newSize: number) => void
  onItemClick: (id: string) => void
}

export default function KatalogDisplaySearch({
  hasilCarianDisplay = true,
  documents,
  isLoading,
  error,
  searchKeyword,
  pageNumber,
  pageSize,
  totalRecords,
  onPageChange,
  onPageSizeChange,
  onItemClick,
}: KatalogDisplaySearchProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <Callout variant="danger">
        <CalloutTitle>Ralat</CalloutTitle>
        <CalloutContent>{error}</CalloutContent>
      </Callout>
    )
  }

  return (
    <div className="flex h-full flex-col gap-6">
      {hasilCarianDisplay && (
        <p className="text-body-sm font-medium text-txt-black-500">
          {totalRecords} hasil carian untuk "{searchKeyword}"
        </p>
      )}

      <div className="h-full">
        {documents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {documents.map((doc) => {
              return (
                <Excerpts
                  key={`${doc.id}`}
                  date={doc.recordDate || ''}
                  secretTag={doc.peringkat_keselamatan}
                  statusTag={doc.status}
                  title={doc.recordTitle || 'Tiada Tajuk Rekod'}
                  type={normalizeWord(doc.profileDocument) || 'Tiada Profil'}
                  unit={normalizeWord(doc.recordUnit) || 'Tiada Nama Unit'}
                  onClick={() => onItemClick(doc.id)}
                />
              )
            })}
          </div>
        ) : (
          <Callout variant="info">
            <CalloutTitle>Tiada Hasil</CalloutTitle>
            <CalloutContent>Tiada dokumen ditemui untuk kata kunci ini.</CalloutContent>
          </Callout>
        )}
      </div>

      <PaginationControl
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalRecords={totalRecords}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={[15, 30, 45, 60]}
      />
    </div>
  )
}
