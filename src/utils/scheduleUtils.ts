// Shared utility functions for schedule rendering
import type { Act } from '../hooks/useFestivalData'

type TimedAct = Pick<Act, 'startTime' | 'length'> & { startTime: string; length: number }

const MINUTES_PER_DAY = 24 * 60

// Convert time string to minutes since midnight (handles both 12-hour and 24-hour formats)
export const timeToMinutes = (timeStr: string): number => {
  // Handle 12-hour format (e.g., "8:00 PM")
  if (timeStr.includes('AM') || timeStr.includes('PM')) {
    const [time, period] = timeStr.split(' ')
    const [hours, minutes] = time.split(':').map(Number)
    let totalMinutes = hours * 60 + minutes

    if (period === 'AM' && hours === 12) {
      totalMinutes = minutes
    } else if (period === 'PM' && hours !== 12) {
      totalMinutes += 12 * 60
    }

    return totalMinutes
  }

  // Handle 24-hour format (e.g., "20:00")
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

// Get all acts for a specific stage (not filtered by time slot)
export const getActsForStage = (acts: Act[], stage: string): Act[] => {
  return acts.filter((act) => {
    if (act.stage !== stage) return false
    if (!act.startTime || !act.length) return false // Skip acts without time info
    return true
  })
}

// The time grid (schedule-grid FR-1, FR-5, FR-7). Each hour is 90 px high.
export const PIXELS_PER_HOUR = 90

// A time before 6 AM belongs to the night of the day before, so it counts past 24:00.
const NIGHT_END_MINUTES = 6 * 60

// Minutes since midnight of the festival day. 12:30 AM is 24:30.
export const festivalMinutes = (timeStr: string): number => {
  const minutes = timeToMinutes(timeStr)
  return minutes < NIGHT_END_MINUTES ? minutes + MINUTES_PER_DAY : minutes
}

export interface GridRange {
  startMinutes: number
  endMinutes: number
}

const isTimed = (act: Act): act is Act & TimedAct => Boolean(act.startTime) && Boolean(act.length)

// From the hour of the first start, rounded down, to the hour of the last end,
// rounded up. Null when no act has a time.
export const getGridRange = (acts: Act[]): GridRange | null => {
  const timed = acts.filter(isTimed)
  if (timed.length === 0) return null
  const starts = timed.map((act) => festivalMinutes(act.startTime))
  const ends = timed.map((act) => festivalMinutes(act.startTime) + act.length)
  return {
    startMinutes: Math.floor(Math.min(...starts) / 60) * 60,
    endMinutes: Math.ceil(Math.max(...ends) / 60) * 60,
  }
}

// Minutes of every hour line, from the top line to the bottom line.
export const getHourLines = (range: GridRange): number[] => {
  const lines: number[] = []
  for (let minutes = range.startMinutes; minutes <= range.endMinutes; minutes += 60) lines.push(minutes)
  return lines
}

// The hour number only: 1200 (8 PM) is "8", 1440 (12 AM) is "12".
export const hourLabel = (minutes: number): string => {
  const hour = Math.floor(minutes / 60) % 12
  return String(hour === 0 ? 12 : hour)
}

// "1", or "1:50" when not on the hour. No AM or PM.
const shortTime = (minutes: number): string => {
  const rest = ((minutes % 60) + 60) % 60
  return rest === 0 ? hourLabel(minutes) : `${hourLabel(minutes)}:${String(rest).padStart(2, '0')}`
}

// Start and end of a set as "1-1:50" or "11:30-1".
export const formatShortRange = (startTime: string, length: number): string => {
  const start = festivalMinutes(startTime)
  return `${shortTime(start)}-${shortTime(start + length)}`
}

// Top and height of an act block, in px from the top of the grid.
export const getActPosition = (act: TimedAct, range: GridRange, pixelsPerHour = PIXELS_PER_HOUR) => ({
  top: ((festivalMinutes(act.startTime) - range.startMinutes) * pixelsPerHour) / 60,
  height: (act.length * pixelsPerHour) / 60,
})

// Get unique days from acts
export const getUniqueDays = (acts: Act[]): string[] => {
  return [...new Set(acts.filter((act) => act.day).map((act) => act.day as string))].sort()
}

// Get unique stages from acts
export const getUniqueStages = (acts: Act[]): string[] => {
  return [...new Set(acts.filter((act) => act.stage).map((act) => act.stage as string))].sort()
}

// Filter acts by day
export const filterActsByDay = (acts: Act[], day: string): Act[] => {
  return acts.filter((act) => act.day === day)
}

// Format minutes since midnight as 12-hour text. Wraps past midnight.
const minutesToText = (totalMinutes: number): string => {
  const wrapped = ((totalMinutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY
  const hours = Math.floor(wrapped / 60)
  const minutes = wrapped % 60
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

// Format time for display
export const formatTime = (timeStr: string): string => {
  if (timeStr.includes('AM') || timeStr.includes('PM')) {
    return timeStr
  }
  return minutesToText(timeToMinutes(timeStr))
}

// Calculate end time for an act. A set that runs past midnight ends in the AM.
export const calculateEndTime = (startTime: string, length: number): string => {
  return minutesToText(timeToMinutes(startTime) + length)
}
