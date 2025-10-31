import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Music, 
  Download,
  Play,
  Star
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
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
  const navigate = useNavigate()
  const { user } = useAuth()

  // Use the shared hook for festival data, acts, and ratings
  const { festival, acts, ratings, loading, setRatings } = useFestivalData(id, user)

  const [debugStatus, setDebugStatus] = useState(null) // For debug mode
  const [showDebugControls, setShowDebugControls] = useState(false) // Toggle debug controls
  const [selectedAct, setSelectedAct] = useState(null) // For act detail popup
  const [showLoginModal, setShowLoginModal] = useState(false) // For login modal

  // Debug mode keyboard shortcut (Ctrl/Cmd + D)
  useEffect(() => {
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
        // Revert the local state on error
        setRatings(prev => ({
          ...prev,
          [actId]: prev[actId] // Keep previous value
        }))
      }
    } catch (error) {
      console.error('Error saving rating:', error)
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!festival) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Festival not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
              className="flex items-center text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Festivals
            </Link>
          </div>
        </div>
      </header>

      {/* Festival Hero */}
      <section className="relative h-64 overflow-hidden">
        <img
          src={festival.image_url}
          alt={festival.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8">
          <h1 className="text-4xl font-bold text-white mb-2">{festival.name}</h1>
          <div className="flex items-center space-x-6 text-white/80">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{festival.start_date} - {festival.end_date}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{festival.location}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Debug Controls */}
      {showDebugControls && (
        <section className="py-4 px-4 sm:px-6 lg:px-8 bg-red-500/10 border-b border-red-500/20">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-red-400 text-sm font-medium">DEBUG MODE:</span>
                <span className="text-white/80 text-sm">
                  Current Status: {debugStatus || festival?.status || 'unknown'}
                </span>
                {debugStatus && (
                  <span className="text-yellow-400 text-xs">
                    (Overriding database status)
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-white/60 text-xs">Switch to:</span>
                {['announced', 'lineup', 'stages', 'schedule', 'times', 'complete'].map(status => (
                  <button
                    key={status}
                    onClick={() => setDebugStatus(status)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
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
                  className="px-2 py-1 rounded text-xs font-medium bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Debug Toggle Button */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setShowDebugControls(prev => !prev)}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            showDebugControls 
              ? 'bg-red-500 text-white' 
              : 'bg-black/50 text-white/60 hover:bg-black/70'
          }`}
          title="Toggle Debug Mode (Ctrl/Cmd + D)"
        >
          DEBUG
        </button>
      </div>


      {/* Content Display */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {renderContentByStatus()}
        </div>
      </section>

      {/* Act Detail Popup */}
      {selectedAct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-white">{selectedAct.artist}</h3>
              <button
                onClick={() => setSelectedAct(null)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Basic Info */}
              <div className="space-y-2">
                {selectedAct.day && (
                  <div className="flex items-center text-white/80">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{selectedAct.day}</span>
                  </div>
                )}
                {selectedAct.stage && (
                  <div className="flex items-center text-white/80">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{selectedAct.stage}</span>
                  </div>
                )}
                {selectedAct.startTime && selectedAct.length && (
                  <div className="flex items-center text-white/80">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{selectedAct.startTime} • {selectedAct.length}min</span>
                  </div>
                )}
              </div>

              {/* Genre and Category */}
              {(selectedAct.genre || selectedAct.category) && (
                <div className="space-y-2">
                  {selectedAct.genre && (
                    <div className="flex items-center text-white/70">
                      <Music className="h-4 w-4 mr-2" />
                      <span>{selectedAct.genre}</span>
                    </div>
                  )}
                  {selectedAct.category && (
                    <div className="text-white/60 text-sm">
                      {selectedAct.category}
                    </div>
                  )}
                </div>
              )}

              {/* Special Notes */}
              {selectedAct.specialNotes && (
                <div className="bg-festival-purple/20 border border-festival-purple/30 rounded-lg p-3">
                  <p className="text-festival-purple font-medium text-sm">
                    {selectedAct.specialNotes}
                  </p>
                </div>
              )}

              {/* Average Rating */}
              {selectedAct.avgRating > 0 && (
                <div className="flex items-center text-festival-purple">
                  <Star className="h-4 w-4 mr-2" />
                  <span className="font-medium">Average Rating: {selectedAct.avgRating.toFixed(1)}</span>
                </div>
              )}

              {/* User Rating */}
              <div className="border-t border-white/10 pt-4">
                <div className="text-white/80 text-sm mb-2">Your Rating:</div>
                {user ? (
                  <StarRating
                    rating={ratings[selectedAct.id] || 0}
                    onRatingChange={(rating) => handleRatingChange(selectedAct.id, rating)}
                    size="md"
                    showValue={true}
                  />
                ) : (
                  <div className="space-y-3">
                    <StarRating
                      rating={0}
                      onRatingChange={() => {}}
                      size="md"
                      showValue={false}
                    />
                    <div className="bg-festival-purple/10 border border-festival-purple/30 rounded-lg p-3">
                      <p className="text-white/70 text-sm mb-3">
                        Sign in to rate this artist and track your favorites
                      </p>
                      <button
                        onClick={() => setShowLoginModal(true)}
                        className="w-full py-2 bg-festival-purple hover:bg-festival-purple/80 text-white font-medium rounded-lg transition-colors"
                      >
                        Sign In to Rate
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* YouTube Link */}
              {selectedAct.youtubeUrl && (
                <div className="border-t border-white/10 pt-4">
                  <a
                    href={selectedAct.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-festival-blue/20 text-festival-blue rounded-lg hover:bg-festival-blue/30 transition-colors"
                  >
                    <Play className="h-4 w-4 mr-2" />
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
