import { Outlet } from 'react-router-dom'
import { NavbarMydsLogin } from './NavbarMyds'
import MastheadMyds from './MastheadMyds'

export default function LayoutLogin() {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex-shrink-0">
        <MastheadMyds />
        <NavbarMydsLogin />
      </div>
      <div className="flex-1 overflow-y-auto mx-auto w-full">
        <Outlet />
      </div>
    </div>
  )
}
