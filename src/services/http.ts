import axios from 'axios'

// Authenticated axios instance (uses default headers set by AuthStore)
export const authAxios = axios

// Unauthenticated axios instance (no default headers)
export const unauthAxios = axios.create({
  // You can add default config here if needed, like timeout, baseURL, etc.
  timeout: 30000,
})
