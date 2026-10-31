// Find your bestie (bestie.spec.md): the match score of the user with each
// member of their groups for a festival, and the list order.
import type { Act } from '../hooks/useFestivalData'
import { festivalMinutes, getUniqueDays } from './scheduleUtils'

// Ratings of one user by act id.
export type Ratings = Record<string, number>

export const EXPLANATION =
  'Your score is how closely your ratings match theirs. Acts you both love count most, and their 1 on an act you rated 4 or 5 counts against you.'
export const NOT_ENOUGH = 'Not enough ratings yet'
export const RATE_MORE = 'Rate 5 acts with 3 stars or more to see your matches'
export const NO_MEMBERS = 'No one in your groups yet. Share an invite link from Groups.'

// A user needs this many ratings of 3 or more in the festival for a score (FR-5).
const MIN_LIKED = 5

// The weights of heatmap.spec.md (FR-2). No rating is 0.
export function ratingWeight(rating: number | undefined): number {
  if (rating === 5) return 2
  if (rating === 4) return 1
  if (rating === 3) return 0.5
  return 0
}

// theirs rated 1, and you rated 4 or 5 (FR-4).
export function isClash(a: number | undefined, b: number | undefined): boolean {
  return (b === 1 && (a === 4 || a === 5))
}

export function isShared(a: number | undefined, b: number | undefined): boolean {
  return (a ?? 0) >= 4 && (b ?? 0) >= 4
}

// The ratings of each user for the acts of the festival only (FR-1).
export function ratingsByUser(
  rows: { user_id: string; act_id: string; rating: number }[],
  festivalActIds: Set<string>,
): Record<string, Ratings> {
  const result: Record<string, Ratings> = {}
  for (const row of rows) {
    if (!festivalActIds.has(row.act_id)) continue
    result[row.user_id] ??= {}
    result[row.user_id][row.act_id] = row.rating
  }
  return result
}

export function hasEnoughRatings(ratings: Ratings): boolean {
  return Object.values(ratings).filter((rating) => rating >= 3).length >= MIN_LIKED
}

// Σ min / (Σ max + clashes) over the acts that one user or both rated (FR-3, FR-4).
// Null when no act has a weight.
export function matchScore(a: Ratings, b: Ratings): number | null {
  let numerator = 0
  let denominator = 0
  for (const actId of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const weightA = ratingWeight(a[actId])
    const weightB = ratingWeight(b[actId])
    numerator += Math.min(weightA, weightB)
    denominator += Math.max(weightA, weightB)
    if (isClash(a[actId], b[actId])) denominator += 1
  }
  return denominator > 0 ? numerator / denominator : null
}

// 0 to 100, rounded to 2 decimals with no trailing zeros: "75.12", "75" (FR-10).
export function formatScore(score: number): string {
  return String(Math.round(score * 10000) / 100)
}

export interface GroupWithMembers {
  name: string
  members: { userId: string; username: string }[]
}

export interface CoMember {
  userId: string
  username: string
  groupNames: string[]
}

// Each other member of the groups of the user, once, with the names of the
// shared groups in the order of `groups` (FR-6, FR-9).
export function coMembers(groups: GroupWithMembers[], myId: string): CoMember[] {
  const byId = new Map<string, CoMember>()
  for (const group of groups) {
    for (const { userId, username } of group.members) {
      if (userId === myId) continue
      const member = byId.get(userId)
      if (member) member.groupNames.push(group.name)
      else byId.set(userId, { userId, username, groupNames: [group.name] })
    }
  }
  return [...byId.values()]
}

export interface Match extends CoMember {
  // Null when the user or the member has not enough ratings (FR-5).
  score: number | null
  sharedCount: number
}

// The matches of the user: scored from high to low, then the rest A to Z (FR-5, FR-6).
export function matchList(myRatings: Ratings, members: CoMember[], memberRatings: Record<string, Ratings>): Match[] {
  const iHaveEnough = hasEnoughRatings(myRatings)
  const matches = members.map((member) => {
    const theirs = memberRatings[member.userId] ?? {}
    const score = iHaveEnough && hasEnoughRatings(theirs) ? matchScore(myRatings, theirs) : null
    const sharedCount = Object.keys(myRatings).filter((actId) => isShared(myRatings[actId], theirs[actId])).length
    return { ...member, score, sharedCount }
  })

  matches.sort((a, b) => {
    if (a.score !== null && b.score !== null && a.score !== b.score) return b.score - a.score
    if (a.score !== null && b.score === null) return -1
    if (a.score === null && b.score !== null) return 1
    return a.username.localeCompare(b.username)
  })

  return matches
}

// By day, then start time with times past midnight last in the day, then artist (FR-7).
export function sortByTime(acts: Act[], allActs: Act[]): Act[] {
  const days = getUniqueDays(allActs)
  const dayIndex = (act: Act) => (act.day ? days.indexOf(act.day) : days.length)
  const minutes = (act: Act) => (act.startTime ? festivalMinutes(act.startTime) : Number.MAX_SAFE_INTEGER)
  return [...acts].sort(
    (a, b) => dayIndex(a) - dayIndex(b) || minutes(a) - minutes(b) || a.artist.localeCompare(b.artist),
  )
}

// The shared acts and the clashes of two users, sorted by time (FR-7).
export function matchDetail(acts: Act[], mine: Ratings, theirs: Ratings): { shared: Act[]; clashes: Act[] } {
  return {
    shared: sortByTime(
      acts.filter((act) => isShared(mine[act.id], theirs[act.id])),
      acts,
    ),
    clashes: sortByTime(
      acts.filter((act) => isClash(mine[act.id], theirs[act.id])),
      acts,
    ),
  }
}
