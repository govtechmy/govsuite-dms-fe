import { Footer } from '@govtechmy/myds-react/footer'
import { JataNegaraIcon } from '@govtechmy/myds-react/icon'
import { Tag } from '@govtechmy/myds-react/tag'

export default function FooterRahsia() {
  return (
    <Footer className="bg-bg-white shadow-button w-full shrink-0 gap-0 p-0 max-md:gap-0 max-md:p-0 md:p-0 md:max-lg:pt-0 lg:p-0">
      <div className="relative mx-auto flex min-h-12 w-full max-w-screen-xl items-center justify-between gap-6 px-8 py-2.5">
        <div className="flex items-center gap-x-2.5">
          <JataNegaraIcon />
          <div className="flex flex-col items-start sm:flex-row sm:items-center sm:gap-x-4">
            <p className="text-txt-black-900 font-poppins text-body-sm whitespace-nowrap font-semibold">
              Government of Malaysia
            </p>
            <p className="text-txt-black-700 text-body-xs whitespace-nowrap">
              © {new Date().getFullYear()} Government of Malaysia
            </p>
          </div>
        </div>
        <Tag variant="danger">RAHSIA</Tag>
      </div>
    </Footer>
  )
}
