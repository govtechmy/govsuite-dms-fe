import { Viewer } from '@react-pdf-viewer/core'
import type { SearchPlugin } from '@react-pdf-viewer/search'
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/search/lib/styles/index.css'
import '@/utils/pdfWorker'

interface DokumenContentIDProps {
  pdfUrl: string
  searchPluginInstance: SearchPlugin
}

export default function DokumenContentID({ pdfUrl, searchPluginInstance }: DokumenContentIDProps) {
  return (
    <div className="h-[1200px] overflow-auto">
      <div className="h-full w-full">
        <Viewer fileUrl={pdfUrl} plugins={[searchPluginInstance]} />
      </div>
    </div>
  )
}
