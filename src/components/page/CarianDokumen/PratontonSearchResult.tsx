import { Button } from '@govtechmy/myds-react/button'
import type {
  PdfPageNavigationRequest,
  PdfSearchNavigationRequest,
  PdfSearchState,
} from '@/components/shared/PdfJsDocumentViewer'
import PdfHtmlDocumentViewer from '@/components/page/KatalogDokumen/DokumenID/PdfHtmlDocumentViewer'
import SearchInPdf from './SearchInPdf'
import dataSampleFulltext from './fullTextHtmlSample'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSearchStore } from '@/store/SearchStore'
import { CheckIcon, CopyIcon, EyeShowIcon, HeartIcon } from '@govtechmy/myds-react/icon'
import { useToast } from '@govtechmy/myds-react/hooks'
import { getFavoriteStatus, postToggleFavorite } from '@/services/kegemaran.svc'
import extractBackendError from '@/utils/extractBackendError'
import { getDokumenViewPage, type RecordViewError, type RecordViewPage } from '@/services/pdf.svc'
import type { ProgressState } from '@/components/shared/ProgressResult'
import DokumenContentID from '@/components/page/KatalogDokumen/DokumenID/DokumenContentID'
// import { downloadFile } from '@/utils/downloadFile'

interface PratontonSearchResultProps {
  searchKeyword: string
  currentMatchIndex: number
  totalMatches: number
  onPreviousMatch: () => void
  onNextMatch: () => void
  navigationRequest?: PdfSearchNavigationRequest | null
  pageNavigationRequest?: PdfPageNavigationRequest | null
  onSearchStateChange: (state: PdfSearchState) => void
  onDocumentLoad?: () => void
  onPageChange: (currentPage: number, totalPages: number) => void
  isIndexing: boolean
  isHybridSearch: boolean
}

// The backend's `contentEditor` is plain HTML, so wrap each item in the page/frame
// nodes the viewer expects: an A4 sheet (96 DPI) that grows with its content, and
// one frame in normal flow instead of the converter's absolute positioning
const PAGE_STYLE = 'width: 794px; min-height: 1123px'
const FRAME_STYLE = 'position: relative; padding: 72px; font-size: 14px; line-height: 1.6'

// Built once so the viewer's `pages` reference stays stable across renders
const SAMPLE_PAGES = dataSampleFulltext.data.items.map(
  ({ pageNumber, contentEditor }) =>
    `<div data-type="page" data-page="${pageNumber}" style="${PAGE_STYLE}"><div data-type="frame" style="${FRAME_STYLE}">${contentEditor}</div></div>`
)

