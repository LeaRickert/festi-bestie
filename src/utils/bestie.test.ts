import { describe, expect, it } from 'vitest'
import type { Act } from '../hooks/useFestivalData'
import {
  coMembers,
  formatScore,
  hasEnoughRatings,
  matchDetail,
  matchList,
  matchScore,
  ratingsByUser,
  ratingWeight,
} from './bestie'

const act = (id: string, day: string | null, startTime: string | null): Act => ({
  id,
  artist: id,
  day,
  startTime,
  length: 60,
  stage: 'Main',
  specialNotes: null,
  genre: null,
  category: null,
  youtubeVideoId: null,
  youtubeTitle: null,
  festivalId: 'f',
  avgRating: null,
})

// Five acts rated 3 or more, so a user passes the floor of FR-5.
const liked = (rating: number, prefix = 'l'): Record<string, number> =>
  Object.fromEntries([1, 2, 3, 4, 5].map((n) => [`${prefix}${n}`, rating]))

describe('match score (bestie FR-1 to FR-4)', () => {
  it('[TC-FU68] uses only the ratings of the festival', () => {
    const rows = [
      { user_id: 'a', act_id: 'old', rating: 5 },
      { user_id: 'a', act_id: 'new', rating: 4 },
      { user_id: 'b', act_id: 'old', rating: 1 },
    ]
    expect(ratingsByUser(rows, new Set(['new']))).toEqual({ a: { new: 4 } })
  })

  it('uses the heatmap weights', () => {
    expect([undefined, 1, 2, 3, 4, 5].map(ratingWeight)).toEqual([0, 0, 0, 0.5, 1, 2])
  })

  it('[TC-FZAB] a 4 against a 3 adds 0.5 and 1', () => {
    expect(matchScore({ x: 4 }, { x: 3 })).toBe(0.5 / 1)
  })

  it('[TC-X9MI] scores 3 / 4 for 5, 4 against 5, 5', () => {
    expect(matchScore({ x: 5, y: 4 }, { x: 5, y: 5 })).toBe(0.75)
  })

  it('[TC-Y4ME] scores 100% for the same ratings', () => {
    expect(matchScore({ x: 5, y: 3, z: 1 }, { x: 5, y: 3, z: 1 })).toBe(1)
  })

  it('[TC-LU8T] a 5 against no rating adds 0 and 2', () => {
    expect(matchScore({ x: 5, y: 5 }, { y: 5 })).toBe(2 / 4)
  })

  it('[TC-G8VF] a 5 against a 1 adds 0 and 3', () => {
    expect(matchScore({ x: 5, y: 5 }, { x: 1, y: 5 })).toBe(2 / 5)
  })

  it('[TC-8Q4A] a 5 against a 2 adds 0 and 2', () => {
    expect(matchScore({ x: 5, y: 5 }, { x: 2, y: 5 })).toBe(2 / 4)
  })

  it('[TC-9DHL] a 3 against a 1 adds 0 and 0.5', () => {
    expect(matchScore({ x: 3, y: 5 }, { x: 1, y: 5 })).toBe(2 / 2.5)
  })

  it('[TC-5EFJ] a 1 of the user against a 5 adds 0 and 2', () => {
    expect(matchScore({ x: 1, y: 5 }, { x: 5, y: 5 })).toBe(2 / 4)
  })

  it('has no score when no act has a weight', () => {
    expect(matchScore({ x: 1 }, { x: 2 })).toBeNull()
  })
})

describe('rating floor (bestie FR-5)', () => {
  it('needs 5 ratings of 3 or more', () => {
    expect(hasEnoughRatings({ ...liked(3), z: 1 })).toBe(true)
    expect(hasEnoughRatings({ l1: 5, l2: 5, l3: 5, l4: 5, z: 2 })).toBe(false)
  })

  it('[TC-DJ01] shows no score for a member with 4 liked acts', () => {
    const [b] = matchList(liked(5), [{ userId: 'b', username: 'B', groupNames: ['Camp A'] }], {
      b: { l1: 5, l2: 5, l3: 5, l4: 5 },
    })
    expect(b.score).toBeNull()
  })

  it('[TC-ESNC] shows no score when the user has 4 liked acts', () => {
    const matches = matchList({ l1: 5, l2: 5, l3: 5, l4: 5 }, [{ userId: 'b', username: 'B', groupNames: ['Camp A'] }], {
      b: liked(5),
    })
    expect(matches[0].score).toBeNull()
  })
})

