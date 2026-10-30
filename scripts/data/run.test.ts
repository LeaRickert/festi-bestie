import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { type ActRow, type FestivalRow, parseActs, parseFestival } from './files.ts'
import { DataError, type Db, readFestivalFolder, runExport, runImport } from './run.ts'

type StoredAct = ActRow & { id: string; festivalId: string }

// A database in memory. Like the real one, an upsert on the act key keeps the act id.
function memoryDb() {
  const festivals = new Map<string, { id: string; festival: FestivalRow }>()
  const acts: StoredAct[] = []
  let next = 1
  const db: Db = {
    async getFestival(slug) {
      return festivals.get(slug) ?? null
    },
    async listActs(festivalId) {
      return acts.filter((act) => act.festivalId === festivalId).map(({ id, festivalId: _, ...act }) => act)
    },
    async upsertFestival(slug, festival) {
      const id = festivals.get(slug)?.id ?? `festival-${next++}`
      festivals.set(slug, { id, festival })
      return id
    },
    async upsertActs(festivalId, rows) {
      for (const row of rows) {
        const found = acts.find((act) => act.festivalId === festivalId && act.artist === row.artist && act.day === row.day)
        if (found) Object.assign(found, row)
        else acts.push({ id: `act-${next++}`, festivalId, ...row })
      }
    },
    async deleteActs(festivalId, rows) {
      for (const row of rows) {
        const index = acts.findIndex((act) => act.festivalId === festivalId && act.artist === row.artist && act.day === row.day)
        if (index !== -1) acts.splice(index, 1)
      }
    },
  }
  return { db, acts, festivals }
}

const FESTIVAL_YAML = `name: Test Fest
start_date: 2025-11-07
end_date: 2025-11-09
location: Orlando, FL
status: schedule
`
const HEADER = 'artist,day,stage,start_time,length_minutes,genre,category,special_notes,youtube_video_id,youtube_title'

function folder(acts: string[]): string {
  const dataDir = mkdtempSync(join(tmpdir(), 'festi-data-'))
  mkdirSync(join(dataDir, 'test-fest'))
  writeFileSync(join(dataDir, 'test-fest', 'festival.yaml'), FESTIVAL_YAML)
  writeFileSync(join(dataDir, 'test-fest', 'acts.csv'), `${[HEADER, ...acts].join('\n')}\n`)
  return dataDir
}

const options = (dataDir: string, extra = {}) => ({
  slug: 'test-fest',
  dataDir,
  env: 'local' as const,
  dryRun: false,
  prune: false,
  ...extra,
})
const deps = (db: Db, answer = true) => {
  const log: string[] = []
  return { log, deps: { db, log: (line: string) => log.push(line), confirm: async () => answer } }
}

describe('readFestivalFolder (data-import FR-1)', () => {
  it('[TC-ALBI] reads the festival and the acts of edc-orlando-2025', () => {
    const { festival, acts } = readFestivalFolder('data', 'edc-orlando-2025')
    expect(festival.name).toBe('EDC Orlando 2025')
    expect(acts.length).toBeGreaterThan(100)
  })

  it('[TC-NM0K] names the missing acts.csv', () => {
    const empty = mkdtempSync(join(tmpdir(), 'festi-data-'))
    mkdirSync(join(empty, 'test-fest'))
    writeFileSync(join(empty, 'test-fest', 'festival.yaml'), FESTIVAL_YAML)
    expect(() => readFestivalFolder(empty, 'test-fest')).toThrow(/acts\.csv is missing/)
  })
})

