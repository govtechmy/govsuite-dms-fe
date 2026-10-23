import PdfHtmlDocumentViewer from '@/components/shared/PdfHtmlDocumentViewer'
import type {
  PdfMatchPage,
  PdfSearchNavigationRequest,
  PdfSearchState,
} from '@/components/shared/PdfJsDocumentViewer'
import type { SearchMatchMode } from '@/components/shared/searchHighlight'
import { usePdfHtmlConversion } from '@/hooks/usePdfHtmlConversion'

interface DocumentHtmlPreviewProps {
  documentId?: string
  fileUrl?: string
  searchKeyword: string
  searchMatchMode?: SearchMatchMode
  // Page to show when the search keyword is not found
  fallbackPage?: number
  navigationRequest?: PdfSearchNavigationRequest | null
  onSearchStateChange?: (state: PdfSearchState) => void
  onMatchPagesChange?: (pages: PdfMatchPage[]) => void
  onDocumentLoad?: () => void
}

export default function DocumentHtmlPreview({
  documentId,
  fileUrl,
  searchKeyword,
  searchMatchMode,
  fallbackPage,
  navigationRequest,
  onSearchStateChange,
  onMatchPagesChange,
  onDocumentLoad,
}: DocumentHtmlPreviewProps) {
  const { state, result, isLoadingMore, loadMoreFailed, loadMore } = usePdfHtmlConversion(
    fileUrl,
    `${documentId ?? 'document'}.pdf`
  )

  const statusMessage = !fileUrl
    ? 'Tiada dokumen untuk dipaparkan.'
    : state === 'error'
      ? 'Dokumen gagal dimuatkan, sila cuba lagi atau hubungi pentadbir sistem.'
      : 'Dokumen sedang diproses...'

  return (
    <div className="min-h-0 w-full flex-1 overflow-hidden rounded-lg border border-otl-gray-200 bg-bg-white">
      <div className="h-full min-h-0 overflow-auto">
        {fileUrl && state === 'success' && result ? (
          <PdfHtmlDocumentViewer
            key={fileUrl}
            pages={result.pages}
            totalPages={result.totalPages}
            isLoadingMore={isLoadingMore}
            loadMoreFailed={loadMoreFailed}
            onLoadMore={loadMore}
            baseStyle={result.baseStyle}
            searchKeyword={searchKeyword}
            searchMatchMode={searchMatchMode}
            singlePage
            fallbackPage={fallbackPage}
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
