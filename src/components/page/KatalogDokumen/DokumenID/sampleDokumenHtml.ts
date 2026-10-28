import type { RecordViewPagesResponse } from '@/services/recordView.svc'

// Sample GET /record/view/:recordId?page=1&pageSize=3 response
const dataSample: { success: boolean; data: RecordViewPagesResponse } = {
  success: true,
  data: {
    items: [
      {
        pageNumber: 1,
        contentEditor:
          '<div>\n<p>RAHSIA</p>\n<p>Salinan Bil: 3.</p>\n<h2>DOKUMEN INI IALAH HAK MILIK KERAJAAN MALAYSIA</h2>\n<p>JPM(R)10214/57 Jilid 51</p>\n<h2>MESYUARAT MENTERI BESAR DAN KETUA MENIERI KE-120</h2>\n<p>Tarikh</p>\n<p>25 Februari 2014 (Selasa)</p>\n<p>Masa</p>\n<p>Tempat</p>\n<p>10.00 pagi hingga 12.30 tengah hari</p>\n<p>Bilik Mesyuarat Perdana; Pejabat Perdana Menteri; Aras 3, Blok Utama, Bangunan Perdana Putra 62502 PUTRAJAYA</p>\n<h2>AGENDA MESYUARAI</h2>\n<table><tbody><tr><th>BIL.</th><th>PERKARA</th></tr><tr><td>I.</td><td>Perutusan Khas YAB Pengerusi.</td></tr><tr><td>II.</td><td>Pengesahan Minit Mesyuarat Menteri Besar dan Ketua Menteri Ke-119 yang diadakan pada Selasa, 29 Oktober 2013.</td></tr><tr><td>III.</td><td>Perkara-perkara Berbangkit - Status Tindakan Ke Atas Keputusan-Keputusan Mesyuarat Menteri Besar dan Ketua Menteri LMB/120/2013.</td></tr></tbody></table>\n<p>RAHSIA</p>\n</div>',
      },
      {
        pageNumber: 2,
        contentEditor:
          '<div>\n<p>RAHSIA</p>\n<ul>\n<li>IV Pembentangan Nota:</li>\n<li>Nota Daripada Perdana Menteri Bil. N1/120/2014 Status Terkini Inisiatif Public Service Delivery Transformation;</li>\n</ul>\n<p>(Taklimat akan diadakan semasa Mesyuarat Menteri Besar dan Ketua Menteri)</p>\n<ol>\n<li>Nota Daripada Kementerian Perdagangan Antarabangsa Dan Industri Bil.  N2/120/2014 Dasar Automatif Nasional 2014; dan</li>\n</ol>\n<p>(Taklimat akan diadakan semasa Mesyuarat  Menteri Besar dan Ketua Menteri)</p>\n<ol>\n<li>Nota Daripada Kementerian Perdagangan Antarabangsa Dan Industri Bil. N3/120/2014 Penyertaan Malaysia Dalam Ekspo Milan 2015 Di Milan; Itali, 1 Mei 31 Oktober 2015.</li>\n<li>V Hal-Hal Lain.</li>\n</ol>\n<p>~</p>\n<p>Bahagian Kabinet; Perlembagaan Jabatan Perdana Menteri Putrajaya.</p>\n<p>14 Februari 2014</p>\n<p>(2)</p>\n<p>RAHSIA</p>\n</div>',
      },
    ],
    meta: {
      currentPage: 1,
      pageSize: 10,
      totalItems: 2,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  },
}

export default dataSample
