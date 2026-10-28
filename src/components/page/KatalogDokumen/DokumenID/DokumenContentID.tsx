import PdfJsDocumentViewer, {
  type PdfPageNavigationRequest,
  type PdfSearchNavigationRequest,
  type PdfSearchState,
} from '@/components/shared/PdfJsDocumentViewer'
import PdfHtmlDocumentViewer from './PdfHtmlDocumentViewer'
import { toPageHtml } from './pdfPageNodes'
import dataSample from './sampleDokumenHtml'

// Built once so the viewer's `pages` reference stays stable across renders
const SAMPLE_PAGES = dataSample.data.items.map(toPageHtml)

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
    <div className="flex w-full flex-col">
      {/* The header's search and page navigation drive the HTML view; the PDF
          below is display only, so the header's page counter shows TipTap pages
          only, not PDF pages. TODO: replace the sample pages with the record view API */}
      <PdfHtmlDocumentViewer
        pages={SAMPLE_PAGES}
        searchKeyword={searchKeyword}
        navigationRequest={navigationRequest}
        pageNavigationRequest={pageNavigationRequest}
        onSearchStateChange={onSearchStateChange}
        onDocumentLoad={onDocumentLoad}
        onPageChange={onPageChange}
      />

      <PdfJsDocumentViewer fileUrl={pdfUrl} />
    </div>
  )
}
