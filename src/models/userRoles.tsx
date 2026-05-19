export type UserRole = 'KETUA_PENYELENGGARA' | 'REVIEWER' | 'VIEWER' | 'EDITOR' | 'PUBLIC'

export const USER_ROLES: UserRole[] = [
  'KETUA_PENYELENGGARA',
  'REVIEWER',
  'VIEWER',
  'EDITOR',
  'PUBLIC',
]

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  KETUA_PENYELENGGARA: [
    'paparan-utama',
    'katalog-dokumen',
    'muatnaik-dokumen',
    'carian-dokumen',
    'kegemaran',
    'pengurusan',
    'log-aktiviti',
    'bantuan',
  ],
  REVIEWER: [
    'paparan-utama',
    'katalog-dokumen',
    'carian-dokumen',
    'kegemaran',
    'log-aktiviti',
    'bantuan',
  ],
  VIEWER: ['paparan-utama', 'katalog-dokumen', 'carian-dokumen', 'bantuan'],
  EDITOR: [
    'paparan-utama',
    'katalog-dokumen',
    'muatnaik-dokumen',
    'carian-dokumen',
    'kegemaran',
    'bantuan',
  ],
  PUBLIC: ['katalog-dokumen', 'carian-dokumen'],
}