describe('match list (bestie FR-6, FR-8, FR-9)', () => {
  const member = (userId: string, username = userId) => ({ userId, username, groupNames: ['Camp A'] })

  // Rates the first n acts of liked(5) 5 and the rest 3, so a higher n scores higher.
  const theirs = (matching: number) =>
    Object.fromEntries([1, 2, 3, 4, 5].map((n) => [`l${n}`, n <= matching ? 5 : 3]))

  it('[TC-VJZY] sorts by score from high to low with the shared acts', () => {
    const ratings = { lo: theirs(1), hi: theirs(4), mid: theirs(2) }
    const matches = matchList(liked(5), [member('lo'), member('hi'), member('mid')], ratings)
    expect(matches.map((m) => m.userId)).toEqual(['hi', 'mid', 'lo'])
    // Only the acts both rated 4 or more are shared.
    expect(matches.map((m) => m.sharedCount)).toEqual([4, 2, 1])
  })

  it('[TC-9EAB] does not share an act both rated 3', () => {
    const [b] = matchList({ ...liked(5), x: 3 }, [member('b')], { b: { ...liked(5), x: 3 } })
    expect(b.sharedCount).toBe(5)
  })

  it('[TC-QT10] puts the members with no score last, A to Z', () => {
    const matches = matchList(liked(5), [member('z', 'Zoe'), member('b', 'B'), member('c', 'Cam')], {
      b: theirs(3),
    })
    expect(matches.map((m) => m.username)).toEqual(['B', 'Cam', 'Zoe'])
  })

  it('[TC-YQI0] lists only the other members, each matched with the user', () => {
    const groups = [{ name: 'Camp A', members: [{ userId: 'a', username: 'A' }, { userId: 'b', username: 'B' }, { userId: 'c', username: 'C' }] }]
    expect(coMembers(groups, 'a').map((m) => m.userId)).toEqual(['b', 'c'])
  })

  it('[TC-QJNT] drops a member who left the only shared group', () => {
    const groups = [{ name: 'Camp A', members: [{ userId: 'a', username: 'A' }, { userId: 'c', username: 'C' }] }]
    expect(coMembers(groups, 'a').map((m) => m.userId)).toEqual(['c'])
  })

  it('[TC-478I] lists a member of two shared groups once', () => {
    const a = { userId: 'a', username: 'A' }
    const b = { userId: 'b', username: 'B' }
    expect(
      coMembers(
        [
          { name: 'Camp A', members: [a, b] },
          { name: 'Work', members: [a, b] },
        ],
        'a',
      ),
    ).toEqual([{ userId: 'b', username: 'B', groupNames: ['Camp A', 'Work'] }])
  })
})

describe('score format (bestie FR-10)', () => {
  it('[TC-4HGL] rounds to 2 decimals', () => {
    expect(formatScore(0.751234)).toBe('75.12')
  })

  it('[TC-8DMY] drops trailing zeros', () => {
    expect(formatScore(0.75)).toBe('75')
    expect(formatScore(1)).toBe('100')
  })
})

describe('match detail (bestie FR-7)', () => {
  const acts = [
    act('late', 'Friday', '00:30'),
    act('sat', 'Saturday', '15:00'),
    act('early', 'Friday', '14:00'),
    act('clash', 'Friday', '20:00'),
    act('none', 'Friday', '21:00'),
  ]

  it('[TC-IIK7] lists the shared acts and the clashes by day and start time', () => {
    const mine = { late: 4, sat: 5, early: 4, clash: 5, none: 5 }
    const theirs = { late: 5, sat: 4, early: 5, clash: 1, none: 2 }
    const { shared, clashes } = matchDetail(acts, mine, theirs)
    expect(shared.map((a) => a.id)).toEqual(['early', 'late', 'sat'])
    expect(clashes.map((a) => a.id)).toEqual(['clash'])
  })

  it('[TC-0LMM] works for a member with no score', () => {
    const { shared } = matchDetail(acts, { sat: 5 }, { sat: 4 })
    expect(shared.map((a) => a.id)).toEqual(['sat'])
  })
})
