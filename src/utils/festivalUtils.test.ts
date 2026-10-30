import { describe, expect, it } from 'vitest'
import { localDateString, splitFestivals, statusBadge } from './festivalUtils'

const festival = (name: string, start_date: string, end_date: string) => ({ name, start_date, end_date })

describe('festival list (festivals FR-1)', () => {
  it('[TC-FT3E] lists the festival that starts on 2024-03-22 before the one on 2024-11-15', () => {
    const { upcoming } = splitFestivals(
      [festival('EDC', '2024-11-15', '2024-11-17'), festival('Ultra', '2024-03-22', '2024-03-24')],
      '2024-01-01',
    )
    expect(upcoming.map((f) => f.name)).toEqual(['Ultra', 'EDC'])
  })

  it('[TC-HHKR] puts a festival that ended on 2025-11-09 in past festivals on 2026-10-30', () => {
    const { upcoming, past } = splitFestivals(
      [festival('EDC 2025', '2025-11-07', '2025-11-09'), festival('EDC 2026', '2026-11-06', '2026-11-08')],
      '2026-10-30',
    )
    expect(past.map((f) => f.name)).toEqual(['EDC 2025'])
    expect(upcoming.map((f) => f.name)).toEqual(['EDC 2026'])
  })

  it('[TC-HHKR] keeps a festival upcoming on its last day', () => {
    const { upcoming } = splitFestivals([festival('EDC 2026', '2026-11-06', '2026-11-08')], '2026-11-08')
    expect(upcoming).toHaveLength(1)
  })

  it('[TC-HHKR] reads today in the local time zone', () => {
    expect(localDateString(new Date(2026, 9, 30, 23, 30))).toBe('2026-10-30')
  })
})

describe('status badges (festivals FR-8)', () => {
  it('[TC-2CXG] shows a blue "Times" badge for the status times', () => {
    expect(statusBadge('times').label).toBe('Times')
    expect(statusBadge('times').className).toContain('blue')
  })

  it('[TC-2CXG] labels every status', () => {
    expect(['announced', 'lineup', 'stages', 'schedule', 'complete'].map((s) => statusBadge(s).label)).toEqual([
      'Announced',
      'Lineup',
      'Stages',
      'Schedule',
      'Complete',
    ])
  })
})
