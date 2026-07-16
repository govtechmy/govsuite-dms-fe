import { Button } from '@govtechmy/myds-react/button'
import { DownloadIcon } from '@govtechmy/myds-react/icon'
import PdfJsDocumentViewer, {
  type PdfSearchNavigationRequest,
  type PdfSearchState,
} from '@/components/shared/PdfJsDocumentViewer'
import SearchInPdf from './SearchInPdf'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSearchStore } from '@/store/SearchStore'
import { downloadFile } from '@/utils/downloadFile'

interface PratontonSearchResultProps {
  searchKeyword: string
  onSearchKeywordChange: (keyword: string) => void
  currentMatchIndex: number
  totalMatches: number
  onPreviousMatch: () => void
  onNextMatch: () => void
  navigationRequest?: PdfSearchNavigationRequest | null
  onSearchStateChange: (state: PdfSearchState) => void
  onDocumentLoad?: () => void
}

export default function PratontonSearchResult({
  searchKeyword,
  onSearchKeywordChange,
  currentMatchIndex,
  totalMatches,
  onPreviousMatch,
  onNextMatch,
  navigationRequest,
  onSearchStateChange,
  onDocumentLoad,
}: PratontonSearchResultProps) {
  const navigate = useNavigate()
  const { lang } = useParams()
  const documentInfo = useSearchStore((state) => state.documentInfo)
  const documentRecords = useSearchStore((state) => state.documentRecords)
  const [isPdfLoaded, setIsPdfLoaded] = useState(false)
  const [isReferenceCopied, setIsReferenceCopied] = useState(false)

  const currentDocumentTitle = documentRecords.find(
    (documentRecord) => documentRecord.documentId === documentInfo?.documentID
  )?.title

  useEffect(() => {
    setIsPdfLoaded(false)
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

  const handleDocumentLoad = () => {
    setIsPdfLoaded(true)
    onDocumentLoad?.()
  }

  const handleDownloadDokumen = () => {
    if (!documentInfo?.path) {
      return
    }

    downloadFile({
      url: documentInfo.path,
      fileName: currentDocumentTitle ?? '',
      fallback: documentInfo.documentID ? `dokumen-${documentInfo.documentID}` : 'dokumen',
    })
  }

  const handleCopyReference = async () => {
    const reference = documentInfo?.referencePath?.trim()
    if (!reference) {
      return
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(reference)
      } else {
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
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col gap-6 border border-otl-gray-200 border-l-0 bg-bg-gray-50 p-6">
      <div className="flex justify-between items-center">
        <p className="flex-1 text-body-md font-semibold text-txt-black-900">Pratonton</p>
        <Button
          variant="default-outline"
          size="small"
          className="gap-1.5"
          onClick={handleDownloadDokumen}
          disabled={!documentInfo?.path}
        >
          <DownloadIcon className="size-4" />
          Muat Turun
        </Button>
      </div>
      <SearchInPdf
        searchKeyword={searchKeyword}
        onSearchKeywordChange={onSearchKeywordChange}
        currentMatchIndex={currentMatchIndex}
        totalMatches={totalMatches}
        onPreviousMatch={onPreviousMatch}
        onNextMatch={onNextMatch}
        isPdfLoaded={isPdfLoaded}
      />
      <div className="h-full min-h-0 w-full overflow-hidden rounded-lg border border-otl-gray-200 bg-bg-white">
        <div className="h-full min-h-0 overflow-auto">
          <PdfJsDocumentViewer
            fileUrl={documentInfo?.path || ''}
            searchKeyword={searchKeyword}
            navigationRequest={navigationRequest}
            onSearchStateChange={onSearchStateChange}
            onDocumentLoad={handleDocumentLoad}
          />
        </div>
      </div>
      <div className="flex justify-between items-center">
        <Button
          variant="default-outline"
          size="small"
          className="gap-1.5"
          onClick={handleCopyReference}
          disabled={!documentInfo?.referencePath}
        >
          {isReferenceCopied ? 'Rujukan Disalin !' : 'Salin Rujukan'}
        </Button>
        <Button size="small" className="gap-1.5" onClick={handleBukaPratonton}>
          Buka Pratonton
        </Button>
      </div>
    </div>
  )
}
