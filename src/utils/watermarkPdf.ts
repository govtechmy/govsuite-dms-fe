import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib'

// MYDS primary-300 (150 183 255), kept translucent so the page text underneath stays readable
const WATERMARK_COLOR = rgb(150 / 255, 183 / 255, 1)
const WATERMARK_OPACITY = 0.6
const MAX_FONT_SIZE = 20
const LINE_HEIGHT = 1.2
const PAGE_MARGIN = 24

// Greedy word wrap so the text keeps its font size instead of shrinking to fit one line
const wrapText = (words: string[], font: PDFFont, fontSize: number, maxWidth: number) => {
  const lines: string[] = []
  let line = ''

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (line && font.widthOfTextAtSize(candidate, fontSize) > maxWidth) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }

  if (line) lines.push(line)
  return lines
}

/**
 * Stamps `text` in uppercase three times on every page (top, middle and bottom,
 * horizontally centred), wrapping onto several lines when it is wider than the page.
 */
export const watermarkPdf = async (
  pdfBytes: ArrayBuffer,
  text: string
): Promise<Uint8Array<ArrayBuffer>> => {
  const pdfDoc = await PDFDocument.load(pdfBytes)
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // Standard PDF fonts only cover WinAnsi; replace anything else (e.g. CJK) so encoding never throws
  const supportedChars = new Set(font.getCharacterSet())
  const safeText = Array.from(text.toUpperCase(), (char) =>
    supportedChars.has(char.codePointAt(0) ?? -1) ? char : '?'
  ).join('')
  const words = safeText.split(/\s+/).filter(Boolean)
  const widestWord = Math.max(...words.map((word) => font.widthOfTextAtSize(word, 1)))

  for (const page of pdfDoc.getPages()) {
    const { width, height } = page.getSize()
    const maxWidth = width - PAGE_MARGIN * 2
    // Only shrink when a single word (e.g. a long unbroken name) cannot fit on a line
    const fontSize = Math.min(MAX_FONT_SIZE, maxWidth / widestWord)
    const lines = wrapText(words, font, fontSize, maxWidth)
    const lineHeight = fontSize * LINE_HEIGHT
    const blockHeight = lineHeight * (lines.length - 1) + fontSize

    // Top edge of each block: flush with the top margin, vertically centred, flush with the bottom margin
    for (const blockTop of [
      height - PAGE_MARGIN,
      (height + blockHeight) / 2,
      PAGE_MARGIN + blockHeight,
    ]) {
      lines.forEach((line, index) => {
        page.drawText(line, {
          x: (width - font.widthOfTextAtSize(line, fontSize)) / 2,
          y: blockTop - fontSize - index * lineHeight,
          size: fontSize,
          font,
          color: WATERMARK_COLOR,
          opacity: WATERMARK_OPACITY,
        })
      })
    }
  }

  // pdf-lib types this as ArrayBufferLike, but it always writes to a plain ArrayBuffer
  // (never a SharedArrayBuffer); narrowing it lets the bytes be passed to `new Blob()`
  return (await pdfDoc.save()) as Uint8Array<ArrayBuffer>
}
