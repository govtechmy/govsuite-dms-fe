import axios, { AxiosHeaders } from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'

// Dedicated authenticated instance to keep auth concerns isolated.
export const authAxios = axios.create({
  timeout: 30000,
})

// Unauthenticated axios instance (no default headers)
export const unauthAxios = axios.create({
  timeout: 30000,
})

let authInterceptorAttached = false

let authResponseInterceptorAttached = false
let isRefreshing = false

type FailedQueueItem = {
  resolve: (token: string | null) => void
  reject: (error: unknown) => void
}

let failedQueue: FailedQueueItem[] = []

type AuthConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })

  failedQueue = []
}

const setAuthorizationHeader = (config: AuthConfig, token: string) => {
  if (config.headers instanceof AxiosHeaders) {
    config.headers.set('Authorization', `Bearer ${token}`)
    return
  }

  const headers = new AxiosHeaders(config.headers)
  headers.set('Authorization', `Bearer ${token}`)
  config.headers = headers
}

export const initializeAuthAxios = ({
  getToken,
  refreshAccessToken,
}: {
  getToken: () => string | null
  refreshAccessToken?: () => Promise<string | null>
}) => {
  const token = getToken()

  if (token) {
    authAxios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete authAxios.defaults.headers.common['Authorization']
  }

  if (authInterceptorAttached) return

  authAxios.interceptors.request.use((config) => {
    const latestToken = getToken()

    if (latestToken) {
      if (config.headers instanceof AxiosHeaders) {
        config.headers.set('Authorization', `Bearer ${latestToken}`)
      } else {
        const headers = new AxiosHeaders(config.headers)
        headers.set('Authorization', `Bearer ${latestToken}`)
        config.headers = headers
      }
    } else if (config.headers instanceof AxiosHeaders) {
      config.headers.delete('Authorization')
    } else if (config.headers) {
      const headers = new AxiosHeaders(config.headers)
      headers.delete('Authorization')
      config.headers = headers
    }

    return config
  })

  authInterceptorAttached = true

  if (authResponseInterceptorAttached || !refreshAccessToken) return

  authAxios.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as AuthConfig | undefined

      if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((newToken) => {
            if (!newToken) {
              return Promise.reject(error)
            }

            setAuthorizationHeader(originalRequest, newToken)
            originalRequest._retry = true
            return authAxios(originalRequest)
          })
          .catch((queueError) => Promise.reject(queueError))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const newToken = await refreshAccessToken()

        if (!newToken) {
          processQueue(error, null)
          return Promise.reject(error)
        }

        processQueue(null, newToken)
        setAuthorizationHeader(originalRequest, newToken)

        return authAxios(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
  )

  authResponseInterceptorAttached = true
}
