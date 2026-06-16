import MainHeading from '@/components/layout/MainHeading'
import SearchBarCarianDokumen from '@/components/page/CarianDokumen/SearchBarCarianDokumen'
import DisplaySearchResults from '@/components/page/CarianDokumen/DisplaySearchResults'
import SearchLoadingState from '@/components/page/CarianDokumen/SearchLoadingState'
import type { DocumentRecord, KeywordRecord, DocumentInfoResponse } from '@/pages/CarianDokumen'
import SelectCarianDokumen from './SelectCarianDokumen'
import RightSidePageLayoutWrapper from '@/components/layout/RightSidePageLayout'

interface SearchResultsStateProps {
  isLoadingSearchPage?: boolean
  documentRecords?: DocumentRecord[]
  keywordRecords?: KeywordRecord[]
  selectedDocumentId?: string | null
  selectedKeywordId?: string | null
  documentInfo?: DocumentInfoResponse['data'] | null
  sortBy?: string
  onDocumentSelect?: (id: string) => void
  onKeywordSelect?: (id: string) => void
  onSortChange?: (value: string) => void
}

export default function SearchResultsState({
  isLoadingSearchPage = false,
  documentRecords = [],
  keywordRecords = [],
  selectedDocumentId,
  selectedKeywordId,
  documentInfo,
  sortBy,
  onDocumentSelect,
  onKeywordSelect,
  onSortChange,
}: SearchResultsStateProps) {
  return (
    <div className="flex flex-col gap-6 w-full h-full">
      <RightSidePageLayoutWrapper className="pb-0 flex flex-col gap-6">
        <MainHeading>Carian Dokumen</MainHeading>
        <div className="flex flex-col gap-3">
          <SearchBarCarianDokumen />
          <SelectCarianDokumen />
        </div>
      </RightSidePageLayoutWrapper>

      {isLoadingSearchPage ? (
        <div className="flex flex-col items-center justify-center gap-4 py-12 h-full">
          <SearchLoadingState />
        </div>
      ) : documentRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-12 h-full">
          <div className="text-body-sm text-txt-black-500 text-center max-w-md">
            Tiada dokumen ditemui. Sila lakukan carian semula.
          </div>
        </div>
      ) : (
        <DisplaySearchResults
          documentRecords={documentRecords}
          keywordRecords={keywordRecords}
          selectedDocumentId={selectedDocumentId}
          selectedKeywordId={selectedKeywordId}
          documentInfo={documentInfo}
          sortBy={sortBy}
          onDocumentSelect={onDocumentSelect}
          onKeywordSelect={onKeywordSelect}
          onSortChange={onSortChange}
        />
      )}
    </div>
  )
}
