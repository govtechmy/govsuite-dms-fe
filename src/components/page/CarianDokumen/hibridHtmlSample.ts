import type { CatalogListMeta } from '@/services/catalog.svc'

export interface RecordViewFile {
  path: string
  type: string
  extension: string
  sizeMb: number
}

export interface RecordViewPassage {
  record_id: string
  page_number: number
  accessLevel: string
  recordDate: string
  documentProfile: string
  documentProfileName: string
  file: RecordViewFile
  score: number
  keyword_score: number
  rerank_score: number
  relevance_score: number
  snippet: string
}

export interface RecordPassageRejection {
  top_reranker_score: number
  top_reranker_score_gap: number
  rerank_rejected: boolean
  rerank_rejection_reason: string | null
}

export interface RecordPassageResponse {
  success: boolean
  data: {
    request_id: string
    took_ms: number
    search: string
    items: RecordViewPassage[]
    ranking_mode: string
    rejection: RecordPassageRejection
    meta: CatalogListMeta
  }
}

const dataSampleHibrid: RecordPassageResponse = {
  success: true,
  data: {
    request_id: 'e4c300a2-9c1c-4e6b-b19b-745b23c75400',
    took_ms: 17605.531906992197,
    search: 'rahsia',
    items: [
      {
        record_id: '1793263636950_6ae30814f41522d18a467bbe',
        page_number: 1,
        accessLevel: 'Rahsia',
        recordDate: '2026-10-01T00:00:00.000Z',
        documentProfile: 'AGENDA_MESYUARAT',
        documentProfileName: 'Agenda Mesyuarat',
        file: {
          path: '/PEJABAT SUB/2026/1793263636950_6ae30814f41522d18a467bbe',
          type: 'application/pdf',
          extension: 'pdf',
          sizeMb: 1.09459,
        },
        score: 0.41159803,
        keyword_score: 0.7651515151515151,
        rerank_score: 0.9032915830612183,
        relevance_score: 71.16,
        snippet:
          'RAHSIA DOKUMEN INI IALAH HAK MILIK KERAJAAN MALAYSIA JPM(R)10214/57 Jilid 51 MESYUARAT MENTERI BESAR DAN KETUA MENTERI KE-120 Tarikh 25 Februari 2014 (Selasa) Masa 10.00 pagi hingga 12.30 tengah hari Tempat Bilik Mesyuarat Perdana, Pejabat Perdana Menteri, Aras 3, Blok Utama, Bangunan Perdana Putra, 62502 PUTRAJAYA.',
      },
      {
        record_id: '1793259811137_6ae2f923f41522d18a467b8b',
        page_number: 1,
        accessLevel: 'Terhad',
        recordDate: '2026-10-29T00:00:00.000Z',
        documentProfile: 'AGENDA_MESYUARAT',
        documentProfileName: 'Agenda Mesyuarat',
        file: {
          path: '/PEJABAT SUB/1793259811137_6ae2f923f41522d18a467b8b',
          type: 'application/pdf',
          extension: 'pdf',
          sizeMb: 1.09459,
        },
        score: 0.42992783,
        keyword_score: 0.7651515151515151,
        rerank_score: 0.66673743724823,
        relevance_score: 66.08,
        snippet:
          'RAHSIA Salinan Bil.: DOKUMEN INI IALAH HAK MILIK KERAJAAN MALAYSIA JPM(R)10214/57 Jilid 51 MESYUARAT MENTERI BESAR DAN KETUA MENTERI KE-120 Tarikh 25 Februari 2014 (Selasa) Masa 10.00 pagi hingga 12.30 tengah hari Tempat Bilik Mesyuarat Perdana, Pejabat Perdana Menteri, Aras 3, Blok Utama, Bangunan Perdana Putra, 62502',
      },
      {
        record_id: '1793255920136_6ae2e9f0c0991689b23aa2f6',
        page_number: 1,
        accessLevel: 'Terbuka',
        recordDate: '2026-10-01T00:00:00.000Z',
        documentProfile: 'MEMO',
        documentProfileName: 'Memo',
        file: {
          path: '/PEJABAT SUB/2026/1793255920136_6ae2e9f0c0991689b23aa2f6',
          type: 'application/pdf',
          extension: 'pdf',
          sizeMb: 1.09459,
        },
        score: 0.42992783,
        keyword_score: 0.7651515151515151,
        rerank_score: 0.66673743724823,
        relevance_score: 66.08,
        snippet:
          'RAHSIA Salinan Bil.: DOKUMEN INI IALAH HAK MILIK KERAJAAN MALAYSIA JPM(R)10214/57 Jilid 51 MESYUARAT MENTERI BESAR DAN KETUA MENTERI KE-120 Tarikh 25 Februari 2014 (Selasa) Masa 10.00 pagi hingga 12.30 tengah hari Tempat Bilik Mesyuarat Perdana, Pejabat Perdana Menteri, Aras 3, Blok Utama, Bangunan Perdana Putra, 62502',
      },
      {
        record_id: '1793259811137_6ae2f923f41522d18a467b8b',
        page_number: 2,
        accessLevel: 'Terhad',
        recordDate: '2026-10-29T00:00:00.000Z',
        documentProfile: 'AGENDA_MESYUARAT',
        documentProfileName: 'Agenda Mesyuarat',
        file: {
          path: '/PEJABAT SUB/1793259811137_6ae2f923f41522d18a467b8b',
          type: 'application/pdf',
          extension: 'pdf',
          sizeMb: 1.09459,
        },
        score: 0.43925276,
        keyword_score: 0.7645631067961165,
        rerank_score: 0.4652022123336792,
        relevance_score: 61.42,
        snippet:
          'RAHSIA IV. Pembentangan Nota: (1) Nota Daripada Perdana Menteri Bil. N1/120/2014 – Status Terkini Inisiatif Public Service Delivery Transformation; (Taklimat akan diadakan semasa Mesyuarat Menteri Besar dan Ketua Menteri) (2) Nota Daripada Kementerian Perdagangan Antarabangsa Dan Industri Bil. N2/120/2014 – Dasar',
      },
      {
        record_id: '1793255920136_6ae2e9f0c0991689b23aa2f6',
        page_number: 2,
        accessLevel: 'Terbuka',
        recordDate: '2026-10-01T00:00:00.000Z',
        documentProfile: 'MEMO',
        documentProfileName: 'Memo',
        file: {
          path: '/PEJABAT SUB/2026/1793255920136_6ae2e9f0c0991689b23aa2f6',
          type: 'application/pdf',
          extension: 'pdf',
          sizeMb: 1.09459,
        },
        score: 0.43925276,
        keyword_score: 0.7645631067961165,
        rerank_score: 0.4652022123336792,
        relevance_score: 61.42,
        snippet:
          'RAHSIA IV. Pembentangan Nota: (1) Nota Daripada Perdana Menteri Bil. N1/120/2014 – Status Terkini Inisiatif Public Service Delivery Transformation; (Taklimat akan diadakan semasa Mesyuarat Menteri Besar dan Ketua Menteri) (2) Nota Daripada Kementerian Perdagangan Antarabangsa Dan Industri Bil. N2/120/2014 – Dasar',
      },
      {
        record_id: '1793263636950_6ae30814f41522d18a467bbe',
        page_number: 2,
        accessLevel: 'Rahsia',
        recordDate: '2026-10-01T00:00:00.000Z',
        documentProfile: 'AGENDA_MESYUARAT',
        documentProfileName: 'Agenda Mesyuarat',
        file: {
          path: '/PEJABAT SUB/2026/1793263636950_6ae30814f41522d18a467bbe',
          type: 'application/pdf',
          extension: 'pdf',
          sizeMb: 1.09459,
        },
        score: 0.42820597,
        keyword_score: 0.7645631067961165,
        rerank_score: 0.26473286747932434,
        relevance_score: 56.58,
        snippet:
          'RAHSIA IV. Pembentangan Nota: (1) Nota Daripada Perdana Menteri Bil. N1/120/2014 - Status Terkini Inisiatif Public Service Delivery Transformation; (Taklimat akan diadakan semasa Mesyuarat Menteri Besar dan Ketua Menteri) (2) Nota Daripada Kementerian Perdagangan Antarabangsa Dan Industri Bil. N2/120/2014 - Dasar',
      },
      {
        record_id: '1793274313994_6ae331c9f41522d18a467c1b',
        page_number: 68,
        accessLevel: 'Terbuka',
        recordDate: '2026-10-01T00:00:00.000Z',
        documentProfile: 'MINIT_MESYUARAT',
        documentProfileName: 'Minit Mesyuarat',
        file: {
          path: '/PEJABAT SUB/2026/1793274313994_6ae331c9f41522d18a467c1b',
          type: 'application/pdf',
          extension: 'pdf',
          sizeMb: 0.61808,
        },
        score: 0.40015787,
        keyword_score: 0.7525252525252526,
        rerank_score: -1.3509939908981323,
        relevance_score: 20.57,
        snippet:
          'menyimpan data-data dan rekod tersebut dan kita akan pastikan bahawa rekod ini tidak akan dijual, dicuri macam CTOSlah... [Ketawa] Kita ada punitif yang berat bagi mereka-mereka yang menjual rahsia. Jadi, mungkin tidak ada peraturan tertentu, maka dia boleh jual dengan harga RM25... Puan Mumtaz binti Md Nawi: Saya',
      },
      {
        record_id: '1793274313994_6ae331c9f41522d18a467c1b',
        page_number: 58,
        accessLevel: 'Terbuka',
        recordDate: '2026-10-01T00:00:00.000Z',
        documentProfile: 'MINIT_MESYUARAT',
        documentProfileName: 'Minit Mesyuarat',
        file: {
          path: '/PEJABAT SUB/2026/1793274313994_6ae331c9f41522d18a467c1b',
          type: 'application/pdf',
          extension: 'pdf',
          sizeMb: 0.61808,
        },
        score: 0.3783551,
        keyword_score: 0,
        rerank_score: -1.3919661045074463,
        relevance_score: 19.91,
        snippet:
          'ujian makmal; dan yang keenam ialah tentang menjalankan ujian makmal khas seperti ujian molekular seperti nuclear acid test dan PCR. Perkara-perkara ini penting kerana mereka ini terlibat 100% dalam makmal dan mereka sentiasa berada di situ dan merekalah yang sebenarnya yang practical man. Jadi dalam ini tidak disebut,',
      },
      {
        record_id: '1793274313994_6ae331c9f41522d18a467c1b',
        page_number: 60,
        accessLevel: 'Terbuka',
        recordDate: '2026-10-01T00:00:00.000Z',
        documentProfile: 'MINIT_MESYUARAT',
        documentProfileName: 'Minit Mesyuarat',
        file: {
          path: '/PEJABAT SUB/2026/1793274313994_6ae331c9f41522d18a467c1b',
          type: 'application/pdf',
          extension: 'pdf',
          sizeMb: 0.61808,
        },
        score: 0.40761888,
        keyword_score: 0.5010917030567685,
        rerank_score: -2.121744155883789,
        relevance_score: 10.7,
        snippet:
          'bagaimana ia diselenggarakan. Kita tidak mahu ada maklumat salah yang mengelirukan orang ramai; dan (vi) sejauh mana rahsia keputusan disimpan. Bagaimana orang ramai mendapat jaminan. Kita tidak mahu ia menjadi seperti isu CTOS - Credit Tip-off Service Sdn. Bhd. yang menjual maklumat kewangan peribadi orang ramai',
      },
      {
        record_id: '1793274313994_6ae331c9f41522d18a467c1b',
        page_number: 42,
        accessLevel: 'Terbuka',
        recordDate: '2026-10-01T00:00:00.000Z',
        documentProfile: 'MINIT_MESYUARAT',
        documentProfileName: 'Minit Mesyuarat',
        file: {
          path: '/PEJABAT SUB/2026/1793274313994_6ae331c9f41522d18a467c1b',
          type: 'application/pdf',
          extension: 'pdf',
          sizeMb: 0.61808,
        },
        score: 0.37366962,
        keyword_score: 0,
        rerank_score: -2.9242210388183594,
        relevance_score: 5.1,
        snippet:
          'DN.12.7.2007 37 Rang undang-undang ini juga menyatakan dalam fasal 14, bahawa satu sekatan ke atas media di mana media massa tidak dibenarkan mendedahkan atau menyiarkan apa apa butiran atau gambar mengenai saksi yang boleh membawa kepada pengenalpastian saksi berkenaan. Barang siapa yang didapati berbuat sedemikian,',
      },
    ],
    ranking_mode: 'reranked',
    rejection: {
      top_reranker_score: 0.9032915830612183,
      top_reranker_score_gap: 0.23655414581298828,
      rerank_rejected: false,
      rerank_rejection_reason: null,
    },
    meta: {
      currentPage: 1,
      pageSize: 10,
      totalItems: 19,
      totalPages: 2,
      hasNextPage: true,
      hasPreviousPage: false,
    },
  },
}

export default dataSampleHibrid
