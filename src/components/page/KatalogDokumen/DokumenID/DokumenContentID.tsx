import PdfJsDocumentViewer, {
  type PdfPageNavigationRequest,
  type PdfSearchNavigationRequest,
  type PdfSearchState,
} from '@/components/shared/PdfJsDocumentViewer'

interface DokumenContentIDProps {
  pdfUrl: string
  searchKeyword: string
  navigationRequest?: PdfSearchNavigationRequest | null
  pageNavigationRequest?: PdfPageNavigationRequest | null
  onSearchStateChange?: (state: PdfSearchState) => void
  onDocumentLoad?: () => void
  onPageChange?: (currentPage: number, totalPages: number) => void
}

export default function DokumenContentID({
  pdfUrl,
  searchKeyword,
  navigationRequest,
  pageNavigationRequest,
  onSearchStateChange,
  onDocumentLoad,
  onPageChange,
}: DokumenContentIDProps) {
  return (
    <div className="w-full">
      <PdfJsDocumentViewer
        fileUrl={pdfUrl}
        searchKeyword={searchKeyword}
        navigationRequest={navigationRequest}
        pageNavigationRequest={pageNavigationRequest}
        onSearchStateChange={onSearchStateChange}
        onDocumentLoad={onDocumentLoad}
        onPageChange={onPageChange}
      />
    </div>
  )
}
