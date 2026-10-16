import { apiAuthHeaders } from '@/services/http'

interface DownloadFileOptions {
  url: string
  fileName: string
  fallback?: string
  fileExtension?: string
}

export const resolveDownloadFileName = ({
  fileName,
  fallback,
  fileExtension,
}: {
  fileName: string
  fallback: string
  fileExtension?: string
}) => {
  const baseName = fileName.trim() || fallback
  const extension = fileExtension?.trim()

  if (!extension) {
    return baseName
  }

  const normalizedExtension = extension.startsWith('.') ? extension : `.${extension}`
  return `${baseName}${normalizedExtension}`
}

export const downloadFile = ({ url, fileName, fallback, fileExtension }: DownloadFileOptions) => {
  if (!url) {
    return
  }

  const resolvedFileName = resolveDownloadFileName({
    fileName,
    fallback: fallback ?? 'download',
    fileExtension,
  })

  const triggerDownload = (downloadUrl: string) => {
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = resolvedFileName
    link.rel = 'noopener noreferrer'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // The backend download endpoint requires the Bearer token, so fetch it as a blob rather than
  // navigating to the URL (a plain link cannot carry the Authorization header).
  fetch(url, { headers: apiAuthHeaders() })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status}`)
      }

      return response.blob()
    })
    .then((blob) => {
      const objectUrl = URL.createObjectURL(blob)
      triggerDownload(objectUrl)
      window.requestAnimationFrame(() => {
        URL.revokeObjectURL(objectUrl)
      })
    })
    .catch((error) => {
      console.error('Error downloading file:', error)
    })
}
