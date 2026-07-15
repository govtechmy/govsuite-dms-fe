import PdfJsDocumentViewer, {
  type PdfSearchNavigationRequest,
  type PdfSearchState,
} from '@/components/shared/PdfJsDocumentViewer'

interface DokumenContentIDProps {
  pdfUrl: string
  searchKeyword: string
  navigationRequest?: PdfSearchNavigationRequest | null
  onSearchStateChange?: (state: PdfSearchState) => void
}

export default function DokumenContentID({
  pdfUrl,
  searchKeyword,
  navigationRequest,
  onSearchStateChange,
}: DokumenContentIDProps) {
  return (
    <div className="h-[1200px] overflow-auto">
      <div className="h-full w-full">
        <PdfJsDocumentViewer
          fileUrl={pdfUrl}
          searchKeyword={searchKeyword}
          navigationRequest={navigationRequest}
          onSearchStateChange={onSearchStateChange}
        />
      </div>
    </div>
  )
}
