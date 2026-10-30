import { ACT_COLUMNS, type ActRow, actKey, type FestivalRow } from './files.ts'

export interface ActChange {
  before: ActRow
  after: ActRow
  fields: string[]
}

export interface ActDiff {
  add: ActRow[]
  change: ActChange[]
  missing: ActRow[]
  same: number
}

export function diffActs(existing: ActRow[], incoming: ActRow[]): ActDiff {
  const byKey = new Map(existing.map((act) => [actKey(act), act]))
  const diff: ActDiff = { add: [], change: [], missing: [], same: 0 }
  for (const after of incoming) {
    const before = byKey.get(actKey(after))
    byKey.delete(actKey(after))
    if (!before) {
      diff.add.push(after)
      continue
    }
    const fields = ACT_COLUMNS.filter((column) => before[column] !== after[column])
    if (fields.length > 0) diff.change.push({ before, after, fields })
    else diff.same++
  }
  diff.missing = [...byKey.values()]
  return diff
}

export function diffFestival(existing: FestivalRow | null, incoming: FestivalRow): string[] {
  if (!existing) return ['new festival']
  return (Object.keys(incoming) as (keyof FestivalRow)[]).filter((key) => existing[key] !== incoming[key])
}

export function formatDiff(festivalFields: string[], diff: ActDiff, prune: boolean): string {
  const lines: string[] = []
  if (festivalFields.length > 0) lines.push(`festival: ${festivalFields.join(', ')}`)
  for (const act of diff.add) lines.push(`+ add     ${act.artist} (${act.day})`)
  for (const { after, fields } of diff.change) {
    lines.push(`~ change  ${after.artist} (${after.day}): ${fields.join(', ')}`)
  }
  for (const act of diff.missing) {
    lines.push(`${prune ? '- remove ' : '? missing'} ${act.artist} (${act.day})${prune ? '' : ' (kept, use --prune to remove)'}`)
  }
  lines.push(
    `${diff.add.length} to add, ${diff.change.length} to change, ${diff.same} unchanged, ` +
      `${diff.missing.length} ${prune ? 'to remove' : 'missing from the file'}`,
  )
  return lines.join('\n')
}

export function hasChanges(festivalFields: string[], diff: ActDiff, prune: boolean): boolean {
  return (
    festivalFields.length > 0 || diff.add.length > 0 || diff.change.length > 0 || (prune && diff.missing.length > 0)
  )
}
