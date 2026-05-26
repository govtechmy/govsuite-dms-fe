import Excerpts from '../shared/Excerpts'

export default function AktivitiTerkini() {
  const data = [
    {
      date: '2026-01-10T00:00:00.000Z',
      status: 'Diterbitkan',
      classification: 'Rahsia Besar',
      title: 'Minit Mesyuarat JKPPN (Januari 2026)',
      type: 'Minit Mesyuarat',
      unit: 'Unit K',
    },
    {
      date: '2026-01-10T00:00:00.000Z',
      status: 'Menunggu Kelulusan',
      classification: 'Rahsia Besar',
      title: 'Minit Mesyuarat JKPPN (Januari 2026)',
      type: 'Minit Mesyuarat',
      unit: 'Unit K',
    },
    {
      date: '2026-01-10T00:00:00.000Z',
      status: 'Diterbitkan',
      classification: 'Rahsia Besar',
      title: 'Minit Mesyuarat JKPPN (Januari 2026)',
      type: 'Minit Mesyuarat',
      unit: 'Unit K',
    },
    {
      date: '2026-01-10T00:00:00.000Z',
      status: 'Draf',
      classification: 'Sulit',
      title: 'Minit Mesyuarat JKPPN (Januari 2026)',
      type: 'Minit Mesyuarat',
      unit: 'Unit K',
    },
    {
      date: '2026-01-10T00:00:00.000Z',
      status: 'Diterbitkan',
      classification: 'Terbuka',
      title: 'Minit Mesyuarat JKPPN (Januari 2026)',
      type: 'Minit Mesyuarat',
      unit: 'Unit K',
    },
  ]

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
          />
        ))}
      </div>
    </div>
  )
}
