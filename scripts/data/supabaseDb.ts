import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import type { ActRow, FestivalRow } from './files.ts'
import { DataError, type Db, type Env } from './run.ts'

const ACT_FIELDS =
  'artist, day, stage, start_time, length_minutes, genre, category, special_notes, youtube_video_id, youtube_title'
const FESTIVAL_FIELDS = 'name, start_date, end_date, location, description, status'

function readEnvFile(path: string): Record<string, string> {
  if (!existsSync(path)) return {}
  const values: Record<string, string> = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/)
    if (match) values[match[1]] = match[2].replace(/^["']|["']$/g, '')
  }
  return values
}

// `prod` needs .env.data.prod.local. `local` uses .env.data.local, or asks the
// running local Supabase stack. Both files are ignored by git.
export function connectionFor(env: Env): { url: string; key: string } {
  const file = readEnvFile(env === 'prod' ? '.env.data.prod.local' : '.env.data.local')
  let url = file.SUPABASE_URL
  let key = file.SUPABASE_SECRET_KEY
  if (!url || !key) {
    if (env === 'prod') {
      throw new DataError('Set SUPABASE_URL and SUPABASE_SECRET_KEY in .env.data.prod.local')
    }
    try {
      const status = JSON.parse(execFileSync('npx', ['supabase', 'status', '-o', 'json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }))
      url = status.API_URL
      key = status.SECRET_KEY ?? status.SERVICE_ROLE_KEY
    } catch {
      throw new DataError('Start the local database (npx supabase start), or set SUPABASE_URL and SUPABASE_SECRET_KEY in .env.data.local')
    }
  }
  return { url, key }
}

export function createSupabaseDb(env: Env): Db {
  const { url, key } = connectionFor(env)
  const client = createClient(url, key, { auth: { persistSession: false } })
  const fail = (what: string, error: { message: string }): never => {
    throw new DataError(`${what}: ${error.message}`)
  }

  return {
    async getFestival(slug) {
      const { data, error } = await client.from('festivals').select(`id, ${FESTIVAL_FIELDS}`).eq('slug', slug).maybeSingle()
      if (error) fail('Could not read the festival', error)
      if (!data) return null
      const { id, ...festival } = data
      return { id, festival: festival as FestivalRow }
    },

    async listActs(festivalId) {
      const { data, error } = await client.from('acts').select(ACT_FIELDS).eq('festival_id', festivalId).range(0, 9999)
      if (error) fail('Could not read the acts', error)
      // The database returns TIME as HH:MM:SS.
      return (data ?? []).map((act) => ({ ...act, start_time: act.start_time?.slice(0, 5) ?? null })) as ActRow[]
    },

    async upsertFestival(slug, festival) {
      const { data, error } = await client
        .from('festivals')
        .upsert({ slug, ...festival }, { onConflict: 'slug' })
        .select('id')
        .single()
      if (error) return fail('Could not write the festival', error)
      return data.id as string
    },

    // The upsert keeps the act id, so the ratings stay.
    async upsertActs(festivalId, acts) {
      if (acts.length === 0) return
      const rows = acts.map((act) => ({ festival_id: festivalId, ...act }))
      const { error } = await client.from('acts').upsert(rows, { onConflict: 'festival_id,artist,day' })
      if (error) fail('Could not write the acts', error)
    },

    async deleteActs(festivalId, acts) {
      for (const act of acts) {
        const { error } = await client.from('acts').delete().eq('festival_id', festivalId).eq('artist', act.artist).eq('day', act.day)
        if (error) fail('Could not remove an act', error)
      }
    },
  }
}
