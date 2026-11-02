import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import type { GroupMember } from '../utils/groups'
import { ratingsByUser } from '../utils/bestie'
import type { Ratings } from '../utils/bestie'

// Friend groups (groups.spec.md). The database enforces every rule; these
// calls return its error so the page can show groupErrorMessage().

export interface MemberInfo extends GroupMember {
  isOwner: boolean
  joinedAt: string
}

export interface MyGroup {
  id: string
  name: string
  joinedAt: string
  isOwner: boolean
  members: MemberInfo[]
}

export interface GroupDetails {
  id: string
  name: string
  inviteToken: string
  festivalId: string
  festivalSlug: string
  festivalName: string
  festivalEndDate: string
}

export interface GroupInvite {
  groupId: string
  groupName: string
  festivalId: string
  festivalName: string
  memberUsernames: string[]
  isMember: boolean
  isFull: boolean
  isPast: boolean
}

type DbError = { message: string; code?: string } | null

// The usernames come from a function that returns nothing else of a profile (FR-12).
export const fetchGroupMembers = async (groupId: string): Promise<MemberInfo[]> => {
  const { data, error } = await supabase.rpc('get_group_members', { group_id: groupId })
  if (error) throw error
  return (data ?? []).map((row: { user_id: string; username: string; is_owner: boolean; joined_at: string }) => ({
    userId: row.user_id,
    username: row.username,
    isOwner: row.is_owner,
    joinedAt: row.joined_at,
  }))
}

export const fetchGroup = async (groupId: string): Promise<GroupDetails | null> => {
  const { data, error } = await supabase
    .from('groups')
    .select('id, name, invite_token, festival_id, festivals(slug, name, end_date)')
    .eq('id', groupId)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  const festival = Array.isArray(data.festivals) ? data.festivals[0] : data.festivals
  return {
    id: data.id,
    name: data.name,
    inviteToken: data.invite_token,
    festivalId: data.festival_id,
    festivalSlug: festival?.slug ?? '',
    festivalName: festival?.name ?? '',
    festivalEndDate: festival?.end_date ?? '',
  }
}

// What the join screen shows for a token; null when the token is not valid (FR-5).
export const fetchInvite = async (token: string): Promise<GroupInvite | null> => {
  const { data, error } = await supabase.rpc('get_group_invite', { token })
  if (error) {
    // A token that is not a uuid is not valid either.
    if (error.code === '22P02') return null
    throw error
  }
  const row = data?.[0]
  if (!row) return null
  return {
    groupId: row.group_id,
    groupName: row.group_name,
    festivalId: row.festival_id,
    festivalName: row.festival_name,
    memberUsernames: row.member_usernames ?? [],
    isMember: row.is_member,
    isFull: row.is_full,
    isPast: row.is_past,
  }
}

export const createGroup = async (festivalId: string, name: string): Promise<{ groupId: string | null; error: DbError }> => {
  const { data, error } = await supabase.rpc('create_group', { festival_id: festivalId, name })
  return { groupId: data ?? null, error }
}

export const joinGroup = async (token: string): Promise<{ groupId: string | null; error: DbError }> => {
  const { data, error } = await supabase.rpc('join_group', { token })
  if (error?.code === '22P02') return { groupId: null, error: { message: 'invalid_invite' } }
  return { groupId: data ?? null, error }
}

export const resetInviteLink = async (groupId: string): Promise<{ token: string | null; error: DbError }> => {
  const { data, error } = await supabase.rpc('reset_invite_token', { group_id: groupId })
  return { token: data ?? null, error }
}

// RLS lets only the owner rename a group that is not past (FR-9, FR-17).
// A rename it blocks changes no row, so check that one changed.
export const renameGroup = async (groupId: string, name: string): Promise<{ error: DbError }> => {
  const { data, error } = await supabase.from('groups').update({ name }).eq('id', groupId).select('id')
  if (error) return { error }
  if (!data?.length) return { error: { message: 'not_owner' } }
  return { error: null }
}

