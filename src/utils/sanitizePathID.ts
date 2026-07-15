/**
 * Removes the ID and its preceding slash from a path string
 * @param path - The full path string
 * @param id - The ID to remove from the path
 * @returns The sanitized path without the ID and its preceding slash
 * @example
 * sanitizePathID("folder/x/y/0001", "0001") // returns "folder/x/y"
 */
export function sanitizePathID(path: string, id: string): string {
  if (!path || !id) return path

  const pattern = `/${id}`

  if (path.endsWith(pattern)) {
    return path.slice(0, -pattern.length)
  }

  return path
}
