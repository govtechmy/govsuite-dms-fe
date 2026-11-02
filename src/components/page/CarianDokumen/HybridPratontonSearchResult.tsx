import { Button } from '@govtechmy/myds-react/button'
import { ChevronLeftIcon, ChevronRightIcon } from '@govtechmy/myds-react/icon'
import PdfHtmlDocumentViewer from '@/components/page/KatalogDokumen/DokumenID/PdfHtmlDocumentViewer'
import PdfJsDocumentViewer from '@/components/shared/PdfJsDocumentViewer'
import DocumentMetaTags from './DocumentMetaTags'
import DocumentPreviewHeader from './DocumentPreviewHeader'
import type { HybridSearchRecord } from './HybridRecordResultSearch'
import { SAMPLE_PAGES } from './sampleDocumentPages'

interface HybridPratontonSearchResultProps {
  record: HybridSearchRecord
  recordPosition: number
  totalItems: number
  onPreviousRecord: () => void
  onNextRecord: () => void
}

export default function HybridPratontonSearchResult({
  record,
  recordPosition,
  totalItems,
  onPreviousRecord,
  onNextRecord,
}: HybridPratontonSearchResultProps) {
  return (
    <div className="flex h-full min-h-[480px] min-w-0 flex-1 flex-col border-y border-otl-gray-200 p-4 sm:p-6 md:min-h-0 md:py-3 md:pr-3">
      <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-xl border border-otl-gray-200 bg-bg-dialog p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-body-md font-semibold text-txt-black-900">Semakan Hasil Carian</h2>
          <div className="flex items-center gap-3">
            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="default-outline"
                size="small"
                iconOnly
                aria-label="Rekod sebelum"
                onClick={onPreviousRecord}
                disabled={recordPosition <= 1}
              >
                <ChevronLeftIcon />
              </Button>
              <Button
                variant="default-outline"
                size="small"
                iconOnly
                aria-label="Rekod seterusnya"
                onClick={onNextRecord}
                disabled={recordPosition >= totalItems}
              >
                <ChevronRightIcon />
              </Button>
            </div>
            <p
              className="whitespace-nowrap text-xs font-medium leading-[18px] tracking-normal text-txt-black-700"
              aria-live="polite"
            >
              {recordPosition} daripada {totalItems} rekod
            </p>
          </div>
        </div>
        {/* No documentId yet: the sample records do not exist, so "Buka Dokumen" stays disabled */}
        <DocumentPreviewHeader title={record.title}>
          <DocumentMetaTags
            variant="plain"
            recordDate={record.recordDate}
            unit={record.unit}
            fileType={record.fileType}
            fileExtension={record.fileExtension}
          />
        </DocumentPreviewHeader>
        <div className="min-h-0 w-full flex-1 overflow-hidden">
          <div className="h-full min-h-0 overflow-auto">
            {/* TODO: replace the sample pages with the record view API, and pass the
                record's file to the PDF below (the sample records have no file) */}
            <PdfHtmlDocumentViewer pages={SAMPLE_PAGES} searchKeyword={record.snippet} />

            <PdfJsDocumentViewer fileUrl="" />
          </div>
        </div>
      </div>
    </div>
  )
}
