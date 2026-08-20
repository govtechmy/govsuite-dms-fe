import { getUserRoles } from '@/services/dropdown.svc'
import getUserInitials from '@/utils/getUserInitials'
import { useEffect, useState } from 'react'

// ✅ Define types
interface User {
  id: string
  username: string
  email?: string
  fullName?: string
  roles: string[]
}

interface AuthState {
  token: string
  user: User
}

interface AuthStorage {
  state: AuthState
}

export default function UserLogin() {
  const [roleNameByCode, setRoleNameByCode] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const roles = await getUserRoles()
        setRoleNameByCode(Object.fromEntries(roles.map((role) => [role.code, role.name])))
      } catch (error) {
        console.error('Error fetching user roles:', error)
      }
    }

    fetchRoles()
  }, [])

  const formatUserRoles = (roles?: string[]) => {
    if (!roles || roles.length === 0) return ''
    return roles
      .map((role) => {
        if (roleNameByCode[role]) return roleNameByCode[role]
        return role.replace(/_/g, ' ')
      })
      .join(', ')
  }

  const sessionInfo = sessionStorage['auth-storage']
  let parsedSession: AuthStorage | null = null
  let initials = ''

  if (sessionInfo) {
    try {
      parsedSession = JSON.parse(sessionInfo) as AuthStorage
      const fullName = parsedSession.state?.user?.fullName ?? ''
      initials = getUserInitials(fullName)
    } catch (error) {
      console.error('Failed to parse session info:', error)
    }
  }

  return (
    <>
      {parsedSession && (
        <div className="flex gap-1.5 items-center min-w-[228px]">
          <div className="size-9 rounded-full bg-primary-100 flex items-center justify-center">
            <div className="text-txt-primary font-body text-body-sm">{initials}</div>
          </div>

          <div>
            <div>{parsedSession.state.user?.fullName ?? ''}</div>
            <div className="text-body-xs font-normal uppercase text-txt-black-500">
              {formatUserRoles(parsedSession.state.user?.roles)}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
