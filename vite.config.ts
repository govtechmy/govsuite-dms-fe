import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite only auto-loads files named `.env*`, so `frontend.env` must be parsed
// manually and injected into process.env before Vite resolves its own env.
const loadFrontendEnv = (): void => {
  const envPath = resolve(process.cwd(), 'frontend.env')
  if (!existsSync(envPath)) return

  for (const line of readFileSync(envPath, 'utf-8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) continue

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim()
    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

loadFrontendEnv()

// Mirrors the production PROXY toggle (see docker/entrypoint.sh): only proxy
// /api when PROXY=ON, so local dev matches whichever mode is being tested.
const isProxyEnabled = (process.env.PROXY ?? '').toLowerCase() === 'on'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
  server: {
    proxy: isProxyEnabled
      ? {
          // Mirrors the production nginx `/api` reverse proxy so VITE_API_BASE_URL
          // can stay a same-origin relative path in dev too. No rewrite: the full
          // path (including the backend's /api/v1 prefix) is forwarded verbatim,
          // and DEV_API_PROXY_TARGET is the backend host:port only.
          '/api': {
            target: process.env.DEV_API_PROXY_TARGET ?? 'http://localhost:3000',
            changeOrigin: true,
          },
        }
      : undefined,
  },
})
