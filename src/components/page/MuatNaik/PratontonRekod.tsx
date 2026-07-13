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
        requiredMetadata: docInfo.requiredMetadataFields.map((field) => ({
          key: field.key,
          title: field.title,
          type: field.type,
          required: 'true',
          value: docInfo.requiredMetadataValues[field.key] || '',
        })),
        metadata: docInfo.additionalMetadataFields.map((field) => ({
          key: field.key,
          title: field.title,
          type: field.type,
          required: field.required ? 'true' : 'false',
          value: docInfo.additionalMetadataValues[field.key] || '',
        })),
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
