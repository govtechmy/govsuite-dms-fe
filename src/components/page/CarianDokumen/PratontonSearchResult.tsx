// import { DownloadIcon } from '@govtechmy/myds-react/icon'
import type {
  PdfMatchPage,
  PdfSearchNavigationRequest,
  PdfSearchState,
} from '@/components/shared/PdfJsDocumentViewer'
import DocumentHtmlPreview from './DocumentHtmlPreview'
import SearchInPdf from './SearchInPdf'
import DocumentMetaTags from './DocumentMetaTags'
import DocumentPreviewHeader from './DocumentPreviewHeader'
import { useCallback, useEffect, useState } from 'react'
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

  const handleDocumentLoad = useCallback(() => {
    setIsPdfLoaded(true)
    onDocumentLoad?.()
  }, [onDocumentLoad])

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
        <DocumentHtmlPreview
          documentId={documentInfo?.documentID}
          fileUrl={documentInfo?.path}
          searchKeyword={searchKeyword}
          navigationRequest={navigationRequest}
          onSearchStateChange={onSearchStateChange}
          onMatchPagesChange={onMatchPagesChange}
          onDocumentLoad={handleDocumentLoad}
        />
      </div>
    </div>
  )
}
