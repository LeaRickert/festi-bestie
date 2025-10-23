import { Calendar, Music, MapPin } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'

const ScheduleByDayView = ({ acts, onActClick }) => {
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

  // Group acts by stage and sort artists alphabetically within each stage
  const actsByStage = useMemo(() => {
    const grouped = dayActs.reduce((acc, act) => {
      if (act.stage) {
        if (!acc[act.stage]) {
          acc[act.stage] = []
        }
        acc[act.stage].push(act)
      }
      return acc
    }, {})

    // Sort artists alphabetically within each stage
    Object.keys(grouped).forEach(stage => {
      grouped[stage].sort((a, b) => a.artist.localeCompare(b.artist))
    })

    return grouped
  }, [dayActs])

  const stages = Object.keys(actsByStage).sort()

  if (days.length === 0) {
    return (
      <div className="text-center py-12">
        <Music className="h-16 w-16 text-white/40 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white/80 mb-2">No schedule information available</h3>
        <p className="text-white/60">Day assignments coming soon.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Festival Schedule</h2>
        <p className="text-white/70">Times and detailed schedule coming soon</p>
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
            stages.map(stage => (
              <div key={stage} className="bg-white/5 rounded-xl p-6">
                <div className="flex items-center mb-6">
                  <MapPin className="h-6 w-6 text-festival-purple mr-3" />
                  <h4 className="text-xl font-bold text-white">{stage}</h4>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {actsByStage[stage].map(act => (
                    <div
                      key={act.id}
                      onClick={() => onActClick(act)}
                      className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-300 cursor-pointer"
                    >
                      <div className="space-y-2">
                        <h5 className="text-white font-medium text-sm truncate">
                          {act.artist}
                        </h5>
                        
                        {act.genre && (
                          <p className="text-white/60 text-xs truncate">
                            {act.genre}
                          </p>
                        )}
                        
                        {act.category && (
                          <p className="text-white/50 text-xs truncate">
                            {act.category}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="text-center mt-8">
        <div className="bg-festival-blue/20 border border-festival-blue/30 rounded-lg p-4 inline-block">
          <p className="text-festival-blue font-medium">
            Set times and detailed schedule coming soon!
          </p>
        </div>
      </div>
    </div>
  )
}

export default ScheduleByDayView
