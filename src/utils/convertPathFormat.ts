/**
 * Converts path to display format with ' > ' separators
 * @param path - Either a path string (e.g., "/JKPPN/folder1") or an array of folder names
 * @returns Display path string (e.g., "JKPPN > folder1")
 */
export default function convertPathFormat(path: string | string[]): string {
  if (Array.isArray(path)) {
    return path.filter((segment) => segment.trim() !== '').join(' > ')
  }
  return path
    .split('/')
    .filter((segment) => segment.trim() !== '')
    .join(' > ')
}
