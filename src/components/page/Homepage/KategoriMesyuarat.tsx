import BookmarkIcon from '@/assets/Icons/Bookmark'
import { useNavigate, useParams } from 'react-router-dom'

interface KategoriMesyuaratItem {
  acronym: string
  description: string
  tag: string
}

interface KategoriMesyuaratProps {
  data: KategoriMesyuaratItem[]
}

export default function KategoriMesyuarat({ data }: KategoriMesyuaratProps) {
  const navigate = useNavigate()
  const { lang = 'ms' } = useParams()

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
            className="border border-otl-gray-200 rounded-lg p-3 gap-3 flex flex-col shadow-button cursor-pointer"
            onClick={() => navigate(`/${lang}/katalog-dokumen`)}
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
