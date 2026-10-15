import { useEffect, useRef, useState } from 'react'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { TextAlign } from '@tiptap/extension-text-align'
import { TextStyleKit } from '@tiptap/extension-text-style'
import { Image } from '@tiptap/extension-image'
import type {
  PdfPageNavigationRequest,
  PdfSearchNavigationRequest,
  PdfSearchState,
} from '@/components/shared/PdfJsDocumentViewer'
import type { PdfConvertResult } from '@/services/pdfConvert.svc'
import { FrameNode, PageDocument, PageNode } from './pdfPageNodes'
import { SearchHighlight, searchHighlightKey, setSearchHighlight } from './searchHighlight'

interface DokumenHtmlContentIDProps {
  html: string
  baseStyle?: PdfConvertResult['baseStyle']
  searchKeyword: string
  navigationRequest?: PdfSearchNavigationRequest | null
  pageNavigationRequest?: PdfPageNavigationRequest | null
  onSearchStateChange?: (state: PdfSearchState) => void
  onDocumentLoad?: () => void
  onPageChange?: (currentPage: number, totalPages: number) => void
}

// The converter leaves the document's most common font/size/colour off each span,
// so it is applied once on the editor root instead
const toBaseCss = (baseStyle?: PdfConvertResult['baseStyle']) =>
  [
    baseStyle?.fontFamily && `font-family: ${baseStyle.fontFamily}`,
    baseStyle?.fontSize && `font-size: ${baseStyle.fontSize}`,
    baseStyle?.color && `color: ${baseStyle.color}`,
  ]
    .filter(Boolean)
    .join('; ')

export default function DokumenHtmlContentID({
  html,
  baseStyle,
  searchKeyword,
  navigationRequest,
  pageNavigationRequest,
  onSearchStateChange,
  onDocumentLoad,
  onPageChange,
}: DokumenHtmlContentIDProps) {
  const [pageElements, setPageElements] = useState<HTMLElement[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const handledNavigationTokenRef = useRef<number | null>(null)
  const handledPageNavigationTokenRef = useRef<number | null>(null)
  // While a page-navigation scroll is animating, pages in between briefly become
  // the most visible; ignore them so the page number goes straight to the target
  const pendingPageScrollTargetRef = useRef<number | null>(null)

  const editor = useEditor({
    editable: false,
    extensions: [
      StarterKit.configure({
        // Replaced by PageDocument, whose content is a list of pages
        document: false,
        heading: { levels: [1, 2, 3] },
      }),
      PageDocument,
      PageNode,
      FrameNode,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyleKit,
      Image.configure({ inline: false, allowBase64: true }),
      SearchHighlight,
    ],
    content: html,
    editorProps: {
      attributes: {
        class: 'pdf-html-document flex flex-col gap-3 focus:outline-none',
        style: toBaseCss(baseStyle),
        'aria-label': 'Kandungan dokumen',
      },
    },
  })

  const searchState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      const state = currentEditor ? searchHighlightKey.getState(currentEditor.state) : undefined
      return {
        totalMatches: state?.totalMatches ?? 0,
        activeIndex: state?.activeIndex ?? -1,
      }
    },
  })
  const totalMatches = searchState?.totalMatches ?? 0
  const activeIndex = searchState?.activeIndex ?? -1

  useEffect(() => {
    if (editor && html !== editor.getHTML()) {
      editor.commands.setContent(html, { emitUpdate: false })
    }
  }, [editor, html])

  useEffect(() => {
    if (!editor) return

    setPageElements(
      Array.from(editor.view.dom.querySelectorAll<HTMLElement>(':scope > [data-type="page"]'))
    )
    setCurrentPage(1)
  }, [editor, html])

  useEffect(() => {
    if (editor) {
      onDocumentLoad?.()
    }
  }, [editor, onDocumentLoad])

  useEffect(() => {
    if (editor) {
      setSearchHighlight(editor, { keyword: searchKeyword })
    }
  }, [editor, searchKeyword])

  useEffect(() => {
    if (
      !editor ||
      !navigationRequest ||
      navigationRequest.token === handledNavigationTokenRef.current
    ) {
      return
    }

    handledNavigationTokenRef.current = navigationRequest.token

    const state = searchHighlightKey.getState(editor.state)
    if (!state || state.totalMatches === 0) return

    const { action, targetMatchIndex } = navigationRequest
    const currentIndex = Math.max(state.activeIndex, 0)
    const nextIndex =
      action === 'jump'
        ? Math.max(0, Math.min(targetMatchIndex ?? 0, state.totalMatches - 1))
        : action === 'next'
          ? (currentIndex + 1) % state.totalMatches
          : (currentIndex - 1 + state.totalMatches) % state.totalMatches

    setSearchHighlight(editor, { activeIndex: nextIndex })
  }, [editor, navigationRequest])

  useEffect(() => {
    if (!editor || activeIndex < 0) return

    editor.view.dom
      .querySelector(`[data-search-match-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' })
  }, [editor, activeIndex, searchKeyword])

  useEffect(() => {
    onSearchStateChange?.({ totalMatches, currentMatchIndex: activeIndex, isIndexing: false })
  }, [totalMatches, activeIndex, onSearchStateChange])

  useEffect(() => {
    if (
      !pageNavigationRequest ||
      pageNavigationRequest.token === handledPageNavigationTokenRef.current ||
      pageElements.length === 0
    ) {
      return
    }

    handledPageNavigationTokenRef.current = pageNavigationRequest.token

    const targetPage = Math.max(1, Math.min(pageNavigationRequest.page, pageElements.length))
    pendingPageScrollTargetRef.current = targetPage
    pageElements[targetPage - 1].scrollIntoView({ behavior: 'smooth', block: 'start' })
    setCurrentPage(targetPage)

    // Release the suppression if the target never becomes the most visible page
    // (e.g. a short last page that cannot fill the viewport)
    setTimeout(() => {
      if (pendingPageScrollTargetRef.current === targetPage) {
        pendingPageScrollTargetRef.current = null
      }
    }, 1000)
  }, [pageNavigationRequest, pageElements])

  useEffect(() => {
    if (pageElements.length === 0) return

    const visibilityByPage = new Map<number, number>()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const pageNumber = pageElements.indexOf(entry.target as HTMLElement) + 1
          visibilityByPage.set(pageNumber, entry.intersectionRatio)
        })

        let mostVisiblePage = 0
        let highestRatio = 0
        visibilityByPage.forEach((ratio, pageNumber) => {
          if (ratio > highestRatio) {
            highestRatio = ratio
            mostVisiblePage = pageNumber
          }
        })

        const pendingTarget = pendingPageScrollTargetRef.current
        if (
          mostVisiblePage === 0 ||
          (pendingTarget !== null && mostVisiblePage !== pendingTarget)
        ) {
          return
        }

        pendingPageScrollTargetRef.current = null
        setCurrentPage(mostVisiblePage)
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
    )

    pageElements.forEach((pageElement) => observer.observe(pageElement))
    return () => observer.disconnect()
  }, [pageElements])

  useEffect(() => {
    onPageChange?.(currentPage, pageElements.length)
  }, [currentPage, pageElements.length, onPageChange])

  return (
    <div className="w-full overflow-x-auto p-3">
      <EditorContent editor={editor} />
    </div>
  )
}
