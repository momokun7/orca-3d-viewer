// Finds secrets and personal details that must not land in this public repository: in commit
// messages, author emails, pull request text and tracked files. The git hooks and CI share it.
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

export type Finding = { kind: string; match: string; line: number }

type Rule = { kind: string; pattern: RegExp; allow?: (match: string) => boolean }

const ALLOWED_EMAIL_DOMAINS = /@(users\.noreply\.github\.com|example\.(com|org|net)|[\w-]+\.(test|invalid|example))$/i
// GitHub commits squash merges and branch updates as noreply@, and Dependabot signs off as support@.
const GITHUB_COMMITTER = /^(noreply|support)@github\.com$/i
const PLACEHOLDER_USERS = /^(<[^>]*>|\{[^}]*\}|%[^%]*%|\$\w+|you|me|user|username|name|victim|runner|public|default)$/i

const RULES: Rule[] = [
  { kind: 'GitHub token', pattern: /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{22,})/g },
  { kind: 'AWS access key', pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g },
  { kind: 'Google API key', pattern: /\bAIza[0-9A-Za-z_-]{35}/g },
  { kind: 'Slack token', pattern: /\bxox[abprs]-[A-Za-z0-9-]{10,}/g },
  { kind: 'API secret key', pattern: /\bsk-(?:ant-|proj-)?[A-Za-z0-9_-]{20,}/g },
  { kind: 'npm token', pattern: /\bnpm_[A-Za-z0-9]{36}\b/g },
  { kind: 'private key', pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g },
  { kind: 'JSON Web Token', pattern: /\beyJ[\w-]{10,}\.eyJ[\w-]{10,}\.[\w-]{10,}/g },
  {
    kind: 'email address',
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    allow: (match) => ALLOWED_EMAIL_DOMAINS.test(match) || GITHUB_COMMITTER.test(match)
  },
  {
    kind: 'home directory path',
    pattern: /\b[A-Za-z]:[\\/]+Users[\\/]+([^\\/\s"'`<>]+)|(?:^|[\s"'`(=])\/(?:Users|home)\/([^/\s"'`<>]+)/gim,
    allow: (match) => PLACEHOLDER_USERS.test(match.replace(/^.*(?:Users|home)[\\/]+/i, ''))
  },
  {
    kind: 'private network address',
    pattern: /\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})\b/g
  }
]

/** Words that are private to the maintainer (a company, a client, a codename), read from outside the repo. */
export function privateWords(gitDir: string | null): string[] {
  const words = (process.env.SENSITIVE_WORDS ?? '').split(/[\n,]/)
  const file = gitDir ? path.join(gitDir, 'info', 'sensitive-words') : null
  if (file && existsSync(file)) {
    words.push(...readFileSync(file, 'utf8').split('\n'))
  }
  return [...new Set(words.map((word) => word.trim()).filter((word) => word.length >= 3 && !word.startsWith('#')))]
}

export function findSensitive(text: string, words: string[] = []): Finding[] {
  const findings: Finding[] = []
  const lineOf = (index: number): number => text.slice(0, index).split('\n').length
  for (const rule of RULES) {
    for (const match of text.matchAll(rule.pattern)) {
      const value = match[0].trim()
      if (!rule.allow?.(value)) {
        findings.push({ kind: rule.kind, match: value, line: lineOf(match.index) })
      }
    }
  }
  const lower = text.toLowerCase()
  for (const word of words) {
    for (let at = lower.indexOf(word.toLowerCase()); at !== -1; at = lower.indexOf(word.toLowerCase(), at + 1)) {
      // Why masked: CI logs are public once the repository is, and the word itself is the secret.
      findings.push({ kind: 'private word', match: `${word.slice(0, 1)}${'*'.repeat(word.length - 1)}`, line: lineOf(at) })
    }
  }
  return findings
}

/**
 * The text of a file to scan. A binary file (one with a NUL byte), such as an image, yields only its
 * runs of 16 or more printable ASCII characters, like `strings -n 16`: embedded metadata stays
 * covered, while compressed pixels, which form short look-alikes by chance, do not.
 */
export function scannableText(bytes: Uint8Array): string {
  if (!bytes.includes(0)) return new TextDecoder().decode(bytes)
  return (new TextDecoder('latin1').decode(bytes).match(/[\x20-\x7e\t]{16,}/g) ?? []).join('\n')
}

export function formatFindings(source: string, findings: Finding[]): string {
  return findings.map(({ kind, match, line }) => `${source}:${line}: ${kind}: ${match}`).join('\n')
}
