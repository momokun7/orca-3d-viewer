// Merges origin/main into the current branch and rebuilds editor/ and THIRD_PARTY_NOTICES.txt, so
// their conflicts settle on what the merged sources build: `mise run sync-main`. Conflicts in any
// other file stop it with the merge left in progress, to resolve and run again. It never pushes.
import { execFileSync, execSync } from 'node:child_process'
import path from 'node:path'

const ROOT = path.join(import.meta.dirname, '..')
const BUILD = path.join(ROOT, 'build')
const GENERATED = ['editor', 'THIRD_PARTY_NOTICES.txt']

const git = (...args: string[]): string => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' })
const lines = (text: string): string[] => text.split('\n').filter(Boolean)
// Why a command line: npm is a .cmd script on Windows, which Node runs only through a shell.
const npm = (command: string): void => {
  execSync(`npm ${command}`, { cwd: BUILD, stdio: 'inherit' })
}
const isGenerated = (file: string): boolean => GENERATED.some((entry) => file === entry || file.startsWith(`${entry}/`))

// Why: a run stopped by a source conflict is picked up again once those files are resolved.
const hasMerge = (): boolean => {
  try {
    git('rev-parse', '-q', '--verify', 'MERGE_HEAD')
    return true
  } catch {
    return false
  }
}
const resuming = hasMerge()
if (!resuming && git('status', '--porcelain') !== '') {
  console.error('Commit or stash your changes first.')
  process.exit(1)
}
const before = git('rev-parse', 'HEAD').trim()
let conflicted = resuming
if (!resuming) {
  git('fetch', 'origin', 'main')
  try {
    git('merge', '--no-edit', 'origin/main')
  } catch (error) {
    if (!hasMerge()) throw error
    conflicted = true
  }
}

const sources = lines(git('diff', '--name-only', '--diff-filter=U')).filter((file) => !isGenerated(file))
if (sources.length > 0) {
  console.error(`Resolve these by hand and stage them, then run this again:\n  ${sources.join('\n  ')}`)
  process.exit(1)
}

const merged = conflicted ? 'MERGE_HEAD' : 'HEAD'
if (lines(git('diff', '--name-only', before, merged, '--', 'build/package-lock.json')).length > 0) npm('ci --ignore-scripts')
npm('run build')
git('add', '-A', '--', ...GENERATED)
if (conflicted) git('commit', '--no-edit')
else if (git('status', '--porcelain', '--', ...GENERATED) !== '') git('commit', '-m', 'Rebuild editor/ after merging main')
if (git('rev-parse', 'HEAD').trim() === before) console.log('Already up to date with origin/main, and editor/ matches the sources.')
else console.log(`Merged origin/main and rebuilt ${GENERATED.join(' and ')}. Check with \`mise run check\`, then push.`)
