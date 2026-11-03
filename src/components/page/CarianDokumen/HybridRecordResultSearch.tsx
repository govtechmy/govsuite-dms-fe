import { clx } from '@govtechmy/myds-react/utils'
import DocumentMetaTag from './DocumentMetaTag'
import {
  PLACEHOLDER_JENIS_DOKUMEN,
  PLACEHOLDER_PASSAGE,
  PLACEHOLDER_RELEVANCE,
  PLACEHOLDER_TARIKH,
} from './recordPlaceholders'
import type { RecordResultListProps } from './searchMode'

// Relevance dot colour: 0–49 red, 50–69 yellow, 70–100 green
const HIGH_RELEVANCE_SCORE = 70
const LOW_RELEVANCE_SCORE = 50

const getRelevanceDotClass = (score: number) =>
  score >= HIGH_RELEVANCE_SCORE
    ? 'bg-success-600'
    : score >= LOW_RELEVANCE_SCORE
      ? 'bg-warning-600'
      : 'bg-danger-600'

export default function HybridRecordResultSearch({
  records,
  totalItems,
  selectedDocumentId,
  onDocumentSelect,
}: RecordResultListProps) {
  return (
    <section className="flex h-[560px] w-full flex-col gap-3 lg:h-full lg:min-h-0">
      <h2 className="text-body-md font-semibold text-txt-black-900">
        Hasil Carian ({totalItems} rekod)
      </h2>

      <ul
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1"
        aria-label="Senarai hasil carian"
      >
        {records.map((record) => {
          const isSelected = selectedDocumentId === record.documentId

          return (
            <li key={record.documentId}>
              <button
                type="button"
                onClick={() => onDocumentSelect(record.documentId)}
                aria-current={isSelected ? 'true' : undefined}
                className={clx(
                  'relative flex w-full cursor-pointer flex-col gap-2 rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fr-primary',
                  isSelected
                    ? 'border-otl-primary-300 bg-bg-primary-50'
                    : 'border-otl-gray-200 bg-bg-white hover:bg-bg-washed'
                )}
              >
                <span className="flex items-center gap-1.5 self-end text-body-xs font-semibold text-txt-black-900">
                  <span
                    className={clx(
                      'size-2 rounded-full',
                      getRelevanceDotClass(PLACEHOLDER_RELEVANCE)
                    )}
                    aria-hidden="true"
                  />
                  <span className="sr-only">Skor relevan</span>
                  {PLACEHOLDER_RELEVANCE}%
                </span>
                <p className="line-clamp-3 text-body-xs text-txt-black-700">
                  “{PLACEHOLDER_PASSAGE}”
                </p>
                <p className="line-clamp-2 text-body-sm font-semibold text-txt-primary underline underline-offset-2">
                  {record.title}
                </p>
                {/* TODO: add the "Muka Surat N" chip from the design once hybrid
                    search returns the page each passage was found on. */}
                <DocumentMetaTag
                  jenisDokumen={PLACEHOLDER_JENIS_DOKUMEN}
                  tarikh={PLACEHOLDER_TARIKH}
                />
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
