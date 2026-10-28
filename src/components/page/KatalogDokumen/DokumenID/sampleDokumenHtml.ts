// Temporary test document for the TipTap view until the record view API is
// integrated. Follows the API's page format: one `data-type="page"` per PDF page
// with absolutely positioned `data-type="frame"` blocks (A4 at 96 DPI).
const PAGE_STYLE = 'position: relative; width: 794px; height: 1123px'

export const SAMPLE_DOKUMEN_PAGES: string[] = [
  `<div data-type="page" data-page="1" style="${PAGE_STYLE}">
    <div data-type="frame" style="left: 72px; top: 72px; width: 650px; font-size: 20px; font-weight: 700; line-height: 1.3">
      <h1 style="text-align: center">MINIT MESYUARAT JAWATANKUASA PENGURUSAN DOKUMEN BIL. 3/2026</h1>
    </div>
    <div data-type="frame" style="left: 72px; top: 170px; width: 650px; font-size: 14px; line-height: 1.6">
      <p><strong>Tarikh:</strong> 15 Oktober 2026</p>
      <p><strong>Masa:</strong> 10.00 pagi</p>
      <p><strong>Tempat:</strong> Bilik Mesyuarat Utama, Aras 5</p>
    </div>
    <div data-type="frame" style="left: 72px; top: 290px; width: 650px; font-size: 16px; font-weight: 700">
      <h2>1. Kehadiran</h2>
    </div>
    <div data-type="frame" style="left: 72px; top: 330px; width: 650px; font-size: 14px; line-height: 1.6">
      <table>
        <tbody>
          <tr><th><p>Bil.</p></th><th><p>Nama</p></th><th><p>Jawatan</p></th></tr>
          <tr><td><p>1</p></td><td><p>Ahmad bin Ali</p></td><td><p>Pengerusi</p></td></tr>
          <tr><td><p>2</p></td><td><p>Siti binti Hassan</p></td><td><p>Setiausaha</p></td></tr>
          <tr><td><p>3</p></td><td><p>Lim Wei Ming</p></td><td><p>Ahli</p></td></tr>
        </tbody>
      </table>
    </div>
    <div data-type="frame" style="left: 72px; top: 520px; width: 650px; font-size: 16px; font-weight: 700">
      <h2>2. Perutusan Pengerusi</h2>
    </div>
    <div data-type="frame" style="left: 72px; top: 560px; width: 650px; font-size: 14px; line-height: 1.6">
      <p style="text-align: justify">Pengerusi mengalu-alukan kehadiran semua ahli mesyuarat dan menekankan kepentingan pengurusan dokumen secara digital bagi meningkatkan kecekapan penyampaian perkhidmatan kerajaan.</p>
    </div>
  </div>`,
  `<div data-type="page" data-page="2" style="${PAGE_STYLE}">
    <div data-type="frame" style="left: 72px; top: 72px; width: 650px; font-size: 16px; font-weight: 700">
      <h2>3. Perkara Berbangkit</h2>
    </div>
    <div data-type="frame" style="left: 72px; top: 112px; width: 650px; font-size: 14px; line-height: 1.6">
      <ul>
        <li><p>Status pemindahan rekod fizikal ke sistem digital.</p></li>
        <li><p>Semakan semula tahap klasifikasi dokumen terperingkat.</p></li>
        <li><p>Latihan penggunaan sistem kepada pegawai baharu.</p></li>
      </ul>
    </div>
    <div data-type="frame" style="left: 72px; top: 230px; width: 650px; font-size: 16px; font-weight: 700">
      <h2>4. Keputusan Mesyuarat</h2>
    </div>
    <div data-type="frame" style="left: 72px; top: 270px; width: 650px; font-size: 14px; line-height: 1.6">
      <ol>
        <li><p>Pemindahan rekod fizikal perlu disiapkan sebelum 31 Disember 2026.</p></li>
        <li><p>Setiap unit hendaklah melantik seorang pegawai penyelaras rekod.</p></li>
      </ol>
    </div>
    <div data-type="frame" style="left: 72px; top: 980px; width: 650px; font-size: 12px; line-height: 1.5">
      <p style="text-align: right"><em>Disediakan oleh: Siti binti Hassan, Setiausaha</em></p>
    </div>
  </div>`,
]
