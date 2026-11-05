// pre-push hook: keeps the branch and tag rules locally while the repository is private and GitHub
// cannot enforce them (.github/rulesets/), and scans what is about to leave the machine.
//   - main changes only through pull requests: no direct push, no deletion;
//   - a release tag (v*) is never moved or deleted once pushed;
//   - pushed commits carry no secrets or personal details in messages or author emails.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const ZERO = /^0+$/
const problems: string[] = []

for (const line of readFileSync(0, 'utf8').split('\n').filter(Boolean)) {
  const [localRef, localSha, remoteRef, remoteSha] = line.split(' ')
  const deleting = ZERO.test(localSha)
  if (remoteRef === 'refs/heads/main') {
    problems.push(deleting ? 'main cannot be deleted.' : 'main changes only through a pull request: push a branch instead.')
  }
  if (remoteRef.startsWith('refs/tags/v') && !ZERO.test(remoteSha)) {
    problems.push(`${remoteRef} is already published; release tags are never moved or deleted. Tag a new version.`)
  }
  if (!deleting && localRef.startsWith('refs/heads/')) {
    try {
      execFileSync(process.execPath, ['tools/check-sensitive.ts', 'commits', ZERO.test(remoteSha) ? 'origin/main' : remoteSha, localSha], {
        stdio: 'inherit'
      })
    } catch {
      problems.push(`commits on ${localRef} carry sensitive text (see above).`)
    }
  }
}

if (problems.length > 0) {
  console.error(problems.map((problem) => `pre-push: ${problem}`).join('\n'))
  process.exit(1)
}
