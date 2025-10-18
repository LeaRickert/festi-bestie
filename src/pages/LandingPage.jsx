import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Clock, Music, User, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import LoginModal from '../components/LoginModal'
import { supabase } from '../utils/supabase'

const LandingPage = () => {
  const [festivals, setFestivals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const { user, signOut } = useAuth()

  useEffect(() => {
    fetchFestivals()
  }, [])

  const fetchFestivals = async () => {
    try {
      // Try to fetch from Supabase first
      const { data, error } = await supabase
        .from('festivals')
        .select('*')
        .order('start_date')

      if (error || !data || data.length === 0) {
        // Fallback to mock data if Supabase is not configured
        const mockFestivals = [
          {
            id: '1',
            name: 'EDC Orlando 2024',
            start_date: '2024-11-15',
            end_date: '2024-11-17',
            location: 'Orlando, FL',
            image_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=400&fit=crop',
            description: 'Electric Daisy Carnival Orlando - The ultimate electronic dance music experience'
          },
          {
            id: '2',
            name: 'Ultra Music Festival 2024',
            start_date: '2024-03-22',
            end_date: '2024-03-24',
            location: 'Miami, FL',
            image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
            description: 'Ultra Music Festival - Where electronic music meets the ocean'
          },
          {
            id: '3',
            name: 'Tomorrowland 2024',
            start_date: '2024-07-19',
            end_date: '2024-07-21',
            location: 'Boom, Belgium',
            image_url: 'https://images.unsplash.com/photo-1571266028243-e68c785c3b73?w=800&h=400&fit=crop',
            description: 'Tomorrowland - The magical electronic music festival'
          }
        ]
        setFestivals(mockFestivals)
      } else {
        setFestivals(data)
      }
    } catch (error) {
      console.error('Error fetching festivals:', error)
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Music className="h-8 w-8 text-festival-purple" />
              <h1 className="text-3xl font-bold text-white">Festi Besti</h1>
            </div>
            <div className="flex items-center space-x-4">
              <p className="text-white/80 text-lg">Festival Planning Made Easy</p>
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-white/80 text-sm">{user.email}</span>
                  <button
                    onClick={signOut}
                    className="flex items-center px-3 py-1 bg-white/10 text-white/80 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="flex items-center px-4 py-2 bg-festival-purple/20 text-festival-purple rounded-lg hover:bg-festival-purple/30 transition-colors"
                >
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Plan Your Perfect Festival Experience
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
            Never miss your favorite artists again. Create personalized schedules, 
            share with friends, and export to your phone for easy access.
          </p>
        </div>
      </section>

      {/* Festivals Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-white mb-12 text-center">
            Upcoming Festivals
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {festivals.map((festival) => (
              <Link
                key={festival.id}
                to={`/festival/${festival.id}`}
                className="group block"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden hover:bg-white/20 transition-all duration-300 transform group-hover:scale-105">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={festival.image_url}
                      alt={festival.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h4 className="text-2xl font-bold text-white mb-2">
                        {festival.name}
                      </h4>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-white/80 mb-4 line-clamp-2">
                      {festival.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-white/70">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="text-sm">
                          {formatDate(festival.start_date)} - {formatDate(festival.end_date)}
                        </span>
                      </div>
                      <div className="flex items-center text-white/70">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="text-sm">{festival.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-white mb-12 text-center">
            Why Choose Festi Besti?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-festival-purple/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-festival-purple" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">Smart Scheduling</h4>
              <p className="text-white/70">
                Filter by day, stage, genre, and time to find exactly what you want to see.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-festival-pink/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Music className="h-8 w-8 text-festival-pink" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">Personal Preferences</h4>
              <p className="text-white/70">
                Mark artists as "interested" or "must-see" to create your perfect lineup.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-festival-blue/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-festival-blue" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">Export & Share</h4>
              <p className="text-white/70">
                Export your schedule as an image for your phone lock screen or share with friends.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/60">
            © 2024 Festi Besti. Making festival planning effortless.
          </p>
        </div>
      </footer>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  )
}

export default LandingPage
