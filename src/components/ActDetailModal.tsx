import { Calendar, Clock, MapPin, Music, Play, Star } from 'lucide-react'
import type { Act } from '../hooks/useFestivalData'
import { formatTime } from '../utils/scheduleUtils'
import StarRating from './StarRating'

interface ActDetailModalProps {
  act: Act
  rating: number
  signedIn: boolean
  onRate: (rating: number) => void
  onSignIn: () => void
  onClose: () => void
}

const ActDetailModal = ({ act, rating, signedIn, onRate, onSignIn, onClose }: ActDetailModalProps) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-surface rounded-lg p-4 max-w-md w-full max-h-[80vh] overflow-y-auto border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-white">{act.artist}</h3>
        <button type="button" onClick={onClose} aria-label="Close" className="text-white/60 hover:text-white transition-colors">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          {act.day && (
            <div className="flex items-center text-white/80 text-sm">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              <span>{act.day}</span>
            </div>
          )}
          {act.stage && (
            <div className="flex items-center text-white/80 text-sm">
              <MapPin className="h-3.5 w-3.5 mr-1.5" />
              <span>{act.stage}</span>
            </div>
          )}
          {act.startTime && act.length && (
            <div className="flex items-center text-white/80 text-sm">
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              <span>{formatTime(act.startTime)} • {act.length}min</span>
            </div>
          )}
        </div>

        {(act.genre || act.category) && (
          <div className="space-y-1.5">
            {act.genre && (
              <div className="flex items-center text-white/70 text-sm">
                <Music className="h-3.5 w-3.5 mr-1.5" />
                <span>{act.genre}</span>
              </div>
            )}
            {act.category && <div className="text-white/60 text-xs">{act.category}</div>}
          </div>
        )}

        {act.specialNotes && (
          <div className="bg-white/10 rounded-md p-2">
            <p className="text-white font-medium text-xs">{act.specialNotes}</p>
          </div>
        )}

        {act.avgRating !== null && act.avgRating > 0 && (
          <div className="flex items-center text-rating text-sm">
            <Star className="h-3.5 w-3.5 mr-1.5" />
            <span className="font-medium">Avg: {act.avgRating.toFixed(1)}</span>
          </div>
        )}

        <div className="border-t border-white/10 pt-3">
          <div className="text-white/70 text-xs mb-2">Your Rating:</div>
          {signedIn ? (
            <StarRating rating={rating} onRatingChange={onRate} size="md" showValue={true} />
          ) : (
            <div className="space-y-2">
              <StarRating rating={0} onRatingChange={() => {}} size="md" showValue={false} />
              <div className="bg-white/10 rounded-md p-2.5">
                <p className="text-white/70 text-xs mb-2">Sign in to rate this artist</p>
                <button
                  type="button"
                  onClick={onSignIn}
                  className="w-full py-1.5 bg-white text-page font-medium rounded-md hover:bg-white/90 transition-colors text-sm"
                >
                  Sign In to Rate
                </button>
              </div>
            </div>
          )}
        </div>

        {act.youtubeUrl && (
          <div className="border-t border-white/10 pt-3">
            <a
              href={act.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-link hover:underline text-sm"
            >
              <Play className="h-3.5 w-3.5 mr-1.5" />
              {act.youtubeTitle || 'Watch Set'}
            </a>
          </div>
        )}
      </div>
    </div>
  </div>
)

export default ActDetailModal
