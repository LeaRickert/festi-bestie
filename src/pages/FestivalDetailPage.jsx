import { useState, useEffect } from 'react'
import { useParams, Link, useLocation, useNavigate, useSearchParams } from 'react-router'
import { ArrowLeft, Calendar, Download, HeartHandshake, MapPin, Users } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useFestivalData } from '../hooks/useFestivalData'
import { useLaterTimesOnTop } from '../hooks/useLaterTimesOnTop'
import { useActHeat } from '../hooks/useActHeat'
import { useMyGroups } from '../hooks/useGroups'
import { posthog } from '../posthog'
import { supabase } from '../utils/supabase'
import { formatDateRange } from '../utils/dateUtils'
import { ratingStyle } from '../utils/ratingStyle'
import { heatStyle } from '../utils/heatStyle'
import ActSheet from '../components/ActSheet'
import BestieSheet from '../components/BestieSheet'
import LoginModal from '../components/LoginModal'
import ModeControl, { useMode } from '../components/ModeControl'
import ScheduleSettings from '../components/ScheduleSettings'
import ScheduleView from '../components/ScheduleView'
import AnnouncedView from '../components/AnnouncedView'
import LineupView from '../components/LineupView'
import StagesView from '../components/StagesView'
import ScheduleByDayView from '../components/ScheduleByDayView'

