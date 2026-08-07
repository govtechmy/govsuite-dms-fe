import { Lock2Icon, LockFillIcon, PutrajayaIcon } from '@govtechmy/myds-react/icon'
import {
  Masthead,
  MastheadContent,
  MastheadHeader,
  MastheadSection,
  MastheadTitle,
  MastheadTrigger,
} from '@govtechmy/myds-react/masthead'

export default function MastheadMyds() {
  return (
    <Masthead>
      <MastheadHeader>
        <MastheadTitle>Portal Rasmi Kerajaan Malaysia</MastheadTitle>
        <MastheadTrigger>Kenal pasti begini</MastheadTrigger>
      </MastheadHeader>
      <MastheadContent>
        <MastheadSection
          icon={<PutrajayaIcon />}
          title="Pautan portal rasmi berakhir dengan .gov.my"
        >
          Sekiranya anda melihat pautan selain <b>.gov.my</b>, segera tutupkan halaman itu walaupun
          ia menyerupai portal rasmi!
        </MastheadSection>
        <MastheadSection
          icon={<Lock2Icon className="inline-block size-3.5" />}
          title="Portal yang selamat menggunakan HTTPS"
        >
          Periksa ikon kunci mangga (<LockFillIcon className="inline-block size-3.5" />
          )atau <b>https:// </b>di depan pautan. Sekiranya tiada, tinggalkan laman sesawang serta
          merta.
        </MastheadSection>
      </MastheadContent>
    </Masthead>
  )
}
