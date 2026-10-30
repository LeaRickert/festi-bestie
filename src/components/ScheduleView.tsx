import { type UIEvent, useMemo, useRef } from 'react'
import { Download, Music } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import type { Act } from '../hooks/useFestivalData'
import {
  PIXELS_PER_HOUR,
  filterActsByDay,
  formatShortRange,
  getActPosition,
  getActsForStage,
  getGridRange,
  getHourLines,
  getUniqueDays,
  getUniqueStages,
  hourLabel,
} from '../utils/scheduleUtils'
import { ratingStyle } from '../utils/ratingStyle'
import DayControl, { useSelectedDay } from './DayControl'

interface ScheduleViewProps {
  acts: Act[]
  ratings: Record<string, number>
  onActClick: (act: Act) => void
}

// Width of the time column, and the minimum width of a stage column. At 768 px
// four stages fit with no sideways scroll; on a phone the grid scrolls.
const TIME_COLUMN = 'w-6'
const STAGE_COLUMN = 'flex-1 min-w-[120px]'

// The time grid of the times view (schedule-grid FR-1, FR-2, FR-5, FR-7).
const ScheduleView = ({ acts, ratings, onActClick }: ScheduleViewProps) => {
  const navigate = useNavigate()
  const { id } = useParams()
  const days = useMemo(() => getUniqueDays(acts), [acts])
  const [selectedDay, setSelectedDay] = useSelectedDay(days)

  const dayActs = useMemo(() => filterActsByDay(acts, selectedDay), [acts, selectedDay])
  const stages = useMemo(() => getUniqueStages(dayActs), [dayActs])
  const range = useMemo(() => getGridRange(dayActs), [dayActs])

  // The stage names sit outside the sideways scroller, so they can stick to the
  // top of the page. They follow the grid's sideways scroll.
  const stageNames = useRef<HTMLDivElement>(null)
  const syncStageNames = (event: UIEvent<HTMLDivElement>) => {
    if (stageNames.current) stageNames.current.scrollLeft = event.currentTarget.scrollLeft
  }

  if (days.length === 0) {
    return (
      <div className="text-center py-8">
        <Music className="h-12 w-12 text-white/40 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white/80 mb-1.5">No schedule data</h3>
        <p className="text-white/60 text-sm">No acts found for this festival.</p>
      </div>
    )
  }

  const hourLines = range ? getHourLines(range) : []
  const gridHeight = range ? ((range.endMinutes - range.startMinutes) * PIXELS_PER_HOUR) / 60 : 0
  const lineTop = (minutes: number) => (range ? ((minutes - range.startMinutes) * PIXELS_PER_HOUR) / 60 : 0)
  const hourLineElements = hourLines.map((minutes) => (
    <div key={minutes} className="absolute left-0 right-0 h-px bg-white/15" style={{ top: lineTop(minutes) }} />
  ))

  return (
    <div>
      <DayControl days={days} selectedDay={selectedDay} onChange={setSelectedDay} />

      <div className="flex justify-end py-2">
        <button
          type="button"
          onClick={() => navigate(`/festival/${id}/export`)}
          className="flex items-center px-3 py-1.5 bg-white/10 text-white/80 rounded-md hover:bg-white/20 transition-colors text-sm"
        >
          <Download className="h-4 w-4 mr-1.5" />
          Export
        </button>
      </div>

      {!range ? (
        <p className="text-center py-8 text-white/60 text-sm">No set times for {selectedDay} yet.</p>
      ) : (
        <>
          {/* Stage names, pinned under the day control (top-14 is its height). */}
          <div ref={stageNames} className="sticky top-14 z-20 bg-page overflow-hidden">
            <div className="flex gap-1 pb-1">
              <div className={`${TIME_COLUMN} shrink-0 sticky left-0 bg-page`} />
              {stages.map((stage) => (
                <div key={stage} className={`${STAGE_COLUMN} text-white/80 text-xs font-semibold truncate`}>
                  {stage}
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto pb-4" onScroll={syncStageNames}>
            {/* w-max lets the hour lines run under every stage when the grid scrolls sideways. */}
            <div className="relative flex gap-1 w-max min-w-full">
              {/* One line per hour across the whole grid, under the acts. */}
              <div aria-hidden="true" className="absolute inset-x-0 top-0 z-[1] pointer-events-none" style={{ height: gridHeight }}>
                {hourLineElements}
              </div>

              {/* Time column, pinned to the left. It draws its own part of each line, with the hour number just below it. */}
              <div className={`${TIME_COLUMN} shrink-0 sticky left-0 z-10 bg-page relative`} style={{ height: gridHeight }}>
                {hourLineElements}
                {hourLines.map((minutes) => (
                  <span
                    key={minutes}
                    className="absolute left-0 text-white/60 text-[10px] leading-none"
                    style={{ top: lineTop(minutes) + 3 }}
                  >
                    {hourLabel(minutes)}
                  </span>
                ))}
              </div>

              {stages.map((stage) => (
                <div key={stage} className={`${STAGE_COLUMN} relative bg-surface rounded-sm`} style={{ height: gridHeight }}>
                  {getActsForStage(dayActs, stage).map((act) => {
                    if (!act.startTime || !act.length) return null
                    const { top, height } = getActPosition({ startTime: act.startTime, length: act.length }, range)
                    return (
                      <button
                        type="button"
                        key={act.id}
                        onClick={() => onActClick(act)}
                        className="absolute z-[2] left-0.5 right-0.5 flex flex-col justify-start border rounded-md px-1.5 py-1 overflow-hidden text-left active:opacity-80 transition-opacity"
                        style={{ top, height, ...ratingStyle(ratings[act.id] || 0) }}
                      >
                        <div className="text-xs font-semibold leading-tight line-clamp-2">{act.artist}</div>
                        <div className="text-[10px] opacity-80 mt-0.5">{formatShortRange(act.startTime, act.length)}</div>
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ScheduleView
