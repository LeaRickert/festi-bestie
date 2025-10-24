import { useState, useMemo, useEffect } from 'react'
import { Clock, Music, Calendar, Download } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  timeToMinutes, 
  simpleTimeToMinutes, 
  generateTimeSlots, 
  getActsForStage, 
  getActStyle, 
  getUniqueDays, 
  getUniqueStages, 
  filterActsByDay 
} from '../utils/scheduleUtils'

const ScheduleView = ({ acts, onActClick, festivalName, ratings = {} }) => {
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
        <div className="mt-4">
          <button
            onClick={() => navigate(`/festival/${id}/export`, { 
              state: { festival: { name: festivalName }, acts, ratings } 
            })}
            className="flex items-center px-6 py-3 bg-festival-purple/20 text-festival-purple rounded-lg hover:bg-festival-purple/30 transition-colors mx-auto"
          >
            <Download className="h-5 w-5 mr-2" />
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

                  {/* Schedule Grid */}
                  <div className="relative">
                    {/* Background Grid */}
                    {timeSlots.map(timeSlot => (
                      <div key={timeSlot} className="flex border-b border-white/10 last:border-b-0">
                        {/* Time Column */}
                        <div className="w-20 p-4 bg-white/5 border-r border-white/10 flex items-center">
                          <span className="text-white/80 text-sm">
                            {timeSlot}
                          </span>
                        </div>

                        {/* Stage Columns Background */}
                        {stages.map(stage => (
                          <div key={`${timeSlot}-${stage}`} className="flex-1 p-2 border-r border-white/10 last:border-r-0 min-h-[60px]">
                            {/* Empty background cells */}
                          </div>
                        ))}
                      </div>
                    ))}

                    {/* Acts Overlay - positioned absolutely over the entire grid */}
                    <div className="absolute top-0 left-0 w-full">
                      <div className="flex">
                        {/* Time column spacer */}
                        <div className="w-20"></div>
                        {/* Stage columns with acts */}
                        {stages.map(stage => (
                          <div key={`acts-${stage}`} className="flex-1 p-2 relative" style={{ minHeight: '720px' }}>
                            {getActsForStage(dayActs, stage).map(act => (
                              <div
                                key={act.id}
                                onClick={() => onActClick(act)}
                                className="bg-festival-purple/20 border border-festival-purple/30 rounded-lg p-2 hover:bg-festival-purple/30 transition-colors cursor-pointer absolute w-full"
                                style={getActStyle(act)}
                              >
                                <div className="font-medium text-white text-sm truncate">
                                  {act.artist}
                                </div>
                              </div>
                            ))}
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