import { useAuthStore } from '@/store/AuthStore.ts'

// const BASE_URL = import.meta.env.VITE_API_BASE_URL
// const AUTH_ENDPOINT = '/auth'

// export const login = async (data: object) => {
//   const url = `${BASE_URL}${AUTH_ENDPOINT}/login`
//   try {
//     const response = await unauthAxios.post(url, data)
//     const token = response.data.data.accessToken
//     const refreshToken = response.data.data.refreshToken
//     const user = response.data.data.user

//     if (token && refreshToken && user) {
//       useAuthStore.getState().login(token, refreshToken, user)
//     } else {
//       console.warn('⚠️ Missing token, refreshToken, or user in response')
//     }
//     return response.data
//   } catch (error) {
//     console.error('❌ Login error:', error)
//     throw error
//   }
// }

const LOGIN_USERNAME = import.meta.env.VITE_LOGIN_USERNAME
const LOGIN_PASSWORD = import.meta.env.VITE_LOGIN_PASSWORD

export const login = async (data: { username: string; password: string }) => {
  // Validate credentials against .env values
  if (data.username === LOGIN_USERNAME && data.password === LOGIN_PASSWORD) {
    // Mock successful login response
    const mockToken = 'mock-access-token-' + Date.now()
    const mockRefreshToken = 'mock-refresh-token-' + Date.now()
    const mockUser = {
      id: '1',
      email: 'user@example.com',
      name: 'Mohd Muzakkir Zamani',
      role: 'KETUA_PENYELENGGARA',
    }

    useAuthStore.getState().login(mockToken, mockRefreshToken, mockUser)

    return {
      success: true,
      data: {
        accessToken: mockToken,
        refreshToken: mockRefreshToken,
        user: mockUser,
      },
    }
  } else {
    throw new Error('Invalid username or password')
  }
}

export const logout = () => {
  useAuthStore.getState().logout()
}
