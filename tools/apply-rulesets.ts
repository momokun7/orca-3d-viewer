// Creates or updates the GitHub rulesets in .github/rulesets/ on this repository, matched by name.
// GitHub enforces rulesets only on public repositories (or with GitHub Pro); run it once the
// repository is public: `mise run rulesets`. Until then .githooks/pre-push keeps the same rules.
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

const DIR = path.join(import.meta.dirname, '..', '.github', 'rulesets')
const gh = (...args: string[]): string => execFileSync('gh', args, { encoding: 'utf8' })

const repo = gh('repo', 'view', '--json', 'nameWithOwner', '-q', '.nameWithOwner').trim()
const existing: { id: number; name: string }[] = JSON.parse(gh('api', `repos/${repo}/rulesets`))

for (const file of readdirSync(DIR).filter((name) => name.endsWith('.json'))) {
  const ruleset = JSON.parse(readFileSync(path.join(DIR, file), 'utf8'))
  const current = existing.find((entry) => entry.name === ruleset.name)
  const [method, endpoint] = current
    ? ['PUT', `repos/${repo}/rulesets/${current.id}`]
    : ['POST', `repos/${repo}/rulesets`]
  gh('api', '--method', method, endpoint, '--input', path.join(DIR, file))
  console.log(`${current ? 'updated' : 'created'} ruleset "${ruleset.name}" from ${file}`)
}
