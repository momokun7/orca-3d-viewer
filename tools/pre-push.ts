// pre-push hook: keeps the branch and tag rules locally while the repository is private and GitHub
// cannot enforce them (.github/rulesets/), and scans what is about to leave the machine.
//   - main changes only through pull requests: no direct push, no deletion;
//   - a release tag (v*) is never moved or deleted once pushed;
//   - pushed commits, and annotated tag messages, carry no secrets or personal details.
// git runs it with the remote's name and URL as arguments and one line per ref on stdin.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { findSensitive, formatFindings, privateWords } from './sensitive-text.ts'

const ZERO = /^0+$/
const remote = process.argv[2] ?? 'origin'
const problems: string[] = []
const git = (...args: string[]): string => execFileSync('git', args, { encoding: 'utf8' })
const words = privateWords(git('rev-parse', '--absolute-git-dir').trim())

function scan(source: string, text: string): void {
  const findings = findSensitive(text, words)
  if (findings.length > 0) problems.push(`sensitive text:\n${formatFindings(source, findings)}`)
}

/** Commits this push sends that the remote does not have yet. */
function newCommits(localSha: string, remoteSha: string): string[] {
  const exclude = ZERO.test(remoteSha) ? ['--not', `--remotes=${remote}`] : [`^${remoteSha}`]
  return git('rev-list', localSha, ...exclude).split('\n').filter(Boolean)
}

for (const line of readFileSync(0, 'utf8').split('\n').filter(Boolean)) {
  const [localRef, localSha, remoteRef, remoteSha] = line.split(' ')
  const deleting = ZERO.test(localSha)
  if (remoteRef === 'refs/heads/main') {
    problems.push(deleting ? 'main cannot be deleted.' : 'main changes only through a pull request: push a branch instead.')
  }
  if (remoteRef.startsWith('refs/tags/v') && !ZERO.test(remoteSha)) {
    problems.push(`${remoteRef} is already published; release tags are never moved or deleted. Tag a new version.`)
  }
  if (deleting) continue
  try {
    if (git('cat-file', '-t', localSha).trim() === 'tag') {
      scan(`tag ${localRef}`, git('cat-file', 'tag', localSha))
    }
    for (const sha of newCommits(localSha, remoteSha)) {
      scan(`commit ${sha.slice(0, 12)}`, git('show', '-s', '--format=%an <%ae>%n%cn <%ce>%n%B', sha))
    }
  } catch (error) {
    problems.push(`could not list what ${localRef} sends, so it was not scanned: ${String(error).split('\n')[0]}`)
  }
}

if (problems.length > 0) {
  console.error(problems.map((problem) => `pre-push: ${problem}`).join('\n'))
  process.exit(1)
}
