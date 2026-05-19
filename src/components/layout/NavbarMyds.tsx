import { JataNegaraIcon } from '@govtechmy/myds-react/icon'
import { Navbar, NavbarLogo } from '@govtechmy/myds-react/navbar'
import { Tag } from '@govtechmy/myds-react/tag'

export function NavbarMydsLogin() {
  return (
    <Navbar>
      <div className="flex gap-2.5 items-center justify-center">
        <JataNegaraIcon />
        <NavbarLogo className="gap-0" src={''} alt={''}>
          GOVSuiteDMS
        </NavbarLogo>
        <Tag variant="primary">ADMIN</Tag>
      </div>
    </Navbar>
  )
}

export function NavbarMyds() {
  return (
    <Navbar>
      <div className="flex gap-2.5 items-center justify-center">
        <JataNegaraIcon />
        <NavbarLogo className="gap-0" src={''} alt={''}>
          GOVSuiteDMS
        </NavbarLogo>
        <Tag variant="primary">ADMIN</Tag>
      </div>
    </Navbar>
  )
}
