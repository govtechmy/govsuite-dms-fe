import { Button } from '@govtechmy/myds-react/button'
import type { DocPreviewInfo } from './MuatNaikDokumenForm'
import MainHeading from '@/components/layout/MainHeading'
import MetadataSummary from '@/components/shared/MetadataSummary'
import type { MetadataDocument } from '@/services/metadata.svc'

interface PratontonRekodProps {
  docInfo: DocPreviewInfo | null
  onSubmit: () => void
}

export default function PratontonRekod({ docInfo, onSubmit }: PratontonRekodProps) {
  const metadataPreview: MetadataDocument | null = docInfo
    ? {
        recordData: {
          path: docInfo.lokasiFolder,
          documentProfile: docInfo.profilDokumen,
          recordDescription: docInfo.ringkasan,
          accessLevel: docInfo.tahapKeselamatan,
        },
        requiredMetadata: docInfo.metadataFields
          .filter((field) => field.required)
          .map((field) => ({
            key: field.key,
            title: field.title,
            type: field.type,
            required: 'true',
            value: docInfo.metadataValues[field.key] || '',
          })),
        metadata: [
          ...docInfo.metadataFields
            .filter((field) => !field.required)
            .map((field) => ({
              key: field.key,
              title: field.title,
              type: field.type,
              required: 'false',
              value: docInfo.metadataValues[field.key] || '',
            })),
          {
            key: 'meeting-place',
            title: 'Tempat Mesyuarat',
            type: 'text',
            required: 'false',
            value: docInfo.tempatMesyuarat,
          },
          {
            key: 'page-count',
            title: 'Bilangan Helaian',
            type: 'number',
            required: 'false',
            value: docInfo.bilanganHelaian,
          },
          {
            key: 'record-entry-type',
            title: 'Jenis Kemasukan Rekod',
            type: 'text',
            required: 'false',
            value: docInfo.jenisKemasukan,
          },
        ],
      }
    : null

  return (
    <div className="flex gap-6 flex-col h-full">
      <MainHeading>Pratonton Rekod</MainHeading>

      {!docInfo && (
        <>
          <div className="h-full flex-grow flex items-center justify-center text-txt-black-500 text-sm font-normal">
            Sila isi metadata dan tekan Muat Naik (Preview)
          </div>
          <div className="flex items-center justify-end">
            <Button disabled>Simpan dan Hantar</Button>
          </div>
        </>
      )}
      {docInfo && <MetadataSummary metadata={metadataPreview} />}

      {docInfo && (
        <div className="flex justify-end mt-auto">
          <Button onClick={onSubmit}>Simpan dan Hantar</Button>
        </div>
      )}
    </div>
  )
}
