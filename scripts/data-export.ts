// Usage: npm run data:export -- <slug> [--env local|prod]
import { parseArgs } from 'node:util'
import { DataError, type Env, runExport } from './data/run.ts'
import { createSupabaseDb } from './data/supabaseDb.ts'

try {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { env: { type: 'string', default: 'local' } },
  })
  const [slug] = positionals
  if (!slug || (values.env !== 'local' && values.env !== 'prod')) {
    throw new DataError('Usage: npm run data:export -- <slug> [--env local|prod]')
  }
  const env = values.env as Env
  await runExport({ slug, env, dataDir: 'data' }, { db: createSupabaseDb(env), log: console.log })
} catch (error) {
  console.error(error instanceof DataError ? error.message : error)
  process.exit(1)
}
