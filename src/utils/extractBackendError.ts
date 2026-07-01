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

  const { data } = error.response

  if (!isObject(data) || !('error' in data) || !isObject(data.error)) {
    return null
  }

  const code = typeof data.error.code === 'string' ? data.error.code : null
  const message = typeof data.error.message === 'string' ? data.error.message : null

  if (!code && !message) {
    return null
  }

  return {
    code: code ?? 'REQUEST_FAILED',
    message: message ?? 'Permintaan gagal diproses.',
  }
}

export default extractBackendError
