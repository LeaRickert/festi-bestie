import { Music, MapPin } from 'lucide-react'
import { useMemo } from 'react'
import { getUniqueDays } from '../utils/scheduleUtils'
import DayControl, { useSelectedDay } from './DayControl'

const ScheduleByDayView = ({ acts, actStyle, onActClick }) => {
  const days = useMemo(() => getUniqueDays(acts), [acts])
  const [selectedDay, setSelectedDay] = useSelectedDay(days)

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
      <div className="text-center py-8">
        <Music className="h-12 w-12 text-white/40 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white/80 mb-1.5">No schedule information available</h3>
        <p className="text-white/60 text-sm">Day assignments coming soon.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <DayControl days={days} selectedDay={selectedDay} onChange={setSelectedDay} />

      {selectedDay && (
        <div className="space-y-4">

          {stages.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-white/60 text-sm">No stage information available for {selectedDay}</p>
            </div>
          ) : (
            stages.map(stage => (
              <div key={stage} className="bg-surface rounded-lg p-3">
                <div className="flex items-center mb-3">
                  <MapPin className="h-4 w-4 text-white/60 mr-2" />
                  <h4 className="text-base font-bold text-white">{stage}</h4>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {actsByStage[stage].map(act => (
                    <button
                      type="button"
                      key={act.id}
                      onClick={() => onActClick(act)}
                      className="w-full border rounded-md p-2.5 active:opacity-80 transition-opacity text-left cursor-pointer"
                      style={actStyle(act)}
                    >
                      <span className="block space-y-1.5">
                        <span className="block text-white font-medium text-sm truncate">
                          {act.artist}
                        </span>

                        {act.genre && (
                          <span className="block text-white/60 text-xs truncate">
                            {act.genre}
                          </span>
                        )}

                        {act.category && (
                          <span className="block text-white/50 text-[10px] truncate">
                            {act.category}
                          </span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="text-center mt-4">
        <div className="bg-surface rounded-md p-3 inline-block">
          <p className="text-white/80 font-medium text-sm">
            Set times and detailed schedule coming soon!
          </p>
        </div>
      </div>
    </div>
  )
}

export default ScheduleByDayView