describe('runImport (data-import FR-6 to FR-11)', () => {
  it('[TC-RW98] a dry run leaves the database unchanged and lists the changes', async () => {
    const memory = memoryDb()
    const { deps: d, log } = deps(memory.db)
    await runImport(options(folder(['Diplo,Friday,Main,,,,,,,']), { dryRun: true }), d)
    expect(memory.acts).toHaveLength(0)
    expect(memory.festivals.size).toBe(0)
    expect(log.join('\n')).toContain('+ add     Diplo (Friday)')
  })

  it('[TC-5F2P] a changed stage keeps the act, so its rating stays', async () => {
    const memory = memoryDb()
    await runImport(options(folder(['Diplo,Friday,Main,,,,,,,'])), deps(memory.db).deps)
    const idBefore = memory.acts[0].id
    const ratings = new Set([idBefore])
    await runImport(options(folder(['Diplo,Friday,Side,,,,,,,'])), deps(memory.db).deps)
    expect(memory.acts).toHaveLength(1)
    expect(memory.acts[0].stage).toBe('Side')
    expect(ratings.has(memory.acts[0].id)).toBe(true)
  })

  it('[TC-JHUG] keeps an act that the file does not have', async () => {
    const memory = memoryDb()
    await runImport(options(folder(['Diplo,Friday,,,,,,,,', 'Zedd,Friday,,,,,,,,'])), deps(memory.db).deps)
    const { deps: d, log } = deps(memory.db)
    await runImport(options(folder(['Diplo,Friday,,,,,,,,'])), d)
    expect(memory.acts.map((act) => act.artist).sort()).toEqual(['Diplo', 'Zedd'])
    expect(log.join('\n')).toContain('use --prune')
  })

  it('[TC-TE8O] --prune removes an act that the file does not have', async () => {
    const memory = memoryDb()
    await runImport(options(folder(['Diplo,Friday,,,,,,,,', 'Zedd,Friday,,,,,,,,'])), deps(memory.db).deps)
    await runImport(options(folder(['Diplo,Friday,,,,,,,,']), { prune: true }), deps(memory.db).deps)
    expect(memory.acts.map((act) => act.artist)).toEqual(['Diplo'])
  })

  it('[TC-0WA1] a write to production without a confirmation changes nothing', async () => {
    const memory = memoryDb()
    const result = await runImport(options(folder(['Diplo,Friday,,,,,,,,']), { env: 'prod' }), deps(memory.db, false).deps)
    expect(result.written).toBe(false)
    expect(memory.acts).toHaveLength(0)
    expect(memory.festivals.size).toBe(0)
  })

  it('[TC-0WA1] a write to production with a confirmation goes through', async () => {
    const memory = memoryDb()
    await runImport(options(folder(['Diplo,Friday,,,,,,,,']), { env: 'prod' }), deps(memory.db, true).deps)
    expect(memory.acts).toHaveLength(1)
  })

  it('[TC-JOHL] an import of an export reports no change', async () => {
    const memory = memoryDb()
    const source = folder(['Diplo,Friday,Main,21:30,60,House,EDM,"A, B",,', 'Zedd,Saturday,,,,,,,,'])
    await runImport(options(source), deps(memory.db).deps)

    const exported = mkdtempSync(join(tmpdir(), 'festi-data-'))
    await runExport({ slug: 'test-fest', dataDir: exported, env: 'local' }, deps(memory.db).deps)
    expect(parseActs(readFileSync(join(exported, 'test-fest', 'acts.csv'), 'utf8')).issues).toEqual([])
    expect(parseFestival(readFileSync(join(exported, 'test-fest', 'festival.yaml'), 'utf8')).issues).toEqual([])

    const { deps: d, log } = deps(memory.db)
    const result = await runImport(options(exported), d)
    expect(result).toMatchObject({ written: false, added: 0, changed: 0, removed: 0 })
    expect(log.join('\n')).toContain('No change.')
  })

  it('[TC-JOHL] the files in data/ import back with no change after an export', async () => {
    const memory = memoryDb()
    await runImport({ ...options('data'), slug: 'edc-orlando-2025' }, deps(memory.db).deps)
    const exported = mkdtempSync(join(tmpdir(), 'festi-data-'))
    await runExport({ slug: 'edc-orlando-2025', dataDir: exported, env: 'local' }, deps(memory.db).deps)
    expect(readFileSync(join(exported, 'edc-orlando-2025', 'acts.csv'), 'utf8')).toBe(readFileSync('data/edc-orlando-2025/acts.csv', 'utf8'))
  })

  it('[TC-ZYLF] stops on a bad file before it touches the database', async () => {
    const memory = memoryDb()
    await expect(runImport(options(folder(['Diplo,Friday,Main,0.9167,,,,,,'])), deps(memory.db).deps)).rejects.toBeInstanceOf(DataError)
    expect(memory.festivals.size).toBe(0)
  })
})
