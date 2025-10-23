import { useState, useMemo, useEffect } from 'react'
import { Clock, Music, Calendar } from 'lucide-react'

const ScheduleView = ({ acts, onActClick }) => {
  const [selectedDay, setSelectedDay] = useState('')

  // Get unique days from acts
  const days = useMemo(() => {
    return [...new Set(acts.filter(act => act.day).map(act => act.day))].sort()
  }, [acts])

  // Set default selected day
  useEffect(() => {
    if (days.length > 0 && !selectedDay) {
      setSelectedDay(days[0])
    }
  }, [days, selectedDay])

  // Filter acts by selected day
  const dayActs = useMemo(() => {
    return acts.filter(act => act.day === selectedDay)
  }, [acts, selectedDay])

  // Get unique stages from filtered acts (only include acts with stage info)
  const stages = useMemo(() => {
    return [...new Set(dayActs.filter(act => act.stage).map(act => act.stage))].sort()
  }, [dayActs])

  // Generate time slots (festival runs from 1 PM to 2 AM, using simple numbers)
  const timeSlots = useMemo(() => {
    const slots = []
    // 1 PM to 11 PM (13:00 to 23:00)
    for (let hour = 13; hour <= 23; hour++) {
      const displayHour = hour - 12 // Convert to 1-11 format
      slots.push(displayHour.toString())
    }
    // 12 AM to 2 AM (00:00 to 02:00)
    for (let hour = 0; hour <= 2; hour++) {
      const displayHour = hour === 0 ? 12 : hour // 12 AM, 1 AM, 2 AM
      slots.push(displayHour.toString())
    }
    return slots
  }, [])

  // Convert time string to minutes since midnight (handles both 12-hour and 24-hour formats)
  const timeToMinutes = (timeStr) => {
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

  // Convert simple number format to minutes (1 = 1 PM = 13:00)
  const simpleTimeToMinutes = (timeStr) => {
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

  // Get acts for a specific stage and time slot
  const getActsForSlot = (stage, timeSlot) => {
    const slotStartMinutes = simpleTimeToMinutes(timeSlot)
    const slotEndMinutes = slotStartMinutes + 60 // 1 hour slots
    
    return dayActs.filter(act => {
      if (act.stage !== stage) return false
      if (!act.startTime || !act.length) return false // Skip acts without time info
      
      const actStartMinutes = timeToMinutes(act.startTime)
      const actEndMinutes = actStartMinutes + act.length
      
      // Check if act overlaps with this time slot
      return actStartMinutes < slotEndMinutes && actEndMinutes > slotStartMinutes
    })
  }

  // Calculate act position and height for grid
  const getActStyle = (act, timeSlot) => {
    const slotStartMinutes = simpleTimeToMinutes(timeSlot)
    const actStartMinutes = timeToMinutes(act.startTime)
    const actEndMinutes = actStartMinutes + act.length
    
    const topOffset = Math.max(0, actStartMinutes - slotStartMinutes)
    const height = Math.min(act.length, slotStartMinutes + 60 - actStartMinutes)
    
    return {
      top: `${topOffset}px`,
      height: `${height}px`,
      position: 'absolute',
      width: '100%',
      zIndex: 10
    }
  }

  if (days.length === 0) {
    return (
      <div className="text-center py-12">
        <Music className="h-16 w-16 text-white/40 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white/80 mb-2">No schedule data</h3>
        <p className="text-white/60">No acts found for this festival.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Festival Schedule</h2>
        <p className="text-white/70">Complete schedule with set times</p>
      </div>

      {/* Day Selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {days.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedDay === day
                ? 'bg-festival-purple text-white'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Selected Day Content */}
      {selectedDay && (
        <div className="space-y-6">
          <div className="flex items-center justify-center mb-6">
            <Calendar className="h-6 w-6 text-festival-purple mr-3" />
            <h3 className="text-2xl font-bold text-white">{selectedDay}</h3>
          </div>

          {stages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/60">No stage information available for {selectedDay}</p>
            </div>
          ) : (
            <div className="bg-white/5 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  {/* Header Row */}
                  <div className="flex border-b border-white/10">
                    <div className="w-20 p-4 bg-white/5 border-r border-white/10">
                      <span className="text-white/60 text-sm font-medium">Time</span>
                    </div>
                    {stages.map(stage => (
                      <div key={stage} className="flex-1 p-4 bg-white/5 border-r border-white/10 last:border-r-0">
                        <span className="text-white font-medium">{stage}</span>
                      </div>
                    ))}
                  </div>

                  {/* Time Slots */}
                  {timeSlots.map(timeSlot => (
                    <div key={timeSlot} className="flex border-b border-white/10 last:border-b-0">
                      {/* Time Column */}
                      <div className="w-20 p-4 bg-white/5 border-r border-white/10 flex items-center">
                        <span className="text-white/80 text-sm">
                          {timeSlot}
                        </span>
                      </div>

                      {/* Stage Columns */}
                      {stages.map(stage => (
                        <div key={`${timeSlot}-${stage}`} className="flex-1 p-2 border-r border-white/10 last:border-r-0 relative min-h-[60px]">
                          {getActsForSlot(stage, timeSlot).map(act => (
                            <div
                              key={act.id}
                              onClick={() => onActClick(act)}
                              className="bg-festival-purple/20 border border-festival-purple/30 rounded-lg p-2 hover:bg-festival-purple/30 transition-colors cursor-pointer"
                              style={getActStyle(act, timeSlot)}
                            >
                              <div className="font-medium text-white text-sm truncate">
                                {act.artist}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ScheduleView