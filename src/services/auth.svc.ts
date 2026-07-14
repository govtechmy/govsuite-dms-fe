import { getEnv } from '@/config/runtimeEnv'
import { unauthAxios } from './http'

const BASE_URL = getEnv('VITE_API_BASE_URL')
const AUTH_ENDPOINT = '/auth'

type AuthUser = {
  id: string
  username: string
  email?: string
  fullName?: string
  roles: string[]
}

type LoginResult = {
  token: string
  refreshToken: string
  user: AuthUser
}

export const login = async (data: { username: string; password: string }): Promise<LoginResult> => {
  const url = `${BASE_URL}${AUTH_ENDPOINT}/login`
  try {
    const response = await unauthAxios.post(url, data)
    const token = response.data?.data?.accessToken
    const refreshToken = response.data?.data?.refreshToken
    const user = response.data?.data?.user as AuthUser | undefined

    if (token && refreshToken && user) {
      return { token, refreshToken, user }
    }

    console.warn('Missing token, refreshToken, or user in response')
    throw new Error('Invalid login response payload')
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
}

export const refreshToken = async (
  refreshToken: string
): Promise<{ newToken: string; newRefreshToken: string | null } | null> => {
  const url = `${BASE_URL}${AUTH_ENDPOINT}/refresh`
  try {
    const response = await unauthAxios.post(url, { refreshToken })
    const newToken: string | null = response.data?.data?.accessToken
    const newRefreshToken: string | null = response.data?.data?.refreshToken

    if (!newToken || typeof newToken !== 'string') {
      console.warn('Invalid or missing accessToken in refresh response')
      return null
    }

    return { newToken, newRefreshToken }
  } catch (error) {
    console.error('Refresh token error:', error)
    return null
  }
}
