// import { DownloadIcon } from '@govtechmy/myds-react/icon'
import PdfJsDocumentViewer, {
  type PdfMatchPage,
  type PdfSearchNavigationRequest,
  type PdfSearchState,
} from '@/components/shared/PdfJsDocumentViewer'
import SearchInPdf from './SearchInPdf'
import DocumentMetaTags from './DocumentMetaTags'
import DocumentPreviewHeader from './DocumentPreviewHeader'
import { useEffect, useState } from 'react'
import { useSearchStore } from '@/store/SearchStore'
// import { downloadFile } from '@/utils/downloadFile'

interface PratontonSearchResultProps {
  searchKeyword: string
  currentMatchIndex: number
  totalMatches: number
  onPreviousMatch: () => void
  onNextMatch: () => void
  navigationRequest?: PdfSearchNavigationRequest | null
  onSearchStateChange: (state: PdfSearchState) => void
  onMatchPagesChange?: (pages: PdfMatchPage[]) => void
  onDocumentLoad?: () => void
  isIndexing: boolean
}

export default function PratontonSearchResult({
  searchKeyword,
  currentMatchIndex,
  totalMatches,
  onPreviousMatch,
  onNextMatch,
  navigationRequest,
  onSearchStateChange,
  onMatchPagesChange,
  onDocumentLoad,
  isIndexing,
}: PratontonSearchResultProps) {
  const documentInfo = useSearchStore((state) => state.documentInfo)
  // const documentRecords = useSearchStore((state) => state.documentRecords)
  const [isPdfLoaded, setIsPdfLoaded] = useState(false)

  // const currentDocumentTitle = documentRecords.find(
  //   (documentRecord) => documentRecord.documentId === documentInfo?.documentID
  // )?.title

  useEffect(() => {
    setIsPdfLoaded(false)
  }, [documentInfo?.documentID])

  const handleDocumentLoad = () => {
    setIsPdfLoaded(true)
    onDocumentLoad?.()
  }

   
  // const handleDownloadDokumen = () => {
  //   if (!documentInfo?.path) {
  //     return
  //   }

  //   downloadFile({
  //     url: documentInfo.path,
  //     fileName: currentDocumentTitle ?? '',
  //     fallback: documentInfo.documentID ? `dokumen-${documentInfo.documentID}` : 'dokumen',
  //   })
  // }

  return (
    <div className="flex h-full min-h-[480px] min-w-0 flex-1 flex-col border-y border-otl-gray-200 p-4 sm:p-6 md:min-h-0">
      <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-xl border border-otl-gray-200 bg-bg-dialog p-4 shadow-sm">
        <SearchInPdf
          searchKeyword={searchKeyword}
          currentMatchIndex={currentMatchIndex}
          totalMatches={totalMatches}
          onPreviousMatch={onPreviousMatch}
          onNextMatch={onNextMatch}
          isPdfLoaded={isPdfLoaded}
          isIndexing={isIndexing}
        />
        <DocumentPreviewHeader documentId={documentInfo?.documentID} title={documentInfo?.title}>
          <DocumentMetaTags
            documentProfile={documentInfo?.documentProfile}
            recordDate={documentInfo?.recordDate}
          />
        </DocumentPreviewHeader>
        <div className="min-h-0 w-full flex-1 overflow-hidden rounded-lg border border-otl-gray-200 bg-bg-white">
          <div className="h-full min-h-0 overflow-auto">
            <PdfJsDocumentViewer
              fileUrl={documentInfo?.path || ''}
              searchKeyword={searchKeyword}
              navigationRequest={navigationRequest}
              onSearchStateChange={onSearchStateChange}
              onMatchPagesChange={onMatchPagesChange}
              onDocumentLoad={handleDocumentLoad}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
