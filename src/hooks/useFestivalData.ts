import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../utils/supabase'

export interface Festival {
  id: string
  name: string
  start_date: string
  end_date: string
  location: string
  description: string
  status: string
}

export interface Act {
  id: string
  artist: string
  day: string | null
  startTime: string | null
  length: number | null
  stage: string | null
  specialNotes: string | null
  genre: string | null
  category: string | null
  youtubeVideoId: string | null
  youtubeTitle: string | null
  festivalId: string
  avgRating: number | null
}

type Ratings = Record<string, number>

/**
 * Fetches a festival, its acts and the ratings of the signed-in user.
 * `festival` stays null with no `error` when the id matches no festival.
 */
export const useFestivalData = (festivalId: string | null, user: { id: string } | null = null) => {
  const [festival, setFestival] = useState<Festival | null>(null)
  const [acts, setActs] = useState<Act[]>([])
  const [ratings, setRatings] = useState<Ratings>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFestivalData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: festivalData, error: festivalError } = await supabase
        .from('festivals')
        .select('*')
        .eq('id', festivalId)
        .maybeSingle()

      if (festivalError) throw festivalError

      if (!festivalData) {
        setFestival(null)
        setActs([])
        return
      }

      const { data: actsData, error: actsError } = await supabase
        .from('acts')
        .select('*')
        .eq('festival_id', festivalId)
        .order('artist', { ascending: true })

      if (actsError) throw actsError

      setFestival(festivalData)
      setActs(
        (actsData ?? []).map((act) => ({
          id: act.id,
          artist: act.artist,
          day: act.day,
          startTime: act.start_time,
          length: act.length_minutes,
          stage: act.stage,
          specialNotes: act.special_notes,
          genre: act.genre,
          category: act.category,
          youtubeVideoId: act.youtube_video_id,
          youtubeTitle: act.youtube_title,
          festivalId: act.festival_id,
          avgRating: act.avg_rating,
        }))
      )
    } catch (err) {
      console.error('Error fetching festival data:', err)
      setFestival(null)
      setActs([])
      setError(err instanceof Error ? err.message : 'Could not load the festival')
    } finally {
      setLoading(false)
    }
  }, [festivalId])

  const loadUserRatings = useCallback(async () => {
    if (!user || acts.length === 0) return

    const actIds = acts.map((act) => act.id)
    const { data, error: ratingsError } = await supabase
      .from('user_ratings')
      .select('act_id, rating')
      .eq('user_id', user.id)
      .in('act_id', actIds)

    if (ratingsError) {
      console.error('Error loading ratings:', ratingsError)
      return
    }

    const ratingsObj: Ratings = {}
    for (const row of data ?? []) {
      ratingsObj[row.act_id] = row.rating
    }
    setRatings(ratingsObj)
  }, [user, acts])

  useEffect(() => {
    if (festivalId) {
      fetchFestivalData()
    }
  }, [festivalId, fetchFestivalData])

  useEffect(() => {
    loadUserRatings()
  }, [loadUserRatings])

  return {
    festival,
    acts,
    ratings,
    loading,
    error,
    retry: fetchFestivalData,
    loadUserRatings,
    setRatings,
  }
}
