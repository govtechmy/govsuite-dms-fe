import { AutoToast } from '@govtechmy/myds-react/toast'
import { WarningIcon } from '@govtechmy/myds-react/icon'
import LockIcon from '@/assets/Icons/LockIcon'
import Mask from '@/assets/bg-svg/Mask'
import ChangePasswordForm from '@/components/shared/ChangePasswordForm'

export default function ChangeDefaultPasswordPage() {
  return (
    <div className="relative h-full">
      <div className="relative flex w-full min-h-full flex-col px-[24px] lg:px-[36px] py-[32px] pb-[32px] overflow-x-hidden bg-[radial-gradient(ellipse_5000px_3000px_at_top,theme(colors.bg-primary-200)_1%,theme(colors.bg-primary-50)_10%)]">
        <Mask className="absolute inset-0 xl:w-full h-2/3 pointer-events-none" />
        <div className="flex flex-1 max-lg:flex-col items-center justify-center gap-12 w-full z-10">
          <div className="w-full lg:max-w-[600px] flex flex-col gap-6">
            <div className="w-full flex justify-center lg:justify-start">
              <img
                className="w-[103.4483px] h-[80.6897px] max-sm:w-[65.9px] max-sm:h-[51.6px]"
                src="/jata-negara.png"
                alt="Jata Negara"
              />
            </div>

            <div className="text-center font-body font-semibold tracking-[4px] lg:text-start text-primary-700 max-sm:text-sm">
              TINDAKAN DIPERLUKAN
            </div>
            <h1 className="text-heading-md text-center lg:text-start font-heading font-semibold max-sm:text-heading-sm">
              Tukar Kata Laluan Lalai
            </h1>
            <div className="flex flex-col text-body-md text-center lg:text-start text-txt-black-700 font-body gap-2 max-sm:px-0 max-lg:px-16 max-sm:text-body-sm">
              <p>
                Akaun anda kini menggunakan kata laluan lalai. Untuk keselamatan akaun dan data
                anda, sila tetapkan kata laluan baharu sebelum meneruskan ke sistem.
              </p>
            </div>
            <div className="flex max-lg:justify-center max-lg:items-center max-sm:text-body-sm">
              <div className="flex flex-col">
                <div className="flex gap-2 items-center p-2 pb-0 font-body">
                  <WarningIcon className="text-txt-warning shrink-0" />
                  <div>
                    <p className="text-body-sm text-txt-black-700">
                      Anda tidak boleh mengakses halaman lain
                    </p>
                  </div>
                </div>
                <p className="pl-9 text-body-md font-light text-txt-black-500">
                  sehingga kata laluan baharu ditetapkan
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-[457px] w-full z-10 border border-otl-gray-200 p-8 rounded-lg shadow-card bg-bg-white">
            <div className="flex gap-3 items-center pb-6 justify-center">
              <LockIcon />
              <div className="font-body font-semibold text-body-lg">Tukar Kata Laluan Lalai</div>
            </div>
            <ChangePasswordForm hideHeading submitLabel="Tetapkan Kata Laluan" />
          </div>
        </div>
        <div className="relative z-10 mt-6 w-full px-6 text-center text-body-xs text-txt-black-500 font-body">
          Sistem ini hanya untuk kegunaan rasmi kerajaan. Sila pastikan kerahsiaan data terpelihara.
        </div>
      </div>
      <AutoToast />
    </div>
  )
}
