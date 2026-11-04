import { useEffect, useMemo, useState } from 'react'
import { useParams, Link, useLocation, useNavigate, useSearchParams } from 'react-router'
import { ArrowLeft, Download, HeartHandshake, Users } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { type Act, useFestivalData } from '../hooks/useFestivalData'
import { useLaterTimesOnTop } from '../hooks/useLaterTimesOnTop'
import { useActHeat } from '../hooks/useActHeat'
import { useMyGroups } from '../hooks/useGroups'
import { posthog } from '../posthog'
import { supabase } from '../utils/supabase'
import { ratingStyle } from '../utils/ratingStyle'
import { heatStyle } from '../utils/heatStyle'
import { type ActStyle, DIMMED_OPACITY, getGenreOptions, matchesGenre, resolveGenre, viewCaption } from '../utils/viewOptions'
import ActSheet from '../components/ActSheet'
import BestieSheet from '../components/BestieSheet'
import LoginModal from '../components/LoginModal'
import { useViewParams, ViewButton, ViewCaption, ViewSheet } from '../components/ViewOptions'
import ScheduleView from '../components/ScheduleView'
import AnnouncedView from '../components/AnnouncedView'
import LineupView from '../components/LineupView'
import StagesView from '../components/StagesView'
import ScheduleByDayView from '../components/ScheduleByDayView'

const ICON_BUTTON = 'flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-white/80 hover:bg-white/10 transition-colors'

const FestivalDetailPage = () => {
  const { slug } = useParams()
  const { user } = useAuth()

  // Use the shared hook for festival data, acts, and ratings
  const { festival, acts, ratings, loading, error, retry, setRatings } = useFestivalData(slug ?? null, user)
  // The groups of the user for this festival make the ratings slider (groups FR-21).
  const { groups, reload: reloadGroups } = useMyGroups(festival?.id ?? null, user?.id ?? null)

  const [debugStatus, setDebugStatus] = useState<string | null>(null) // For debug mode
  const [showDebugControls, setShowDebugControls] = useState(false) // Toggle debug controls
  const [showLoginModal, setShowLoginModal] = useState(false) // For login modal
  const [viewOpen, setViewOpen] = useState(false)

  // "My picks" shows the rating style, "Heatmap" the global heat (heatmap FR-1, FR-11).
  // A chosen genre dims the other acts (view-options FR-5, FR-6).
  const { mode, genreParam, setMode, setGenre, resetView } = useViewParams()
  const genres = useMemo(() => getGenreOptions(acts), [acts])
  const genre = resolveGenre(genreParam, genres)
  const caption = viewCaption({ mode, genre })
  const [laterOnTop, setLaterOnTop] = useLaterTimesOnTop()
  const [searchParams] = useSearchParams()
  const { heat, error: heatError } = useActHeat(festival?.id ?? null, mode === 'heatmap')
  const actStyle = (act: Act): ActStyle => {
    const style = mode === 'heatmap' ? heatStyle(heat[act.id]) : ratingStyle(ratings[act.id] || 0)
    return matchesGenre(act, genre) ? style : { ...style, opacity: DIMMED_OPACITY }
  }

  // The open act sheet is a history entry, so the browser back button closes
  // only the sheet (act-sheet FR-2). Every other close path goes back too.
  const location = useLocation()
  const navigate = useNavigate()
  const selectedAct = acts.find(act => act.id === location.state?.actId) ?? null
  const openAct = (act: Act) => navigate({ search: location.search }, { state: { actId: act.id } })
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

    const handleKeyDown = (e: KeyboardEvent) => {
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

  const handleRatingChange = async (actId: string, rating: number) => {
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
  const exportDay = searchParams.get('day')

  const hasActView = currentStatus !== null && ['lineup', 'stages', 'schedule', 'times', 'complete'].includes(currentStatus)
  const isTimeGrid = currentStatus === 'times' || currentStatus === 'complete'
  const openView = () => setViewOpen(true)
  const viewButton = <ViewButton caption={caption} onOpen={openView} />
  const captionLine = caption && <ViewCaption caption={caption} onOpen={openView} />
  // The lineup and stages views have no day control, so the View button has its own row (view-options FR-2).
  const viewRow = (
    <div className="sticky top-0 z-30 -mx-2 flex items-center gap-2 bg-page px-2 py-2">
      <div className="min-w-0 flex-1">{captionLine}</div>
      {viewButton}
    </div>
  )

  const renderContentByStatus = () => {
    if (!festival) return null

    switch (currentStatus) {
      case 'announced':
        return <AnnouncedView festival={festival} />

      case 'lineup':
        return (
          <>
            {viewRow}
            <LineupView acts={getAlphabeticallySortedActs()} actStyle={actStyle} onActClick={openAct} />
          </>
        )

      case 'stages':
        return (
          <>
            {viewRow}
            <StagesView acts={getAlphabeticallySortedActs()} actStyle={actStyle} onActClick={openAct} />
          </>
        )

      case 'schedule':
        return (
          <ScheduleByDayView
            acts={getAlphabeticallySortedActs()}
            actStyle={actStyle}
            onActClick={openAct}
            dayTrailing={viewButton}
            dayBelow={captionLine}
          />
        )

      case 'times':
      case 'complete':
        return (
          <ScheduleView
            acts={acts}
            laterOnTop={laterOnTop}
            actStyle={actStyle}
            onActClick={openAct}
            dayTrailing={viewButton}
            dayBelow={captionLine}
          />
        )

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
      {/* One header row (festivals FR-13). */}
      <header className="max-w-4xl mx-auto flex items-center gap-0.5 px-1 py-1">
        <Link to="/festivals" aria-label="Back" title="Back" className={ICON_BUTTON}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="min-w-0 flex-1 truncate pl-0.5 text-base font-bold text-white">{festival.name}</h1>
        {/* Only for a user in a group for this festival (bestie FR-11). */}
        {user && groups.length > 0 && (
          <button type="button" onClick={openBestie} aria-label="Bestie Scores" title="Bestie Scores" className={ICON_BUTTON}>
            <HeartHandshake className="h-4 w-4" />
          </button>
        )}
        {/* The groups page (groups FR-19). */}
        <Link to={`/festival/${slug}/groups`} aria-label="Groups" title="Groups" className={ICON_BUTTON}>
          <Users className="h-4 w-4" />
        </Link>
        {/* Only the times view has a grid to export. The export page keeps the same ?day=. */}
        {isTimeGrid && (
          <Link
            to={`/festival/${slug}/export${exportDay ? `?day=${encodeURIComponent(exportDay)}` : ''}`}
            aria-label="Export"
            title="Export"
            className={ICON_BUTTON}
          >
            <Download className="h-4 w-4" />
          </Link>
        )}
      </header>

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
      <section className={`px-2 ${hasActView ? 'pb-4' : 'py-4'}`}>
        <div className="max-w-4xl mx-auto">
          {hasActView && mode === 'heatmap' && heatError && (
            <p className="text-red-400 text-xs pt-2">Could not load the heatmap: {heatError}</p>
          )}
          {renderContentByStatus()}
        </div>
      </section>

      {/* View options (view-options FR-3 to FR-9). */}
      {viewOpen && hasActView && (
        <ViewSheet
          mode={mode}
          onModeChange={setMode}
          genres={genres}
          genre={genre}
          onGenreChange={setGenre}
          laterOnTop={isTimeGrid ? { value: laterOnTop, onChange: setLaterOnTop } : undefined}
          isDefault={caption === null}
          onReset={resetView}
          onClose={() => setViewOpen(false)}
        />
      )}

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
      {bestieOpen && user && (
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
