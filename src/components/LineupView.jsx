import { Music } from 'lucide-react'

const LineupView = ({ acts, onActClick }) => {
  if (acts.length === 0) {
    return (
      <div className="text-center py-12">
        <Music className="h-16 w-16 text-white/40 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white/80 mb-2">No lineup available</h3>
        <p className="text-white/60">Check back soon for artist announcements.</p>
      </div>
    )
  }

  // Sort acts alphabetically by artist name
  const sortedActs = [...acts].sort((a, b) => a.artist.localeCompare(b.artist))

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Artist Lineup</h2>
        <p className="text-white/70">Schedule and stage information coming soon</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {sortedActs.map(act => (
          <div
            key={act.id}
            onClick={() => onActClick(act)}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300 text-center cursor-pointer"
          >
            <div className="space-y-2">
              <h3 className="text-white font-medium text-sm truncate">
                {act.artist}
              </h3>
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

      <div className="text-center mt-8">
        <div className="bg-festival-blue/20 border border-festival-blue/30 rounded-lg p-4 inline-block">
          <p className="text-festival-blue font-medium">
            Schedule and stage information coming soon!
          </p>
        </div>
      </div>
    </div>
  )
}

export default LineupView
