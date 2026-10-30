import { Music } from 'lucide-react'
import { ratingStyle } from '../utils/ratingStyle'

const LineupView = ({ acts, ratings, onActClick }) => {
  if (acts.length === 0) {
    return (
      <div className="text-center py-8">
        <Music className="h-12 w-12 text-white/40 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white/80 mb-1.5">No lineup available</h3>
        <p className="text-white/60 text-sm">Check back soon for artist announcements.</p>
      </div>
    )
  }

  // Sort acts alphabetically by artist name
  const sortedActs = [...acts].sort((a, b) => a.artist.localeCompare(b.artist))

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-white mb-1">Artist Lineup</h2>
        <p className="text-white/70 text-sm">Schedule and stage information coming soon</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
        {sortedActs.map(act => (
          <div
            key={act.id}
            onClick={() => onActClick(act)}
            className="border rounded-lg p-3 active:opacity-80 transition-opacity text-center cursor-pointer"
            style={ratingStyle(ratings[act.id] || 0)}
          >
            <div className="space-y-1.5">
              <h3 className="text-white font-medium text-sm truncate">
                {act.artist}
              </h3>
              {act.genre && (
                <p className="text-white/60 text-xs truncate">
                  {act.genre}
                </p>
              )}
              {act.category && (
                <p className="text-white/50 text-[10px] truncate">
                  {act.category}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-4">
        <div className="bg-surface rounded-md p-3 inline-block">
          <p className="text-white/80 font-medium text-sm">
            Schedule and stage information coming soon!
          </p>
        </div>
      </div>
    </div>
  )
}

export default LineupView
