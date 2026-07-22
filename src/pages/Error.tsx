import { Button } from '@govtechmy/myds-react/button'
import { WarningIcon } from '@govtechmy/myds-react/icon'
import { useNavigate, useParams } from 'react-router-dom'

export default function ErrorPage() {
  const navigate = useNavigate()
  const { lang } = useParams()
  const activeLang = lang ?? localStorage.getItem('lang') ?? 'ms'

  return (
    <div className="flex h-full flex-col gap-6">
      <section className="flex flex-1 items-center justify-center pb-6 pr-6">
        <div className="mx-auto flex max-w-[560px] flex-col items-center gap-6 text-center">
          {/* Warning Icon */}
          <div className="flex items-center justify-center text-txt-danger">
            <WarningIcon className="size-16" />
          </div>

          {/* Heading & Subheading */}
          <div className="flex flex-col gap-2">
            <h1 className="text-heading-lg font-heading font-bold text-txt-black-900">404</h1>
            <p className="text-heading-xs font-heading font-semibold text-txt-black-700">
              Halaman Tidak Dijumpai
            </p>
          </div>

          {/* Error Status Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-danger-300 bg-danger-50 px-4 py-2 text-sm font-medium text-danger-800">
            Ralat
          </div>

          {/* Description Text */}
          <p className="text-body-md font-body leading-relaxed text-txt-black-600">
            Halaman yang anda cari tidak wujud atau telah dipindahkan. Sila semak URL atau kembali
            ke halaman utama.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button onClick={() => navigate(`/${activeLang}`)}>Pergi ke Halaman Utama</Button>
            <Button variant="default-outline" onClick={() => navigate(-1)}>
              Kembali
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
