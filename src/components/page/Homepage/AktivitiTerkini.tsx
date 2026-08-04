import Excerpts from '@/components/shared/Excerpts'
import { type LatestActivity } from '@/services/infoHomepage.svc'
import normalizeWord from '@/utils/NormalizeWord'
import { useNavigate, useParams } from 'react-router-dom'

interface AktivitiTerkiniProps {
  data: LatestActivity[]
}

export default function AktivitiTerkini({ data }: AktivitiTerkiniProps) {
  const navigate = useNavigate()
  const { lang } = useParams()
  const activeLang = lang ?? localStorage.getItem('lang') ?? 'ms'

  return (
    <div className="flex h-full flex-col p-6">
      <div className="text-body-md font-semibold text-txt-black-900">Aktiviti Terkini</div>
      <div className="text-body-sm font-normal text-txt-black-500 pt-1 pb-3">
        Dokumen yang baru dibuka (berdasarkan peranti ini).
      </div>
      <div className="flex flex-1 flex-col gap-4">
        {data.map((item, idx) => (
          <Excerpts
            key={idx}
            date={item.recordDate}
            secretTag={item.accessLevel}
            statusTag={item.workflowState}
            type={item.documentProfileName}
            unit={normalizeWord(item.unitId)}
            title={item.title}
            onClick={() => navigate(`/${activeLang}/katalog-dokumen/${item.recordId}`)}
          />
        ))}
      </div>
    </div>
  )
}
