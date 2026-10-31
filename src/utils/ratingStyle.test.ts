import { describe, expect, it } from 'vitest'
import { RATING_ACCENT, ratingLabel, ratingStyle } from './ratingStyle'

describe('rating labels (ratings FR-2)', () => {
  it('[TC-Q0OF] labels the 5th star "Must See!"', () => {
    expect(ratingLabel(5)).toBe('Must See!')
  })

  it('[TC-UNIZ] labels the 1st star "Not for me"', () => {
    expect(ratingLabel(1)).toBe('Not for me')
  })

  it('[TC-5GN7] labels no rating "Not rated"', () => {
    expect(ratingLabel(0)).toBe('Not rated')
  })
})

describe('rating style (ratings FR-10)', () => {
  it('[TC-YBFW] shows a rating of 2 like no rating: gray 70% border, no fill', () => {
    const expected = { borderColor: 'rgba(170, 170, 170, 0.7)', background: 'transparent', color: '#ffffff' }
    expect(ratingStyle(2)).toEqual(expected)
    expect(ratingStyle(0)).toEqual(expected)
  })

  it('[TC-CC2Q] shows a rating of 1 with a gray 40% border, no fill and gray 80% text', () => {
    expect(ratingStyle(1)).toEqual({
      borderColor: 'rgba(170, 170, 170, 0.4)',
      background: 'transparent',
      color: 'rgba(170, 170, 170, 0.8)',
    })
  })

  it('[TC-FINQ] shows a rating of 3 with a magenta border and no fill', () => {
    expect(ratingStyle(3)).toMatchObject({ borderColor: RATING_ACCENT, background: 'transparent' })
  })

  it('[TC-QZZJ] shows a rating of 4 with a magenta border and a magenta 20% fill', () => {
    expect(ratingStyle(4)).toMatchObject({ borderColor: RATING_ACCENT, background: 'rgba(158, 31, 179, 0.2)' })
  })

  it('[TC-NECG] shows a rating of 5 with a magenta border and a magenta 70% fill', () => {
    expect(ratingStyle(5)).toMatchObject({ borderColor: RATING_ACCENT, background: 'rgba(158, 31, 179, 0.7)' })
  })
})
