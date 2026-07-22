export type UserRole =
  | 'PENGGUNA_AKHIR'
  | 'PELULUS'
  | 'PENTADBIR_SISTEM'
  | 'PENGURUS_REKOD'
  | 'JURU_AUDIT'
  | 'SUPER_ADMIN'
  | 'PUBLIC'

export const USER_ROLES: UserRole[] = [
  'PENGGUNA_AKHIR',
  'PELULUS',
  'PENTADBIR_SISTEM',
  'PENGURUS_REKOD',
  'JURU_AUDIT',
  'SUPER_ADMIN',
  'PUBLIC',
]

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  PENGGUNA_AKHIR: [
    'paparan-utama',
    'katalog-dokumen',
    'muatnaik-dokumen',
    'carian-dokumen',
    'kegemaran',
    'log-aktiviti',
    'bantuan',
  ],
  PELULUS: ['carian-dokumen', 'kegemaran', 'log-aktiviti', 'bantuan'],
  PENTADBIR_SISTEM: [
    'paparan-utama',
    'katalog-dokumen',
    'carian-dokumen',
    'kegemaran',
    'pengurusan',
    'log-aktiviti',
    'bantuan',
  ],
  PENGURUS_REKOD: [
    'paparan-utama',
    'carian-dokumen',
    'kegemaran',
    'pengurusan',
    'log-aktiviti',
    'bantuan',
  ],
  JURU_AUDIT: ['log-aktiviti'],
  SUPER_ADMIN: ['pengurusan'],
  PUBLIC: ['bantuan'],
}

export const PERMISSION_TO_ROUTE_SEGMENT: Record<string, string> = {
  'paparan-utama': '',
  'katalog-dokumen': 'katalog-dokumen',
  'muatnaik-dokumen': 'muatnaik-dokumen',
  'carian-dokumen': 'carian-dokumen',
  kegemaran: 'kegemaran',
  pengurusan: 'pengurusan',
  'log-aktiviti': 'log-aktiviti',
  bantuan: 'bantuan',
}

const REDIRECT_PRIORITY = [
  'paparan-utama',
  'katalog-dokumen',
  'muatnaik-dokumen',
  'carian-dokumen',
  'kegemaran',
  'pengurusan',
  'log-aktiviti',
  'bantuan',
]

export function resolveUserRole(rawRole?: string): UserRole {
  if (rawRole && USER_ROLES.includes(rawRole as UserRole)) {
    return rawRole as UserRole
  }

  return 'PUBLIC'
}

export function resolveUserRoles(rawRoles?: string[]): UserRole[] {
  if (!rawRoles || rawRoles.length === 0) {
    return ['PUBLIC']
  }

  const validRoles = rawRoles
    .map((role) => resolveUserRole(role))
    .filter((role, index, roles) => roles.indexOf(role) === index)

  return validRoles.length > 0 ? validRoles : ['PUBLIC']
}

export function getPermissionsForRoles(rawRoles?: string[]): string[] {
  const roles = resolveUserRoles(rawRoles)

  return roles
    .flatMap((role) => ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS.PUBLIC)
    .filter((permission, index, permissions) => permissions.indexOf(permission) === index)
}

export function getDefaultRouteSegmentForRoles(rawRoles?: string[]): string {
  const userPermissions = getPermissionsForRoles(rawRoles)

  const defaultPermission = REDIRECT_PRIORITY.find((permission) =>
    userPermissions.includes(permission)
  )

  if (!defaultPermission) {
    return 'bantuan'
  }

  return PERMISSION_TO_ROUTE_SEGMENT[defaultPermission] ?? 'bantuan'
}

export function getDefaultRouteSegmentForRole(role: UserRole): string {
  return getDefaultRouteSegmentForRoles([role])
}
