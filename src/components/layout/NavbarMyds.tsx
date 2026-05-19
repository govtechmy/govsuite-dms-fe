import { CrossIcon, HamburgerMenuIcon, JataNegaraIcon } from '@govtechmy/myds-react/icon'
import { Navbar, NavbarLogo } from '@govtechmy/myds-react/navbar'
import { Tag } from '@govtechmy/myds-react/tag'
import { useState } from 'react'
import { useAuthStore } from '../../store/AuthStore'
import SidebarMyds from '../shared/SidebarMyds'
import UserLogin from '../shared/UserLogin'
import { Button } from '@govtechmy/myds-react/button'

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
  const [open, setOpen] = useState(false)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const logout = useAuthStore((state) => state.logout)

  return (
    <div className="relative">
      {/* Top Navbar */}
      <Navbar className="z-10">
        <div className="flex gap-2.5 items-center justify-center">
          <JataNegaraIcon />
          <NavbarLogo className="gap-0" src={''} alt={''}>
            GOVSuiteDMS
          </NavbarLogo>
          <Tag variant="primary">ADMIN</Tag>
        </div>

        {/* Desktop Navigation */}
        {isAuthenticated && (
          <div className="hidden lg:flex lg:flex-row lg:gap-4 lg:items-center">
            <UserLogin />
            <Button variant="default-outline" onClick={logout}>
              Log Keluar
            </Button>
          </div>
        )}

        {/* Mobile Hamburger Menu */}
        {isAuthenticated && (
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg hover:bg-bg-washed transition lg:hidden"
          >
            {open ? <CrossIcon /> : <HamburgerMenuIcon />}
          </button>
        )}
      </Navbar>

      {/* Mobile Drawer with Overlay */}
      <div className={`fixed inset-0 z-20 lg:hidden ${open ? 'visible' : 'invisible'}`}>
        {/* Overlay background */}
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-gray-900/50 transition-opacity duration-500 ease-in-out ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Drawer */}
        <div
          className={`absolute top-0 right-0 h-full w-64 bg-bg-white shadow-lg transform transition-transform duration-700 ease-in-out z-50 ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b shadow-button">
            <h2 className="text-body-lg font-semibold"> </h2>
            <button onClick={() => setOpen(false)} className="px-2 rounded-md hover:bg-bg-washed">
              <CrossIcon className="h-6 w-6" />
            </button>
          </div>

          <SidebarMyds
            onclick={() => {
              setOpen(false)
            }}
          />

          <div className="absolute inset-x-0 bottom-0 m-4 border-t pt-4">
            <div className="flex flex-col gap-2">
              <UserLogin />
              <Button
                variant="default-outline"
                onClick={logout}
                className="w-full items-center justify-center"
              >
                Log Keluar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
