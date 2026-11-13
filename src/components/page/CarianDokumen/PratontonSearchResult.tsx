import { Button } from '@govtechmy/myds-react/button'
import PdfJsDocumentViewer, {
  type PdfSearchNavigationRequest,
  type PdfSearchState,
} from '@/components/shared/PdfJsDocumentViewer'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSearchStore } from '@/store/SearchStore'
import { ArrowOutgoingIcon, CopyIcon, HeartIcon } from '@govtechmy/myds-react/icon'
import { useToast } from '@govtechmy/myds-react/hooks'
import { getFavoriteStatus, postToggleFavorite } from '@/services/kegemaran.svc'
import extractBackendError from '@/utils/extractBackendError'

interface PratontonSearchResultProps {
  searchKeyword: string
  navigationRequest?: PdfSearchNavigationRequest | null
  onSearchStateChange: (state: PdfSearchState) => void
  onDocumentLoad?: () => void
}

export default function PratontonSearchResult({
  searchKeyword,
  navigationRequest,
  onSearchStateChange,
  onDocumentLoad,
}: PratontonSearchResultProps) {
  const navigate = useNavigate()
  const { lang } = useParams()
  const { toast } = useToast()
  const documentInfo = useSearchStore((state) => state.documentInfo)
  const [isReferenceCopied, setIsReferenceCopied] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false)

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

  return (
    <div className="flex h-full min-h-[480px] min-w-0 flex-1 flex-col gap-4 border rounded-lg sm:p-4 lg:min-h-0">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          variant="default-outline"
          size="small"
          className="gap-1.5"
          onClick={handleCopyReference}
          disabled={!documentInfo?.referencePath}
          aria-label="Salin rujukan"
        >
          <CopyIcon className="size-4 text-txt-primary" />
          {isReferenceCopied ? 'Disalin !' : 'Salin'}
        </Button>
        <Button
          variant="default-outline"
          size="small"
          className="gap-1.5"
          onClick={handleBukaPratonton}
          disabled={!documentInfo?.documentID}
          aria-label="Buka paparan penuh"
        >
          <ArrowOutgoingIcon className="size-4 text-txt-primary" />
          Buka
        </Button>
        <Button
          variant="default-outline"
          size="small"
          className={isFavorite ? 'gap-1.5 border-otl-danger-300 text-txt-danger' : 'gap-1.5'}
          onClick={handleToggleFavorite}
          disabled={isFavoriteLoading || !documentInfo?.documentID}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? 'Buang dari kegemaran' : 'Tambah ke kegemaran'}
        >
          <HeartIcon
            className="size-4 text-txt-primary"
            fill={isFavorite ? 'currentColor' : 'none'}
          />
          Kegemaran
        </Button>
      </div>
      <div className="h-full min-h-0 w-full overflow-hidden rounded-lg border border-otl-gray-200 bg-bg-black-50">
        <div className="h-full min-h-0 overflow-auto">
          <PdfJsDocumentViewer
            fileUrl={documentInfo?.path || ''}
            searchKeyword={searchKeyword}
            navigationRequest={navigationRequest}
            onSearchStateChange={onSearchStateChange}
            onDocumentLoad={onDocumentLoad}
          />
        </div>
      </div>
    </div>
  )
}
