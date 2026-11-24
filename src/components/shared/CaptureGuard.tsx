import { useEffect, useRef, type ReactNode } from 'react'

const MODIFIER_KEYS = new Set(['Shift', 'Control', 'Alt', 'Meta', 'AltGraph', 'CapsLock'])

const isMac = /Mac|iPhone|iPad/.test(navigator.userAgent)

// - interaction: window blurred, tab hidden, capture shortcut or PrintScreen. Cleared only by a
//   click or key press in the page, so captures that finish later (area selection, timers) still
//   see black.
// - pointer: mouse has left the page; cleared when it comes back.
type HideReason = 'interaction' | 'pointer'

const isEditable = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))

/**
 * Whether the held modifiers can be the start of a screenshot / recording shortcut. The browser
 * receives modifier keydowns before the OS consumes the final key, so hiding here wins the race.
 *
 * - All: any two or more modifiers (Cmd+Shift+3/4/5/6, Win+Shift+S, Ctrl+Shift / Ctrl+Alt tools).
 * - macOS: Ctrl or Option alone (custom hotkeys). Option is skipped while typing in a field,
 *   since it is used to enter special characters.
 * - Windows / Linux: Win/Super or Alt alone (Win+PrtScn, Win+G, Alt+PrtScn).
 *
 * Shift alone, Cmd alone (macOS) and Ctrl alone (Windows / Linux) are deliberately excluded so
 * typing and copying text keep working.
 */
const isCaptureCombo = (event: KeyboardEvent | MouseEvent) => {
  const { ctrlKey, altKey, metaKey, shiftKey } = event
  if ([ctrlKey, altKey, metaKey, shiftKey].filter(Boolean).length >= 2) return true
  if (isMac) return ctrlKey || (altKey && !isEditable(event.target))
  return metaKey || altKey
}

interface CaptureGuardProps {
  children: ReactNode
}

/**
 * Hides its children whenever a screen capture is likely: the window loses focus or the tab is
 * hidden (e.g. a snipping tool takes over), a capture shortcut is held, PrintScreen is pressed,
 * the mouse leaves the page, or the page is printed. This is a deterrent only: it cannot stop
 * every OS-level screenshot or screen recording.
 *
 * The hidden state is toggled directly on the DOM (not through React state) so the blackout
 * paints as early as possible, and uses `visibility: hidden` so the PDF layout, scroll position
 * and page tracking are preserved.
 */
export function CaptureGuard({ children }: CaptureGuardProps) {
  const guardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const guard = guardRef.current
    if (!guard) return

    const root = document.documentElement
    const reasons = new Set<HideReason>()

    const render = () => {
      guard.dataset.captureHidden = String(reasons.size > 0)
    }

    const hide = (reason: HideReason) => {
      reasons.add(reason)
      render()
    }

    const reveal = (reason: HideReason) => {
      reasons.delete(reason)
      render()
    }

    const revealOnInteraction = () => {
      if (document.visibilityState === 'visible' && document.hasFocus()) reveal('interaction')
    }

    const handleBlur = () => hide('interaction')

    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') hide('interaction')
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if ((event.ctrlKey || event.metaKey) && (key === 'p' || key === 's')) {
        event.preventDefault()
      }

      if (event.key === 'PrintScreen' || isCaptureCombo(event)) {
        hide('interaction')
      } else if (!MODIFIER_KEYS.has(event.key)) {
        revealOnInteraction()
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key !== 'PrintScreen') return
      hide('interaction')
      navigator.clipboard?.writeText('').catch(() => {})
    }

    // Uses the click's own modifier flags rather than tracked key state, because the OS can swallow
    // modifier keyups after a shortcut fires.
    const handlePointerDown = (event: PointerEvent) => {
      if (!isCaptureCombo(event)) revealOnInteraction()
    }

    const handlePointerLeave = () => hide('pointer')
    const handlePointerEnter = () => reveal('pointer')

    if (document.visibilityState !== 'visible' || !document.hasFocus()) {
      hide('interaction')
    } else {
      render()
    }

    window.addEventListener('blur', handleBlur)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    root.addEventListener('mouseleave', handlePointerLeave)
    root.addEventListener('mouseenter', handlePointerEnter)

    return () => {
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      root.removeEventListener('mouseleave', handlePointerLeave)
      root.removeEventListener('mouseenter', handlePointerEnter)
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