export default function PratontonSearchResult({
  searchKeyword,
  currentMatchIndex,
  totalMatches,
  onPreviousMatch,
  onNextMatch,
  navigationRequest,
  pageNavigationRequest,
  onSearchStateChange,
  onDocumentLoad,
  onPageChange,
  isIndexing,
  isHybridSearch,
}: PratontonSearchResultProps) {
  const navigate = useNavigate()
  const { lang } = useParams()
  const { toast } = useToast()
  const documentInfo = useSearchStore((state) => state.documentInfo)
  const selectedDocumentId = useSearchStore((state) => state.selectedDocumentId)
  const selectedPageNumber = useSearchStore((state) => state.selectedPageNumber)
  const [hybridPages, setHybridPages] = useState<RecordViewPage[] | null>(null)
  const [hybridFetchState, setHybridFetchState] = useState<ProgressState>(null)
  const [hybridFetchError, setHybridFetchError] = useState<RecordViewError | null>(null)
  // const documentRecords = useSearchStore((state) => state.documentRecords)
  const [isPdfLoaded, setIsPdfLoaded] = useState(false)
  const [isReferenceCopied, setIsReferenceCopied] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false)

  // const currentDocumentTitle = documentRecords.find(
  //   (documentRecord) => documentRecord.documentId === documentInfo?.documentID
  // )?.title

  useEffect(() => {
    setIsPdfLoaded(false)
  }, [documentInfo?.documentID])

  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      try {
        if (!documentInfo?.documentID) {
          setIsFavorite(false)
          return
        }
        const data = await getFavoriteStatus(documentInfo.documentID)
        setIsFavorite(data.favorite)
      } catch (error) {
        setIsFavorite(false)
        console.error('Error fetching favorite status:', error)
      }
    }

    fetchFavoriteStatus()
  }, [documentInfo?.documentID])

  useEffect(() => {
    if (!isHybridSearch || !selectedDocumentId || selectedPageNumber === null) {
      return
    }

    let ignore = false
    const abortController = new AbortController()

    const fetchHybridPage = async () => {
      setHybridFetchState('loading')
      setHybridFetchError(null)
      setHybridPages(null)

      const result = await getDokumenViewPage({
        id: selectedDocumentId,
        page: selectedPageNumber,
        signal: abortController.signal,
      })

      if (ignore) return

      if (!result.success) {
        setHybridFetchState('error')
        setHybridFetchError(result.error)
        return
      }

      setHybridPages(result.data.items)
      setHybridFetchState('success')
    }

    void fetchHybridPage()

    return () => {
      ignore = true
      abortController.abort()
    }
  }, [isHybridSearch, selectedDocumentId, selectedPageNumber])

  useEffect(() => {
    if (!isReferenceCopied) {
      return
    }

    const timer = window.setTimeout(() => {
      setIsReferenceCopied(false)
    }, 2000)

    return () => window.clearTimeout(timer)
  }, [isReferenceCopied])

  const handleBukaPratonton = () => {
    if (documentInfo?.documentID) {
      navigate(`/${lang}/katalog-dokumen/${documentInfo.documentID}`)
    }
  }

  const handleDocumentLoad = () => {
    setIsPdfLoaded(true)
    onDocumentLoad?.()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const handleDownloadDokumen = () => {
  //   if (!documentInfo?.path) {
  //     return
  //   }

  //   downloadFile({
  //     url: documentInfo.path,
  //     fileName: currentDocumentTitle ?? '',
  //     fallback: documentInfo.documentID ? `dokumen-${documentInfo.documentID}` : 'dokumen',
  //   })
  // }

  const handleToggleFavorite = async () => {
    if (!documentInfo?.documentID || isFavoriteLoading) return

    setIsFavoriteLoading(true)
    try {
      const result = await postToggleFavorite(documentInfo.documentID)
      setIsFavorite(result.action === 'added')
    } catch (error) {
      console.error('Error toggling favorite:', error)
      const backendError = extractBackendError(error)
      toast({
        variant: 'error',
        title: 'Kegemaran Gagal Dikemaskini',
        description: `${backendError?.code ?? 'REQUEST_FAILED'} : ${
          backendError?.message ?? 'Sila cuba lagi.'
        }`,
      })
    } finally {
      setIsFavoriteLoading(false)
    }
  }

  const handleCopyReference = async () => {
    const referencePath = documentInfo?.referencePath?.trim()
    if (!referencePath) {
      return
    }

    const title = documentInfo?.title?.trim()
    const reference = title
      ? `${referencePath.slice(0, referencePath.lastIndexOf('/') + 1)}${title}`
      : referencePath

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(reference)
      } else {
        // Do not remove: navigator.clipboard is unavailable on non-HTTPS origins,
        // so this textarea fallback keeps copy working on HTTP environments for now.
        const textArea = document.createElement('textarea')
        textArea.value = reference
        textArea.setAttribute('readonly', '')
        textArea.style.position = 'absolute'
        textArea.style.left = '-9999px'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }

      setIsReferenceCopied(true)
    } catch {
      setIsReferenceCopied(false)
    }
  }

  const referenceLabel = isReferenceCopied ? 'Rujukan disalin' : 'Salin rujukan'
  const favoriteLabel = isFavorite ? 'Buang dari kegemaran' : 'Tambah ke kegemaran'

  return (
    <section className="flex h-[560px] min-w-0 flex-1 flex-col gap-3 rounded-xl border border-otl-gray-200 bg-bg-white p-3 lg:h-full">
      <div className="flex items-center gap-2">
        <SearchInPdf
          searchKeyword={searchKeyword}
          currentMatchIndex={currentMatchIndex}
          totalMatches={totalMatches}
          onPreviousMatch={onPreviousMatch}
          onNextMatch={onNextMatch}
          isPdfLoaded={isPdfLoaded}
          isIndexing={isIndexing}
        />
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="primary-ghost"
            size="small"
            iconOnly
            aria-label={referenceLabel}
            title={referenceLabel}
            onClick={handleCopyReference}
            disabled={!documentInfo?.referencePath}
          >
            {isReferenceCopied ? <CheckIcon /> : <CopyIcon />}
          </Button>
          <Button
            variant="default-ghost"
            size="small"
            iconOnly
            aria-label="Paparan penuh"
            title="Paparan penuh"
            onClick={handleBukaPratonton}
            disabled={!documentInfo?.documentID}
          >
            <EyeShowIcon />
          </Button>
          <Button
            variant="danger-ghost"
            size="small"
            iconOnly
            aria-label={favoriteLabel}
            aria-pressed={isFavorite}
            title={favoriteLabel}
            onClick={handleToggleFavorite}
            disabled={isFavoriteLoading || !documentInfo?.documentID}
          >
            <HeartIcon fill={isFavorite ? 'currentColor' : 'none'} />
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto rounded-lg bg-bg-gray-50">
        {isHybridSearch ? (
          // Keyed by record and page so each selected passage remounts with a clean state
          <DokumenContentID
            key={`${selectedDocumentId}-${selectedPageNumber}`}
            dokumenViewPages={hybridPages}
            dokumenViewFetchState={hybridFetchState}
            dokumenViewFetchError={hybridFetchError}
            searchKeyword={searchKeyword}
            navigationRequest={navigationRequest}
            pageNavigationRequest={pageNavigationRequest}
            onSearchStateChange={onSearchStateChange}
            onDocumentLoad={handleDocumentLoad}
            onPageChange={onPageChange}
          />
        ) : (
          // TODO: replace SAMPLE_PAGES with the record view API for full text search.
          // Keyed by record so each selection remounts and reports its state again.
          <div className="flex w-full flex-col">
            <PdfHtmlDocumentViewer
              key={documentInfo?.documentID}
              pages={SAMPLE_PAGES}
              searchKeyword={searchKeyword}
              navigationRequest={navigationRequest}
              pageNavigationRequest={pageNavigationRequest}
              onSearchStateChange={onSearchStateChange}
              onDocumentLoad={handleDocumentLoad}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>
    </section>
  )
}
