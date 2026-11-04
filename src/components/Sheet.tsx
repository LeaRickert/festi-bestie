import { useEffect, useRef, useState } from 'react'
import type { ReactNode, TouchEvent } from 'react'
import { X } from 'lucide-react'

interface SheetProps {
  // The id of the title element inside `header`, for aria-labelledby.
  titleId: string
  header: ReactNode
  onClose: () => void
  children: ReactNode
  // Keep the page visible behind the sheet, for a sheet that changes the page at once.
  lightBackdrop?: boolean
}

// Drag the sheet down this far to close it (act-sheet FR-2).
const SWIPE_CLOSE_PX = 100

// A bottom sheet below 640 px, a centered dialog on a wider screen, with the
// closing rules of act-sheet FR-2: the X, a tap outside, Escape and a swipe
// down. The page owns the browser history; onClose must close only the sheet.
const Sheet = ({ titleId, header, onClose, children, lightBackdrop = false }: SheetProps) => {
  const sheet = useRef<HTMLDivElement>(null)
  const closed = useRef(false)
  const dragStart = useRef<number | null>(null)
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)

  // Several close paths can fire together (a swipe ends in a tap outside), so close once.
  const close = () => {
    if (closed.current) return
    closed.current = true
    onClose()
  }
  const closeRef = useRef(close)
  closeRef.current = close

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    sheet.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [])

  const handleTouchStart = (e: TouchEvent) => {
    // Only drag the sheet when its content is scrolled to the top.
    if ((sheet.current?.scrollTop ?? 0) > 0) return
    dragStart.current = e.touches[0].clientY
    setDragging(true)
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (dragStart.current === null) return
    setDragY(Math.max(0, e.touches[0].clientY - dragStart.current))
  }

  const handleTouchEnd = () => {
    if (dragStart.current === null) return
    dragStart.current = null
    setDragging(false)
    if (dragY > SWIPE_CLOSE_PX) close()
    else setDragY(0)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close"
        onClick={close}
        className={`absolute inset-0 h-full w-full cursor-default ${lightBackdrop ? 'bg-black/30' : 'bg-black/50 backdrop-blur-sm'}`}
      />
      <div
        ref={sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: dragY ? `translateY(${dragY}px)` : undefined }}
        className={`relative w-full max-h-[85vh] overflow-y-auto overscroll-contain bg-surface border border-white/10 rounded-t-2xl px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] outline-none sm:max-w-md sm:rounded-lg sm:pt-4 ${
          dragging ? '' : 'transition-transform duration-200'
        }`}
      >
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-white/30 sm:hidden" aria-hidden="true" />

        <div className="flex items-start justify-between gap-2 mb-3">
          {header}
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}

export default Sheet
