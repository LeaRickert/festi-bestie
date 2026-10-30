import { useState, useMemo, useEffect } from 'react'
import { Music, Calendar, Download } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import {
  generateTimeSlots,
  getActsForStage,
  getActStyle,
  getUniqueDays,
  getUniqueStages,
  filterActsByDay,
  formatTime,
  calculateEndTime
} from '../utils/scheduleUtils'
import { ratingStyle } from '../utils/ratingStyle'

const ScheduleView = ({ acts, ratings, onActClick }) => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [selectedDay, setSelectedDay] = useState('')

  // Get unique days from acts
  const days = useMemo(() => getUniqueDays(acts), [acts])

  // Set default selected day
  useEffect(() => {
    if (days.length > 0 && !selectedDay) {
      setSelectedDay(days[0])
    }
  }, [days, selectedDay])

  // Filter acts by selected day
  const dayActs = useMemo(() => filterActsByDay(acts, selectedDay), [acts, selectedDay])

  // Get unique stages from filtered acts (only include acts with stage info)
  const stages = useMemo(() => getUniqueStages(dayActs), [dayActs])

  // Generate time slots (festival runs from 1 PM to 12 AM, using simple numbers)
  const timeSlots = useMemo(() => generateTimeSlots(), [])

  if (days.length === 0) {
    return (
      <div className="text-center py-8">
        <Music className="h-12 w-12 text-white/40 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white/80 mb-1.5">No schedule data</h3>
        <p className="text-white/60 text-sm">No acts found for this festival.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-white mb-1">Festival Schedule</h2>
        <p className="text-white/70 text-sm">Complete schedule with set times</p>
        <div className="mt-3">
          <button
            onClick={() => navigate(`/festival/${id}/export`)}
            className="flex items-center px-4 py-2 bg-white text-page font-medium rounded-md hover:bg-white/90 transition-colors mx-auto text-sm"
          >
            <Download className="h-4 w-4 mr-1.5" />
            Export Schedule
          </button>
        </div>
      </div>

      {/* Day Selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {days.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors text-sm ${
              selectedDay === day
                ? 'bg-white text-page'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Selected Day Content */}
      {selectedDay && (
        <div className="space-y-4">
          <div className="flex items-center justify-center mb-3">
            <Calendar className="h-5 w-5 text-white/60 mr-2" />
            <h3 className="text-lg font-bold text-white">{selectedDay}</h3>
          </div>

          {stages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/60">No stage information available for {selectedDay}</p>
            </div>
          ) : (
            <div className="bg-surface rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  {/* Header Row */}
                  <div className="flex border-b border-white/10">
                    <div className="w-16 p-2 bg-white/5 border-r border-white/10">
                      <span className="text-white/60 text-xs font-medium">Time</span>
                    </div>
                    {stages.map(stage => (
                      <div key={stage} className="flex-1 p-2 bg-white/5 border-r border-white/10 last:border-r-0">
                        <span className="text-white font-medium text-sm">{stage}</span>
                      </div>
                    ))}
                  </div>

                  {/* Schedule Grid */}
                  <div className="relative">
                    {/* Background Grid */}
                    {timeSlots.map(timeSlot => (
                      <div key={timeSlot} className="flex border-b border-white/10 last:border-b-0">
                        {/* Time Column */}
                        <div className="w-16 p-2 bg-white/5 border-r border-white/10 flex items-center h-[90px]">
                          <span className="text-white/80 text-xs">
                            {timeSlot}
                          </span>
                        </div>

                        {/* Stage Columns Background */}
                        {stages.map(stage => (
                          <div key={`${timeSlot}-${stage}`} className="flex-1 p-1 border-r border-white/10 last:border-r-0 h-[90px]">
                            {/* Empty background cells */}
                          </div>
                        ))}
                      </div>
                    ))}

                    {/* Acts Overlay - positioned absolutely over the entire grid */}
                    <div className="absolute top-0 left-0 w-full">
                      <div className="flex">
                        {/* Time column spacer */}
                        <div className="w-16"></div>
                        {/* Stage columns with acts */}
                        {stages.map(stage => (
                          <div key={`acts-${stage}`} className="flex-1 relative" style={{ height: `${timeSlots.length * 90}px` }}>
                            <div className="absolute inset-0 p-1">
                              {getActsForStage(dayActs, stage).map(act => {
                                const startTime = formatTime(act.startTime)
                                const endTime = calculateEndTime(act.startTime, act.length)

                                return (
                                  <div
                                    key={act.id}
                                    onClick={() => onActClick(act)}
                                    className="border rounded-md p-1.5 active:opacity-80 transition-opacity cursor-pointer absolute left-0 right-0"
                                    style={{ ...getActStyle(act), ...ratingStyle(ratings[act.id] || 0) }}
                                  >
                                    <div className="font-medium text-xs truncate">
                                      {act.artist}
                                    </div>
                                    <div className="opacity-70 text-[10px] mt-0.5">
                                      {startTime} - {endTime}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
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