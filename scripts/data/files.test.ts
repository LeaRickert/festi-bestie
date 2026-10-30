import { describe, expect, it } from 'vitest'
import { type ActRow, formatIssue, parseActs, serializeActs } from './files.ts'

const HEADER = 'artist,day,stage,start_time,length_minutes,genre,category,special_notes,youtube_url,youtube_title'

describe('parseActs (data-import FR-2 to FR-5)', () => {
  it('[TC-Q291] reads a byte order mark and a quoted comma', () => {
    const { acts, issues } = parseActs(`﻿${HEADER}\n"Smith, John",Friday,,,,,,,,\n`)
    expect(issues).toEqual([])
    expect(acts[0].artist).toBe('Smith, John')
  })

  it('[TC-0U5F] stores the time 21:30', () => {
    const { acts } = parseActs(`${HEADER}\nDiplo,Friday,Main,21:30,60,,,,,\n`)
    expect(acts[0].start_time).toBe('21:30')
    expect(acts[0].length_minutes).toBe(60)
  })

  it('[TC-ZYLF] rejects the time 0.9167 and reports the row and the column', () => {
    const { issues } = parseActs(`${HEADER}\nDiplo,Friday,Main,0.9167,,,,,,\n`)
    expect(issues).toHaveLength(1)
    expect(issues[0]).toMatchObject({ row: 2, column: 'start_time' })
  })

  it('[TC-D57O] reports row 7 and the column day when day is empty', () => {
    const rows = ['A', 'B', 'C', 'D', 'E'].map((artist) => `${artist},Friday,,,,,,,,`)
    const { issues } = parseActs([HEADER, ...rows, 'F,,,,,,,,,'].join('\n'))
    expect(issues.map(formatIssue)).toEqual(['acts.csv, row 7, column day: is empty'])
  })

  it('[TC-5IH0] reports both rows of a duplicate act key', () => {
    const { issues } = parseActs(`${HEADER}\nDiplo,Friday,,,,,,,,\nZedd,Friday,,,,,,,,\nDiplo,Friday,Main,,,,,,,\n`)
    expect(issues).toHaveLength(1)
    expect(issues[0].message).toContain('rows 2 and 4')
  })

  it('[TC-5IH0] accepts the same artist on another day', () => {
    const { issues } = parseActs(`${HEADER}\nDiplo,Friday,,,,,,,,\nDiplo,Saturday,,,,,,,,\n`)
    expect(issues).toEqual([])
  })
})

describe('serializeActs (data-import FR-9)', () => {
  const act = (artist: string, day: string): ActRow => ({
    artist,
    day,
    stage: null,
    start_time: null,
    length_minutes: null,
    genre: null,
    category: null,
    special_notes: null,
    youtube_url: null,
    youtube_title: null,
  })

  it('[TC-WYOX] writes Adam Beyer before Zeds Dead on the same day', () => {
    const text = serializeActs([act('Zeds Dead', 'Friday'), act('Adam Beyer', 'Friday')], '2025-11-07')
    expect(text.split('\n').slice(1, 3).map((line) => line.split(',')[0])).toEqual(['Adam Beyer', 'Zeds Dead'])
  })

  it('[TC-WYOX] sorts by day in festival order before artist', () => {
    const text = serializeActs([act('Adam', 'Sunday'), act('Zed', 'Friday'), act('Bob', 'Saturday')], '2025-11-07')
    expect(text.split('\n').slice(1, 4).map((line) => line.split(',')[1])).toEqual(['Friday', 'Saturday', 'Sunday'])
  })
})
