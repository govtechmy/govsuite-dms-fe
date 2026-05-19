import { useAuthStore } from '@/store/AuthStore.ts'
import { authAxios, unauthAxios } from './http.ts'

const BASE_URL = import.meta.env.VITE_API_BASE_URL
const MYDIGITALID_ENDPOINT = '/mydigital'
const AUTH_ENDPOINT = '/auth'

export const login = async (data?: object) => {
  if (data) {
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
  } else {
    // MyDigital ID OAuth login
    const url = `${BASE_URL}${MYDIGITALID_ENDPOINT}/oauth/login`
    try {
      const response = await unauthAxios.get(url)
      return response.data.authUrl
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }
}

export const logout = async () => {
  // For MyDigital ID users, also call the logout endpoint
  const url = `${BASE_URL}${MYDIGITALID_ENDPOINT}/logout`

  let logoutUrl: string | undefined = undefined
  try {
    const response = await authAxios.get(url)
    logoutUrl = response.data.data.logoutUrl
  } catch (error) {
    console.error('Logout error:', error)
  }

  return logoutUrl
}
