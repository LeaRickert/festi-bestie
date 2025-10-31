import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

/**
 * Custom hook for fetching and managing festival data, acts, and user ratings
 * @param {string} festivalId - The festival ID to fetch data for
 * @param {object} user - The current user object (optional, for loading ratings)
 * @returns {object} - { festival, acts, ratings, loading, loadUserRatings, setRatings }
 */
export const useFestivalData = (festivalId, user = null) => {
  const [festival, setFestival] = useState(null)
  const [acts, setActs] = useState([])
  const [ratings, setRatings] = useState({})
  const [loading, setLoading] = useState(true)

  // Fetch festival data and acts
  const fetchFestivalData = async () => {
    try {
      // Try to fetch from Supabase first
      const { data: festivalData, error: festivalError } = await supabase
        .from('festivals')
        .select('*')
        .eq('id', festivalId)
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
          { id: 'mock-1', artist: 'Alex Kennon', day: 'Friday', startTime: '8:00 PM', length: 60, stage: 'Neon Garden', specialNotes: '', genre: 'Tech House', category: 'Techno', youtubeUrl: 'https://youtube.com/watch?v=example1', youtubeTitle: 'Ibiza 2023', festivalId: festivalId, avgRating: 3.6 },
          { id: 'mock-2', artist: 'Avision', day: 'Friday', startTime: '9:00 PM', length: 60, stage: 'Neon Garden', specialNotes: '', genre: 'Techno', category: 'House', youtubeUrl: 'https://youtube.com/watch?v=example2', youtubeTitle: 'Club 2023', festivalId: festivalId, avgRating: 4.0 },
          { id: 'mock-3', artist: 'Black Tiger Sex Machine', day: 'Friday', startTime: '10:00 PM', length: 60, stage: 'Circuit Grounds', specialNotes: '', genre: 'Dubstep', category: 'Bass', youtubeUrl: 'https://youtube.com/watch?v=example3', youtubeTitle: 'WAMU 2024', festivalId: festivalId, avgRating: 4.2 },
          { id: 'mock-4', artist: 'Carl Cox B2B Vintage Culture', day: 'Friday', startTime: '11:00 PM', length: 60, stage: 'Neon Garden', specialNotes: 'Worldwide Debut', genre: 'Tech House', category: 'Pop EDM', youtubeUrl: 'https://youtube.com/watch?v=example4', youtubeTitle: 'Exit 2024', festivalId: festivalId, avgRating: 8.0 },
          { id: 'mock-5', artist: 'Hedex', day: 'Friday', startTime: '7:00 PM', length: 60, stage: 'Circuit Grounds', specialNotes: '', genre: 'Drum & Bass', category: 'Bass', youtubeUrl: 'https://youtube.com/watch?v=example5', youtubeTitle: 'EDCLV 2024', festivalId: festivalId, avgRating: 6.6 },
          { id: 'mock-6', artist: 'Lost Frequencies', day: 'Friday', startTime: '8:30 PM', length: 60, stage: 'Kinetic Field', specialNotes: '', genre: 'House', category: 'Pop EDM', youtubeUrl: 'https://youtube.com/watch?v=example6', youtubeTitle: 'Tomorrowland 2024', festivalId: festivalId, avgRating: 7.4 },
          // Saturday acts
          { id: 'mock-7', artist: 'Above & Beyond', day: 'Saturday', startTime: '11:00 PM', length: 60, stage: 'Kinetic Field', specialNotes: 'Group Therapy', genre: 'Trance', category: 'Progressive', youtubeUrl: 'https://youtube.com/watch?v=example7', youtubeTitle: 'ABGT 500', festivalId: festivalId, avgRating: 9.2 },
          { id: 'mock-8', artist: 'Armin van Buuren', day: 'Saturday', startTime: '9:30 PM', length: 90, stage: 'Kinetic Field', specialNotes: 'A State of Trance', genre: 'Trance', category: 'Progressive', youtubeUrl: 'https://youtube.com/watch?v=example8', youtubeTitle: 'ASOT 1000', festivalId: festivalId, avgRating: 8.8 },
          { id: 'mock-9', artist: 'Charlotte de Witte', day: 'Saturday', startTime: '10:00 PM', length: 60, stage: 'Neon Garden', specialNotes: '', genre: 'Techno', category: 'Dark Techno', youtubeUrl: 'https://youtube.com/watch?v=example9', youtubeTitle: 'Tomorrowland 2024', festivalId: festivalId, avgRating: 7.8 },
          { id: 'mock-10', artist: 'Flume', day: 'Saturday', startTime: '8:00 PM', length: 60, stage: 'Kinetic Field', specialNotes: '', genre: 'Future Bass', category: 'Electronic', youtubeUrl: 'https://youtube.com/watch?v=example10', youtubeTitle: 'Coachella 2024', festivalId: festivalId, avgRating: 6.8 },
          { id: 'mock-11', artist: 'Gryffin', day: 'Saturday', startTime: '7:00 PM', length: 60, stage: 'Kinetic Field', specialNotes: '', genre: 'Progressive House', category: 'Melodic', youtubeUrl: 'https://youtube.com/watch?v=example11', youtubeTitle: 'EDC Las Vegas 2024', festivalId: festivalId, avgRating: 6.2 },
          // Sunday acts
          { id: 'mock-12', artist: 'John Summit', day: 'Sunday', startTime: '9:00 PM', length: 90, stage: 'Neon Garden', specialNotes: '', genre: 'Tech House', category: 'Underground', youtubeUrl: 'https://youtube.com/watch?v=example12', youtubeTitle: 'Summit Sessions', festivalId: festivalId, avgRating: 7.3 },
          { id: 'mock-13', artist: 'Kx5', day: 'Sunday', startTime: '11:00 PM', length: 60, stage: 'Kinetic Field', specialNotes: 'Kaskade x Deadmau5', genre: 'Progressive House', category: 'Collaboration', youtubeUrl: 'https://youtube.com/watch?v=example13', youtubeTitle: 'EDC Las Vegas 2024', festivalId: festivalId, avgRating: 8.7 },
          { id: 'mock-14', artist: 'Lane 8', day: 'Sunday', startTime: '7:30 PM', length: 60, stage: 'Neon Garden', specialNotes: 'This Never Happened', genre: 'Deep House', category: 'Melodic', youtubeUrl: 'https://youtube.com/watch?v=example14', youtubeTitle: 'Summer Gatherings', festivalId: festivalId, avgRating: 6.9 },
          { id: 'mock-15', artist: 'Nora En Pure', day: 'Sunday', startTime: '6:00 PM', length: 60, stage: 'Neon Garden', specialNotes: '', genre: 'Deep House', category: 'Melodic', youtubeUrl: 'https://youtube.com/watch?v=example15', youtubeTitle: 'Purified Radio', festivalId: festivalId, avgRating: 6.4 },
          { id: 'mock-16', artist: 'Odesza', day: 'Sunday', startTime: '10:00 PM', length: 90, stage: 'Kinetic Field', specialNotes: 'Live Show', genre: 'Future Bass', category: 'Live Electronic', youtubeUrl: 'https://youtube.com/watch?v=example16', youtubeTitle: 'The Last Goodbye Tour', festivalId: festivalId, avgRating: 8.9 },
          { id: 'mock-17', artist: 'Seven Lions', day: 'Sunday', startTime: '8:30 PM', length: 60, stage: 'Circuit Grounds', specialNotes: '', genre: 'Melodic Dubstep', category: 'Emotional', youtubeUrl: 'https://youtube.com/watch?v=example17', youtubeTitle: 'Ophelia Records', festivalId: festivalId, avgRating: 7.1 }
        ]
        setActs(mockActs)
      } else {
        setFestival(festivalData)

        // Fetch acts from Supabase
        const { data: actsData, error: actsError } = await supabase
          .from('acts')
          .select('*')
          .eq('festival_id', festivalId)
          .order('artist', { ascending: true })

        if (actsError) {
          console.error('Error fetching acts:', actsError)
          setActs([])
        } else {
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

  // Load user ratings for acts
  const loadUserRatings = async () => {
    if (!user || acts.length === 0) return

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

  // Fetch festival data on mount or when festivalId changes
  useEffect(() => {
    if (festivalId) {
      fetchFestivalData()
    }
  }, [festivalId])

  // Load user ratings when user or acts change
  useEffect(() => {
    if (user && acts.length > 0) {
      loadUserRatings()
    }
  }, [user, acts])

  return {
    festival,
    acts,
    ratings,
    loading,
    loadUserRatings,
    setRatings
  }
}
