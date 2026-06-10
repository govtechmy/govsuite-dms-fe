import axios from 'axios'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getEnv } from '@/config/runtimeEnv'

import { unauthAxios } from '../services/http'

const sessionStorageAdapter = {
  getItem: (name: string) => {
    const value = sessionStorage.getItem(name)
    return value ? JSON.parse(value) : null
  },
  setItem: (name: string, value: unknown) => {
    sessionStorage.setItem(name, JSON.stringify(value))
  },
  removeItem: (name: string) => {
    sessionStorage.removeItem(name)
  },
}

type User = {
  id: string
  username: string
  email?: string
  fullName?: string
  roles: string[]
  // Add other user fields as needed
}

type AuthStore = {
  token: string | null
  refreshToken: string | null
  user: User | null
  isAuthenticated: boolean
  login: (token: string, refreshToken: string, user: User) => void
  logout: () => void
  refreshAccessToken: () => Promise<string | null>
  getUser: () => User | null
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      login: (token: string, refreshToken: string, user: User) => {
        set({ token, refreshToken, user, isAuthenticated: true })
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      },
      logout: () => {
        set({ token: null, refreshToken: null, user: null, isAuthenticated: false })
        delete axios.defaults.headers.common['Authorization']
      },
      refreshAccessToken: async (): Promise<string | null> => {
        const refreshToken = get().refreshToken
        if (!refreshToken) return null
        try {
          const response = await unauthAxios.post(`${getEnv('VITE_API_BASE_URL')}/auth/refresh`, {
            refreshToken,
          })
          const newToken: string = response.data.data.accessToken
          set({ token: newToken, refreshToken: refreshToken })
          axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
          return newToken
        } catch (error) {
          console.error('Error refreshing token:', error)
          get().logout()
          return null
        }
      },
      getUser: () => get().user,
    }),
    {
      name: 'auth-storage',
      storage: sessionStorageAdapter,
    }
  )
)
