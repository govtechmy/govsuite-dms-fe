import { Button } from '@govtechmy/myds-react/button'
import { ChevronLeftIcon, ChevronRightIcon } from '@govtechmy/myds-react/icon'
import { useSearchStore } from '@/store/SearchStore'
import DocumentMetaTags from './DocumentMetaTags'
import DocumentHtmlPreview from './DocumentHtmlPreview'
import DocumentPreviewHeader from './DocumentPreviewHeader'
import { useSearchPage } from './useSearchPage'

interface HybridPratontonSearchResultProps {
  searchKeyword: string
}

export default function HybridPratontonSearchResult({
  searchKeyword,
}: HybridPratontonSearchResultProps) {
  const documentInfo = useSearchStore((state) => state.documentInfo)
  const documentRecords = useSearchStore((state) => state.documentRecords)
  const selectedDocumentId = useSearchStore((state) => state.selectedDocumentId)
  const totalItems = useSearchStore((state) => state.searchMeta?.totalItems ?? 0)
  const dropdownUnits = useSearchStore((state) => state.dropdownUnits)
  const selectDocument = useSearchStore((state) => state.selectDocument)
  const setSelectLastOnNextLoad = useSearchStore((state) => state.setSelectLastOnNextLoad)
  const { pageNumber, pageSize, goToPage } = useSearchPage()

  const indexInPage = documentRecords.findIndex(
    (record) => record.documentId === selectedDocumentId
  )
  const recordPosition = indexInPage >= 0 ? (pageNumber - 1) * pageSize + indexInPage + 1 : 0
  const isPreviousDisabled = recordPosition <= 1
  const isNextDisabled = recordPosition === 0 || recordPosition >= totalItems

  // /units may only list units this user can access; fall back to the raw code
  const unitName =
    dropdownUnits.find((dropdownUnit) => dropdownUnit.code === documentInfo?.unit)?.codeName ??
    documentInfo?.unit

  const handlePreviousRecord = () => {
    if (indexInPage > 0) {
      selectDocument(documentRecords[indexInPage - 1].documentId)
      return
    }

    if (pageNumber > 1) {
      setSelectLastOnNextLoad(true)
      goToPage(pageNumber - 1)
    }
  }

  const handleNextRecord = () => {
    if (indexInPage < documentRecords.length - 1) {
      selectDocument(documentRecords[indexInPage + 1].documentId)
      return
    }

    goToPage(pageNumber + 1)
  }

  return (
    <div className="flex h-full min-h-[480px] min-w-0 flex-1 flex-col border-y border-otl-gray-200 p-4 sm:p-6 md:min-h-0">
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
                onClick={handleNextRecord}
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
          <DocumentMetaTags variant="plain" recordDate={documentInfo?.recordDate} unit={unitName} />
        </DocumentPreviewHeader>
        <DocumentHtmlPreview
          documentId={documentInfo?.documentID}
          fileUrl={documentInfo?.path}
          searchKeyword={searchKeyword}
        />
      </div>
    </div>
  )
}
