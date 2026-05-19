import { Outlet } from 'react-router-dom'
import MastheadMyds from './MastheadMyds'
import { NavbarMyds } from './NavbarMyds'
import SidebarMyds from '../shared/SidebarMyds'

export default function LayoutMain() {
  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-50">
        <MastheadMyds />
        <NavbarMyds />
      </div>

      <div className="mx-auto px-4.5 flex w-full relative md:px-6 max-w-screen-xl">
        <div className="hidden lg:block sticky top-[100px] h-[calc(100vh-100px)] overflow-y-hidden">
          <SidebarMyds />
        </div>
        <div className="flex-1 h-[calc(100vh-100px)] overflow-y-auto scrollbar-hide">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
