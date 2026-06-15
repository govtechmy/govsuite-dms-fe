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
  const formatUserRoles = (roles?: string[]) => {
    if (!roles || roles.length === 0) return ''
    return roles
      .map((role) => {
        const normalized = role.toLowerCase()
        if (normalized === 'editor') return 'FOCAL PERSON'
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

  return (
    <>
      {parsedSession && (
        <div className="flex gap-1.5 items-center min-w-[228px]">
          <div className="size-9 rounded-full bg-primary-100 flex items-center justify-center">
            <div className="text-txt-primary font-body text-body-sm">{initials}</div>
          </div>

          <div>
            <div>{parsedSession.state.user?.fullName ?? ''}</div>
            <div className="text-body-xs font-normal text-txt-black-500">
              {formatUserRoles(parsedSession.state.user?.roles)}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
