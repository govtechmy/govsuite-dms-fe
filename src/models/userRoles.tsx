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
    'pengurusan',
    'bantuan',
  ],
  PELULUS: ['paparan-utama', 'pengurusan', 'bantuan'],
  PENTADBIR_SISTEM: ['paparan-utama', 'katalog-dokumen', 'kegemaran', 'pengurusan', 'bantuan'],
  PENGURUS_REKOD: ['paparan-utama', 'katalog-dokumen', 'kegemaran', 'pengurusan', 'bantuan'],
  JURU_AUDIT: ['paparan-utama', 'pengurusan', 'log-aktiviti', 'bantuan'],
  SUPER_ADMIN: ['paparan-utama', 'pengurusan', 'bantuan'],
  PUBLIC: ['pengurusan', 'bantuan'],
}

export const PERMISSION_TO_ROUTE_SEGMENT: Record<string, string> = {
  'paparan-utama': '',
  'katalog-dokumen': 'katalog-dokumen',
  'muatnaik-dokumen': 'muatnaik-dokumen',
  'carian-dokumen': 'carian-kandungan',
  kegemaran: 'kegemaran',
  pengurusan: 'pengurusan-dokumen',
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
