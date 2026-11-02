import { Music, MapPin } from 'lucide-react'

const StagesView = ({ acts, actStyle, onActClick }) => {
  // Group acts by stage and sort artists alphabetically within each stage
  const actsByStage = acts.reduce((acc, act) => {
    if (act.stage) {
      if (!acc[act.stage]) {
        acc[act.stage] = []
      }
      acc[act.stage].push(act)
    }
    return acc
  }, {})

  // Sort artists alphabetically within each stage
  Object.keys(actsByStage).forEach(stage => {
    actsByStage[stage].sort((a, b) => a.artist.localeCompare(b.artist))
  })

  const stages = Object.keys(actsByStage).sort()

  if (stages.length === 0) {
    return (
      <div className="text-center py-8">
        <Music className="h-12 w-12 text-white/40 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white/80 mb-1.5">No stage information available</h3>
        <p className="text-white/60 text-sm">Stage assignments coming soon.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-white mb-1">Stages & Artists</h2>
        <p className="text-white/70 text-sm">Schedule information coming soon</p>
      </div>

      {stages.map(stage => (
        <div key={stage} className="bg-surface rounded-lg p-3">
          <div className="flex items-center mb-3">
            <MapPin className="h-4 w-4 text-white/60 mr-2" />
            <h3 className="text-base font-bold text-white">{stage}</h3>
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
      ))}

      <div className="text-center mt-4">
        <div className="bg-surface rounded-md p-3 inline-block">
          <p className="text-white/80 font-medium text-sm">
            Schedule and times coming soon!
          </p>
        </div>
      </div>
    </div>
  )
}

export default StagesView
