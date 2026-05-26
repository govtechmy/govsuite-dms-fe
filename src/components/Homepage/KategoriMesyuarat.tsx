import BookmarkIcon from '@/assets/Icons/Bookmark'

export default function KategoriMesyuarat() {
  const data = [
    {
      acronym: 'JKPPN',
      description:
        'Mesyuarat Jawatankuasa Perhubungan Antara Kerajaan Persekutuan dan Kerajaan Negeri',
      tag: '174 Mesyuarat',
    },
    {
      acronym: 'KSUKP',
      description: 'Mesyuarat Ketua Setiausaha Kementerian dan Ketua Perkhidmatan',
      tag: '174 Mesyuarat',
    },
    {
      acronym: 'MBKM',
      description: 'Mesyuarat Menteri Besar dan Ketua Menteri',
      tag: '174 Mesyuarat',
    },
    {
      acronym: 'MJM',
      description: 'Mesyuarat Jemaah Menteri',
      tag: '174 Mesyuarat',
    },
  ]
  return (
    <div className="p-6 flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <div className="font-body text-body-md font-semibold text-txt-black-900">
          Kategori Mesyuarat
        </div>
        <div className="text-body-sm font-normal text-txt-black-500">
          Klik untuk buka Carian Dokumen mengikut kategori mesyuarat.
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {data.map((item) => (
          <div
            key={item.acronym}
            className="border border-otl-gray-200 rounded-lg p-3 gap-3 flex flex-col shadow-button"
          >
            <div>
              <div className="font-body text-body-md font-semibold text-txt-black-900 pb-1.5">
                {item.acronym}
              </div>
              <div className="text-body-sm font-normal text-txt-black-700">{item.description}</div>
            </div>
            <div className="flex justify-end">
              <div className="flex items-center justify-center bg-primary-700 rounded-sm px-1.5 py-1 gap-0.5">
                <BookmarkIcon className="size-4" />
                <p className="text-body-md font-medium text-white"> {item.tag}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
