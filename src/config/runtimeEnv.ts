// Runtime environment configuration
// Add new VITE_* variable keys here when adding to .env.example
// This provides type safety and IDE autocomplete
type RuntimeEnvKey = 'VITE_API_BASE_URL' | 'VITE_LOGIN_IC' | 'VITE_LOGIN_PASSWORD'

type RuntimeEnv = Partial<Record<RuntimeEnvKey, string>>

declare global {
  interface Window {
    __APP_ENV__?: RuntimeEnv
  }
}

const getRuntimeEnv = (): RuntimeEnv => {
  if (typeof window === 'undefined') {
    return {}
  }

  return window.__APP_ENV__ ?? {}
}

export const getEnv = (key: RuntimeEnvKey, fallback = ''): string => {
  const value = getRuntimeEnv()[key]
  return typeof value === 'string' ? value : fallback
}
