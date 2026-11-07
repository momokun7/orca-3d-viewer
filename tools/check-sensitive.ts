// Scans for secrets and personal details. Used by the git hooks and by CI:
//   node tools/check-sensitive.ts message <file>        a commit message (commit-msg hook)
//   node tools/check-sensitive.ts commits <base> <head> messages and author/committer emails in a range
//   node tools/check-sensitive.ts files                 every tracked file
//   node tools/check-sensitive.ts env <NAME>...         text in environment variables (PR title and body)
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { findSensitive, formatFindings, privateWords } from './sensitive-text.ts'

const git = (...args: string[]): string => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })
const gitDir = (() => {
  try {
    return git('rev-parse', '--absolute-git-dir').trim()
  } catch {
    return null
  }
})()
const words = privateWords(gitDir)

// Generated or vendored files whose contents are not ours to word, and the scanner's own test, whose
// samples are fake secrets by design.
const SKIPPED_FILES =
  /^(build\/package-lock\.json|editor\/.*\.(js|wasm)|THIRD_PARTY_NOTICES\.txt|build\/licenses\/.*|build\/test\/sensitive-text\.test\.ts)$/

const reports: string[] = []
const scan = (source: string, text: string): void => {
  const findings = findSensitive(text, words)
  if (findings.length > 0) reports.push(formatFindings(source, findings))
}

const [mode, ...args] = process.argv.slice(2)
switch (mode) {
  case 'message':
    scan('commit message', readFileSync(args[0], 'utf8').replace(/^#.*$/gm, ''))
    break
  case 'commits': {
    const [base, head] = args
    const range = /^0+$/.test(base) ? head : `${base}..${head}`
    for (const sha of git('rev-list', range).split('\n').filter(Boolean)) {
      scan(`commit ${sha.slice(0, 12)}`, git('show', '-s', '--format=%an <%ae>%n%cn <%ce>%n%B', sha))
    }
    break
  }
  case 'files':
    for (const file of git('ls-files', '-z').split('\0').filter(Boolean)) {
      if (!SKIPPED_FILES.test(file)) scan(file, readFileSync(file, 'utf8'))
    }
    break
  case 'env':
    for (const name of args) scan(name, process.env[name] ?? '')
    break
  default:
    console.error('usage: check-sensitive.ts message <file> | commits <base> <head> | files | env <NAME>...')
    process.exit(2)
}

if (reports.length > 0) {
  console.error(`Sensitive text found:\n${reports.join('\n')}`)
  console.error('Reword or remove it. A false positive belongs in tools/sensitive-text.ts, with a test.')
  process.exit(1)
}
