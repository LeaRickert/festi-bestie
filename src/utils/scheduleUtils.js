// Shared utility functions for schedule rendering

// Convert time string to minutes since midnight (handles both 12-hour and 24-hour formats)
export const timeToMinutes = (timeStr) => {
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
export const simpleTimeToMinutes = (timeStr) => {
  const hour = parseInt(timeStr)
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
export const generateTimeSlots = () => {
  const slots = []
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
export const getActsForStage = (acts, stage) => {
  return acts.filter(act => {
    if (act.stage !== stage) return false
    if (!act.startTime || !act.length) return false // Skip acts without time info
    return true
  })
}

// Calculate act position and height for the entire schedule grid
// Each hour (60 minutes) = 90px, so 1 minute = 1.5px
const PIXELS_PER_MINUTE = 90 / 60 // 1.5px per minute

export const getActStyle = (act) => {
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
    zIndex: 10
  }
}

// Get unique days from acts
export const getUniqueDays = (acts) => {
  return [...new Set(acts.filter(act => act.day).map(act => act.day))].sort()
}

// Get unique stages from acts
export const getUniqueStages = (acts) => {
  return [...new Set(acts.filter(act => act.stage).map(act => act.stage))].sort()
}

// Filter acts by day
export const filterActsByDay = (acts, day) => {
  return acts.filter(act => act.day === day)
}

// Filter acts by stages
export const filterActsByStages = (acts, stages) => {
  return acts.filter(act => stages.includes(act.stage))
}

// Format time for display
export const formatTime = (timeStr) => {
  if (timeStr.includes('AM') || timeStr.includes('PM')) {
    return timeStr
  }
  const [hours, minutes] = timeStr.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

// Calculate end time for an act
export const calculateEndTime = (startTime, length) => {
  const startMinutes = timeToMinutes(startTime)
  const endMinutes = startMinutes + length
  const endHours = Math.floor(endMinutes / 60)
  const endMins = endMinutes % 60
  
  // Convert back to 12-hour format
  const period = endHours >= 12 ? 'PM' : 'AM'
  const displayHours = endHours === 0 ? 12 : endHours > 12 ? endHours - 12 : endHours
  
  return `${displayHours}:${endMins.toString().padStart(2, '0')} ${period}`
}
