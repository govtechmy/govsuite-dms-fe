import { Button } from '@govtechmy/myds-react/button'
import { DownloadIcon } from '@govtechmy/myds-react/icon'
import { Viewer } from '@react-pdf-viewer/core'
import type { SearchPlugin } from '@react-pdf-viewer/search'
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/search/lib/styles/index.css'
import '@/utils/pdfWorker'
import { useNavigate, useParams } from 'react-router-dom'

interface DocumentInfo {
  documentID: string
  path: string
}

interface PratontonSearchResultProps {
  documentInfo?: DocumentInfo | null
  searchPluginInstance: SearchPlugin
  onDocumentLoad?: () => void
}

export default function PratontonSearchResult({
  documentInfo,
  searchPluginInstance,
  onDocumentLoad,
}: PratontonSearchResultProps) {
  const navigate = useNavigate()
  const { lang } = useParams()

  const handleBukaPratonton = () => {
    if (documentInfo?.documentID) {
      navigate(`/${lang}/katalog-dokumen/${documentInfo.documentID}`)
    }
  }

  return (
    <div className="w-full border border-otl-gray-200 bg-bg-gray-50 p-6 border-l-0 gap-6 flex flex-col">
      <div className="flex justify-between items-center">
        <p className="flex-1 text-body-md font-semibold text-txt-black-900">Pratonton</p>
        <Button variant="default-outline" size="small" className="gap-1.5">
          <DownloadIcon className="size-4" />
          Muat Turun
        </Button>
      </div>
      <div className="border border-otl-gray-200 bg-bg-white w-full h-full rounded-lg overflow-hidden">
        <div className="h-[600px] overflow-auto">
          <Viewer
            fileUrl="/MinitMesyuaratSample.pdf"
            plugins={[searchPluginInstance]}
            onDocumentLoad={onDocumentLoad}
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
