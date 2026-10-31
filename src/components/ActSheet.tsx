import { useEffect, useRef, useState } from 'react'
import type { TouchEvent } from 'react'
import { Calendar, Clock, MapPin, Music, Play, Search, Star, X } from 'lucide-react'
import type { Act } from '../hooks/useFestivalData'
import type { MyGroup } from '../hooks/useGroups'
import { formatTime } from '../utils/scheduleUtils'
import { searchUrl, watchUrl } from '../utils/youtube'
import RatingsSlider from './RatingsSlider'
import StarRating from './StarRating'

interface ActSheetProps {
  act: Act
  rating: number
  signedIn: boolean
  // The groups of the user for the festival; with one or more the rating is a slider (groups FR-21, FR-24).
  groups?: MyGroup[]
  userId?: string | null
  onRate: (rating: number) => void
  onSignIn: () => void
  onClose: () => void
}

// Drag the sheet down this far to close it (act-sheet FR-2).
const SWIPE_CLOSE_PX = 100

// A bottom sheet below 640 px, a centered dialog on a wider screen. The page
// owns the browser history; onClose must close only the sheet (act-sheet FR-2).
const ActSheet = ({ act, rating, signedIn, groups = [], userId = null, onRate, onSignIn, onClose }: ActSheetProps) => {
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
        className="absolute inset-0 h-full w-full cursor-default bg-black/50 backdrop-blur-sm"
      />
      <div
        ref={sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="act-sheet-title"
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
          <h3 id="act-sheet-title" className="text-lg font-bold text-white pt-1.5">
            {act.artist}
          </h3>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            {act.day && (
              <div className="flex items-center text-white/80 text-sm">
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                <span>{act.day}</span>
              </div>
            )}
            {act.stage && (
              <div className="flex items-center text-white/80 text-sm">
                <MapPin className="h-3.5 w-3.5 mr-1.5" />
                <span>{act.stage}</span>
              </div>
            )}
            {act.startTime && act.length && (
              <div className="flex items-center text-white/80 text-sm">
                <Clock className="h-3.5 w-3.5 mr-1.5" />
                <span>
                  {formatTime(act.startTime)} • {act.length}min
                </span>
              </div>
            )}
            {act.genre && (
              <div className="flex items-center text-white/70 text-sm">
                <Music className="h-3.5 w-3.5 mr-1.5" />
                <span>{act.genre}</span>
              </div>
            )}
            {act.category && <div className="text-white/60 text-xs">{act.category}</div>}
          </div>

          {act.specialNotes && (
            <div className="bg-white/10 rounded-md p-2">
              <p className="text-white font-medium text-xs">{act.specialNotes}</p>
            </div>
          )}

          {act.avgRating !== null && act.avgRating > 0 && (
            <div className="flex items-center text-rating text-sm">
              <Star className="h-3.5 w-3.5 mr-1.5" />
              <span className="font-medium">Avg: {act.avgRating.toFixed(1)}</span>
            </div>
          )}

          {/* Links out to YouTube; many official sets block embedding (act-sheet FR-3, FR-4). */}
          <div className="border-t border-white/10 pt-3 space-y-1.5">
            {act.youtubeVideoId && (
              <a
                href={watchUrl(act.youtubeVideoId)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start text-link hover:underline text-sm py-1"
              >
                <Play className="h-3.5 w-3.5 mr-1.5 mt-0.5 shrink-0" />
                <span>Recommended Set{act.youtubeTitle ? `: ${act.youtubeTitle}` : ''}</span>
              </a>
            )}
            <a
              href={searchUrl(act.artist)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start text-link hover:underline text-sm py-1"
            >
              <Search className="h-3.5 w-3.5 mr-1.5 mt-0.5 shrink-0" />
              <span>Search YouTube for "{act.artist} live set"</span>
            </a>
            {!act.youtubeVideoId && <p className="text-white/60 text-xs">Have a good example set for {act.artist}?</p>}
          </div>

          {/* Last, so the stars stay in the same place with or without a video. */}
          <div className="border-t border-white/10 pt-3">
            {signedIn && userId && groups.length > 0 ? (
              <RatingsSlider actId={act.id} groups={groups} myId={userId} myRating={rating} onRate={onRate} />
            ) : (
              <>
                <div className="text-white/70 text-xs mb-1">Your Rating:</div>
                {signedIn ? (
                  <StarRating rating={rating} onRatingChange={onRate} showValue={true} />
                ) : (
                  <div className="space-y-2">
                    <StarRating rating={0} onRatingChange={() => {}} interactive={false} showValue={false} />
                    <div className="bg-white/10 rounded-md p-2.5">
                      <p className="text-white/70 text-xs mb-2">Sign in to rate this artist</p>
                      <button
                        type="button"
                        onClick={onSignIn}
                        className="w-full py-2.5 bg-white text-page font-medium rounded-md hover:bg-white/90 transition-colors text-sm"
                      >
                        Sign In to Rate
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActSheet
