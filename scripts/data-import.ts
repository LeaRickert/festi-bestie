// Usage: npm run data:import -- <slug> [--env local|prod] [--dry-run] [--prune]
import { createInterface } from 'node:readline/promises'
import { parseArgs } from 'node:util'
import { DataError, type Env, runImport } from './data/run.ts'
import { createSupabaseDb } from './data/supabaseDb.ts'

async function confirm(question: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const answer = await rl.question(`${question} Type "yes" to continue: `)
  rl.close()
  return answer.trim().toLowerCase() === 'yes'
}

try {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      env: { type: 'string', default: 'local' },
      'dry-run': { type: 'boolean', default: false },
      prune: { type: 'boolean', default: false },
    },
  })
  const [slug] = positionals
  if (!slug || (values.env !== 'local' && values.env !== 'prod')) {
    throw new DataError('Usage: npm run data:import -- <slug> [--env local|prod] [--dry-run] [--prune]')
  }
  const env = values.env as Env
  await runImport(
    { slug, env, dataDir: 'data', dryRun: values['dry-run'], prune: values.prune },
    { db: createSupabaseDb(env), log: console.log, confirm },
  )
} catch (error) {
  console.error(error instanceof DataError ? error.message : error)
  process.exit(1)
}
