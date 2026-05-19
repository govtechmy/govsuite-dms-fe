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
    'data-teras',
    'data-koleksi',
    'statistik-teras',
    'tetapan-admin',
    'urus-pengguna',
    'manual-pengguna',
  ],
  REVIEWER: ['paparan-utama', 'data-teras', 'data-koleksi', 'manual-pengguna', 'statistik-teras'],
  VIEWER: ['paparan-utama', 'data-teras', 'data-koleksi', 'manual-pengguna', 'statistik-teras'],
  EDITOR: ['paparan-utama', 'data-teras', 'data-koleksi', 'manual-pengguna', 'statistik-teras'],
  PUBLIC: ['data-koleksi'],
}
