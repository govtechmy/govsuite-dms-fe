import { useMemo } from 'react'
import { CrossCircleIcon, DocumentIcon } from '@govtechmy/myds-react/icon'
import { Spinner } from '@govtechmy/myds-react/spinner'
import {
  type PdfPageNavigationRequest,
  type PdfSearchNavigationRequest,
  type PdfSearchState,
} from '@/components/shared/PdfJsDocumentViewer'
import { ProgressResult, type ProgressState } from '@/components/shared/ProgressResult'
import type { RecordViewError, RecordViewPage } from '@/services/pdf.svc'
import PdfHtmlDocumentViewer from './PdfHtmlDocumentViewer'
import { AutoPagination } from '@govtechmy/myds-react/pagination'
import type { CatalogListMeta } from '@/services/catalog.svc'

// The backend's `contentEditor` is plain HTML, so wrap each item in the page/frame
// nodes the viewer expects: an A4 sheet (96 DPI) that grows with its content, and
// one frame in normal flow instead of the converter's absolute positioning
const PAGE_STYLE = 'width: 794px; min-height: 1123px'
const FRAME_STYLE = 'position: relative; padding: 72px; font-size: 14px; line-height: 1.6'

interface DokumenContentIDProps {
  dokumenViewPages: RecordViewPage[] | null
  dokumenViewFetchState: ProgressState
  dokumenViewFetchError: RecordViewError | null
  dokumenViewMeta: CatalogListMeta | null
  onDokumenViewPageChange: (page: number) => void
  searchKeyword: string
  navigationRequest?: PdfSearchNavigationRequest | null
  pageNavigationRequest?: PdfPageNavigationRequest | null
  onSearchStateChange?: (state: PdfSearchState) => void
  onDocumentLoad?: () => void
  onPageChange?: (currentPage: number, totalPages: number) => void
}

export default function DokumenContentID({
  dokumenViewPages,
  dokumenViewFetchState,
  dokumenViewFetchError,
  dokumenViewMeta,
  searchKeyword,
  navigationRequest,
  pageNavigationRequest,
  onSearchStateChange,
  onDocumentLoad,
  onPageChange,
  onDokumenViewPageChange,
}: DokumenContentIDProps) {
  // Viewer's `pages` reference stays stable across renders
  const pages = useMemo(
    () =>
      (dokumenViewPages ?? []).map(
        ({ pageNumber, contentEditor }) =>
          `<div data-type="page" data-page="${pageNumber}" style="${PAGE_STYLE}"><div data-type="frame" style="${FRAME_STYLE}">${contentEditor}</div></div>`
      ),
    [dokumenViewPages]
  )

  // Only the content area reflects the view fetch; the header and metadata
  // above come from separate requests and stay usable
  if (dokumenViewFetchState === 'loading') {
    return (
      <div className="flex min-h-[400px] w-full">
        <ProgressResult
          icon={<Spinner size="large" />}
          description="Kandungan dokumen sedang dimuatkan. Sila tunggu sebentar."
        />
      </div>
    )
  }

  if (dokumenViewFetchState === 'error') {
    return (
      <div className="flex min-h-[400px] w-full">
        <ProgressResult
          icon={<CrossCircleIcon className="size-[42px] text-txt-danger" />}
          title="Kandungan Dokumen Gagal Dimuatkan"
          description={
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              <div>
                Kandungan dokumen gagal dimuatkan, sila cuba lagi atau hubungi pentadbir sistem.
              </div>
              <div>
                {dokumenViewFetchError?.code ?? 'REQUEST_FAILED'} :{' '}
                {dokumenViewFetchError?.message ?? 'Gagal memuatkan paparan dokumen.'}
              </div>
            </div>
          }
        />
      </div>
    )
  }

  if (dokumenViewFetchState === 'success' && pages.length === 0) {
    return (
      <div className="flex min-h-[400px] w-full">
        <ProgressResult
          icon={<DocumentIcon className="size-[42px] text-txt-black-500" />}
          title="Tiada Kandungan"
          description="Tiada kandungan untuk dipaparkan bagi dokumen ini."
        />
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col">
      {/* The header's search and page navigation drive the HTML view; the PDF
          below is display only, so the header's page counter shows TipTap pages
          only, not PDF pages. */}
      <PdfHtmlDocumentViewer
        pages={pages}
        searchKeyword={searchKeyword}
        navigationRequest={navigationRequest}
        pageNavigationRequest={pageNavigationRequest}
        onSearchStateChange={onSearchStateChange}
        onDocumentLoad={onDocumentLoad}
        onPageChange={onPageChange}
      />

      {/* Pdf Viewer for previous viewer*/}
      {/* <PdfJsDocumentViewer fileUrl={pdfUrl} /> */}

      {dokumenViewMeta && dokumenViewMeta.totalPages > 1 && (
        <div className="sticky bottom-0 bg-bg-white py-3">
          <AutoPagination
            page={dokumenViewMeta.currentPage}
            limit={dokumenViewMeta.pageSize}
            count={dokumenViewMeta.totalItems}
            type="default"
            maxDisplay={4}
            onPageChange={onDokumenViewPageChange}
          />
        </div>
      )}
    </div>
  )
}
