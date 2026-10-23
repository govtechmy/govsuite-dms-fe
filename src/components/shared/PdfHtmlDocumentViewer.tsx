import { useEffect, useRef, useState } from 'react'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { TextAlign } from '@tiptap/extension-text-align'
import { TextStyleKit } from '@tiptap/extension-text-style'
import { Image } from '@tiptap/extension-image'
import { Button } from '@govtechmy/myds-react/button'
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
import {
  SearchHighlight,
  searchHighlightKey,
  setSearchHighlight,
  type SearchMatchMode,
} from './searchHighlight'

interface PdfHtmlDocumentViewerProps {
  // HTML of each loaded page, in page order; later pages are appended as they load
  pages: string[]
  totalPages: number
  isLoadingMore?: boolean
  loadMoreFailed?: boolean
  onLoadMore?: () => void
  baseStyle?: PdfConvertResult['baseStyle']
  searchKeyword: string
  searchMatchMode?: SearchMatchMode
  // Show only the page holding the active match (fallbackPage when nothing matches)
  singlePage?: boolean
  fallbackPage?: number
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

const findScrollParent = (element: HTMLElement) => {
  for (let parent = element.parentElement; parent; parent = parent.parentElement) {
    if (/(auto|scroll)/.test(getComputedStyle(parent).overflowY)) return parent
  }
  return null
}

export default function PdfHtmlDocumentViewer({
  pages,
  totalPages,
  isLoadingMore = false,
  loadMoreFailed = false,
  onLoadMore,
  baseStyle,
  searchKeyword,
  searchMatchMode = 'exact',
  singlePage = false,
  fallbackPage = 1,
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
  // Page asked for by page navigation that may not be loaded yet
  const [pendingNavigationPage, setPendingNavigationPage] = useState<number | null>(null)
  const renderedPagesRef = useRef(pages)
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null)

  const hasMorePages = pages.length < totalPages
  const canLoadMore = hasMorePages && !isLoadingMore && !loadMoreFailed
  // Search only covers loaded pages, so a keyword pulls in the remaining pages
  const isSearching = searchKeyword.trim() !== ''

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
    content: pages.join('\n'),
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
  const activeMatchPage = matchPages?.find(
    ({ firstMatchIndex, matchCount }) =>
      activeIndex >= firstMatchIndex && activeIndex < firstMatchIndex + matchCount
  )?.page
  const singlePageTarget =
    totalMatches > 0 && activeMatchPage
      ? activeMatchPage
      : Math.max(1, Math.min(fallbackPage, totalPages))
  const visiblePage = singlePage ? singlePageTarget : null
  // In single-page mode the shown page may be in a chunk that has not loaded yet
  const isWaitingForVisiblePage = singlePage && singlePageTarget > pages.length

  // A newly loaded chunk is appended so the pages already shown are left alone;
  // a different document replaces the content
  useEffect(() => {
    if (!editor) return

    const renderedPages = renderedPagesRef.current
    if (pages !== renderedPages) {
      renderedPagesRef.current = pages
      const isAppend =
        renderedPages.length > 0 &&
        pages.length > renderedPages.length &&
        pages[0] === renderedPages[0]

      if (isAppend) {
        editor.commands.insertContentAt(
          editor.state.doc.content.size,
          pages.slice(renderedPages.length).join('\n'),
          { updateSelection: false }
        )
      } else {
        editor.commands.setContent(pages.join('\n'), { emitUpdate: false })
        setCurrentPage(1)
      }
    }

    setPageElements(
      Array.from(editor.view.dom.querySelectorAll<HTMLElement>(':scope > [data-type="page"]'))
    )
  }, [editor, pages])

  // The scrolling element belongs to the parent, so load the next chunk when a
  // sentinel after the last loaded page comes near the bottom of that element
  useEffect(() => {
    const sentinel = loadMoreSentinelRef.current
    if (!sentinel || singlePage || !canLoadMore) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadMore?.()
        }
      },
      { root: findScrollParent(sentinel), rootMargin: '0px 0px 600px 0px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [singlePage, canLoadMore, onLoadMore])

  useEffect(() => {
    if ((isSearching || isWaitingForVisiblePage) && canLoadMore) {
      onLoadMore?.()
    }
  }, [isSearching, isWaitingForVisiblePage, canLoadMore, onLoadMore])

  useEffect(() => {
    if (editor) {
      onDocumentLoad?.()
    }
  }, [editor, onDocumentLoad])

  useEffect(() => {
    if (editor) {
      setSearchHighlight(editor, { keyword: searchKeyword, matchMode: searchMatchMode })
    }
  }, [editor, searchKeyword, searchMatchMode])

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
    onSearchStateChange?.({
      totalMatches,
      currentMatchIndex: activeIndex,
      isIndexing: isSearching && hasMorePages && !loadMoreFailed,
    })
  }, [totalMatches, activeIndex, isSearching, hasMorePages, loadMoreFailed, onSearchStateChange])

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
      pageNavigationRequest.token === handledPageNavigationTokenRef.current
    ) {
      return
    }

    handledPageNavigationTokenRef.current = pageNavigationRequest.token
    setPendingNavigationPage(Math.max(1, Math.min(pageNavigationRequest.page, totalPages)))
  }, [pageNavigationRequest, totalPages])

  // Keep loading chunks until the requested page exists, then scroll to it
  useEffect(() => {
    if (pendingNavigationPage === null) return

    if (pendingNavigationPage > pageElements.length) {
      if (canLoadMore) {
        onLoadMore?.()
      } else if (!isLoadingMore) {
        setPendingNavigationPage(null)
      }
      return
    }

    const targetPage = pendingNavigationPage
    setPendingNavigationPage(null)
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
  }, [pendingNavigationPage, pageElements, canLoadMore, isLoadingMore, onLoadMore])

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
    onPageChange?.(currentPage, totalPages)
  }, [currentPage, totalPages, onPageChange])

  return (
    <div
      ref={viewportRef}
      className="w-full overflow-x-auto p-3"
      style={{ '--pdf-page-scale': pageScale } as CSSProperties}
    >
      <EditorContent editor={editor} />
      {hasMorePages && (!singlePage || loadMoreFailed || isWaitingForVisiblePage) && (
        <div
          ref={loadMoreSentinelRef}
          role={loadMoreFailed ? 'alert' : 'status'}
          className="flex min-h-10 flex-col items-center justify-center gap-2 py-4 text-center text-body-sm text-txt-black-500"
        >
          {loadMoreFailed ? (
            <>
              <span>Halaman seterusnya gagal dimuatkan.</span>
              <Button variant="default-outline" size="small" onClick={onLoadMore}>
                Cuba Lagi
              </Button>
            </>
          ) : (
            'Memuatkan halaman seterusnya...'
          )}
        </div>
      )}
    </div>
  )
}
