import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Calendar, 
  Clock, 
  MapPin, 
  Music, 
  Download,
  Play
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { exportScheduleToImage, exportScheduleToLockScreen } from '../utils/exportSchedule'
import { supabase } from '../utils/supabase'
import StarRating from '../components/StarRating'

const FestivalDetailPage = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [festival, setFestival] = useState(null)
  const [acts, setActs] = useState([])
  const [filteredActs, setFilteredActs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [ratings, setRatings] = useState({})
  
  // Filter states
  const [filters, setFilters] = useState({
    day: '',
    stage: '',
    genre: '',
    category: '',
    timeRange: { start: '', end: '' }
  })
  
  // Sort states
  const [sortBy, setSortBy] = useState({ field: 'startTime', direction: 'asc' })

  useEffect(() => {
    fetchFestivalData()
  }, [id])

  useEffect(() => {
    if (user && acts.length > 0) {
      loadUserRatings()
    }
  }, [user, acts])

  useEffect(() => {
    applyFiltersAndSort()
  }, [acts, filters, sortBy])

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
          description: 'Electric Daisy Carnival Orlando - The ultimate electronic dance music experience'
        }
        setFestival(mockFestival)
        
        // Use mock acts data
        const mockActs = [
          { id: '1', artist: 'Alex Kennon', day: 'Friday', startTime: '8:00 PM', length: 60, stage: 'Neon Garden', specialNotes: '', genre: 'Tech House', category: 'Techno', youtubeUrl: 'https://youtube.com/watch?v=example1', youtubeTitle: 'Ibiza 2023', festivalId: id, avgRating: 3.6 },
          { id: '2', artist: 'Avision', day: 'Friday', startTime: '9:00 PM', length: 60, stage: 'Neon Garden', specialNotes: '', genre: 'Techno', category: 'House', youtubeUrl: 'https://youtube.com/watch?v=example2', youtubeTitle: 'Club 2023', festivalId: id, avgRating: 4.0 },
          { id: '3', artist: 'Black Tiger Sex Machine', day: 'Friday', startTime: '10:00 PM', length: 60, stage: 'Circuit Grounds', specialNotes: '', genre: 'Dubstep', category: 'Bass', youtubeUrl: 'https://youtube.com/watch?v=example3', youtubeTitle: 'WAMU 2024', festivalId: id, avgRating: 4.2 },
          { id: '4', artist: 'Carl Cox B2B Vintage Culture', day: 'Friday', startTime: '11:00 PM', length: 90, stage: 'Neon Garden', specialNotes: 'Worldwide Debut', genre: 'Tech House', category: 'Pop EDM', youtubeUrl: 'https://youtube.com/watch?v=example4', youtubeTitle: 'Exit 2024', festivalId: id, avgRating: 8.0 },
          { id: '5', artist: 'Deorro B2B Timmy Trumpet', day: 'Friday', startTime: '12:30 AM', length: 90, stage: 'Kinetic Field', specialNotes: 'Worldwide Debut', genre: 'House / Hardstyle', category: 'Pop EDM', youtubeUrl: 'https://youtube.com/watch?v=example5', youtubeTitle: 'UMF 2023', festivalId: id, avgRating: 7.2 },
          { id: '6', artist: 'Diplo', day: 'Friday', startTime: '2:00 AM', length: 60, stage: 'Kinetic Field', specialNotes: 'Sunset Set', genre: 'Pop', category: 'Pop EDM', youtubeUrl: 'https://youtube.com/watch?v=example6', youtubeTitle: 'Rio 2024', festivalId: id, avgRating: 5.0 },
          { id: '7', artist: 'Fisher', day: 'Friday', startTime: '3:00 AM', length: 60, stage: 'Kinetic Field', specialNotes: '', genre: 'House', category: 'Pop EDM', youtubeUrl: 'https://youtube.com/watch?v=example7', youtubeTitle: 'Outside Lands 2023', festivalId: id, avgRating: 7.6 },
          { id: '8', artist: 'Hedex', day: 'Friday', startTime: '7:00 PM', length: 60, stage: 'Circuit Grounds', specialNotes: '', genre: 'Drum & Bass', category: 'Bass', youtubeUrl: 'https://youtube.com/watch?v=example8', youtubeTitle: 'EDCLV 2024', festivalId: id, avgRating: 6.6 },
          { id: '9', artist: 'Kaskade B2B Alison Wonderland', day: 'Friday', startTime: '1:00 AM', length: 90, stage: 'Kinetic Field', specialNotes: '', genre: 'Big Room / Trap', category: 'Pop EDM', youtubeUrl: 'https://youtube.com/watch?v=example9', youtubeTitle: 'B2B Coachella 2024', festivalId: id, avgRating: 8.2 },
          { id: '10', artist: 'Lost Frequencies', day: 'Friday', startTime: '8:30 PM', length: 60, stage: 'Kinetic Field', specialNotes: '', genre: 'House', category: 'Pop EDM', youtubeUrl: 'https://youtube.com/watch?v=example10', youtubeTitle: 'Tomorrowland 2024', festivalId: id, avgRating: 7.4 }
        ]
        setActs(mockActs)
      } else {
        setFestival(festivalData)
        
        // Fetch acts from Supabase
        const { data: actsData, error: actsError } = await supabase
          .from('acts')
          .select('*')
          .eq('festival_id', id)
          .order('start_time')

        if (actsError) {
          console.error('Error fetching acts:', actsError)
          setActs([])
        } else {
          // Transform Supabase data to match our component format
          const transformedActs = actsData.map(act => ({
            id: act.id,
            artist: act.artist,
            day: act.day,
            startTime: act.start_time,
            length: act.length_minutes,
            stage: act.stage,
            specialNotes: act.special_notes,
            genre: act.genre,
            category: act.category,
            youtubeUrl: act.youtube_url,
            youtubeTitle: act.youtube_title,
            festivalId: act.festival_id,
            avgRating: act.avg_rating
          }))
          setActs(transformedActs)
        }
      }
    } catch (error) {
      console.error('Error fetching festival data:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFiltersAndSort = () => {
    let filtered = [...acts]

    // Apply filters
    if (filters.day) {
      filtered = filtered.filter(act => act.day === filters.day)
    }
    if (filters.stage) {
      filtered = filtered.filter(act => act.stage === filters.stage)
    }
    if (filters.genre) {
      filtered = filtered.filter(act => act.genre.includes(filters.genre))
    }
    if (filters.category) {
      filtered = filtered.filter(act => act.category === filters.category)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy.field]
      let bValue = b[sortBy.field]

      if (sortBy.field === 'startTime') {
        aValue = new Date(`2000-01-01 ${aValue}`)
        bValue = new Date(`2000-01-01 ${bValue}`)
      }

      if (sortBy.direction === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredActs(filtered)
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

  const getUniqueValues = (field) => {
    return [...new Set(acts.map(act => act[field]))].filter(Boolean)
  }

  const exportSchedule = async () => {
    if (!festival) return
    
    try {
      await exportScheduleToImage(filteredActs, festival.name, ratings)
    } catch (error) {
      console.error('Error exporting schedule:', error)
    }
  }

  const exportLockScreen = async () => {
    if (!festival) return
    
    try {
      await exportScheduleToLockScreen(filteredActs, festival.name, ratings)
    } catch (error) {
      console.error('Error exporting lock screen:', error)
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
            
            <div className="flex items-center space-x-4">
              <button
                onClick={exportSchedule}
                className="flex items-center px-4 py-2 bg-festival-purple/20 text-festival-purple rounded-lg hover:bg-festival-purple/30 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </button>
              <button
                onClick={exportLockScreen}
                className="flex items-center px-4 py-2 bg-festival-blue/20 text-festival-blue rounded-lg hover:bg-festival-blue/30 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Lock Screen
              </button>
            </div>
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

      {/* Filters and Controls */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Lineup</h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
              
              <select
                value={`${sortBy.field}-${sortBy.direction}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-')
                  setSortBy({ field, direction })
                }}
                className="px-4 py-2 bg-white/10 text-white rounded-lg border-none focus:ring-2 focus:ring-festival-purple"
              >
                <option value="startTime-asc">Time (Early to Late)</option>
                <option value="startTime-desc">Time (Late to Early)</option>
                <option value="artist-asc">Artist (A-Z)</option>
                <option value="artist-desc">Artist (Z-A)</option>
                <option value="stage-asc">Stage (A-Z)</option>
                <option value="stage-desc">Stage (Z-A)</option>
              </select>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white/10 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2">Day</label>
                  <select
                    value={filters.day}
                    onChange={(e) => setFilters(prev => ({ ...prev, day: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 text-white rounded border-none focus:ring-2 focus:ring-festival-purple"
                  >
                    <option value="">All Days</option>
                    {getUniqueValues('day').map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">Stage</label>
                  <select
                    value={filters.stage}
                    onChange={(e) => setFilters(prev => ({ ...prev, stage: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 text-white rounded border-none focus:ring-2 focus:ring-festival-purple"
                  >
                    <option value="">All Stages</option>
                    {getUniqueValues('stage').map(stage => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">Genre</label>
                  <select
                    value={filters.genre}
                    onChange={(e) => setFilters(prev => ({ ...prev, genre: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 text-white rounded border-none focus:ring-2 focus:ring-festival-purple"
                  >
                    <option value="">All Genres</option>
                    {getUniqueValues('genre').map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 text-white rounded border-none focus:ring-2 focus:ring-festival-purple"
                  >
                    <option value="">All Categories</option>
                    {getUniqueValues('category').map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Acts Grid */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActs.map((act) => (
              <div
                key={act.id}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{act.artist}</h3>
                    <div className="flex items-center text-white/60 text-sm mb-2">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{act.startTime}</span>
                      <span className="mx-2">•</span>
                      <span>{act.length}min</span>
                    </div>
                    <div className="flex items-center text-white/60 text-sm">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{act.stage}</span>
                    </div>
                  </div>
                  
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-white/70 text-sm">
                    <Music className="h-4 w-4 mr-2" />
                    <span>{act.genre}</span>
                    <span className="mx-2">•</span>
                    <span>{act.category}</span>
                  </div>
                  
                  {act.specialNotes && (
                    <div className="text-festival-purple text-sm font-medium">
                      {act.specialNotes}
                    </div>
                  )}
                  
                  {act.youtubeUrl && (
                    <a
                      href={act.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-festival-blue hover:text-festival-blue/80 text-sm"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      {act.youtubeTitle || 'Watch Set'}
                    </a>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-white/60 text-sm">
                      Day: {act.day}
                    </div>
                    {act.avgRating > 0 && (
                      <div className="text-festival-purple text-sm font-medium">
                        ⭐ {act.avgRating.toFixed(1)}
                      </div>
                    )}
                  </div>
                  
                  {user && (
                    <div className="border-t border-white/10 pt-3">
                      <div className="text-white/80 text-sm mb-2">Your Rating:</div>
                      <StarRating
                        rating={ratings[act.id] || 0}
                        onRatingChange={(rating) => handleRatingChange(act.id, rating)}
                        size="sm"
                        showValue={false}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredActs.length === 0 && (
            <div className="text-center py-12">
              <Music className="h-16 w-16 text-white/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white/80 mb-2">No acts found</h3>
              <p className="text-white/60">Try adjusting your filters to see more results.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default FestivalDetailPage
