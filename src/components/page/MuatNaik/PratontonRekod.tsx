import { Button } from '@govtechmy/myds-react/button'
import type { DocPreviewInfo } from './MuatNaikDokumenForm'
import MainHeading from '@/components/layout/MainHeading'
import MetadataSummary from '@/components/shared/MetadataSummary'

interface PratontonRekodProps {
  docInfo: DocPreviewInfo | null
  onSubmit: () => void
}

export default function PratontonRekod({ docInfo, onSubmit }: PratontonRekodProps) {
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
      {docInfo && <MetadataSummary docInfo={docInfo} />}

      {docInfo && (
        <div className="flex justify-end mt-auto">
          <Button onClick={onSubmit}>Simpan dan Hantar</Button>
        </div>
      )}
    </div>
  )
}
