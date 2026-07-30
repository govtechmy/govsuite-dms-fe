import PdfJsDocumentViewer, {
  type PdfSearchNavigationRequest,
  type PdfSearchState,
} from '@/components/shared/PdfJsDocumentViewer'

interface DokumenContentIDProps {
  pdfUrl: string
  searchKeyword: string
  navigationRequest?: PdfSearchNavigationRequest | null
  onSearchStateChange?: (state: PdfSearchState) => void
  onDocumentLoad?: () => void
  onPageChange?: (currentPage: number, totalPages: number) => void
}

export default function DokumenContentID({
  pdfUrl,
  searchKeyword,
  navigationRequest,
  onSearchStateChange,
  onDocumentLoad,
  onPageChange,
}: DokumenContentIDProps) {
  return (
    <div className="h-[1200px] overflow-auto">
      <div className="h-full w-full">
        <PdfJsDocumentViewer
          fileUrl={pdfUrl}
          searchKeyword={searchKeyword}
          navigationRequest={navigationRequest}
          onSearchStateChange={onSearchStateChange}
          onDocumentLoad={onDocumentLoad}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  )
}