const FestivalDetailPage = () => {
  const { slug } = useParams()
  const { user } = useAuth()

  // Use the shared hook for festival data, acts, and ratings
  const { festival, acts, ratings, loading, error, retry, setRatings } = useFestivalData(slug, user)
  // The groups of the user for this festival make the ratings slider (groups FR-21).
  const { groups, reload: reloadGroups } = useMyGroups(festival?.id ?? null, user?.id ?? null)

  const [debugStatus, setDebugStatus] = useState(null) // For debug mode
  const [showDebugControls, setShowDebugControls] = useState(false) // Toggle debug controls
  const [showLoginModal, setShowLoginModal] = useState(false) // For login modal

  // "My picks" shows the rating style, "Heatmap" the global heat (heatmap FR-1, FR-11).
  const [mode, setMode] = useMode()
  const [laterOnTop, setLaterOnTop] = useLaterTimesOnTop()
  const [searchParams] = useSearchParams()
  const { heat, error: heatError } = useActHeat(festival?.id ?? null, mode === 'heatmap')
  const actStyle = (act) => (mode === 'heatmap' ? heatStyle(heat[act.id]) : ratingStyle(ratings[act.id] || 0))

  // The open act sheet is a history entry, so the browser back button closes
  // only the sheet (act-sheet FR-2). Every other close path goes back too.
  const location = useLocation()
  const navigate = useNavigate()
  const selectedAct = acts.find(act => act.id === location.state?.actId) ?? null
  const openAct = (act) => navigate({ search: location.search }, { state: { actId: act.id } })
  const closeAct = () => navigate(-1)
  // The bestie scores close the same way. Reload the groups so the list has
  // the current members (bestie FR-9, FR-12).
  const bestieOpen = Boolean(location.state?.bestie) && Boolean(user) && groups.length > 0
  const openBestie = () => {
    reloadGroups()
    navigate({ search: location.search }, { state: { bestie: true } })
  }

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
        return
      }

      posthog?.capture('act_rated', {
        act_id: actId,
        festival_id: festival?.id,
        rating,
      })
    } catch (error) {
      console.error('Error saving rating:', error)
      restorePrevious()
    }
  }


  // Use debug status if set, otherwise use festival status
  const currentStatus = festival ? debugStatus || festival.status : null

  const renderContentByStatus = () => {
    if (!festival) return null

    switch (currentStatus) {
      case 'announced':
        return <AnnouncedView festival={festival} />
      
      case 'lineup':
        return <LineupView acts={getAlphabeticallySortedActs()} actStyle={actStyle} onActClick={openAct} />
      
      case 'stages':
        return <StagesView acts={getAlphabeticallySortedActs()} actStyle={actStyle} onActClick={openAct} />
      
      case 'schedule':
        return <ScheduleByDayView acts={getAlphabeticallySortedActs()} actStyle={actStyle} onActClick={openAct} />
      
      case 'times':
      case 'complete':
        return <ScheduleView acts={acts} laterOnTop={laterOnTop} actStyle={actStyle} onActClick={openAct} />
      
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
      <header className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between">
            <Link 
              to="/festivals"
              className="flex items-center text-white/70 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back
            </Link>
            <div className="flex items-center gap-2">
              {/* Only for a user in a group for this festival (bestie FR-11). */}
              {user && groups.length > 0 && (
                <button
                  type="button"
                  onClick={openBestie}
                  className="flex items-center px-3 py-1.5 bg-white/10 text-white/80 rounded-md hover:bg-white/20 transition-colors text-sm"
                >
                  <HeartHandshake className="h-4 w-4 mr-1.5" />
                  Bestie Scores
                </button>
              )}
              {/* The groups page (groups FR-19). */}
              <Link
                to={`/festival/${slug}/groups`}
                className="flex items-center px-3 py-1.5 bg-white/10 text-white/80 rounded-md hover:bg-white/20 transition-colors text-sm"
              >
                <Users className="h-4 w-4 mr-1.5" />
                Groups
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Festival Hero */}
      <section className="px-4 pt-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-xl font-bold text-white">{festival.name}</h1>
            <div className="flex flex-col items-end gap-0.5 text-white/70 text-xs text-right">
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1 shrink-0" />
                <span>{formatDateRange(festival.start_date, festival.end_date)}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-3 w-3 mr-1 shrink-0" />
                <span>{festival.location}</span>
              </div>
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
                    type="button"
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
                  type="button"
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
      <div className="fixed bottom-3 left-3 z-40">
        <button
          type="button"
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
      <section className="py-4 px-2">
        <div className="max-w-4xl mx-auto">
          {/* Every act view has the mode control; the announced view has no acts (heatmap FR-1). */}
          {currentStatus && currentStatus !== 'announced' && (
            <>
              <div className="flex items-center justify-between gap-2 mb-2">
                <ModeControl mode={mode} onChange={setMode} />
                {/* Only the times view has a grid to export. The export page keeps the same ?day=. */}
                {(currentStatus === 'times' || currentStatus === 'complete') && (
                  <div className="flex items-center gap-2">
                    <ScheduleSettings laterOnTop={laterOnTop} onLaterOnTopChange={setLaterOnTop} />
                    <Link
                      to={`/festival/${slug}/export${searchParams.get('day') ? `?day=${encodeURIComponent(searchParams.get('day'))}` : ''}`}
                      aria-label="Export"
                      className="flex items-center px-3 py-1.5 bg-white/10 text-white/80 rounded-md hover:bg-white/20 transition-colors text-sm"
                    >
                      <Download className="h-4 w-4 mr-1.5" />
                      Export
                    </Link>
                  </div>
                )}
              </div>
              {mode === 'heatmap' && heatError && (
                <p className="text-red-400 text-xs mb-2">Could not load the heatmap: {heatError}</p>
              )}
            </>
          )}
          {renderContentByStatus()}
        </div>
      </section>

      {/* Act Sheet */}
      {selectedAct && (
        <ActSheet
          key={selectedAct.id}
          act={selectedAct}
          rating={ratings[selectedAct.id] || 0}
          signedIn={Boolean(user)}
          groups={groups}
          userId={user?.id ?? null}
          onRate={(rating) => handleRatingChange(selectedAct.id, rating)}
          onSignIn={() => setShowLoginModal(true)}
          onClose={closeAct}
        />
      )}

      {/* Bestie Scores */}
      {bestieOpen && (
        <BestieSheet
          festivalId={festival.id}
          acts={acts}
          myRatings={ratings}
          myId={user.id}
          groups={groups}
          onClose={closeAct}
        />
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
