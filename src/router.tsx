import React from 'react'
import { Navigate, Outlet, Route, Routes, useParams } from 'react-router-dom'
import { useAuthStore } from './store/AuthStore'
import { getDefaultRouteSegmentForRoles, getPermissionsForRoles } from './models/userRoles'
import LangWrapper from './LangWrapper'
import LayoutLogin from './components/layout/LayoutLogin'
import LoginPage from './pages/Login'
import ChangeDefaultPasswordPage from './pages/ChangeDefaultPassword'
import LayoutMain from './components/layout/LayoutMain'
import HomePage from './pages/Home/Home'
import PerluKelulusanPage from './pages/Home/PerluKelulusan/PerluKelulusan'
import TidakLulusPage from './pages/Home/TidakLulus/TidakLulus'
import DrafPage from './pages/Home/Draf/Draf'
import DiluluskanPage from './pages/Home/Diluluskan/Diluluskan'
import ErrorPage from './pages/Error'
import KatalogDokumenPage from './pages/KatalogDokumen/KatalogDokumen'
import DokumenIDPage from './pages/KatalogDokumen/DokumenID/DokumenID'

import CarianDokumenPage from './pages/CarianDokumen'
import KegemaranPage from './pages/Kegemaran'
import PengurusanDokumenPage from './pages/Pengurusan/PengurusanDokumen/PengurusanDokumen'
import PengurusanDokumenIDPage from './pages/Pengurusan/PengurusanDokumen/PengurusanDokumenID/PengurusanDokumenID'
import PengurusanPenggunaPage from './pages/Pengurusan/PengurusanPengguna/PengurusanPengguna'
import PengurusanProfilPage from './pages/Pengurusan/PengurusanProfil/PengurusanProfil'
import LogAktivitiPage from './pages/LogAktiviti'
import BantuanPage from './pages/Bantuan'
import MuatNaikDokumenPage from './pages/MuatNaikDokumen/MuatNaikDokumen'
import MuatNaikDokumenIDPage from './pages/MuatNaikDokumen/MuatNaikDokumenID/MuatNaikDokumenID'

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
  'pengurusan-dokumen': 'pengurusan-dokumen',
  'pengurusan-pengguna': 'pengurusan-pengguna',
  'pengurusan-profil': 'pengurusan-profil',
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
  skipMustChangePasswordCheck,
}: {
  children: React.ReactElement
  routeKey?: string
  skipMustChangePasswordCheck?: boolean
}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const authData = JSON.parse(sessionStorage.getItem('auth-storage') || '{}')
  const rawRoles = (authData?.state?.user?.roles || []) as string[]
  const userPermissions = getPermissionsForRoles(rawRoles)
  const mustChangePassword = Boolean(authData?.state?.user?.mustChangePassword)

  if (!isAuthenticated) {
    return <Navigate to={`/${localStorage.getItem('lang') || 'ms'}/login`} replace />
  }

  // A user with a default/expired password must change it before accessing
  // any other part of the app.
  if (mustChangePassword && !skipMustChangePasswordCheck) {
    return <Navigate to={`/${localStorage.getItem('lang') || 'ms'}/tukar-kata-laluan`} replace />
  }

  // Check route-specific permissions if routeKey is provided
  if (routeKey) {
    const requiredPermission = ROUTE_PERMISSIONS[String(routeKey)]

    if (requiredPermission) {
      if (!userPermissions.includes(requiredPermission)) {
        const defaultSegment = getDefaultRouteSegmentForRoles(rawRoles)
        const redirectPath = defaultSegment ? `/${defaultSegment}` : '/'
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
          <Route
            path="tukar-kata-laluan"
            element={
              <ProtectedRoute skipMustChangePasswordCheck>
                <ChangeDefaultPasswordPage />
              </ProtectedRoute>
            }
          />
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
            {/* /diluluskan */}
            <Route path="diluluskan" element={<DiluluskanPage />} />
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
                <Outlet />
              </ProtectedRoute>
            }
          >
            {/* /katalog-dokumen */}
            <Route index element={<MuatNaikDokumenPage />} />
            {/* /katalog-dokumen/:DokumenID */}
            <Route path=":MuatNaikDokumenID" element={<MuatNaikDokumenIDPage />} />
          </Route>
          <Route
            path="carian-kandungan"
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
          {/* Redirect legacy /pengurusan path to its new default sub-page */}
          <Route path="pengurusan" element={<Navigate to="pengurusan-dokumen" replace />} />
          <Route
            path="pengurusan-dokumen"
            element={
              <ProtectedRoute routeKey="pengurusan-dokumen">
                <Outlet />
              </ProtectedRoute>
            }
          >
            {/* /pengurusan-dokumen */}
            <Route index element={<PengurusanDokumenPage />} />
            {/* /pengurusan-dokumen/:PengurusanDokumenID */}
            <Route path=":PengurusanDokumenID" element={<PengurusanDokumenIDPage />} />
          </Route>
          <Route
            path="pengurusan-pengguna"
            element={
              <ProtectedRoute routeKey="pengurusan-pengguna">
                <PengurusanPenggunaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="pengurusan-profil"
            element={
              <ProtectedRoute routeKey="pengurusan-profil">
                <PengurusanProfilPage />
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
