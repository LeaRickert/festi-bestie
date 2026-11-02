// Friend groups (groups.spec.md): error messages, the invite link and the
// group pages of the ratings slider.
import { ratingLabel } from './ratingStyle'

export interface GroupMember {
  userId: string
  username: string
}

// The errors that the database functions raise (supabase/schemas/groups.sql).
const ERROR_MESSAGES: Record<string, string> = {
  invalid_invite: 'This invite link is not valid. Ask a member for a new one.',
  group_full: 'This group is full. A group has at most 20 members.',
  group_limit: 'You are already in 2 groups for this festival.',
  group_past: 'This festival has ended, so the group is read-only.',
  not_owner: 'Only the owner can do that.',
  not_signed_in: 'Sign in first.',
}

export function groupErrorMessage(error: { message?: string; code?: string } | null): string {
  if (!error) return ''
  if (error.message && ERROR_MESSAGES[error.message]) return ERROR_MESSAGES[error.message]
  // The name check of the groups table (FR-2).
  if (error.code === '23514') return 'The name must have 1 to 40 characters.'
  return error.message || 'Something went wrong. Please try again.'
}

// The name as the database stores it (FR-2).
export function isValidGroupName(name: string): boolean {
  const trimmed = name.trim()
  return trimmed.length >= 1 && trimmed.length <= 40
}

export function inviteUrl(origin: string, festivalSlug: string, token: string): string {
  return `${origin}/festival/${festivalSlug}/join/${token}`
}

// "My rating", then the groups in the order the user joined them (FR-21).
export function sliderPages(groupNames: string[]): string[] {
  return ['My rating', ...groupNames]
}

// The page after `page`; the last group goes back to "My rating" (FR-22).
export function nextPage(page: number, pageCount: number): number {
  return (page + 1) % pageCount
}

export function previousPage(page: number, pageCount: number): number {
  return (page - 1 + pageCount) % pageCount
}

// The ratings of the members of one group for one act, by user id. The rating
// of the user comes from `myRating`, so a change on "My rating" shows at once.
export function groupRatings(
  members: GroupMember[],
  actRatings: Record<string, number>,
  myId: string,
  myRating: number,
): Record<string, number> {
  const result: Record<string, number> = {}
  for (const { userId } of members) {
    const rating = userId === myId ? myRating : actRatings[userId]
    if (rating >= 1 && rating <= 5) result[userId] = rating
  }
  return result
}

// The number of members who gave each rating, index 0 for 1 star (FR-25).
export function starCounts(ratings: Record<string, number>): number[] {
  const counts = [0, 0, 0, 0, 0]
  for (const rating of Object.values(ratings)) counts[rating - 1] += 1
  return counts
}

export const WHO_PROMPT = 'Tap a star to see who'

// The line under the stars of a group page (FR-26): the user first as "You",
// then the other members in the order they joined.
export function whoLine(
  star: number | null,
  members: GroupMember[],
  ratings: Record<string, number>,
  myId: string,
): string {
  if (star === null) return WHO_PROMPT
  const names = members
    .filter(({ userId }) => ratings[userId] === star)
    .sort((a, b) => Number(b.userId === myId) - Number(a.userId === myId))
    .map(({ userId, username }) => (userId === myId ? 'You' : username))
  return `${star}/5 ${ratingLabel(star)}: ${names.join(', ')}`
}

// A second tap on the selected star hides the line (FR-26).
export function toggleStar(selected: number | null, star: number): number | null {
  return selected === star ? null : star
}
