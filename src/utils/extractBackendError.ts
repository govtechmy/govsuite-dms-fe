export interface BackendError {
  code: string
  message: string
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const extractBackendError = (error: unknown): BackendError | null => {
  if (!isObject(error) || !('response' in error) || !isObject(error.response)) {
    return null
  }

  const { data, status } = error.response

  if (!isObject(data)) {
    return null
  }

  // Standard app error shape: { success: false, error: { code, message } }.
  if ('error' in data && isObject(data.error)) {
    const code = typeof data.error.code === 'string' ? data.error.code : null
    const message = typeof data.error.message === 'string' ? data.error.message : null

    if (code || message) {
      return {
        code: code ?? 'REQUEST_FAILED',
        message: message ?? 'Permintaan gagal diproses.',
      }
    }
  }

  // Fallback shape used by middleware (e.g. rate limiting): { success: false, message }.
  if (typeof data.message === 'string') {
    return {
      code: status === 429 ? 'TOO_MANY_REQUESTS' : 'REQUEST_FAILED',
      message: data.message,
    }
  }

  return null
}

export default extractBackendError
