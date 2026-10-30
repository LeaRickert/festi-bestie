import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { diffActs, diffFestival, formatDiff, hasChanges } from './diff.ts'
import {
  type ActRow,
  type FestivalRow,
  formatIssue,
  parseActs,
  parseFestival,
  serializeActs,
  serializeFestival,
} from './files.ts'

export interface Db {
  getFestival(slug: string): Promise<{ id: string; festival: FestivalRow } | null>
  listActs(festivalId: string): Promise<ActRow[]>
  upsertFestival(slug: string, festival: FestivalRow): Promise<string>
  upsertActs(festivalId: string, acts: ActRow[]): Promise<void>
  deleteActs(festivalId: string, acts: Pick<ActRow, 'artist' | 'day'>[]): Promise<void>
}

export type Env = 'local' | 'prod'

export interface ImportOptions {
  slug: string
  dataDir: string
  env: Env
  dryRun: boolean
  prune: boolean
}

export interface Deps {
  db: Db
  log: (line: string) => void
  // Asks the user to confirm a write to production.
  confirm: (question: string) => Promise<boolean>
}

export class DataError extends Error {}

function readFile(dir: string, name: string): string {
  const path = join(dir, name)
  if (!existsSync(path)) throw new DataError(`${path} is missing`)
  return readFileSync(path, 'utf8')
}

export function readFestivalFolder(dataDir: string, slug: string): { festival: FestivalRow; acts: ActRow[] } {
  const dir = join(dataDir, slug)
  if (!existsSync(dir)) throw new DataError(`${dir} does not exist`)
  const festivalResult = parseFestival(readFile(dir, 'festival.yaml'))
  const actsResult = parseActs(readFile(dir, 'acts.csv'))
  const issues = [...festivalResult.issues, ...actsResult.issues]
  if (issues.length > 0 || !festivalResult.festival) {
    throw new DataError(`${slug} has ${issues.length} problem(s):\n${issues.map((i) => `  ${formatIssue(i)}`).join('\n')}`)
  }
  return { festival: festivalResult.festival, acts: actsResult.acts }
}

export interface ImportResult {
  written: boolean
  added: number
  changed: number
  removed: number
  missing: number
}

export async function runImport(options: ImportOptions, deps: Deps): Promise<ImportResult> {
  const { slug, env, dryRun, prune } = options
  const { festival, acts } = readFestivalFolder(options.dataDir, slug)

  const existing = await deps.db.getFestival(slug)
  const existingActs = existing ? await deps.db.listActs(existing.id) : []
  const festivalFields = diffFestival(existing?.festival ?? null, festival)
  const diff = diffActs(existingActs, acts)

  deps.log(`${dryRun ? 'Dry run: ' : ''}${slug} on ${env}`)
  deps.log(formatDiff(festivalFields, diff, prune))

  const result: ImportResult = {
    written: false,
    added: diff.add.length,
    changed: diff.change.length,
    removed: prune ? diff.missing.length : 0,
    missing: prune ? 0 : diff.missing.length,
  }
  if (dryRun) return result
  if (!hasChanges(festivalFields, diff, prune)) {
    deps.log('No change.')
    return result
  }
  if (env === 'prod') {
    const removing = prune && diff.missing.length > 0 ? ' and remove acts with their ratings' : ''
    if (!(await deps.confirm(`Write ${slug} to PRODUCTION${removing}?`))) {
      deps.log('Not confirmed. The database is unchanged.')
      return { ...result, added: 0, changed: 0, removed: 0 }
    }
  }

  const festivalId = await deps.db.upsertFestival(slug, festival)
  await deps.db.upsertActs(festivalId, [...diff.add, ...diff.change.map((change) => change.after)])
  if (prune && diff.missing.length > 0) await deps.db.deleteActs(festivalId, diff.missing)
  deps.log('Done.')
  return { ...result, written: true }
}

export interface ExportOptions {
  slug: string
  dataDir: string
  env: Env
}

export async function runExport(options: ExportOptions, deps: Pick<Deps, 'db' | 'log'>): Promise<void> {
  const found = await deps.db.getFestival(options.slug)
  if (!found) throw new DataError(`No festival with the slug "${options.slug}" on ${options.env}`)
  const acts = await deps.db.listActs(found.id)
  const dir = join(options.dataDir, options.slug)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'festival.yaml'), serializeFestival(found.festival))
  writeFileSync(join(dir, 'acts.csv'), serializeActs(acts, found.festival.start_date))
  deps.log(`Wrote ${acts.length} acts to ${dir}`)
}
