import React from 'react'
import { Navigate, Outlet, Route, Routes, useParams } from 'react-router-dom'
import { useAuthStore } from './store/AuthStore'
import { ROLE_PERMISSIONS, USER_ROLES, type UserRole } from './models/userRoles'
import LangWrapper from './LangWrapper'
import LayoutLogin from './components/layout/LayoutLogin'
import LoginPage from './pages/Login'
import LayoutMain from './components/layout/LayoutMain'
import HomePage from './pages/Home/Home'
import PerluKelulusanPage from './pages/Home/PerluKelulusan/PerluKelulusan'
import TidakLulusPage from './pages/Home/TidakLulus/TidakLulus'
import DrafPage from './pages/Home/Draf/Draf'
import ErrorPage from './pages/Error'
import KatalogDokumenPage from './pages/KatalogDokumen/KatalogDokumen'
import DokumenIDPage from './pages/KatalogDokumen/DokumenID/DokumenID'
import MuatNaikDokumenPage from './pages/MuatNaikDokumen'
import CarianDokumenPage from './pages/CarianDokumen'
import KegemaranPage from './pages/Kegemaran'
import PengurusanDokumenPage from './pages/PengurusanDokumen'
import LogAktivitiPage from './pages/LogAktiviti'
import BantuanPage from './pages/Bantuan'

/**
 * Maps route paths to their required permission keys.
 * Used by ProtectedRoute to enforce role-based access control.
 */
const ROUTE_PERMISSIONS: Record<string, string> = {
  home: 'paparan-utama',
  'katalog-dokumen': 'katalog-dokumen',
  'muatnaik-dokumen': 'muatnaik-dokumen',
  'carian-dokumen': 'carian-dokumen',
  kegemaran: 'kegemaran',
  pengurusan: 'pengurusan',
  'log-aktiviti': 'log-aktiviti',
  bantuan: 'bantuan',
}

/**
 * ProtectedRoute wrapper component.
 * Enforces authentication and role-based permissions for routes.
 * Redirects to login if not authenticated, or to appropriate page if unauthorized.
 */
function ProtectedRoute({
  children,
  routeKey,
}: {
  children: React.ReactElement
  routeKey?: string
}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const authData = JSON.parse(sessionStorage.getItem('auth-storage') || '{}')
  const role = (authData?.state?.user?.roles?.[0] as UserRole) || 'PUBLIC'

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
      {/* Root redirect to default language */}
      <Route path="/" element={<Navigate to={`/${lang}`} replace />} />

      {/* All routes prefixed with :lang (en|ms) */}
      <Route path=":lang" element={<LangWrapper />}>
        {/* Login layout - no main navigation */}
        <Route element={<LayoutLogin />}>
          <Route path="login" element={<LoginPage />} />
        </Route>

        {/* Main app layout - includes Masthead, Navbar, Footer */}
        <Route element={<LayoutMain />}>
          {/* Home routes - pathless parent with nested children */}
          <Route
            element={
              <ProtectedRoute routeKey="home">
                <Outlet />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />} />
            {/* /perlu-kelulusan */}
            <Route path="perlu-kelulusan" element={<PerluKelulusanPage />} />
            {/* /tidak-lulus */}
            <Route path="tidak-lulus" element={<TidakLulusPage />} />
            {/* /draf */}
            <Route path="draf" element={<DrafPage />} />
          </Route>

          {/* Katalog Dokumen routes - nested structure with detail page */}
          <Route
            path="katalog-dokumen"
            element={
              <ProtectedRoute routeKey="katalog-dokumen">
                <Outlet />
              </ProtectedRoute>
            }
          >
            {/* /katalog-dokumen */}
            <Route index element={<KatalogDokumenPage />} />
            {/* /katalog-dokumen/:DokumenID */}
            <Route path=":DokumenID" element={<DokumenIDPage />} />
          </Route>

          {/* Standalone protected routes */}
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
          <Route
            path="pengurusan"
            element={
              <ProtectedRoute routeKey="pengurusan">
                <PengurusanDokumenPage />
              </ProtectedRoute>
            }
          />
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

          {/* Error handling routes */}
          <Route
            path="404"
            element={
              <ProtectedRoute>
                <ErrorPage key="error-page" />
              </ProtectedRoute>
            }
          />
          {/* Catch-all for invalid routes */}
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

/**
 * Handles invalid routes by redirecting to /404.
 * Validates language parameter and falls back to localStorage or 'ms'.
 */

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
