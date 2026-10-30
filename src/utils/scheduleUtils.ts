// Shared utility functions for schedule rendering
import type { CSSProperties } from 'react'
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

// Convert simple number format to minutes (1 = 1 PM = 13:00, 12 = 12 AM = 00:00)
export const simpleTimeToMinutes = (timeStr: string): number => {
  const hour = parseInt(timeStr, 10)
  let actualHour = hour

  // Convert simple numbers to 24-hour format
  if (hour >= 1 && hour <= 11) {
    actualHour = hour + 12 // 1-11 becomes 13-23 (1 PM - 11 PM)
  } else if (hour === 12) {
    actualHour = 0 // 12 becomes 0 (12 AM)
  }

  return actualHour * 60 // No minutes, just hours
}

// Generate time slots (festival runs from 1 PM to 12 AM, using simple numbers)
export const generateTimeSlots = (): string[] => {
  const slots: string[] = []
  // 1 PM to 11 PM (13:00 to 23:00)
  for (let hour = 13; hour <= 23; hour++) {
    const displayHour = hour - 12 // Convert to 1-11 format
    slots.push(displayHour.toString())
  }
  // 12 AM (00:00)
  slots.push('12')
  return slots
}

// Get all acts for a specific stage (not filtered by time slot)
export const getActsForStage = (acts: Act[], stage: string): Act[] => {
  return acts.filter((act) => {
    if (act.stage !== stage) return false
    if (!act.startTime || !act.length) return false // Skip acts without time info
    return true
  })
}

// Calculate act position and height for the entire schedule grid
// Each hour (60 minutes) = 90px, so 1 minute = 1.5px
const PIXELS_PER_MINUTE = 90 / 60 // 1.5px per minute

export const getActStyle = (act: TimedAct): CSSProperties => {
  const actStartMinutes = timeToMinutes(act.startTime)

  // Calculate position relative to the start of the schedule (1 PM = 13:00)
  const scheduleStartMinutes = 13 * 60 // 1 PM in minutes
  const topOffsetMinutes = Math.max(0, actStartMinutes - scheduleStartMinutes)
  const topOffset = topOffsetMinutes * PIXELS_PER_MINUTE
  const height = act.length * PIXELS_PER_MINUTE

  return {
    top: `${topOffset}px`,
    height: `${height}px`,
    position: 'absolute',
    width: '100%',
    zIndex: 10,
  }
}

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

// Filter acts by stages
export const filterActsByStages = (acts: Act[], stages: string[]): Act[] => {
  return acts.filter((act) => act.stage !== null && stages.includes(act.stage))
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
