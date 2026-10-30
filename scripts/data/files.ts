import { parse, stringify } from 'yaml'

export const ACT_COLUMNS = [
  'artist',
  'day',
  'stage',
  'start_time',
  'length_minutes',
  'genre',
  'category',
  'special_notes',
  'youtube_url',
  'youtube_title',
] as const

export const STATUSES = ['announced', 'lineup', 'stages', 'schedule', 'times', 'complete'] as const

export interface ActRow {
  artist: string
  day: string
  stage: string | null
  start_time: string | null
  length_minutes: number | null
  genre: string | null
  category: string | null
  special_notes: string | null
  youtube_url: string | null
  youtube_title: string | null
}

export interface FestivalRow {
  name: string
  start_date: string
  end_date: string
  location: string
  description: string | null
  status: (typeof STATUSES)[number]
}

// `row` is the spreadsheet row of acts.csv (the header is row 1).
export interface Issue {
  file: string
  row: number | null
  column: string | null
  message: string
}

export function formatIssue(issue: Issue): string {
  const where = [
    issue.file,
    issue.row === null ? null : `row ${issue.row}`,
    issue.column === null ? null : `column ${issue.column}`,
  ]
  return `${where.filter(Boolean).join(', ')}: ${issue.message}`
}

export class CsvError extends Error {}

export function parseCsv(input: string): string[][] {
  const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  let i = 0
  while (i < text.length) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"'
        i += 2
        continue
      }
      if (c === '"') quoted = false
      else field += c
    } else if (c === '"' && field === '') {
      quoted = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += c
    }
    i++
  }
  if (quoted) throw new CsvError('a quoted value is not closed')
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  while (rows.length > 0 && rows[rows.length - 1].every((cell) => cell.trim() === '')) rows.pop()
  return rows
}

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

export function parseActs(text: string, file = 'acts.csv'): { acts: ActRow[]; issues: Issue[] } {
  const issues: Issue[] = []
  const issue = (row: number | null, column: string | null, message: string) =>
    issues.push({ file, row, column, message })

  let table: string[][]
  try {
    table = parseCsv(text)
  } catch (error) {
    issue(null, null, (error as Error).message)
    return { acts: [], issues }
  }
  if (table.length === 0) {
    issue(1, null, 'the file is empty')
    return { acts: [], issues }
  }

  const header = table[0].map((cell) => cell.trim())
  for (const column of ACT_COLUMNS) {
    if (!header.includes(column)) issue(1, column, 'the column is missing')
  }
  for (const column of header) {
    if (!(ACT_COLUMNS as readonly string[]).includes(column)) issue(1, column, 'unknown column')
  }
  if (issues.length > 0) return { acts: [], issues }

  const acts: ActRow[] = []
  const firstRowOfKey = new Map<string, number>()
  table.slice(1).forEach((cells, offset) => {
    const row = offset + 2
    const value = (column: string) => (cells[header.indexOf(column)] ?? '').trim()
    const orNull = (column: string) => value(column) || null
    const before = issues.length

    if (cells.length > header.length) issue(row, null, 'the row has more values than the header')
    if (!value('artist')) issue(row, 'artist', 'is empty')
    if (!value('day')) issue(row, 'day', 'is empty')

    const startTime = value('start_time')
    if (startTime && !TIME_PATTERN.test(startTime)) {
      issue(row, 'start_time', `"${startTime}" is not a time in the form HH:MM`)
    }

    const length = value('length_minutes')
    if (length && !/^[1-9]\d*$/.test(length)) {
      issue(row, 'length_minutes', `"${length}" is not a whole number of minutes`)
    }

    if (issues.length > before) return

    const act: ActRow = {
      artist: value('artist'),
      day: value('day'),
      stage: orNull('stage'),
      start_time: orNull('start_time'),
      length_minutes: length ? Number(length) : null,
      genre: orNull('genre'),
      category: orNull('category'),
      special_notes: orNull('special_notes'),
      youtube_url: orNull('youtube_url'),
      youtube_title: orNull('youtube_title'),
    }
    const key = actKey(act)
    const first = firstRowOfKey.get(key)
    if (first !== undefined) {
      issue(first, 'artist', `rows ${first} and ${row} have the same artist and day (${act.artist}, ${act.day})`)
      return
    }
    firstRowOfKey.set(key, row)
    acts.push(act)
  })
  return { acts, issues }
}

export function parseFestival(text: string, file = 'festival.yaml'): { festival: FestivalRow | null; issues: Issue[] } {
  const issues: Issue[] = []
  const issue = (column: string | null, message: string) => issues.push({ file, row: null, column, message })

  let data: unknown
  try {
    data = parse(text)
  } catch (error) {
    issue(null, (error as Error).message)
    return { festival: null, issues }
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    issue(null, 'the file must be a list of key: value lines')
    return { festival: null, issues }
  }
  const record = data as Record<string, unknown>
  const text_ = (key: string, required: boolean): string | null => {
    const raw = record[key]
    if (raw === undefined || raw === null || raw === '') {
      if (required) issue(key, 'is missing')
      return null
    }
    return String(raw).trim()
  }
  const date = (key: string): string | null => {
    const value = text_(key, true)
    if (value !== null && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      issue(key, `"${value}" is not a date in the form YYYY-MM-DD`)
      return null
    }
    return value
  }

  const name = text_('name', true)
  const startDate = date('start_date')
  const endDate = date('end_date')
  const location = text_('location', true)
  const status = text_('status', false) ?? 'announced'
  if (!(STATUSES as readonly string[]).includes(status)) {
    issue('status', `"${status}" is not one of ${STATUSES.join(', ')}`)
  }
  if (issues.length > 0 || !name || !startDate || !endDate || !location) return { festival: null, issues }
  return {
    festival: {
      name,
      start_date: startDate,
      end_date: endDate,
      location,
      description: text_('description', false),
      status: status as FestivalRow['status'],
    },
    issues,
  }
}

export function actKey(act: Pick<ActRow, 'artist' | 'day'>): string {
  return `${act.artist}\u0000${act.day}`
}

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

// Days run in festival order: from the weekday of the start date on.
export function sortActs(acts: ActRow[], startDate: string): ActRow[] {
  const startWeekday = new Date(`${startDate}T00:00:00Z`).getUTCDay()
  const dayOrder = (day: string) => {
    const index = WEEKDAYS.indexOf(day.toLowerCase())
    return index === -1 ? 99 : (index - startWeekday + 7) % 7
  }
  const byText = (a: string, b: string) => a.toLowerCase().localeCompare(b.toLowerCase(), 'en')
  return [...acts].sort(
    (a, b) => dayOrder(a.day) - dayOrder(b.day) || byText(a.day, b.day) || byText(a.artist, b.artist) || byText(a.stage ?? '', b.stage ?? ''),
  )
}

function csvCell(value: string | number | null): string {
  if (value === null) return ''
  const text = String(value)
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function serializeActs(acts: ActRow[], startDate: string): string {
  const lines = [ACT_COLUMNS.join(',')]
  for (const act of sortActs(acts, startDate)) {
    lines.push(ACT_COLUMNS.map((column) => csvCell(act[column])).join(','))
  }
  return `${lines.join('\n')}\n`
}

export function serializeFestival(festival: FestivalRow): string {
  const { name, start_date, end_date, location, description, status } = festival
  const ordered: Record<string, string> = { name, start_date, end_date, location }
  if (description) ordered.description = description
  ordered.status = status
  return stringify(ordered, { lineWidth: 0 })
}
