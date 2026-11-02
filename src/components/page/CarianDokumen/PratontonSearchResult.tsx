import PdfJsDocumentViewer, {
  type PdfSearchNavigationRequest,
  type PdfSearchState,
} from '@/components/shared/PdfJsDocumentViewer'
import PdfHtmlDocumentViewer from '@/components/page/KatalogDokumen/DokumenID/PdfHtmlDocumentViewer'
import DocumentMetaTags from './DocumentMetaTags'
import DocumentPreviewHeader from './DocumentPreviewHeader'
import SearchInPdf from './SearchInPdf'
import { SAMPLE_PAGES } from './sampleDocumentPages'
import { useCallback, useState } from 'react'
import { useSearchStore } from '@/store/SearchStore'

interface PratontonSearchResultProps {
  searchKeyword: string
  currentMatchIndex: number
  totalMatches: number
  onPreviousMatch: () => void
  onNextMatch: () => void
  navigationRequest?: PdfSearchNavigationRequest | null
  onSearchStateChange: (state: PdfSearchState) => void
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
  onDocumentLoad,
  isIndexing,
}: PratontonSearchResultProps) {
  const documentInfo = useSearchStore((state) => state.documentInfo)
  const [isPdfLoaded, setIsPdfLoaded] = useState(false)

  const handleDocumentLoad = useCallback(() => {
    setIsPdfLoaded(true)
    onDocumentLoad?.()
  }, [onDocumentLoad])

  return (
    <div className="flex h-full min-h-[480px] min-w-0 flex-1 flex-col border-y border-otl-gray-200 p-4 sm:p-6 md:min-h-0 md:py-3 md:pr-3">
      <div className="flex min-h-0 flex-1 flex-col gap-2 rounded-md border border-otl-gray-200 bg-bg-dialog p-3 shadow-sm">
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
          <DocumentMetaTags />
        </DocumentPreviewHeader>
        <div className="min-h-0 w-full flex-1 overflow-hidden">
          <div className="h-full min-h-0 overflow-auto">
            {/* The match navigation drives the HTML view; the PDF below is display only.
                TODO: replace the sample pages with the record view API */}
            <PdfHtmlDocumentViewer
              pages={SAMPLE_PAGES}
              searchKeyword={searchKeyword}
              navigationRequest={navigationRequest}
              onSearchStateChange={onSearchStateChange}
              onDocumentLoad={handleDocumentLoad}
            />

            <PdfJsDocumentViewer fileUrl={documentInfo?.path || ''} />
          </div>
        </div>
      </div>
    </div>
  )
}
