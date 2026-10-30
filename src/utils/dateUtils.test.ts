import { describe, expect, it } from 'vitest'
import { formatDateRange } from './dateUtils'

describe('festival dates (festivals FR-10)', () => {
  it('[TC-M0G6] shows days in one month as "November 7-9, 2025"', () => {
    expect(formatDateRange('2025-11-07', '2025-11-09')).toBe('November 7-9, 2025')
  })

  it('[TC-E5ZJ] names both months when the festival crosses a month', () => {
    expect(formatDateRange('2025-10-31', '2025-11-02')).toBe('October 31 - November 2, 2025')
  })

  it('[TC-TKTP] names both years when the festival crosses a year', () => {
    expect(formatDateRange('2025-12-30', '2026-01-01')).toBe('December 30, 2025 - January 1, 2026')
  })

  it('[TC-M0G6] shows a one-day festival as one date', () => {
    expect(formatDateRange('2025-11-07', '2025-11-07')).toBe('November 7, 2025')
  })
})
