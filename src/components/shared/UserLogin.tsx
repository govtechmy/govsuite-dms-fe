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

export default function UserLogin() {
  const formatUserRole = (role?: string) => {
    if (!role) return ''
    const normalized = role.toLowerCase()
    if (normalized === 'editor') return <i>FOCAL PERSON</i>
    return role.replace(/_/g, ' ')
  }

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

  return (
    <>
      {parsedSession && (
        <div className="flex gap-1.5 items-center min-w-[228px]">
          <div className="size-9 rounded-full bg-primary-100 flex items-center justify-center">
            <div className="text-txt-primary font-body text-body-sm">{initials}</div>
          </div>

          <div>
            <div>{parsedSession.state.user?.name ?? ''}</div>
            <div className="text-body-xs font-normal text-txt-black-500">
              {formatUserRole(parsedSession.state.user?.role)}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
