import { describe, expect, it } from 'vitest'
import {
  WHO_PROMPT,
  groupErrorMessage,
  groupRatings,
  inviteUrl,
  isValidGroupName,
  nextPage,
  previousPage,
  sliderPages,
  starCounts,
  toggleStar,
  whoLine,
} from './groups'

const me = { userId: 'me', username: 'lea' }
const alice = { userId: 'a', username: 'Alice' }
const bob = { userId: 'b', username: 'Bob' }

describe('group errors (groups FR-2, FR-4, FR-7, FR-8)', () => {
  it('[TC-EDFG] shows that the group is full', () => {
    expect(groupErrorMessage({ message: 'group_full', code: 'P0001' })).toMatch(/full/)
  })

  it('[TC-W8M1] shows that the link is not valid', () => {
    expect(groupErrorMessage({ message: 'invalid_invite', code: 'P0001' })).toMatch(/not valid/)
  })

  it('shows the name rule for the check violation', () => {
    expect(groupErrorMessage({ message: 'new row violates check constraint', code: '23514' })).toMatch(/1 to 40/)
  })

  it('accepts a trimmed name of 1 to 40 characters', () => {
    expect(isValidGroupName('  Camp A  ')).toBe(true)
    expect(isValidGroupName('   ')).toBe(false)
    expect(isValidGroupName('x'.repeat(41))).toBe(false)
  })
})

describe('invite link (groups FR-3)', () => {
  it('[TC-B3VI] links to the join screen of the token', () => {
    expect(inviteUrl('https://festibestie.app', 'abc')).toBe('https://festibestie.app/join/abc')
  })
})

describe('ratings slider (groups FR-21, FR-22)', () => {
  it('[TC-A0GT] lists "My rating", then the groups in join order', () => {
    expect(sliderPages(['Camp A', 'Work'])).toEqual(['My rating', 'Camp A', 'Work'])
  })

  it('[TC-NXVN] goes from the last group back to "My rating"', () => {
    expect(nextPage(2, 3)).toBe(0)
    expect(nextPage(0, 3)).toBe(1)
    expect(previousPage(0, 3)).toBe(2)
  })
})

describe('group page of the slider (groups FR-25, FR-26)', () => {
  it('[TC-2TE6] counts the members behind each star, the user included', () => {
    const ratings = groupRatings([me, alice, bob], { a: 4, b: 5 }, 'me', 4)
    expect(starCounts(ratings)).toEqual([0, 0, 0, 2, 1])
  })

  it('uses the live rating of the user and skips members who did not rate', () => {
    expect(groupRatings([me, alice, bob], { me: 2, a: 3 }, 'me', 0)).toEqual({ a: 3 })
  })

  it('[TC-1781] asks the user to tap a star', () => {
    expect(whoLine(null, [me, alice], {}, 'me')).toBe(WHO_PROMPT)
    expect(WHO_PROMPT).toBe('Tap a star to see who')
  })

  it('[TC-E9X7] names the user first as "You"', () => {
    expect(whoLine(4, [alice, bob, me], { a: 4, me: 4, b: 2 }, 'me')).toBe('4/5 Hyped: You, Alice')
  })

  it('[TC-TQ51] hides the line on a second tap of the same star', () => {
    expect(toggleStar(null, 4)).toBe(4)
    expect(toggleStar(4, 4)).toBeNull()
    expect(toggleStar(4, 5)).toBe(5)
  })
})
