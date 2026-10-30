import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Calendar, MapPin, Clock, Music, User, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import LoginModal from '../components/LoginModal'
import { supabase } from '../utils/supabase'

const LandingPage = () => {
  const [festivals, setFestivals] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [showLogin, setShowLogin] = useState(false)
  const { user, signOut } = useAuth()

  useEffect(() => {
    fetchFestivals()
  }, [])

  const fetchFestivals = async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const { data, error } = await supabase
        .from('festivals')
        .select('*')
        .order('start_date')

      if (error) throw error
      setFestivals(data ?? [])
    } catch (error) {
      console.error('Error fetching festivals:', error)
      setLoadError(error.message || 'Could not load festivals')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Music className="h-5 w-5 text-festival-purple" />
              <h1 className="text-xl font-bold text-white">Festi Besti</h1>
            </div>
            <div className="flex items-center space-x-2">
              {user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-white/70 text-xs hidden sm:inline">{user.email}</span>
                  <button
                    onClick={signOut}
                    className="flex items-center px-2 py-1.5 bg-white/10 text-white/80 rounded-md hover:bg-white/20 transition-colors text-sm"
                  >
                    <LogOut className="h-3.5 w-3.5 mr-1" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="flex items-center px-3 py-1.5 bg-festival-purple/20 text-festival-purple rounded-md hover:bg-festival-purple/30 transition-colors text-sm"
                >
                  <User className="h-3.5 w-3.5 mr-1.5" />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Compact */}
      <section className="py-6 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Plan Your Perfect Festival Experience
          </h2>
          <p className="text-sm text-white/70 max-w-2xl mx-auto">
            Never miss your favorite artists again. Create personalized schedules and export to your phone.
          </p>
        </div>
      </section>

      {/* Festivals Grid */}
      <section className="py-4 px-4">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold text-white/90 mb-4 text-center">
            Upcoming Festivals
          </h3>
          
          {loadError && (
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

          {!loadError && festivals.length === 0 && (
            <p className="text-white/60 text-sm text-center py-6">No festivals yet.</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {festivals.map((festival) => (
              <Link
                key={festival.id}
                to={`/festival/${festival.id}`}
                className="group block"
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden hover:bg-white/10 transition-all duration-200">
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={festival.image_url}
                      alt={festival.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <h4 className="text-base font-bold text-white mb-1.5">
                        {festival.name}
                      </h4>
                      {/* Status Badge */}
                      <div className="inline-block">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          festival.status === 'complete' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          festival.status === 'times' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          festival.status === 'schedule' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                          festival.status === 'stages' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                          festival.status === 'lineup' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                          'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {festival.status === 'complete' ? 'Complete' :
                           festival.status === 'times' ? 'Times' :
                           festival.status === 'schedule' ? 'Schedule' :
                           festival.status === 'stages' ? 'Stages' :
                           festival.status === 'lineup' ? 'Lineup' :
                           'Announced'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <p className="text-white/70 mb-2.5 line-clamp-2 text-xs">
                      {festival.description}
                    </p>
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center text-white/60">
                        <Calendar className="h-3 w-3 mr-1.5" />
                        <span className="text-xs">
                          {formatDate(festival.start_date)} - {formatDate(festival.end_date)}
                        </span>
                      </div>
                      <div className="flex items-center text-white/60">
                        <MapPin className="h-3 w-3 mr-1.5" />
                        <span className="text-xs">{festival.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Compact */}
      <section className="py-6 px-4 bg-white/5">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-base font-semibold text-white/90 mb-4 text-center">
            Why Choose Festi Besti?
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="bg-festival-purple/20 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2">
                <Calendar className="h-5 w-5 text-festival-purple" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">Smart Scheduling</h4>
              <p className="text-white/60 text-xs">
                Filter by day, stage, genre, and time.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-festival-pink/20 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2">
                <Music className="h-5 w-5 text-festival-pink" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">Personal Preferences</h4>
              <p className="text-white/60 text-xs">
                Mark artists as favorites.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-festival-blue/20 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2">
                <Clock className="h-5 w-5 text-festival-blue" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">Export & Share</h4>
              <p className="text-white/60 text-xs">
                Export schedules to your phone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Compact */}
      <footer className="py-4 px-4 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-white/50 text-xs">
            © 2024 Festi Besti
          </p>
        </div>
      </footer>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  )
}

export default LandingPage
