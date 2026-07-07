import { Button } from '@govtechmy/myds-react/button'
import { DownloadIcon } from '@govtechmy/myds-react/icon'
import { Viewer } from '@react-pdf-viewer/core'
import type { SearchPlugin } from '@react-pdf-viewer/search'
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/search/lib/styles/index.css'
import '@/utils/pdfWorker'
import SearchInPdf from './SearchInPdf'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSearchStore } from '@/store/SearchStore'

interface PratontonSearchResultProps {
  previewSearchQuery?: string
  searchPluginInstance: SearchPlugin
  onDocumentLoad?: () => void
}

export default function PratontonSearchResult({
  previewSearchQuery = '',
  searchPluginInstance,
  onDocumentLoad,
}: PratontonSearchResultProps) {
  const navigate = useNavigate()
  const { lang } = useParams()
  const documentInfo = useSearchStore((state) => state.documentInfo)
  const [isPdfLoaded, setIsPdfLoaded] = useState(false)

  useEffect(() => {
    setIsPdfLoaded(false)
  }, [documentInfo?.documentID])

  const handleBukaPratonton = () => {
    if (documentInfo?.documentID) {
      navigate(`/${lang}/katalog-dokumen/${documentInfo.documentID}`)
    }
  }

  const handleDocumentLoad = () => {
    setIsPdfLoaded(true)
    onDocumentLoad?.()
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-6 border border-otl-gray-200 border-l-0 bg-bg-gray-50 p-6">
      <div className="flex justify-between items-center">
        <p className="flex-1 text-body-md font-semibold text-txt-black-900">Pratonton</p>
        <Button variant="default-outline" size="small" className="gap-1.5">
          <DownloadIcon className="size-4" />
          Muat Turun
        </Button>
      </div>
      <SearchInPdf
        searchPluginInstance={searchPluginInstance}
        previewSearchQuery={previewSearchQuery}
        documentId={documentInfo?.documentID}
        isPdfLoaded={isPdfLoaded}
      />
      <div className="h-full min-h-0 w-full overflow-hidden rounded-lg border border-otl-gray-200 bg-bg-white">
        <div className="h-full min-h-0 overflow-auto">
          <Viewer
            fileUrl={documentInfo?.path || ''}
            plugins={[searchPluginInstance]}
            onDocumentLoad={handleDocumentLoad}
          />
        </div>
      </div>
      <div className="flex justify-between items-center">
        <Button variant="default-outline" size="small" className="gap-1.5">
          Salin Rujukan
        </Button>
        <Button size="small" className="gap-1.5" onClick={handleBukaPratonton}>
          Buka Pratonton
        </Button>
      </div>
    </div>
  )
}
