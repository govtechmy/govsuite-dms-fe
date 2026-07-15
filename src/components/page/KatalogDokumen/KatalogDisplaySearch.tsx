import Excerpts from '@/components/shared/Excerpts'
import PaginationControl from '@/components/shared/PaginationControl'
import { Spinner } from '@govtechmy/myds-react/spinner'
import { Callout, CalloutContent, CalloutTitle } from '@govtechmy/myds-react/callout'
import normalizeWord from '@/utils/NormalizeWord'

export interface KatalogSearchResultItem {
  type: string
  id: string
  recordId: string
  folderId: string
  fileName: string
  status: string
  accessLevel: string
  recordDate: string
  recordTitle: string
  unit: string
  path: string
  documentProfile?: string
  documentProfileCode?: string
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
  onItemClick: (recordId: string, item?: KatalogSearchResultItem) => void
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
            {documents.map((doc, index) => {
              return (
                <Excerpts
                  key={`${index}`}
                  date={doc.recordDate || ''}
                  secretTag={doc.accessLevel || 'Not Set'}
                  statusTag={doc.status || 'Not Set'}
                  title={doc.recordTitle || 'Tiada Tajuk Rekod'}
                  type={normalizeWord(doc.documentProfile) || 'Tiada Profil'}
                  unit={normalizeWord(doc.unit) || 'Tiada Nama Unit'}
                  onClick={() => onItemClick(doc.recordId || 'TiadaRekod', doc)}
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
