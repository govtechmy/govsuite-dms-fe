import DotIcon from '@/assets/Icons/Dot'
import { Button } from '@govtechmy/myds-react/button'
import { ClockIcon } from '@govtechmy/myds-react/icon'
import { useNavigate, useParams } from 'react-router-dom'

interface InDevelopmentPlaceholderProps {
  className?: string
}

export default function InDevelopmentPlaceholder({ className }: InDevelopmentPlaceholderProps) {
  const navigate = useNavigate()
  const { lang } = useParams()
  const activeLang = lang ?? localStorage.getItem('lang') ?? 'ms'

  return (
    <div className={className ?? 'flex h-full flex-col gap-6'}>
      <section className="flex flex-1 items-center justify-center pb-6 pr-6">
        <div className="mx-auto flex max-w-[560px] flex-col items-center gap-6 text-center">
          {/* Clock Icon - Removed colored background to match reference */}
          <div className="flex items-center justify-center text-black">
            <ClockIcon className="size-10" />
          </div>

          {/* Heading & Subheading */}
          <div className="flex flex-col gap-2">
            <h2 className="text-heading-xs font-heading font-semibold text-txt-black-900">
              Akan Datang
            </h2>
            <p className="text-body-md font-body text-txt-black-500">
              Fungsi ini sedang dalam pembangunan aktif
            </p>
          </div>

          {/* Yellow Status Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-warning-300 bg-warning-50 px-4 py-2 text-sm font-medium text-warning-800">
            <DotIcon />
            Dalam Pembangunan Aktif
          </div>

          {/* Combined Description Text */}
          <p className="text-body-sm font-body leading-relaxed text-txt-black-500">
            Fungsi ini sedang dibangunkan dan akan tersedia tidak lama lagi. Pasukan kami sedang
            berusaha untuk menyediakan pengalaman terbaik untuk anda. Sila kembali semula kemudian
            untuk mengakses fungsi ini.
          </p>

          {/* Action Button - Retained from original code */}
          <div className="pt-2">
            <Button variant="default-outline" onClick={() => navigate(`/${activeLang}`)}>
              Kembali ke Paparan Utama
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
