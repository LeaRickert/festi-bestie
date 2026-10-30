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
  youtubeVideoId: null,
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
    expect(output).toContain('background: rgba(158, 31, 179, 0.7)')
  })

  it('[TC-BL3F] names the file EDC_Orlando_2024_Friday_schedule.png', () => {
    expect(exportFileName('EDC Orlando 2024', 'Friday')).toBe('EDC_Orlando_2024_Friday_schedule.png')
  })
})

describe('rating style in the image (export FR-8)', () => {
  // The act block is the last absolutely positioned element before the artist name.
  const actBlock = (output: string, artist: string) => output.slice(0, output.indexOf(artist)).split('position: absolute;').pop() ?? ''

  it('[TC-12UL] draws a 5 with a magenta border and fill, and a 1 with a faint border and no fill', () => {
    const output = html([act({ id: 'a1', artist: 'Five' }), act({ id: 'a2', artist: 'One', startTime: '22:00' })], { a1: 5, a2: 1 })
    expect(actBlock(output, 'Five')).toContain('border: 1px solid #9e1fb3')
    expect(actBlock(output, 'Five')).toContain('background: rgba(158, 31, 179, 0.7)')
    expect(actBlock(output, 'One')).toContain('border: 1px solid rgba(255, 255, 255, 0.4)')
    expect(actBlock(output, 'One')).toContain('background: transparent')
  })
})

describe('time range and act times (export FR-9)', () => {
  it('[TC-J3IS] shows a set from 2:30 PM to 3:00 PM as "2:30-3"', () => {
    expect(html([act({ startTime: '14:30', length: 30 })])).toContain('2:30-3<')
  })
})

describe('schedule image (export FR-7)', () => {
  it('[TC-HCJ0] draws a set that starts at 12:30 AM once, 11.5 hours below a 1 PM grid top', () => {
    const output = html([act({ id: 'a0', artist: 'Opener', startTime: '13:00' }), act({ startTime: '00:30', length: 60 })])
    expect(output.match(/Hedex/g)).toHaveLength(1)
    expect(output).toContain(`top: ${11.5 * 50}px`)
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
