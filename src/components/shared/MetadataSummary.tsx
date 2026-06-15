import { renderSecretTag } from '@/utils/RenderTag'
import {
  SummaryList,
  SummaryListHeader,
  SummaryListBody,
  SummaryListRow,
  SummaryListTerm,
  SummaryListDetail,
  SummaryListAction,
} from '@govtechmy/myds-react/summary-list'
import type { DocPreviewInfo } from '@/components/page/MuatNaik/MuatNaikDokumenForm'

interface MetadataSummaryProps {
  docInfo: DocPreviewInfo
}

export default function MetadataSummary({ docInfo }: MetadataSummaryProps) {
  return (
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
  )
}
