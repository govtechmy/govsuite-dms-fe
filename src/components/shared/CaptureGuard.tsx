import { useEffect, useRef, type ReactNode } from 'react'

// How long the content stays hidden after the PrintScreen key, even if the window keeps focus.
const PRINT_SCREEN_HIDE_MS = 1500

interface CaptureGuardProps {
  children: ReactNode
}

/**
 * Hides its children whenever the window loses focus or the tab is hidden (e.g. a snipping
 * tool takes over), on PrintScreen, and when printing. This is a deterrent only: it cannot
 * stop OS-level screenshots or screen recording.
 *
 * The hidden state is toggled directly on the DOM (not through React state) so the blackout
 * paints as early as possible, and uses `visibility: hidden` so the PDF layout, scroll
 * position and page tracking are preserved.
 */
export function CaptureGuard({ children }: CaptureGuardProps) {
  const guardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const guard = guardRef.current
    if (!guard) return

    let printScreenTimeoutId: number | undefined

    const setHidden = (hidden: boolean) => {
      guard.dataset.captureHidden = String(hidden)
    }

    const syncWithFocus = () => {
      if (printScreenTimeoutId !== undefined) return
      setHidden(document.visibilityState !== 'visible' || !document.hasFocus())
    }

    const handleBlur = () => setHidden(true)

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if ((event.ctrlKey || event.metaKey) && (key === 'p' || key === 's')) {
        event.preventDefault()
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key !== 'PrintScreen') return

      setHidden(true)
      navigator.clipboard?.writeText('').catch(() => {})
      window.clearTimeout(printScreenTimeoutId)
      printScreenTimeoutId = window.setTimeout(() => {
        printScreenTimeoutId = undefined
        syncWithFocus()
      }, PRINT_SCREEN_HIDE_MS)
    }

    syncWithFocus()
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', syncWithFocus)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    document.addEventListener('visibilitychange', syncWithFocus)

    return () => {
      window.clearTimeout(printScreenTimeoutId)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', syncWithFocus)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      document.removeEventListener('visibilitychange', syncWithFocus)
    }
  }, [])

  return (
    <div
      ref={guardRef}
      // Start hidden and reveal only once focus is confirmed, so the guard fails closed.
      data-capture-hidden="true"
      className="group relative"
      onContextMenu={(event) => event.preventDefault()}
    >
      <div className="group-data-[capture-hidden=true]:invisible print:hidden">{children}</div>
      <div className="absolute inset-0 hidden justify-center rounded-md bg-gray-950 group-data-[capture-hidden=true]:flex print:hidden">
        <p
          role="status"
          className="sticky top-24 mt-24 h-fit px-4 text-center text-body-sm text-white"
        >
          Dokumen disembunyikan untuk keselamatan. Klik untuk paparkan semula.
        </p>
      </div>
    </div>
  )
}
