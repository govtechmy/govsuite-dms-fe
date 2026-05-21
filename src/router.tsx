import React from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { useAuthStore } from './store/AuthStore'
import { ROLE_PERMISSIONS, USER_ROLES, type UserRole } from './models/userRoles'
import LangWrapper from './LangWrapper'
import LayoutLogin from './components/layout/LayoutLogin'
import LoginPage from './pages/Login'
import LayoutMain from './components/layout/LayoutMain'
import HomePage from './pages/Home'
import ErrorPage from './pages/Error'
import KatalogDokumenPage from './pages/KatalogDokumen'
import MuatNaikDokumenPage from './pages/MuatNaikDokumen'
import CarianDokumenPage from './pages/CarianDokumen'
import KegemaranPage from './pages/Kegemaran'
import PenguruanPage from './pages/Pengurusan'
import PengurusanDokumen from './pages/PengurusanDokumen'
import LogAktivitiPage from './pages/LogAktiviti'
import BantuanPage from './pages/Bantuan'

// Route-to-permission mapping
const ROUTE_PERMISSIONS: Record<string, string> = {
  '': 'paparan-utama',
  'katalog-dokumen': 'katalog-dokumen',
  'muatnaik-dokumen': 'muatnaik-dokumen',
  'carian-dokumen': 'carian-dokumen',
  kegemaran: 'kegemaran',
  pengurusan: 'pengurusan',
  'log-aktiviti': 'log-aktiviti',
  bantuan: 'bantuan',
}

function ProtectedRoute({
  children,
  routeKey,
}: {
  children: React.ReactElement
  routeKey?: string
}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const authData = JSON.parse(sessionStorage.getItem('auth-storage') || '{}')
  const role = (authData?.state?.user?.role as UserRole) || 'PUBLIC'

  if (!isAuthenticated) {
    return <Navigate to={`/${localStorage.getItem('lang') || 'ms'}/login`} replace />
  }

  // Check if user has a valid role from existing roles
  if (!USER_ROLES.includes(role)) {
    return <Navigate to={`/${localStorage.getItem('lang') || 'ms'}/404`} replace />
  }

  // Check route-specific permissions if routeKey is provided
  if (routeKey) {
    const requiredPermission = ROUTE_PERMISSIONS[String(routeKey)]

    if (requiredPermission) {
      const roleString = role
      const userPermissions = ROLE_PERMISSIONS[roleString as UserRole]

      if (!userPermissions.includes(requiredPermission)) {
        const redirectPath = role === 'PUBLIC' ? '/data-koleksi' : '/'
        return <Navigate to={`/${localStorage.getItem('lang') || 'ms'}${redirectPath}`} replace />
      }
    }
  }

  return children
}

export default function AppRoutes() {
  const lang = localStorage.getItem('lang') ?? 'ms'

  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/${lang}`} replace />} />
      {/* OAuth callback route - no language prefix needed */}
      <Route path=":lang" element={<LangWrapper />}>
        <Route element={<LayoutLogin />}>
          <Route path="login" element={<LoginPage />} />
        </Route>
        <Route element={<LayoutMain />}>
          <Route
            index
            element={
              <ProtectedRoute routeKey="">
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="katalog-dokumen"
            element={
              <ProtectedRoute routeKey="katalog-dokumen">
                <KatalogDokumenPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="muatnaik-dokumen"
            element={
              <ProtectedRoute routeKey="muatnaik-dokumen">
                <MuatNaikDokumenPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="carian-dokumen"
            element={
              <ProtectedRoute routeKey="carian-dokumen">
                <CarianDokumenPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="kegemaran"
            element={
              <ProtectedRoute routeKey="kegemaran">
                <KegemaranPage />
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="pengurusan"
            element={
              <ProtectedRoute routeKey="pengurusan">
                <PenguruanPage />
              </ProtectedRoute>
            }
          /> */}

          <Route path="pengurusan">
            {/* default redirect */}
            <Route index element={<Navigate to="dokumen" replace />} />

            {/* Pengurusan Dokumen */}
            <Route
              path="dokumen"
              element={
                <ProtectedRoute routeKey="pengurusan">
                  <PengurusanDokumen />
                </ProtectedRoute>
              }
            />

            {/* Pengurusan Pengguna */}
            {/* <Route
    path="pengguna"
    element={
      <ProtectedRoute routeKey="pengurusan">
        <PengurusanPenggunaPage />
      </ProtectedRoute>
    }
  /> */}
          </Route>

          <Route
            path="log-aktiviti"
            element={
              <ProtectedRoute routeKey="log-aktiviti">
                <LogAktivitiPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="bantuan"
            element={
              <ProtectedRoute routeKey="bantuan">
                <BantuanPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="404"
            element={
              <ProtectedRoute>
                <ErrorPage key="error-page" />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <Redirect404Page key="404-page" />
              </ProtectedRoute>
            }
          />
        </Route>
      </Route>
    </Routes>
  )
}

function Redirect404Page() {
  const params = useParams()
  const lang = params.lang ?? ''
  const allowedLangs = ['en', 'ms']
  const langStorage = localStorage.getItem('lang')

  if (allowedLangs.includes(lang)) {
    return <Navigate to={`/${lang}/404`} replace />
  }

  if (langStorage) {
    return <Navigate to={`/${langStorage}/404`} replace />
  }

  return <Navigate to={`/ms/404`} replace />
}
