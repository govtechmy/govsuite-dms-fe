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

  //for blob style fetching
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status}`)
      }

      return response.blob()
    })
    .then((blob) => {
      const objectUrl = URL.createObjectURL(blob)
      triggerDownload(objectUrl)
      URL.revokeObjectURL(objectUrl)
    })
    .catch(() => {
      // Fallback for endpoints that do not allow blob fetch due to CORS.
      triggerDownload(url)
    })
}
