import HeadphoneIcon from '@/assets/Icons/Headphone'
import { Button } from '@govtechmy/myds-react/button'
import { EmailIcon } from '@govtechmy/myds-react/icon'

import { getEnv } from '@/config/runtimeEnv'

export default function BantuanPage() {
  const emailSupport = getEnv('VITE_EMAIL_SUPPORT')

  return (
    <div className="flex h-full flex-col gap-6">
      <section className="flex flex-1 items-center justify-center pb-6 pr-6">
        <div className="mx-auto flex max-w-[560px] flex-col items-center gap-6 text-center">
          <div className="flex items-center justify-center text-txt-black-900">
            <HeadphoneIcon className="size-10" />
          </div>

          {/* Heading & Subheading */}
          <div className="flex flex-col gap-2">
            <h2 className="text-heading-xs font-heading font-semibold text-txt-black-900">
              Bantuan
            </h2>
            <p className="text-body-md font-body text-txt-black-500">
              Meja Bantuan Govtech Malaysia
            </p>
          </div>

          {/* Combined Description Text */}
          <p className="text-body-sm font-body leading-relaxed text-txt-black-500">
            Sekiranya anda menghadapi sebarang isu berkenaan sistem, sila hubungi Meja Bantuan
            GovTech Malaysia melalui e-mel berikut
          </p>

          {/* Action Button - Retained from original code */}
          <div className="pt-2">
            <Button variant="default-outline" className="max-w-full">
              <EmailIcon /> <span className="truncate">{emailSupport}</span>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