export const deleteGroup = async (groupId: string): Promise<{ error: DbError }> => {
  const { data, error } = await supabase.from('groups').delete().eq('id', groupId).select('id')
  if (error) return { error }
  if (!data?.length) return { error: { message: 'not_owner' } }
  return { error: null }
}

// The database passes the owner on or deletes the empty group (FR-15, FR-16).
export const leaveGroup = async (groupId: string, userId: string): Promise<{ error: DbError }> => {
  const { error } = await supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', userId)
  return { error }
}

/**
 * The groups of the user for one festival, in the order the user joined them
 * (FR-19, FR-21), each with its members. Empty for a visitor.
 */
export const useMyGroups = (festivalId: string | null, userId: string | null) => {
  const [groups, setGroups] = useState<MyGroup[]>([])
  // Loading until the groups of this festival and user have loaded, also in
  // the first render after sign-in.
  const key = festivalId && userId ? `${festivalId}/${userId}` : null
  const [loadedKey, setLoadedKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!festivalId || !userId) {
      setGroups([])
      return
    }
    setLoadedKey(null)
    setError(null)
    try {
      const { data, error: groupsError } = await supabase
        .from('group_members')
        .select('joined_at, is_owner, groups!inner(id, name, festival_id)')
        .eq('user_id', userId)
        .eq('groups.festival_id', festivalId)
        .order('joined_at')
      if (groupsError) throw groupsError

      const next = await Promise.all(
        (data ?? []).map(async (row) => {
          const group = Array.isArray(row.groups) ? row.groups[0] : row.groups
          return {
            id: group.id,
            name: group.name,
            joinedAt: row.joined_at,
            isOwner: row.is_owner,
            members: await fetchGroupMembers(group.id),
          }
        }),
      )
      setGroups(next)
    } catch (err) {
      console.error('Error loading groups:', err)
      setError(err instanceof Error ? err.message : (err as { message?: string }).message ?? 'Could not load groups')
    } finally {
      setLoadedKey(`${festivalId}/${userId}`)
    }
  }, [festivalId, userId])

  useEffect(() => {
    load()
  }, [load])

  return { groups: key ? groups : [], loading: key !== null && loadedKey !== key, error, reload: load }
}

/**
 * The ratings for one act that the user can read, by user id: their own and
 * the shared ratings of their groups (groups FR-10). Loads only when enabled.
 */
export const useActRatings = (actId: string, enabled: boolean) => {
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    setLoading(true)
    setError(null)
    supabase
      .from('user_ratings')
      .select('user_id, rating')
      .eq('act_id', actId)
      .then(({ data, error: ratingsError }) => {
        if (cancelled) return
        if (ratingsError) {
          console.error('Error loading group ratings:', ratingsError)
          setError(ratingsError.message)
        } else {
          const next: Record<string, number> = {}
          for (const row of data ?? []) next[row.user_id] = row.rating
          setRatings(next)
        }
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [actId, enabled])

  return { ratings, loading, error }
}

/**
 * The ratings for the acts of one festival that the user can read, by user id
 * and act id (bestie FR-1). Loads again when the component mounts, so each
 * open of the bestie scores has fresh ratings (bestie FR-14).
 */
export const useFestivalRatings = (festivalId: string, actIds: Set<string>) => {
  const [ratings, setRatings] = useState<Record<string, Ratings>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    supabase
      .from('user_ratings')
      .select('user_id, act_id, rating, acts!inner(festival_id)')
      .eq('acts.festival_id', festivalId)
      .then(({ data, error: ratingsError }) => {
        if (cancelled) return
        if (ratingsError) {
          console.error('Error loading group ratings:', ratingsError)
          setError(ratingsError.message)
        } else {
          setRatings(ratingsByUser(data ?? [], actIds))
        }
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [festivalId, actIds])

  return { ratings, loading, error }
}
