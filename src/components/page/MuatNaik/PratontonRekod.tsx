import { Button } from '@govtechmy/myds-react/button'
import {
  SummaryList,
  SummaryListAction,
  SummaryListBody,
  SummaryListHeader,
  SummaryListTerm,
  SummaryListDetail,
  SummaryListRow,
} from '@govtechmy/myds-react/summary-list'
import type { DocPreviewInfo } from './MuatNaikDokumenForm'
import MainHeading from '@/components/layout/MainHeading'
import { renderSecretTag } from '@/utils/RenderTag'

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
      {docInfo && (
        <>
          <SummaryList>
            <SummaryListHeader className="font-body text-body-md font-semibold">
              Profil Dokumen (Repositori)
            </SummaryListHeader>
            <SummaryListBody>
              <SummaryListRow>
                <SummaryListTerm className="font-medium">Lokasi Folder</SummaryListTerm>
                <SummaryListDetail>{docInfo.lokasiFolder}</SummaryListDetail>
                <SummaryListAction></SummaryListAction>
              </SummaryListRow>

              <SummaryListRow>
                <SummaryListTerm className="font-medium">Profil Dokumen</SummaryListTerm>
                <SummaryListDetail>{docInfo.profilDokumen}</SummaryListDetail>
                <SummaryListAction></SummaryListAction>
              </SummaryListRow>

              <SummaryListRow>
                <SummaryListTerm className="font-medium">Ringkasan (Pilihan)</SummaryListTerm>
                <SummaryListDetail>{docInfo.ringkasan || '-'}</SummaryListDetail>
                <SummaryListAction></SummaryListAction>
              </SummaryListRow>
            </SummaryListBody>
          </SummaryList>

          <SummaryList>
            <SummaryListHeader className="font-body text-body-md font-semibold">
              Dublin Core (Metadata)
            </SummaryListHeader>

            <SummaryListBody>
              <SummaryListRow>
                <SummaryListTerm className="font-medium">Tajuk</SummaryListTerm>
                <SummaryListDetail>{docInfo.tajuk}</SummaryListDetail>
                <SummaryListAction></SummaryListAction>
              </SummaryListRow>

              <SummaryListRow>
                <SummaryListTerm className="font-medium">Tarikh Mesyuarat</SummaryListTerm>
                <SummaryListDetail>{docInfo.tarikhMesyuarat}</SummaryListDetail>
                <SummaryListAction></SummaryListAction>
              </SummaryListRow>

              <SummaryListRow>
                <SummaryListTerm className="font-medium">Klasifikasi Fail</SummaryListTerm>
                <SummaryListDetail className="py-2">
                  {renderSecretTag(docInfo.klasifikasiFail)}
                </SummaryListDetail>
                <SummaryListAction></SummaryListAction>
              </SummaryListRow>

              <SummaryListRow>
                <SummaryListTerm className="font-medium">Nama Pewujud</SummaryListTerm>
                <SummaryListDetail>{docInfo.namaPewujud}</SummaryListDetail>
                <SummaryListAction></SummaryListAction>
              </SummaryListRow>
            </SummaryListBody>
          </SummaryList>

          <SummaryList>
            <SummaryListHeader className="font-body text-body-md font-semibold">
              Metadata Tambahan (Repositori)
            </SummaryListHeader>

            <SummaryListBody>
              <SummaryListRow>
                <SummaryListTerm className="font-medium">Tempat Mesyuarat</SummaryListTerm>
                <SummaryListDetail>{docInfo.tempatMesyuarat || '-'}</SummaryListDetail>
                <SummaryListAction></SummaryListAction>
              </SummaryListRow>

              <SummaryListRow>
                <SummaryListTerm className="font-medium">Bilangan Helaian</SummaryListTerm>
                <SummaryListDetail>{docInfo.bilanganHelaian || '-'}</SummaryListDetail>
                <SummaryListAction></SummaryListAction>
              </SummaryListRow>

              <SummaryListRow>
                <SummaryListTerm className="font-medium">Jenis Kemasukan Rekod</SummaryListTerm>
                <SummaryListDetail>{docInfo.jenisKemasukan || '-'}</SummaryListDetail>
                <SummaryListAction></SummaryListAction>
              </SummaryListRow>
            </SummaryListBody>
          </SummaryList>
        </>
      )}

      {docInfo && (
        <div className="flex justify-end mt-auto">
          <Button onClick={onSubmit}>Simpan dan Hantar</Button>
        </div>
      )}
    </div>
  )
}
