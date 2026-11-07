// Creates or updates the labels in .github/labels.json on this repository, matched by name, and
// lists labels that the file does not know about (it never deletes them): `mise run labels`.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'

type Label = { name: string; color: string; description: string }

const FILE = path.join(import.meta.dirname, '..', '.github', 'labels.json')
const gh = (...args: string[]): string => execFileSync('gh', args, { encoding: 'utf8' })

const repo = gh('repo', 'view', '--json', 'nameWithOwner', '-q', '.nameWithOwner').trim()
const wanted: Label[] = JSON.parse(readFileSync(FILE, 'utf8'))
const existing: Label[] = JSON.parse(gh('label', 'list', '-R', repo, '--limit', '200', '--json', 'name,color,description'))

for (const label of wanted) {
  const current = existing.find((entry) => entry.name.toLowerCase() === label.name.toLowerCase())
  if (current && current.color.toLowerCase() === label.color && current.description === label.description) continue
  gh('label', 'create', label.name, '-R', repo, '--color', label.color, '--description', label.description, '--force')
  console.log(`${current ? 'updated' : 'created'} label "${label.name}"`)
}
const unknown = existing.filter((entry) => !wanted.some((label) => label.name.toLowerCase() === entry.name.toLowerCase()))
if (unknown.length > 0) console.log(`not in labels.json (left as they are): ${unknown.map((entry) => entry.name).join(', ')}`)
