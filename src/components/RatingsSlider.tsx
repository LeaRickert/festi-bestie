import { useRef, useState } from 'react'
import type { TouchEvent } from 'react'
import { ChevronRight, Star } from 'lucide-react'
import { useActRatings, type MyGroup } from '../hooks/useGroups'
import { groupRatings, nextPage, previousPage, sliderPages, starCounts, toggleStar, whoLine } from '../utils/groups'
import StarRating from './StarRating'

interface RatingsSliderProps {
  actId: string
  groups: MyGroup[]
  myId: string
  myRating: number
  onRate: (rating: number) => void
}

// A horizontal swipe this long turns the page (groups FR-22).
const SWIPE_PAGE_PX = 40

interface GroupStarsProps {
  counts: number[]
  selected: number | null
  onSelect: (star: number) => void
}

// The stars of a group page: the number of members in each chosen star, and
// no editing (groups FR-25). A tap selects a star to show who chose it.
const GroupStars = ({ counts, selected, onSelect }: GroupStarsProps) => (
  <div className="flex items-center -ml-1.5">
    {counts.map((count, index) => {
      const star = index + 1
      return (
        <button
          type="button"
          // biome-ignore lint/suspicious/noArrayIndexKey: the five stars never move
          key={index}
          onClick={() => onSelect(star)}
          disabled={count === 0}
          aria-pressed={selected === star}
          aria-label={`${star} star${star === 1 ? '' : 's'}: ${count} member${count === 1 ? '' : 's'}`}
          className={`relative flex h-11 w-11 items-center justify-center rounded-md transition-colors ${
            selected === star ? 'bg-white/15' : ''
          }`}
        >
          <Star className={`h-8 w-8 ${count > 0 ? 'fill-rating text-rating' : 'fill-transparent text-white/30'}`} />
          {count > 0 && (
            <span className="absolute inset-0 flex items-center justify-center pt-0.5 text-[11px] font-bold text-white">
              {count}
            </span>
          )}
        </button>
      )
    })}
  </div>
)

// The rating section of the act sheet as pages: "My rating", then one page for
// each group of the user for the festival (groups FR-21 to FR-26). The sheet
// mounts it again for each act, so it always opens on "My rating" (FR-23).
const RatingsSlider = ({ actId, groups, myId, myRating, onRate }: RatingsSliderProps) => {
  const [page, setPage] = useState(0)
  const [selectedStar, setSelectedStar] = useState<number | null>(null)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const { ratings: actRatings, loading, error } = useActRatings(actId, true)

  const pages = sliderPages(groups.map((group) => group.name))
  const goTo = (next: number) => {
    setPage(next)
    setSelectedStar(null)
  }

  const handleTouchStart = (e: TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchStart.current) return
    const dx = e.changedTouches[0].clientX - touchStart.current.x
    const dy = e.changedTouches[0].clientY - touchStart.current.y
    touchStart.current = null
    if (Math.abs(dx) < SWIPE_PAGE_PX || Math.abs(dx) < Math.abs(dy)) return
    goTo(dx < 0 ? nextPage(page, pages.length) : previousPage(page, pages.length))
  }

  const group = page > 0 ? groups[page - 1] : null
  const members = group?.members ?? []
  const memberRatings = groupRatings(members, actRatings, myId, myRating)

  return (
    <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="text-white/70 text-xs mb-1 truncate">{group ? group.name : 'Your Rating:'}</div>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {group ? (
            <div className="flex flex-col items-start space-y-1">
              <GroupStars
                counts={starCounts(memberRatings)}
                selected={selectedStar}
                onSelect={(star) => setSelectedStar(toggleStar(selectedStar, star))}
              />
              <div className="text-sm text-white/70" aria-live="polite">
                {error
                  ? <span className="text-red-400">Could not load the group ratings</span>
                  : loading
                    ? 'Loading...'
                    : whoLine(selectedStar, members, memberRatings, myId)}
              </div>
            </div>
          ) : (
            <StarRating rating={myRating} onRatingChange={onRate} showValue={true} />
          )}
        </div>
        <button
          type="button"
          onClick={() => goTo(nextPage(page, pages.length))}
          aria-label={`Show ${pages[nextPage(page, pages.length)]}`}
          className="flex h-11 max-w-[40%] shrink-0 items-center gap-0.5 text-xs text-white/60 hover:text-white transition-colors"
        >
          <span className="truncate">{pages[nextPage(page, pages.length)]}</span>
          <ChevronRight className="h-4 w-4 shrink-0" />
        </button>
      </div>
      <div className="mt-2 flex justify-center gap-1.5" aria-hidden="true">
        {['mine', ...groups.map((g) => g.id)].map((key, index) => (
          <span key={key} className={`h-1.5 w-1.5 rounded-full ${index === page ? 'bg-white' : 'bg-white/30'}`} />
        ))}
      </div>
    </div>
  )
}

export default RatingsSlider
