import { Button } from '@govtechmy/myds-react/button'
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from '@govtechmy/myds-react/dropdown'
import { ChevronDownIcon } from '@govtechmy/myds-react/icon'
import { t } from 'i18next'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { logout } from '../../services/auth.svc'

// ✅ Define types
interface User {
  id: string
  name: string
  role: string
}

interface AuthState {
  token: string
  user: User
}

interface AuthStorage {
  state: AuthState
}

interface UserMobileProps {
  userMobile?: string
}

export default function UserLogin({ userMobile }: UserMobileProps) {
  //refactor later
  const formatUserRole = (role?: string) => {
    if (!role) return ''
    const normalized = role.toLowerCase()
    if (normalized === 'editor') return <i>FOCAL PERSON</i>
    return role.replace(/_/g, ' ')
  }

  const navigate = useNavigate()
  const { lang } = useParams<{ lang: string }>()

  const [open, setOpen] = useState(false)
  // const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const sessionInfo = sessionStorage['auth-storage']
  let parsedSession: AuthStorage | null = null
  let initials = ''

  if (sessionInfo) {
    try {
      parsedSession = JSON.parse(sessionInfo) as AuthStorage
      const fullName = parsedSession.state?.user?.name ?? ''
      const parts = fullName.trim().split(' ').filter(Boolean)

      if (parts.length >= 2) {
        initials = parts[0][0] + parts[1][0]
      } else if (parts.length === 1) {
        const word = parts[0]
        initials = word[0] + word[word.length - 1]
      }

      initials = initials.toUpperCase()
    } catch (error) {
      console.error('Failed to parse session info:', error)
    }
  }

  const handleLogoutClick = () => {
    logout()
    navigate(`/${lang}/login`)
    setOpen(false)
  }

  // const handleLogoutConfirm = async () => {
  //   try {
  //     const myDigitalLogoutUrl = await logout()

  //     // Clear local auth state first
  //     useAuthStore.getState().logout()

  //     if (myDigitalLogoutUrl) {
  //       window.location.href = myDigitalLogoutUrl
  //     } else {
  //       navigate(`/${lang}/login`)
  //     }
  //   } catch (error) {
  //     console.error('Logout error:', error)
  //     useAuthStore.getState().logout()
  //     navigate(`/${lang}/login`)
  //   }

  //   setShowLogoutConfirm(false)
  // }

  // const handleLogoutCancel = () => {
  //   setShowLogoutConfirm(false)
  // }

  return (
    <>
      {parsedSession && (
        <>
          {!userMobile ? (
            <Dropdown open={open} onOpenChange={setOpen}>
              <DropdownTrigger asChild>
                <div className="flex gap-1.5 items-center cursor-pointer min-w-[228px]">
                  <div className="size-9 rounded-full bg-rdmkd-primary-600 flex items-center justify-center">
                    <div className="text-white font-body text-body-sm">{initials}</div>
                  </div>

                  <div>
                    <div>{parsedSession.state.user?.name ?? ''}</div>
                    <div className="text-body-xs font-normal text-txt-black-500">
                      {formatUserRole(parsedSession.state.user?.role)}
                    </div>
                  </div>

                  <div
                    className={`ml-1 transition-transform duration-300 ${open ? 'rotate-180' : 'rotate-0'}`}
                  >
                    <ChevronDownIcon />
                  </div>
                </div>
              </DropdownTrigger>

              <DropdownContent>
                <DropdownItem onClick={handleLogoutClick}>{t('logout')}</DropdownItem>
              </DropdownContent>
            </Dropdown>
          ) : (
            <>
              <div className="flex gap-1.5 items-center cursor-pointer">
                <div className="size-9 rounded-full bg-rdmkd-primary-600 flex items-center justify-center">
                  <div className="text-white font-body text-body-sm">{initials}</div>
                </div>
                <div>
                  <div>{parsedSession.state.user?.name ?? ''}</div>
                  <div className="text-body-xs font-normal text-txt-black-500">
                    {formatUserRole(parsedSession.state.user?.role)}
                  </div>
                </div>
              </div>
              <Button
                size="medium"
                className="items-center justify-center bg-rdmkd-primary-600 border-rdmkd-primary-600 hover:bg-rdmkd-primary-700 hover:border-rdmkd-primary-700 w-full my-4"
                onClick={handleLogoutClick}
              >
                <span>{t('logout')}</span>
              </Button>
            </>
          )}
        </>
      )}
      {/* <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
      /> */}
    </>
  )
}
