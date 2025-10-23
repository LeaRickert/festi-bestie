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
import { supabase } from '../utils/supabase'
import StarRating from '../components/StarRating'
import ScheduleView from '../components/ScheduleView'
import AnnouncedView from '../components/AnnouncedView'
import LineupView from '../components/LineupView'
import StagesView from '../components/StagesView'
import ScheduleByDayView from '../components/ScheduleByDayView'

const FestivalDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [festival, setFestival] = useState(null)
  const [acts, setActs] = useState([])
  const [loading, setLoading] = useState(true)
  const [ratings, setRatings] = useState({})
  const [debugStatus, setDebugStatus] = useState(null) // For debug mode
  const [showDebugControls, setShowDebugControls] = useState(false) // Toggle debug controls
  const [selectedAct, setSelectedAct] = useState(null) // For act detail popup

  useEffect(() => {
    fetchFestivalData()
  }, [id])

  useEffect(() => {
    if (user && acts.length > 0) {
      loadUserRatings()
    }
  }, [user, acts])

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

  const fetchFestivalData = async () => {
    try {
    
      // Try to fetch from Supabase first
      const { data: festivalData, error: festivalError } = await supabase
        .from('festivals')
        .select('*')
        .eq('id', id)
        .single()

      if (festivalError || !festivalData) {
        // Fallback to mock data if Supabase is not configured
        const mockFestival = {
          id: '1',
          name: 'EDC Orlando 2024',
          start_date: '2024-11-15',
          end_date: '2024-11-17',
          location: 'Orlando, FL',
          image_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=400&fit=crop',
          description: 'Electric Daisy Carnival Orlando - The ultimate electronic dance music experience',
          status: 'complete'
        }
        setFestival(mockFestival)
        
        // Use mock acts data
        const mockActs = [
          { id: 'mock-1', artist: 'Alex Kennon', day: 'Friday', startTime: '8:00 PM', length: 60, stage: 'Neon Garden', specialNotes: '', genre: 'Tech House', category: 'Techno', youtubeUrl: 'https://youtube.com/watch?v=example1', youtubeTitle: 'Ibiza 2023', festivalId: id, avgRating: 3.6 },
          { id: 'mock-2', artist: 'Avision', day: 'Friday', startTime: '9:00 PM', length: 60, stage: 'Neon Garden', specialNotes: '', genre: 'Techno', category: 'House', youtubeUrl: 'https://youtube.com/watch?v=example2', youtubeTitle: 'Club 2023', festivalId: id, avgRating: 4.0 },
          { id: 'mock-3', artist: 'Black Tiger Sex Machine', day: 'Friday', startTime: '10:00 PM', length: 60, stage: 'Circuit Grounds', specialNotes: '', genre: 'Dubstep', category: 'Bass', youtubeUrl: 'https://youtube.com/watch?v=example3', youtubeTitle: 'WAMU 2024', festivalId: id, avgRating: 4.2 },
          { id: 'mock-4', artist: 'Carl Cox B2B Vintage Culture', day: 'Friday', startTime: '11:00 PM', length: 60, stage: 'Neon Garden', specialNotes: 'Worldwide Debut', genre: 'Tech House', category: 'Pop EDM', youtubeUrl: 'https://youtube.com/watch?v=example4', youtubeTitle: 'Exit 2024', festivalId: id, avgRating: 8.0 },
          { id: 'mock-5', artist: 'Hedex', day: 'Friday', startTime: '7:00 PM', length: 60, stage: 'Circuit Grounds', specialNotes: '', genre: 'Drum & Bass', category: 'Bass', youtubeUrl: 'https://youtube.com/watch?v=example5', youtubeTitle: 'EDCLV 2024', festivalId: id, avgRating: 6.6 },
          { id: 'mock-6', artist: 'Lost Frequencies', day: 'Friday', startTime: '8:30 PM', length: 60, stage: 'Kinetic Field', specialNotes: '', genre: 'House', category: 'Pop EDM', youtubeUrl: 'https://youtube.com/watch?v=example6', youtubeTitle: 'Tomorrowland 2024', festivalId: id, avgRating: 7.4 },
          // Saturday acts
          { id: 'mock-7', artist: 'Above & Beyond', day: 'Saturday', startTime: '11:00 PM', length: 60, stage: 'Kinetic Field', specialNotes: 'Group Therapy', genre: 'Trance', category: 'Progressive', youtubeUrl: 'https://youtube.com/watch?v=example7', youtubeTitle: 'ABGT 500', festivalId: id, avgRating: 9.2 },
          { id: 'mock-8', artist: 'Armin van Buuren', day: 'Saturday', startTime: '9:30 PM', length: 90, stage: 'Kinetic Field', specialNotes: 'A State of Trance', genre: 'Trance', category: 'Progressive', youtubeUrl: 'https://youtube.com/watch?v=example8', youtubeTitle: 'ASOT 1000', festivalId: id, avgRating: 8.8 },
          { id: 'mock-9', artist: 'Charlotte de Witte', day: 'Saturday', startTime: '10:00 PM', length: 60, stage: 'Neon Garden', specialNotes: '', genre: 'Techno', category: 'Dark Techno', youtubeUrl: 'https://youtube.com/watch?v=example9', youtubeTitle: 'Tomorrowland 2024', festivalId: id, avgRating: 7.8 },
          { id: 'mock-10', artist: 'Flume', day: 'Saturday', startTime: '8:00 PM', length: 60, stage: 'Kinetic Field', specialNotes: '', genre: 'Future Bass', category: 'Electronic', youtubeUrl: 'https://youtube.com/watch?v=example10', youtubeTitle: 'Coachella 2024', festivalId: id, avgRating: 6.8 },
          { id: 'mock-11', artist: 'Gryffin', day: 'Saturday', startTime: '7:00 PM', length: 60, stage: 'Kinetic Field', specialNotes: '', genre: 'Progressive House', category: 'Melodic', youtubeUrl: 'https://youtube.com/watch?v=example11', youtubeTitle: 'EDC Las Vegas 2024', festivalId: id, avgRating: 6.2 },
          // Sunday acts
          { id: 'mock-12', artist: 'John Summit', day: 'Sunday', startTime: '9:00 PM', length: 90, stage: 'Neon Garden', specialNotes: '', genre: 'Tech House', category: 'Underground', youtubeUrl: 'https://youtube.com/watch?v=example12', youtubeTitle: 'Summit Sessions', festivalId: id, avgRating: 7.3 },
          { id: 'mock-13', artist: 'Kx5', day: 'Sunday', startTime: '11:00 PM', length: 60, stage: 'Kinetic Field', specialNotes: 'Kaskade x Deadmau5', genre: 'Progressive House', category: 'Collaboration', youtubeUrl: 'https://youtube.com/watch?v=example13', youtubeTitle: 'EDC Las Vegas 2024', festivalId: id, avgRating: 8.7 },
          { id: 'mock-14', artist: 'Lane 8', day: 'Sunday', startTime: '7:30 PM', length: 60, stage: 'Neon Garden', specialNotes: 'This Never Happened', genre: 'Deep House', category: 'Melodic', youtubeUrl: 'https://youtube.com/watch?v=example14', youtubeTitle: 'Summer Gatherings', festivalId: id, avgRating: 6.9 },
          { id: 'mock-15', artist: 'Nora En Pure', day: 'Sunday', startTime: '6:00 PM', length: 60, stage: 'Neon Garden', specialNotes: '', genre: 'Deep House', category: 'Melodic', youtubeUrl: 'https://youtube.com/watch?v=example15', youtubeTitle: 'Purified Radio', festivalId: id, avgRating: 6.4 },
          { id: 'mock-16', artist: 'Odesza', day: 'Sunday', startTime: '10:00 PM', length: 90, stage: 'Kinetic Field', specialNotes: 'Live Show', genre: 'Future Bass', category: 'Live Electronic', youtubeUrl: 'https://youtube.com/watch?v=example16', youtubeTitle: 'The Last Goodbye Tour', festivalId: id, avgRating: 8.9 },
          { id: 'mock-17', artist: 'Seven Lions', day: 'Sunday', startTime: '8:30 PM', length: 60, stage: 'Circuit Grounds', specialNotes: '', genre: 'Melodic Dubstep', category: 'Emotional', youtubeUrl: 'https://youtube.com/watch?v=example17', youtubeTitle: 'Ophelia Records', festivalId: id, avgRating: 7.1 }
        ]
        setActs(mockActs)
      } else {
        setFestival(festivalData)
        
        // Fetch acts from Supabase
        const { data: actsData, error: actsError } = await supabase
          .from('acts')
          .select('*')
          .eq('festival_id', id)
          .order('artist', { ascending: true })

        if (actsError) {
          console.error('Error fetching acts:', actsError)
          setActs([])
        } else {
            // Transform Supabase data to match our component format
            // KEEP THIS FOR REFERENCE
            //  const transformedActs = actsData.map((act,index) => ({
            //   id: act.id,
            //   artist: act.artist,
            //   day: act.day,
            //   startTime: act.start_time,
            //   length: act.length_minutes || 60,
            //   stage: act.stage,
            //   specialNotes: act.special_notes,
            //   genre: act.genre,
            //   category: act.category,
            //   youtubeUrl: act.youtube_url,
            //   youtubeTitle: act.youtube_title,
            //   festivalId: act.festival_id,
            //   avgRating: act.avg_rating
            // }))
            
          // Group acts by day and stage for proper time scheduling
          const actsByDayAndStage = {}
          actsData.forEach(act => {
            const day = act.day || 'Friday'
            const stage = act.stage || 'Main Stage'
            const key = `${day}-${stage}`
            if (!actsByDayAndStage[key]) {
              actsByDayAndStage[key] = []
            }
            actsByDayAndStage[key].push(act)
          })

          // Generate incrementing start times for each day/stage combination
          const transformedActs = []
          Object.entries(actsByDayAndStage).forEach(([key, dayStageActs]) => {
            const [day, stage] = key.split('-')
            dayStageActs.forEach((act, index) => {
              // Start at 1 PM (13:00) and increment by 1 hour for each act
              const startHour = 13 + index // 13 = 1 PM, 14 = 2 PM, etc.
              const endHour = 23 // 11 PM
              
              // If we exceed 11 PM, wrap to next day or adjust
              const actualHour = startHour <= endHour ? startHour : startHour - 12
              const timeString = actualHour <= 12 ? `${actualHour}:00` : `${actualHour - 12}:00`
              const period = actualHour < 12 ? 'AM' : 'PM'
              
              transformedActs.push({
                id: act.id,
                artist: act.artist,
                day: day,
                startTime: act.start_time || `${timeString} ${period}`,
                length: act.length_minutes || 60,
                stage: stage,
                specialNotes: act.special_notes,
                genre: act.genre,
                category: act.category,
                youtubeUrl: act.youtube_url,
                youtubeTitle: act.youtube_title,
                festivalId: act.festival_id,
                avgRating: act.avg_rating
              })
            })
          })
          setActs(transformedActs)
        }
      }
    } catch (error) {
      console.error('Error fetching festival data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get acts sorted alphabetically for views without time information
  const getAlphabeticallySortedActs = () => {
    return [...acts].sort((a, b) => a.artist.localeCompare(b.artist))
  }

  const loadUserRatings = async () => {
    if (!user) return
    
    try {
      const actIds = acts.map(act => act.id)
      const { data, error } = await supabase
        .from('user_ratings')
        .select('act_id, rating')
        .eq('user_id', user.id)
        .in('act_id', actIds)
      
      if (error) {
        console.error('Error loading ratings:', error)
        return
      }
      
      // Convert array to object for easier lookup
      const ratingsObj = {}
      data.forEach(rating => {
        ratingsObj[rating.act_id] = rating.rating
      })
      
      setRatings(ratingsObj)
    } catch (error) {
      console.error('Error loading ratings:', error)
    }
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
              {user && (
                <div className="border-t border-white/10 pt-4">
                  <div className="text-white/80 text-sm mb-2">Your Rating:</div>
                  <StarRating
                    rating={ratings[selectedAct.id] || 0}
                    onRatingChange={(rating) => handleRatingChange(selectedAct.id, rating)}
                    size="md"
                    showValue={true}
                  />
                </div>
              )}

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

    </div>
  )
}

export default FestivalDetailPage
