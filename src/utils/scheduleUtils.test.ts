import { describe, expect, it } from 'vitest'
import { timeToMinutes } from './scheduleUtils'

describe('timeToMinutes (festivals FR-7)', () => {
  it('[TC-RNP0] converts "8:00 PM" to 1200', () => {
    expect(timeToMinutes('8:00 PM')).toBe(1200)
  })

  it('[TC-PIKX] converts "12:30 AM" to 30', () => {
    expect(timeToMinutes('12:30 AM')).toBe(30)
  })

  it('[TC-0W65] converts "20:00" to 1200', () => {
    expect(timeToMinutes('20:00')).toBe(1200)
  })
})
