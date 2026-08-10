import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { getEnv } from './config/runtimeEnv'
import { initializeAuthAxios } from './services/http'
import { useAuthStore } from './store/AuthStore'

document.title = getEnv('VITE_APP_NAME', 'GovSuite DMS')

if (import.meta.env.DEV) {
  console.info('[env]', {
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
  })
}

initializeAuthAxios({
  getToken: () => useAuthStore.getState().token,
  refreshAccessToken: () => useAuthStore.getState().refreshAccessToken(),
})
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <App />
    </Suspense>
  </StrictMode>
)
