import { Music, MapPin } from 'lucide-react'

const StagesView = ({ acts, onActClick }) => {
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
      <div className="text-center py-12">
        <Music className="h-16 w-16 text-white/40 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white/80 mb-2">No stage information available</h3>
        <p className="text-white/60">Stage assignments coming soon.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Stages & Artists</h2>
        <p className="text-white/70">Schedule information coming soon</p>
      </div>

      {stages.map(stage => (
        <div key={stage} className="bg-white/5 rounded-xl p-6">
          <div className="flex items-center mb-6">
            <MapPin className="h-6 w-6 text-festival-purple mr-3" />
            <h3 className="text-2xl font-bold text-white">{stage}</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {actsByStage[stage].map(act => (
                    <div
                      key={act.id}
                      onClick={() => onActClick(act)}
                      className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-300 cursor-pointer"
                    >
                <div className="space-y-2">
                  <h4 className="text-white font-medium text-sm truncate">
                    {act.artist}
                  </h4>
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
      ))}

      <div className="text-center mt-8">
        <div className="bg-festival-blue/20 border border-festival-blue/30 rounded-lg p-4 inline-block">
          <p className="text-festival-blue font-medium">
            Schedule and times coming soon!
          </p>
        </div>
      </div>
    </div>
  )
}

export default StagesView
