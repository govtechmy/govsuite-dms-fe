import { useAuthStore } from '@/store/AuthStore'
import { getEnv } from '@/config/runtimeEnv'
import { unauthAxios } from './http'

const BASE_URL = getEnv('VITE_API_BASE_URL')
const AUTH_ENDPOINT = '/auth'

export const login = async (data: { username: string; password: string }) => {
  const url = `${BASE_URL}${AUTH_ENDPOINT}/login`
  try {
    const response = await unauthAxios.post(url, data)
    const token = response.data.data.accessToken
    const refreshToken = response.data.data.refreshToken
    const user = response.data.data.user

    if (token && refreshToken && user) {
      useAuthStore.getState().login(token, refreshToken, user)
    } else {
      console.warn('⚠️ Missing token, refreshToken, or user in response')
    }
    return response.data
  } catch (error) {
    console.error('❌ Login error:', error)
    throw error
  }
}

export const logout = () => {
  useAuthStore.getState().logout()
}
