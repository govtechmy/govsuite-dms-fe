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
  const { state, result, isLoadingMore, loadMoreFailed, loadMore } = useRecordHtmlView(
    documentId,
    page
  )

  const statusMessage = !documentId
    ? 'Tiada dokumen untuk dipaparkan.'
    : state === 'error'
      ? 'Dokumen gagal dimuatkan, sila cuba lagi atau hubungi pentadbir sistem.'
      : 'Dokumen sedang diproses...'

  return (
    <div className="min-h-0 w-full flex-1 overflow-hidden">
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
            className="p-0"
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
