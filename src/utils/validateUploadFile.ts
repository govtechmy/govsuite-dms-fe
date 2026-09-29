/**
 * Validate a file against the profile's accepted extensions (e.g. '.pdf,.docx') and max size.
 * Returns an error message, or null when the file is valid.
 */
const validateUploadFile = (
  file: { name?: string; size?: number },
  acceptedFileTypes: string,
  maxFileSizeMb: number
): string | null => {
  const allowedExtensions = acceptedFileTypes
    .split(',')
    .map((value) => value.trim().toLowerCase().replace(/^\./, ''))
    .filter(Boolean)
  const fileExtension = file.name?.split('.').pop()?.toLowerCase() ?? ''

  if (!allowedExtensions.includes(fileExtension)) {
    const formatsLabel = allowedExtensions.map((ext) => ext.toUpperCase()).join(', ')
    return `Format fail tidak disokong. Sila muat naik fail ${formatsLabel}.`
  }

  if ((file.size ?? 0) > maxFileSizeMb * 1024 * 1024) {
    return `Saiz fail melebihi had maksima ${maxFileSizeMb}MB.`
  }

  return null
}

export default validateUploadFile
