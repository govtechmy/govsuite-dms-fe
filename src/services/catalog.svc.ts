import { authAxios } from './http'

export const getCatalogUnits = async (path: string = '/') => {
  // Manually construct URL - only encode spaces and special chars, not forward slashes
  const encodedPath = path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
  const url = `http://localhost:3000/api/folders?path=${encodedPath}`
  try {
    const response = await authAxios.get(url)
    return response.data
  } catch (error) {
    console.error('❌ Error fetching catalog units for path', path, ':', error)
    throw error
  }
}
