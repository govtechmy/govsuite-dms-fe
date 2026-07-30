import { Outlet } from 'react-router-dom'
import MastheadMyds from './MastheadMyds'
import { NavbarMyds } from './NavbarMyds'
import SidebarMyds from './SidebarMyds'

export default function LayoutMain() {
  return (
    <div className="flex h-[100dvh] flex-col">
      <div className="sticky top-0 z-50">
        <MastheadMyds />
        <NavbarMyds />
      </div>

      <div className="mx-auto px-4.5 flex w-full relative md:px-6 max-w-screen-xl min-h-0 flex-1">
        <div className="hidden lg:block h-full overflow-y-hidden">
          <SidebarMyds />
        </div>
        <div className="flex-1 h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
