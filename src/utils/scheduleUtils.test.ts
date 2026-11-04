import { describe, expect, it } from 'vitest'
import type { Act } from '../hooks/useFestivalData'
import {
  calculateEndTime,
  formatShortRange,
  getActPosition,
  getActsForStage,
  getGridRange,
  getHourLines,
  getTimeTop,
  hourLabel,
  timeToMinutes,
} from './scheduleUtils'

const act = (overrides: Partial<Act>): Act => ({
  id: 'a1',
  artist: 'Hedex',
  day: 'Friday',
  startTime: '20:00',
  length: 60,
  stage: 'Kinetic Field',
  specialNotes: null,
  genre: null,
  category: null,
  youtubeVideoId: null,
  youtubeTitle: null,
  festivalId: 'f1',
  avgRating: null,
  ...overrides,
})

const rangeOf = (acts: Act[]) => {
  const range = getGridRange(acts)
  if (!range) throw new Error('no grid range')
  return range
}

describe('time grid (schedule-grid FR-1)', () => {
  it('[TC-PAOT] places an 8 PM set of 60 minutes 630 px below a 1 PM grid top, 90 px high', () => {
    const acts = [act({ id: '1', startTime: '13:00' }), act({ id: '2', startTime: '20:00', length: 60 })]
    expect(getActPosition({ startTime: '20:00', length: 60 }, rangeOf(acts))).toEqual({ top: 630, height: 90 })
  })

  it('[TC-V346] labels the 8 PM hour line "8"', () => {
    expect(hourLabel(20 * 60)).toBe('8')
    expect(hourLabel(24 * 60)).toBe('12')
  })
})

describe('timeToMinutes (schedule-grid FR-3)', () => {
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

describe('calculateEndTime (schedule-grid FR-3)', () => {
  it('[TC-EK11] ends a set that starts at 11:00 PM and lasts 90 minutes at 12:30 AM', () => {
    expect(calculateEndTime('23:00', 90)).toBe('12:30 AM')
  })
})

describe('acts in the grid (schedule-grid FR-4)', () => {
  it('[TC-WRQY] leaves an act with no start time out of the grid and its range', () => {
    const acts = [act({ id: '1', startTime: '20:00' }), act({ id: '2', startTime: null })]
    expect(getActsForStage(acts, 'Kinetic Field').map((a) => a.id)).toEqual(['1'])
    expect(getGridRange(acts)).toEqual({ startMinutes: 20 * 60, endMinutes: 21 * 60 })
  })
})

describe('grid range (schedule-grid FR-5)', () => {
  it('[TC-5146] runs from 2 PM to 3 AM when the first set starts at 2:30 PM and the last ends at 2:15 AM', () => {
    const acts = [act({ id: '1', startTime: '14:30', length: 60 }), act({ id: '2', startTime: '01:15', length: 60 })]
    const range = rangeOf(acts)
    expect(range).toEqual({ startMinutes: 14 * 60, endMinutes: 27 * 60 })
    expect(getHourLines(range).map(hourLabel)).toEqual(['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '1', '2', '3'])
  })

  it('[TC-5146] has no range when no act has a time', () => {
    expect(getGridRange([act({ startTime: null })])).toBeNull()
  })
})

describe('later times on top (schedule-grid FR-7)', () => {
  const early = { startTime: '14:00', length: 60 }
  const late = { startTime: '22:00', length: 60 }

  it('[TC-4K1L] puts a 2 PM set above a 10 PM set by default', () => {
    const range = rangeOf([act(early), act(late)])
    expect(getActPosition(early, range).top).toBeLessThan(getActPosition(late, range).top)
  })

  it('[TC-O0NF] puts a 10 PM set above a 2 PM set, with the bottom of each at its start time', () => {
    const range = rangeOf([act(early), act(late)])
    const layout = { laterOnTop: true }
    const earlyPosition = getActPosition(early, range, layout)
    const latePosition = getActPosition(late, range, layout)
    expect(latePosition.top).toBeLessThan(earlyPosition.top)
    expect(latePosition.top + latePosition.height).toBe(getTimeTop(22 * 60, range, layout))
    expect(earlyPosition.top + earlyPosition.height).toBe(getTimeTop(14 * 60, range, layout))
  })

  it('[TC-8KPV] draws the 11 PM line at the top and the 2 PM line at the bottom', () => {
    const range = { startMinutes: 14 * 60, endMinutes: 23 * 60 }
    const layout = { laterOnTop: true }
    const lines = getHourLines(range, layout)
    expect(lines[0]).toBe(23 * 60)
    expect(lines[lines.length - 1]).toBe(14 * 60)
    expect(getTimeTop(23 * 60, range, layout)).toBe(0)
    expect(getTimeTop(14 * 60, range, layout)).toBe(810)
  })
})

describe('act times (schedule-grid FR-6)', () => {
  it('[TC-6A6R] shows a set from 1:00 PM to 1:50 PM as "1-1:50"', () => {
    expect(formatShortRange('13:00', 50)).toBe('1-1:50')
  })

  it('[TC-WSC4] shows a set from 11:30 PM to 1:00 AM as "11:30-1"', () => {
    expect(formatShortRange('23:30', 90)).toBe('11:30-1')
  })
})
