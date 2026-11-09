import { Button } from '@govtechmy/myds-react/button'
import type {
  PdfPageNavigationRequest,
  PdfSearchNavigationRequest,
  PdfSearchState,
} from '@/components/shared/PdfJsDocumentViewer'
import SearchInPdf from './SearchInPdf'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSearchStore } from '@/store/SearchStore'
import { CheckIcon, CopyIcon, EyeShowIcon, HeartIcon } from '@govtechmy/myds-react/icon'
import { useToast } from '@govtechmy/myds-react/hooks'
import { getFavoriteStatus, postToggleFavorite } from '@/services/kegemaran.svc'
import extractBackendError from '@/utils/extractBackendError'
import { getDokumenViewPage, type RecordViewError, type RecordViewPage } from '@/services/pdf.svc'
import type { ProgressState } from '@/components/shared/ProgressResult'
import DokumenContent from '@/components/shared/DokumenContent'
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
}

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
}: PratontonSearchResultProps) {
  const navigate = useNavigate()
  const { lang } = useParams()
  const { toast } = useToast()
  const documentInfo = useSearchStore((state) => state.documentInfo)
  const selectedDocumentId = useSearchStore((state) => state.selectedDocumentId)
  const selectedPageNumber = useSearchStore((state) => state.selectedPageNumber)
  const [viewPages, setViewPages] = useState<RecordViewPage[] | null>(null)
  const [viewFetchState, setViewFetchState] = useState<ProgressState>(null)
  const [viewFetchError, setViewFetchError] = useState<RecordViewError | null>(null)
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
    if (!selectedDocumentId || selectedPageNumber === null) {
      setViewPages(null)
      setViewFetchState(null)
      setViewFetchError(null)
      return
    }

    let ignore = false
    const abortController = new AbortController()

    const fetchSelectedPage = async () => {
      setViewFetchState('loading')
      setViewFetchError(null)
      setViewPages(null)

      const result = await getDokumenViewPage({
        id: selectedDocumentId,
        page: selectedPageNumber,
        signal: abortController.signal,
      })

      if (ignore) return

      if (!result.success) {
        setViewFetchState('error')
        setViewFetchError(result.error)
        return
      }

      setViewPages(result.data.items)
      setViewFetchState('success')
    }

    void fetchSelectedPage()

    return () => {
      ignore = true
      abortController.abort()
    }
  }, [selectedDocumentId, selectedPageNumber])

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
        <DokumenContent
          key={`${selectedDocumentId}-${selectedPageNumber}`}
          dokumenViewPages={viewPages}
          dokumenViewFetchState={viewFetchState}
          dokumenViewFetchError={viewFetchError}
          searchKeyword={searchKeyword}
          navigationRequest={navigationRequest}
          pageNavigationRequest={pageNavigationRequest}
          onSearchStateChange={onSearchStateChange}
          onDocumentLoad={handleDocumentLoad}
          onPageChange={onPageChange}
        />
      </div>
    </section>
  )
}
