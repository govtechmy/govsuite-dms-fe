import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import LangWrapper from './LangWrapper'
import HomePage from './pages/Home'
import AboutPage from './pages/About'
import ErrorPage from './pages/Error'
import LayoutMain from './components/layout/LayoutMain'

export default function AppRoutes() {
  const stored = localStorage.getItem('lang')
  const lang = stored === 'en' || stored === 'ms' ? stored : 'en'

  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/${lang}`} replace />} />
      <Route path=":lang" element={<LangWrapper />}>
        <Route element={<LayoutMain />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="testingpage" element={<div> this is testing page</div>} />
          <Route path="404" element={<ErrorPage />} />
          <Route path="*" element={<Redirect404Page />} />
        </Route>
      </Route>
    </Routes>
  )
}

function Redirect404Page() {
  const { lang } = useParams<{ lang: string | undefined }>()
  const stored = localStorage.getItem('lang')
  const fallback = stored === 'en' || stored === 'ms' ? stored : 'en'
  const targetLang = lang === 'en' || lang === 'ms' ? lang : fallback
  return <Navigate to={`/${targetLang}/404`} replace />
}
