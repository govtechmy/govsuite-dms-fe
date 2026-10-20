import { useEffect, useRef, useState } from 'react'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { TextAlign } from '@tiptap/extension-text-align'
import { TextStyleKit } from '@tiptap/extension-text-style'
import { Image } from '@tiptap/extension-image'
import type { CSSProperties } from 'react'
import type {
  PdfMatchPage,
  PdfPageNavigationRequest,
  PdfSearchNavigationRequest,
  PdfSearchState,
} from './PdfJsDocumentViewer'
import type { PdfConvertResult } from '@/services/pdfConvert.svc'
import { PageVisibility, setVisiblePage } from './pageVisibility'
import { FrameNode, PageDocument, PageNode } from './pdfPageNodes'
import { SearchHighlight, searchHighlightKey, setSearchHighlight } from './searchHighlight'

interface PdfHtmlDocumentViewerProps {
  html: string
  baseStyle?: PdfConvertResult['baseStyle']
  searchKeyword: string
  // Show only the page holding the active match (page 1 when nothing matches)
  singlePage?: boolean
  navigationRequest?: PdfSearchNavigationRequest | null
  pageNavigationRequest?: PdfPageNavigationRequest | null
  onSearchStateChange?: (state: PdfSearchState) => void
  onMatchPagesChange?: (pages: PdfMatchPage[]) => void
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

export default function PdfHtmlDocumentViewer({
  html,
  baseStyle,
  searchKeyword,
  singlePage = false,
  navigationRequest,
  pageNavigationRequest,
  onSearchStateChange,
  onMatchPagesChange,
  onDocumentLoad,
  onPageChange,
}: PdfHtmlDocumentViewerProps) {
  const [pageElements, setPageElements] = useState<HTMLElement[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageScale, setPageScale] = useState(1)
  const viewportRef = useRef<HTMLDivElement>(null)
  const pageScaleRef = useRef(1)
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
      PageVisibility,
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
        matchPages: state?.matchPages ?? [],
      }
    },
  })
  const totalMatches = searchState?.totalMatches ?? 0
  const activeIndex = searchState?.activeIndex ?? -1
  const matchPages = searchState?.matchPages
  const activeMatchPage =
    matchPages?.find(
      ({ firstMatchIndex, matchCount }) =>
        activeIndex >= firstMatchIndex && activeIndex < firstMatchIndex + matchCount
    )?.page ?? 1
  const visiblePage = singlePage ? activeMatchPage : null

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

  // Runs before the active-match scroll below so the target page is shown first
  useEffect(() => {
    if (editor) {
      setVisiblePage(editor, visiblePage)
    }
  }, [editor, visiblePage])

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
    if (matchPages) {
      onMatchPagesChange?.(matchPages)
    }
  }, [matchPages, onMatchPagesChange])

  // Pages keep the converter's fixed size; shrink them all by one factor so the
  // widest page fits the viewport. CSS zoom also shrinks the layout box, so
  // scrolling and page visibility tracking keep working on the scaled pages.
  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport || pageElements.length === 0) return

    const updatePageScale = () => {
      const { paddingLeft, paddingRight } = getComputedStyle(viewport)
      const availableWidth =
        viewport.clientWidth - parseFloat(paddingLeft) - parseFloat(paddingRight)
      // Rendered widths already include the current zoom, so undo it first.
      // Hidden pages measure 0 and are ignored
      const widestPageWidth = Math.max(
        ...pageElements.map(
          (pageElement) => pageElement.getBoundingClientRect().width / pageScaleRef.current
        )
      )

      if (availableWidth <= 0 || widestPageWidth <= 0) return

      const nextScale = Math.min(1, availableWidth / widestPageWidth)
      if (Math.abs(nextScale - pageScaleRef.current) < 0.001) return

      pageScaleRef.current = nextScale
      setPageScale(nextScale)
    }

    updatePageScale()

    const resizeObserver = new ResizeObserver(updatePageScale)
    resizeObserver.observe(viewport)
    return () => resizeObserver.disconnect()
  }, [pageElements, visiblePage])

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
    <div
      ref={viewportRef}
      className="w-full overflow-x-auto p-3"
      style={{ '--pdf-page-scale': pageScale } as CSSProperties}
    >
      <EditorContent editor={editor} />
    </div>
  )
}
