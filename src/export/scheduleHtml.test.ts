import { describe, expect, it } from 'vitest'
import type { Act } from '../hooks/useFestivalData'
import { buildScheduleHtml, canExport, exportFileName, filterExportActs, getImageSize } from './scheduleHtml'

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

const SIZE = { width: 393, height: 852, scale: 3 }
// 852 minus the clock zone (213), the header (20), the stage names (20) and the room for the last hour number (12).
const GRID_HEIGHT = 587

const html = (acts: Act[], ratings: Record<string, number> = {}, options: { stages?: string[]; preview?: boolean } = {}) =>
  buildScheduleHtml({
    festivalName: 'EDC Orlando 2026',
    dateLabel: 'Fri, Nov 6',
    stages: options.stages ?? ['Kinetic Field'],
    acts,
    ratings,
    size: SIZE,
    preview: options.preview,
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
  it('[TC-E76L] labels the hours "2" to "1" for acts from 2:00 PM to 1:00 AM', () => {
    const output = html([act({ startTime: '14:00', length: 60 }), act({ id: 'a2', startTime: '00:00', length: 60 })])
    const labels = [...output.matchAll(/>(\d+)<\/div>/g)].map((match) => match[1])
    expect(labels).toEqual(['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '1'])
  })

  it('[TC-J3IS] shows a set from 2:30 PM to 3:00 PM as "2:30-3"', () => {
    expect(html([act({ startTime: '14:30', length: 30 })])).toContain('2:30-3<')
  })
})

describe('schedule image (export FR-7)', () => {
  it('[TC-HCJ0] draws a set that starts at 12:30 AM once, 11.5 hours below a 1 PM grid top', () => {
    const output = html([act({ id: 'a0', artist: 'Opener', startTime: '13:00' }), act({ startTime: '00:30', length: 60 })])
    expect(output.match(/Hedex/g)).toHaveLength(1)
    const tops = [...output.matchAll(/position: absolute;\s+left: 0;\s+width: 100%;\s+top: ([\d.]+)px/g)].map((match) => Number(match[1]))
    // The grid runs from 1 PM to 2 AM, 13 hours.
    expect(tops[1]).toBeCloseTo((11.5 * GRID_HEIGHT) / 13)
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

describe('image size (export FR-10)', () => {
  it('[TC-NETT] makes a 1170 by 2532 PNG on a 390 by 844 phone at 3x', () => {
    const size = getImageSize({ userAgent: 'Mozilla/5.0 (iPhone)', screenWidth: 390, screenHeight: 844, devicePixelRatio: 3 })
    expect([size.width * size.scale, size.height * size.scale]).toEqual([1170, 2532])
  })

  it('[TC-NETT] stays portrait when the phone is turned sideways', () => {
    const size = getImageSize({ userAgent: 'Mozilla/5.0 (Linux; Android 14)', screenWidth: 915, screenHeight: 412, devicePixelRatio: 2.625 })
    expect([size.width, size.height]).toEqual([412, 915])
  })

  it('[TC-JNGC] makes a 1179 by 2556 PNG in a desktop browser', () => {
    const size = getImageSize({ userAgent: 'Mozilla/5.0 (Macintosh)', screenWidth: 1728, screenHeight: 1117, devicePixelRatio: 2 })
    expect([size.width * size.scale, size.height * size.scale]).toEqual([1179, 2556])
  })
})

describe('wallpaper layout (export FR-11, FR-12, FR-14)', () => {
  it('[TC-18TU] leaves the top 25% empty and puts the header right above the stage names', () => {
    const output = html([act({})])
    expect(output).toContain('padding: 213px 6px 12px')
    const header = output.indexOf('Fri, Nov 6 - EDC Orlando 2026')
    expect(header).toBeGreaterThan(-1)
    expect(output.indexOf('Kinetic Field')).toBeGreaterThan(header)
  })

  it('[TC-5D4V] outlines the clock zone in the preview only', () => {
    expect(html([act({})], {}, { preview: true })).toContain('dashed')
    expect(html([act({})])).not.toContain('dashed')
  })

  it('[TC-0TDL] draws on #051721 with no background behind the stage names or the time column', () => {
    const output = html([act({})], {}, { stages: ['Kinetic Field', 'Circuit Grounds', 'Cosmic Meadow', 'Neon Garden'] })
    expect(output).toContain('background: #051721')
    // The only backgrounds are the image, the hour lines and the act blocks.
    const backgrounds = output.match(/background: [^;]+/g) ?? []
    expect(backgrounds.filter((b) => b !== 'background: #051721' && b !== 'background: rgba(255, 255, 255, 0.15)' && b !== 'background: transparent')).toEqual([])
  })
})
