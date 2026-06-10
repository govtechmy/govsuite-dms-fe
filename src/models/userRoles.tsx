export type UserRole = 'PENTADBIR_SISTEM' | 'REVIEWER' | 'VIEWER' | 'EDITOR' | 'PUBLIC'

export const USER_ROLES: UserRole[] = [
  'PENTADBIR_SISTEM',
  'REVIEWER',
  'VIEWER',
  'EDITOR',
  'PUBLIC',
]

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  PENTADBIR_SISTEM: [
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
  PUBLIC: [
    'paparan-utama',
    'katalog-dokumen',
    'muatnaik-dokumen',
    'carian-dokumen',
    'kegemaran',
    'pengurusan',
    'log-aktiviti',
    'bantuan',
  ],
}
