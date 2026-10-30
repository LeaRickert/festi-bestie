import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Music, 
  Play,
  Star
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { formatTime } from '../utils/scheduleUtils'
import { useFestivalData } from '../hooks/useFestivalData'
import { supabase } from '../utils/supabase'
import StarRating from '../components/StarRating'
import LoginModal from '../components/LoginModal'
import ScheduleView from '../components/ScheduleView'
import AnnouncedView from '../components/AnnouncedView'
import LineupView from '../components/LineupView'
import StagesView from '../components/StagesView'
import ScheduleByDayView from '../components/ScheduleByDayView'

const FestivalDetailPage = () => {
  const { id } = useParams()
  const { user } = useAuth()

  // Use the shared hook for festival data, acts, and ratings
  const { festival, acts, ratings, loading, error, retry, setRatings } = useFestivalData(id, user)

  const [debugStatus, setDebugStatus] = useState(null) // For debug mode
  const [showDebugControls, setShowDebugControls] = useState(false) // Toggle debug controls
  const [selectedAct, setSelectedAct] = useState(null) // For act detail popup
  const [showLoginModal, setShowLoginModal] = useState(false) // For login modal

  // Debug mode keyboard shortcut (Ctrl/Cmd + D), development builds only
  useEffect(() => {
    if (!import.meta.env.DEV) return

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault()
        setShowDebugControls(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Get acts sorted alphabetically for views without time information
  const getAlphabeticallySortedActs = () => {
    return [...acts].sort((a, b) => a.artist.localeCompare(b.artist))
  }

  const handleRatingChange = async (actId, rating) => {
    if (!user) return
    
    const previous = ratings[actId]
    const restorePrevious = () => {
      setRatings(prev => {
        const next = { ...prev }
        if (previous === undefined) {
          delete next[actId]
        } else {
          next[actId] = previous
        }
        return next
      })
    }

    setRatings(prev => ({
      ...prev,
      [actId]: rating
    }))

    try {
      // Save to Supabase using upsert with proper conflict resolution
      const { error } = await supabase
        .from('user_ratings')
        .upsert({
          user_id: user.id,
          act_id: actId,
          rating: rating
        }, {
          onConflict: 'user_id,act_id'
        })

      if (error) {
        console.error('Error saving rating:', error)
        restorePrevious()
      }
    } catch (error) {
      console.error('Error saving rating:', error)
      restorePrevious()
    }
  }


  const renderContentByStatus = () => {
    if (!festival) return null

    // Use debug status if set, otherwise use festival status
    const currentStatus = debugStatus || festival.status

    switch (currentStatus) {
      case 'announced':
        return <AnnouncedView festival={festival} />
      
      case 'lineup':
        return <LineupView acts={getAlphabeticallySortedActs()} onActClick={setSelectedAct} />
      
      case 'stages':
        return <StagesView acts={getAlphabeticallySortedActs()} onActClick={setSelectedAct} />
      
      case 'schedule':
        return <ScheduleByDayView acts={getAlphabeticallySortedActs()} onActClick={setSelectedAct} />
      
      case 'times':
      case 'complete':
        return <ScheduleView acts={acts} onActClick={setSelectedAct} festivalName={festival.name} ratings={ratings} />
      
      default:
        return <AnnouncedView festival={festival} />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <div className="text-red-400 text-sm">Could not load the festival: {error}</div>
        <button
          type="button"
          onClick={retry}
          className="px-3 py-1.5 bg-white/10 text-white/80 rounded-md hover:bg-white/20 transition-colors text-sm"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!festival) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-sm">Festival not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
              className="flex items-center text-white/70 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back
            </Link>
          </div>
        </div>
      </header>

      {/* Festival Hero */}
      <section className="relative h-40 overflow-hidden">
        <img
          src={festival.image_url}
          alt={festival.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <h1 className="text-xl font-bold text-white mb-1.5">{festival.name}</h1>
          <div className="flex items-center space-x-4 text-white/70 text-xs">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{festival.start_date} - {festival.end_date}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              <span>{festival.location}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Debug Controls */}
      {import.meta.env.DEV && showDebugControls && (
        <section className="py-2.5 px-4 bg-red-500/10 border-b border-red-500/20">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-red-400 text-xs font-medium">DEBUG:</span>
                <span className="text-white/80 text-xs">
                  {debugStatus || festival?.status || 'unknown'}
                </span>
                {debugStatus && (
                  <span className="text-yellow-400 text-[10px]">
                    (override)
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1.5 flex-wrap">
                <span className="text-white/60 text-[10px]">Switch:</span>
                {['announced', 'lineup', 'stages', 'schedule', 'times', 'complete'].map(status => (
                  <button
                    key={status}
                    onClick={() => setDebugStatus(status)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                      (debugStatus || festival?.status) === status
                        ? 'bg-red-500 text-white'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    {status}
                  </button>
                ))}
                <button
                  onClick={() => setDebugStatus(null)}
                  className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Debug Toggle Button */}
      {import.meta.env.DEV && (
      <div className="fixed top-3 right-3 z-50">
        <button
          onClick={() => setShowDebugControls(prev => !prev)}
          className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
            showDebugControls 
              ? 'bg-red-500 text-white' 
              : 'bg-black/50 text-white/60 hover:bg-black/70'
          }`}
          title="Toggle Debug Mode (Ctrl/Cmd + D)"
        >
          DEBUG
        </button>
      </div>
      )}


      {/* Content Display */}
      <section className="py-4 px-4">
        <div className="max-w-4xl mx-auto">
          {renderContentByStatus()}
        </div>
      </section>

      {/* Act Detail Popup */}
      {selectedAct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800/95 backdrop-blur-sm rounded-lg p-4 max-w-md w-full max-h-[80vh] overflow-y-auto border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-white">{selectedAct.artist}</h3>
              <button
                onClick={() => setSelectedAct(null)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {/* Basic Info */}
              <div className="space-y-1.5">
                {selectedAct.day && (
                  <div className="flex items-center text-white/80 text-sm">
                    <Calendar className="h-3.5 w-3.5 mr-1.5" />
                    <span>{selectedAct.day}</span>
                  </div>
                )}
                {selectedAct.stage && (
                  <div className="flex items-center text-white/80 text-sm">
                    <MapPin className="h-3.5 w-3.5 mr-1.5" />
                    <span>{selectedAct.stage}</span>
                  </div>
                )}
                {selectedAct.startTime && selectedAct.length && (
                  <div className="flex items-center text-white/80 text-sm">
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    <span>{formatTime(selectedAct.startTime)} • {selectedAct.length}min</span>
                  </div>
                )}
              </div>

              {/* Genre and Category */}
              {(selectedAct.genre || selectedAct.category) && (
                <div className="space-y-1.5">
                  {selectedAct.genre && (
                    <div className="flex items-center text-white/70 text-sm">
                      <Music className="h-3.5 w-3.5 mr-1.5" />
                      <span>{selectedAct.genre}</span>
                    </div>
                  )}
                  {selectedAct.category && (
                    <div className="text-white/60 text-xs">
                      {selectedAct.category}
                    </div>
                  )}
                </div>
              )}

              {/* Special Notes */}
              {selectedAct.specialNotes && (
                <div className="bg-festival-purple/20 border border-festival-purple/30 rounded-md p-2">
                  <p className="text-festival-purple font-medium text-xs">
                    {selectedAct.specialNotes}
                  </p>
                </div>
              )}

              {/* Average Rating */}
              {selectedAct.avgRating > 0 && (
                <div className="flex items-center text-festival-purple text-sm">
                  <Star className="h-3.5 w-3.5 mr-1.5" />
                  <span className="font-medium">Avg: {selectedAct.avgRating.toFixed(1)}</span>
                </div>
              )}

              {/* User Rating */}
              <div className="border-t border-white/10 pt-3">
                <div className="text-white/70 text-xs mb-2">Your Rating:</div>
                {user ? (
                  <StarRating
                    rating={ratings[selectedAct.id] || 0}
                    onRatingChange={(rating) => handleRatingChange(selectedAct.id, rating)}
                    size="md"
                    showValue={true}
                  />
                ) : (
                  <div className="space-y-2">
                    <StarRating
                      rating={0}
                      onRatingChange={() => {}}
                      size="md"
                      showValue={false}
                    />
                    <div className="bg-festival-purple/10 border border-festival-purple/30 rounded-md p-2.5">
                      <p className="text-white/70 text-xs mb-2">
                        Sign in to rate this artist
                      </p>
                      <button
                        onClick={() => setShowLoginModal(true)}
                        className="w-full py-1.5 bg-festival-purple hover:bg-festival-purple/80 text-white font-medium rounded-md transition-colors text-sm"
                      >
                        Sign In to Rate
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* YouTube Link */}
              {selectedAct.youtubeUrl && (
                <div className="border-t border-white/10 pt-3">
                  <a
                    href={selectedAct.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1.5 bg-festival-blue/20 text-festival-blue rounded-md hover:bg-festival-blue/30 transition-colors text-sm"
                  >
                    <Play className="h-3.5 w-3.5 mr-1.5" />
                    {selectedAct.youtubeTitle || 'Watch Set'}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

    </div>
  )
}

export default FestivalDetailPage
