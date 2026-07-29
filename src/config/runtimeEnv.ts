// Runtime environment configuration
// Required keys are derived from frontend.env.example by Vite at startup.
type RuntimeEnvKey = string

type RuntimeEnv = Partial<Record<RuntimeEnvKey, string>>

const isDevMode = import.meta.env.DEV

const getDevRequiredEnvKeys = (): string[] => {
  if (!isDevMode) {
    return []
  }

  return ((import.meta.env.VITE_REQUIRED_ENV_KEYS as string | undefined) ?? '')
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean)
}

const readEnvValue = (key: string): string | undefined => {
  const env = import.meta.env as Record<string, string | boolean | undefined>
  const value = env[key]
  return typeof value === 'string' ? value : undefined
}

const readViteEnv = (): RuntimeEnv => {
  const requiredEnvKeys = getDevRequiredEnvKeys()
  return Object.fromEntries(requiredEnvKeys.map((key) => [key, readEnvValue(key)]))
}

declare global {
  interface Window {
    __APP_ENV__?: RuntimeEnv
  }
}

const getRuntimeEnv = (): RuntimeEnv => {
  if (typeof window === 'undefined') {
    return isDevMode ? readViteEnv() : {}
  }

  if (isDevMode) {
    // In local dev, allow Vite frontend.env values when /env.js is not present.
    return { ...readViteEnv(), ...(window.__APP_ENV__ ?? {}) }
  }

  return window.__APP_ENV__ ?? {}
}

export const getEnv = (key: RuntimeEnvKey, fallback = ''): string => {
  const value = getRuntimeEnv()[key]
  return typeof value === 'string' ? value : fallback
}

export const getRequiredEnvKeys = (): string[] => [...getDevRequiredEnvKeys()]
