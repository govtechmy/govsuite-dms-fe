import type { MetadataDocument, MetadataItem } from '@/services/metadata.svc'
import {
  SummaryList,
  SummaryListHeader,
  SummaryListBody,
  SummaryListRow,
  SummaryListTerm,
  SummaryListDetail,
  SummaryListAction,
} from '@govtechmy/myds-react/summary-list'
import normalizeWord from '@/utils/NormalizeWord'

interface MetadataSummaryProps {
  metadata?: MetadataDocument | null
}

const SECTION_TITLE_MAP: Record<string, string> = {
  recordData: 'Profil Dokumen (Repositori)',
  requiredMetadata: 'Dublin Core (Metadata)',
  metadata: 'Metadata Tambahan (Repository)',
}

const RECORD_DATA_TERM_MAP: Record<string, string> = {
  id: 'ID Rekod',
  path: 'Lokasi Folder',
  documentProfile: 'Profil Dokumen',
  recordDescription: 'Ringkasan (Pilihan)',
  accessLevel: 'Tahap Keselamatan',
  unit: 'Unit',
}

function getSectionTitle(title?: string): string {
  if (!title) return 'No Title'

  return SECTION_TITLE_MAP[title] ?? title
}

function toRecordDataDisplayValue(key: string, value: unknown): string {
  if (key === 'unit' || key === 'accessLevel') {
    const normalizedValue = normalizeWord(
      value === null || value === undefined ? '' : String(value)
    )
    return String(normalizedValue ?? '') || '-'
  }

  return String(value ?? '') || '-'
}

function renderMetadataRows(items: MetadataItem[]) {
  return items.map((item, index) => (
    <SummaryListRow key={`${item.title}-${index}`}>
      <SummaryListTerm className="font-medium">{item.title}</SummaryListTerm>
      <SummaryListDetail className="break-words">
        {String(item.value ?? '') || '-'}
      </SummaryListDetail>
      <SummaryListAction></SummaryListAction>
    </SummaryListRow>
  ))
}

export default function MetadataSummary({ metadata }: MetadataSummaryProps) {
  const recordDataEntries = metadata?.recordData ? Object.entries(metadata.recordData) : []
  const hasRecordData = recordDataEntries.length > 0
  const hasRequiredMetadata = (metadata?.requiredMetadata.length ?? 0) > 0
  const hasMetadata = (metadata?.metadata.length ?? 0) > 0

  if (!metadata || (!hasRecordData && !hasRequiredMetadata && !hasMetadata)) {
    return (
      <SummaryList>
        <SummaryListHeader className="font-body text-body-md font-semibold">
          Metadata
        </SummaryListHeader>
        <SummaryListBody>
          <SummaryListRow>
            <SummaryListTerm className="font-medium">Tiada Maklumat Ditemui</SummaryListTerm>
            <SummaryListDetail>-</SummaryListDetail>
            <SummaryListAction></SummaryListAction>
          </SummaryListRow>
        </SummaryListBody>
      </SummaryList>
    )
  }

  return (
    <>
      {hasRecordData && (
        <SummaryList>
          <SummaryListHeader className="font-body text-body-md font-semibold">
            {getSectionTitle('recordData')}
          </SummaryListHeader>
          <SummaryListBody>
            {recordDataEntries.map(([key, value], index) => (
              <SummaryListRow key={`${key}-${index}`}>
                <SummaryListTerm className="font-medium">
                  {RECORD_DATA_TERM_MAP[key] ?? key}
                </SummaryListTerm>
                <SummaryListDetail className="break-words">
                  {toRecordDataDisplayValue(key, value)}
                </SummaryListDetail>
                <SummaryListAction></SummaryListAction>
              </SummaryListRow>
            ))}
          </SummaryListBody>
        </SummaryList>
      )}

      {hasRequiredMetadata && (
        <SummaryList>
          <SummaryListHeader className="font-body text-body-md font-semibold">
            {getSectionTitle('requiredMetadata')}
          </SummaryListHeader>
          <SummaryListBody>{renderMetadataRows(metadata.requiredMetadata)}</SummaryListBody>
        </SummaryList>
      )}

      {hasMetadata && (
        <SummaryList>
          <SummaryListHeader className="font-body text-body-md font-semibold">
            {getSectionTitle('metadata')}
          </SummaryListHeader>
          <SummaryListBody>{renderMetadataRows(metadata.metadata)}</SummaryListBody>
        </SummaryList>
      )}
    </>
  )
}
