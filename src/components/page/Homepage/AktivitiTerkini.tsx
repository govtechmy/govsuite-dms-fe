import Excerpts from '@/components/shared/Excerpts'
import { useNavigate, useParams } from 'react-router-dom'

export interface AktivitiTerkiniItem {
  date: string
  classification: string
  status: string
  type: string
  unit: string
  title: string
  id: string
}

interface AktivitiTerkiniProps {
  data: AktivitiTerkiniItem[]
}

export default function AktivitiTerkini({ data }: AktivitiTerkiniProps) {
  const navigate = useNavigate()
  const { lang } = useParams()
  const activeLang = lang ?? localStorage.getItem('lang') ?? 'ms'

  return (
    <div className="p-6">
      <div className="text-body-md font-semibold text-txt-black-900">Aktiviti Terkini</div>
      <div className="text-body-sm font-normal text-txt-black-500 pt-1 pb-3">
        Dokumen yang baru dibuka (berdasarkan peranti ini).
      </div>
      <div className="flex flex-col gap-4">
        {data.map((item, idx) => (
          <Excerpts
            key={idx}
            date={item.date}
            secretTag={item.classification}
            statusTag={item.status}
            type={item.type}
            unit={item.unit}
            title={item.title}
            onClick={() => navigate(`/${activeLang}/katalog-dokumen/${item.id}`)}
          />
        ))}
      </div>
    </div>
  )
}
