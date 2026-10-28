import PdfJsDocumentViewer, {
  type PdfPageNavigationRequest,
  type PdfSearchNavigationRequest,
  type PdfSearchState,
} from '@/components/shared/PdfJsDocumentViewer'
import PdfHtmlDocumentViewer from './PdfHtmlDocumentViewer'
import dataSample from './sampleDokumenHtml'

// The backend's `contentEditor` is plain HTML, so wrap each item in the page/frame
// nodes the viewer expects: an A4 sheet (96 DPI) that grows with its content, and
// one frame in normal flow instead of the converter's absolute positioning
const PAGE_STYLE = 'width: 794px; min-height: 1123px'
const FRAME_STYLE = 'position: relative; padding: 72px; font-size: 14px; line-height: 1.6'

// Built once so the viewer's `pages` reference stays stable across renders
const SAMPLE_PAGES = dataSample.data.items.map(
  ({ pageNumber, contentEditor }) =>
    `<div data-type="page" data-page="${pageNumber}" style="${PAGE_STYLE}"><div data-type="frame" style="${FRAME_STYLE}">${contentEditor}</div></div>`
)

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
