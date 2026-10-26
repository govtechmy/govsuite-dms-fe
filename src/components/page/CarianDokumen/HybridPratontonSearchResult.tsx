import { Button } from '@govtechmy/myds-react/button'
import { ChevronLeftIcon, ChevronRightIcon } from '@govtechmy/myds-react/icon'
import { useSearchStore } from '@/store/SearchStore'
import DocumentMetaTags from './DocumentMetaTags'
import DocumentHtmlPreview from './DocumentHtmlPreview'
import DocumentPreviewHeader from './DocumentPreviewHeader'

export default function HybridPratontonSearchResult() {
  const documentInfo = useSearchStore((state) => state.documentInfo)
  const documentRecords = useSearchStore((state) => state.documentRecords)
  const selectedResultIndex = useSearchStore((state) => state.selectedResultIndex)
  const totalItems = useSearchStore((state) => state.searchMeta?.totalItems ?? 0)
  const dropdownUnits = useSearchStore((state) => state.dropdownUnits)
  const isLoadingMoreRecords = useSearchStore((state) => state.isLoadingMoreRecords)
  const selectDocument = useSearchStore((state) => state.selectDocument)
  const loadMoreDocumentRecords = useSearchStore((state) => state.loadMoreDocumentRecords)

  const indexInPage = selectedResultIndex ?? -1
  // Highlight only the passage that matched for the selected result
  const selectedRecord = documentRecords[indexInPage]
  const selectedSnippet = selectedRecord?.snippet ?? ''
  const recordPosition = indexInPage + 1
  const isPreviousDisabled = recordPosition <= 1
  const isNextDisabled =
    recordPosition === 0 || recordPosition >= totalItems || isLoadingMoreRecords

  // /units may only list units this user can access; fall back to the raw code
  const unitName =
    dropdownUnits.find((dropdownUnit) => dropdownUnit.code === documentInfo?.unit)?.codeName ??
    documentInfo?.unit

  const handlePreviousRecord = () => {
    if (indexInPage > 0) {
      selectDocument(documentRecords[indexInPage - 1].documentId, indexInPage - 1)
    }
  }

  // The next record may not be loaded yet; load the next results page first
  const handleNextRecord = async () => {
    const nextIndex = indexInPage + 1
    if (nextIndex >= documentRecords.length) {
      await loadMoreDocumentRecords(true)
    }

    const nextRecord = useSearchStore.getState().documentRecords[nextIndex]
    if (nextRecord) {
      selectDocument(nextRecord.documentId, nextIndex)
    }
  }

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
                onClick={handlePreviousRecord}
                disabled={isPreviousDisabled}
              >
                <ChevronLeftIcon />
              </Button>
              <Button
                variant="default-outline"
                size="small"
                iconOnly
                aria-label="Rekod seterusnya"
                onClick={() => void handleNextRecord()}
                disabled={isNextDisabled}
              >
                <ChevronRightIcon />
              </Button>
            </div>
            {recordPosition > 0 && (
              <p
                className="whitespace-nowrap text-xs font-medium leading-[18px] tracking-normal text-txt-black-700"
                aria-live="polite"
              >
                {recordPosition} daripada {totalItems} rekod
              </p>
            )}
          </div>
        </div>
        <DocumentPreviewHeader documentId={documentInfo?.documentID} title={documentInfo?.title}>
          <DocumentMetaTags
            variant="plain"
            recordDate={documentInfo?.recordDate}
            unit={unitName}
            fileType={documentInfo?.fileType}
            fileExtension={documentInfo?.fileExtension}
          />
        </DocumentPreviewHeader>
        <DocumentHtmlPreview
          documentId={documentInfo?.documentID}
          searchKeyword={selectedSnippet}
          searchMatchMode="passage"
          page={selectedRecord?.pageNumber ?? null}
        />
      </div>
    </div>
  )
}
