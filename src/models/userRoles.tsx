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
  PENGGUNA_AKHIR: ['paparan-utama'],
  PELULUS: [
    'paparan-utama',
  ],
  PENTADBIR_SISTEM: [
    'paparan-utama',
  ],
  PENGURUS_REKOD: [
    'paparan-utama',
  ],
  JURU_AUDIT: [
    'paparan-utama',
  ],
  SUPER_ADMIN: [
    'paparan-utama',
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
