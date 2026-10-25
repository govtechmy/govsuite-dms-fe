import PdfHtmlDocumentViewer from '@/components/shared/PdfHtmlDocumentViewer'
import type {
  PdfMatchPage,
  PdfSearchNavigationRequest,
  PdfSearchState,
} from '@/components/shared/PdfJsDocumentViewer'
import type { SearchMatchMode } from '@/components/shared/searchHighlight'
import { useRecordHtmlView } from '@/hooks/useRecordHtmlView'

interface DocumentHtmlPreviewProps {
  documentId?: string
  searchKeyword: string
  searchMatchMode?: SearchMatchMode
  // Only fetch and show this PDF page (null while it is not known yet)
  page?: number | null
  navigationRequest?: PdfSearchNavigationRequest | null
  onSearchStateChange?: (state: PdfSearchState) => void
  onMatchPagesChange?: (pages: PdfMatchPage[]) => void
  onDocumentLoad?: () => void
}

export default function DocumentHtmlPreview({
  documentId,
  searchKeyword,
  searchMatchMode,
  page,
  navigationRequest,
  onSearchStateChange,
  onMatchPagesChange,
  onDocumentLoad,
}: DocumentHtmlPreviewProps) {
  // TEMPORARY (dev only): preview a fixed record while real contentEditor HTML is not ready.
  // Set VITE_RECORD_VIEW_TEST_ID in frontend.env; remove once the API returns real HTML
  const testRecordId = import.meta.env.DEV
    ? (import.meta.env.VITE_RECORD_VIEW_TEST_ID as string | undefined)
    : undefined
  const { state, result, isLoadingMore, loadMoreFailed, loadMore } = useRecordHtmlView(
    documentId && (testRecordId || documentId),
    page
  )

  const statusMessage = !documentId
    ? 'Tiada dokumen untuk dipaparkan.'
    : state === 'error'
      ? 'Dokumen gagal dimuatkan, sila cuba lagi atau hubungi pentadbir sistem.'
      : 'Dokumen sedang diproses...'

  return (
    <div className="min-h-0 w-full flex-1 overflow-hidden rounded-lg border border-otl-gray-200 bg-bg-white">
      <div className="h-full min-h-0 overflow-auto">
        {documentId && state === 'success' && result ? (
          <PdfHtmlDocumentViewer
            key={documentId}
            pages={result.pages}
            totalPages={result.totalPages}
            isLoadingMore={isLoadingMore}
            loadMoreFailed={loadMoreFailed}
            onLoadMore={loadMore}
            searchKeyword={searchKeyword}
            searchMatchMode={searchMatchMode}
            singlePage
            navigationRequest={navigationRequest}
            onSearchStateChange={onSearchStateChange}
            onMatchPagesChange={onMatchPagesChange}
            onDocumentLoad={onDocumentLoad}
          />
        ) : (
          <div
            role={state === 'error' ? 'alert' : 'status'}
            className="flex w-full items-center justify-center px-4 py-12 text-center text-body-sm text-txt-black-500"
          >
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  )
}
