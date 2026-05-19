import { Outlet } from 'react-router-dom'
import { NavbarMyds } from './NavbarMyds'

export default function LayoutLogin() {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex-shrink-0">
        <div>
          <NavbarMyds />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto mx-auto w-full">
        <Outlet />
      </div>
    </div>
  )
}
