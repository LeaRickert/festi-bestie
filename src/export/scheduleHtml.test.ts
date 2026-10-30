import { describe, expect, it } from 'vitest'
import type { Act } from '../hooks/useFestivalData'
import { buildScheduleHtml, canExport, exportFileName, filterExportActs, getExportLayout } from './scheduleHtml'

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
  youtubeUrl: null,
  youtubeTitle: null,
  festivalId: 'f1',
  avgRating: null,
  ...overrides,
})

const html = (acts: Act[], ratings: Record<string, number> = {}) =>
  buildScheduleHtml({
    festivalName: 'EDC Orlando 2025',
    day: 'Friday',
    stages: ['Kinetic Field'],
    acts,
    ratings,
    layout: getExportLayout('Mozilla/5.0 (iPhone)', 393),
    generatedOn: '11/7/2025',
  })

describe('export page (export FR-1 to FR-4)', () => {
  it('[TC-KJL8] keeps only the Friday acts on the chosen stage', () => {
    const acts = [
      act({ id: '1', artist: 'A' }),
      act({ id: '2', artist: 'B', stage: 'Neon Garden' }),
      act({ id: '3', artist: 'C', day: 'Saturday' }),
    ]
    expect(filterExportActs(acts, 'Friday', ['Kinetic Field']).map((a) => a.artist)).toEqual(['A'])
  })

  it('[TC-50UL] cannot export without a stage', () => {
    expect(canExport('Friday', [])).toBe(false)
    expect(canExport('', ['Kinetic Field'])).toBe(false)
    expect(canExport('Friday', ['Kinetic Field'])).toBe(true)
  })

  it('[TC-5VLI] shows the act and styles a 5 star rating', () => {
    const output = html([act({})], { a1: 5 })
    expect(output).toContain('Hedex')
    expect(output).toContain('#ee5a24')
  })

  it('[TC-BL3F] names the file EDC_Orlando_2024_Friday_schedule.png', () => {
    expect(exportFileName('EDC Orlando 2024', 'Friday')).toBe('EDC_Orlando_2024_Friday_schedule.png')
  })
})

describe('schedule image (export FR-7)', () => {
  it('[TC-HCJ0] draws a set that starts at 12:30 AM once, 575 px below the 1 PM line', () => {
    const output = html([act({ startTime: '00:30', length: 60 })])
    expect(output.match(/Hedex/g)).toHaveLength(1)
    expect(output).toContain('top: 575px')
  })

  it('[TC-HCJ0] draws a set that crosses an hour once', () => {
    expect(html([act({ startTime: '20:30', length: 90 })]).match(/Hedex/g)).toHaveLength(1)
  })

  it('[TC-YCYQ] escapes an artist name that contains an HTML tag', () => {
    const output = html([act({ artist: '<img src=x onerror=alert(1)>' })])
    expect(output).not.toContain('<img')
    expect(output).toContain('&lt;img')
  })
})
