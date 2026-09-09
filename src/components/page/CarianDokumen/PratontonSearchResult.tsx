import { Button } from '@govtechmy/myds-react/button'
// import { DownloadIcon } from '@govtechmy/myds-react/icon'
import PdfJsDocumentViewer, {
  type PdfPageNavigationRequest,
  type PdfSearchNavigationRequest,
  type PdfSearchState,
} from '@/components/shared/PdfJsDocumentViewer'
import SearchInPdf from './SearchInPdf'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSearchStore } from '@/store/SearchStore'
import { HeartIcon } from '@govtechmy/myds-react/icon'
// import { downloadFile } from '@/utils/downloadFile'

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
  isIndexing: boolean
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
  isIndexing,
}: PratontonSearchResultProps) {
  const navigate = useNavigate()
  const { lang } = useParams()
  const documentInfo = useSearchStore((state) => state.documentInfo)
  // const documentRecords = useSearchStore((state) => state.documentRecords)
  const [isPdfLoaded, setIsPdfLoaded] = useState(false)
  const [isReferenceCopied, setIsReferenceCopied] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [pageNavigationRequest, setPageNavigationRequest] =
    useState<PdfPageNavigationRequest | null>(null)
  const pageNavigationTokenRef = useRef(0)

  // const currentDocumentTitle = documentRecords.find(
  //   (documentRecord) => documentRecord.documentId === documentInfo?.documentID
  // )?.title

  useEffect(() => {
    setIsPdfLoaded(false)
    setCurrentPage(1)
    setTotalPages(0)
    setPageNavigationRequest(null)
    pageNavigationTokenRef.current = 0
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

  const handlePageChange = (nextCurrentPage: number, nextTotalPages: number) => {
    setCurrentPage(nextCurrentPage)
    setTotalPages(nextTotalPages)
  }

  const queuePageNavigationRequest = (targetPage: number) => {
    pageNavigationTokenRef.current += 1
    setPageNavigationRequest({
      page: targetPage,
      token: pageNavigationTokenRef.current,
    })
  }

  const handlePreviousPage = () => {
    queuePageNavigationRequest(Math.max(1, currentPage - 1))
  }

  const handleNextPage = () => {
    queuePageNavigationRequest(Math.min(totalPages, currentPage + 1))
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
    <div className="flex h-full min-h-[480px] min-w-0 flex-1 flex-col border border-otl-gray-200 border-l-0 bg-bg-gray-50 p-4 sm:p-6 lg:min-h-0">
      <div className="flex justify-between items-center">
        <p className="flex-1 text-body-md font-semibold text-txt-black-900">Pratonton</p>
        {/* <Button
          variant="default-outline"
          size="small"
          className="gap-1.5"
          onClick={handleDownloadDokumen}
          disabled={!documentInfo?.path}
        >
          <DownloadIcon className="size-4" />
          Muat Turun
        </Button> */}
        <Button variant={'default-outline'} className="px-2">
          <HeartIcon />
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
        isIndexing={isIndexing}
        currentPage={currentPage}
        totalPages={totalPages}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
      />
      <div className="h-full min-h-0 w-full overflow-hidden rounded-lg border border-otl-gray-200 bg-bg-white">
        <div className="h-full min-h-0 overflow-auto">
          <PdfJsDocumentViewer
            fileUrl={documentInfo?.path || ''}
            searchKeyword={searchKeyword}
            navigationRequest={navigationRequest}
            pageNavigationRequest={pageNavigationRequest}
            onSearchStateChange={onSearchStateChange}
            onDocumentLoad={handleDocumentLoad}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
      <div className="flex justify-between items-center pt-6">
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
          Paparan Penuh
        </Button>
      </div>
    </div>
  )
}
