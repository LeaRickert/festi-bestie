import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ChevronRight, LogOut, User } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import type { Festival } from '../hooks/useFestivalData'
import LoginModal from '../components/LoginModal'
import { supabase } from '../utils/supabase'
import { formatDateRange } from '../utils/dateUtils'
import { localDateString, splitFestivals, statusBadge } from '../utils/festivalUtils'

// Past festivals show no status badge (festivals FR-8).
const FestivalRow = ({ festival, past = false }: { festival: Festival; past?: boolean }) => (
  <li>
    <Link
      to={`/festival/${festival.slug}`}
      className="flex items-center gap-3 bg-surface rounded-lg px-3 py-2.5 hover:bg-surface/80 transition-colors"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-white font-semibold text-sm truncate">{festival.name}</h3>
          {!past && (
            <span className={`shrink-0 px-1.5 py-0.5 rounded border text-[10px] font-medium ${statusBadge(festival.status).className}`}>
              {statusBadge(festival.status).label}
            </span>
          )}
        </div>
        <p className="text-white/60 text-xs truncate">
          {formatDateRange(festival.start_date, festival.end_date)} · {festival.location}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-white/40" />
    </Link>
  </li>
)

// The festival list on `/festivals` (festivals FR-1, FR-8).
const FestivalListPage = () => {
  const [festivals, setFestivals] = useState<Festival[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [showLogin, setShowLogin] = useState(false)
  const { user, signOut } = useAuth()

  const fetchFestivals = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const { data, error } = await supabase.from('festivals').select('*').order('start_date')
      if (error) throw error
      setFestivals(data ?? [])
    } catch (error) {
      console.error('Error fetching festivals:', error)
      setLoadError(error instanceof Error ? error.message : 'Could not load festivals')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFestivals()
  }, [fetchFestivals])

  const { upcoming, past } = splitFestivals(festivals, localDateString(new Date()))

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-page/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-white">Festi Bestie</h1>
          {user ? (
            <button
              type="button"
              onClick={signOut}
              className="flex items-center px-2 py-1.5 bg-white/10 text-white/80 rounded-md hover:bg-white/20 transition-colors text-sm"
            >
              <LogOut className="h-3.5 w-3.5 mr-1" />
              Sign Out
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowLogin(true)}
              className="flex items-center px-3 py-1.5 bg-white text-page font-medium rounded-md hover:bg-white/90 transition-colors text-sm"
            >
              <User className="h-3.5 w-3.5 mr-1.5" />
              Sign In
            </button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4">
        {loading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}

        {!loading && loadError && (
          <div className="text-center py-6">
            <p className="text-red-400 text-sm mb-3">Could not load festivals: {loadError}</p>
            <button
              type="button"
              onClick={fetchFestivals}
              className="px-3 py-1.5 bg-white/10 text-white/80 rounded-md hover:bg-white/20 transition-colors text-sm"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !loadError && (
          <>
            {upcoming.length === 0 ? (
              <p className="text-white/60 text-sm text-center py-6">No upcoming festivals yet.</p>
            ) : (
              <ul className="space-y-2">
                {upcoming.map((festival) => (
                  <FestivalRow key={festival.id} festival={festival} />
                ))}
              </ul>
            )}

            {past.length > 0 && (
              <details className="mt-6 group">
                <summary className="cursor-pointer list-none flex items-center gap-1 text-white/70 text-sm font-medium">
                  <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                  Past festivals ({past.length})
                </summary>
                <ul className="space-y-2 mt-3">
                  {past.map((festival) => (
                    <FestivalRow key={festival.id} festival={festival} past />
                  ))}
                </ul>
              </details>
            )}
          </>
        )}
      </main>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  )
}

export default FestivalListPage
