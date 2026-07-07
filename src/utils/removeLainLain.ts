export default function removeLainLain(text: string): string {
  return text.replace(/lain\s+lain\s*:\s*/i, '')
}
