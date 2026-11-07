import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { findSensitive, scannableText } from '../../tools/sensitive-text.ts'

const kinds = (text: string, words?: string[]): string[] => findSensitive(text, words).map((finding) => finding.kind)

describe('findSensitive', () => {
  it('finds tokens and keys', () => {
    for (const [text, kind] of [
      [`token ghp_${'a'.repeat(36)}`, 'GitHub token'],
      [`github_pat_${'A1_'.repeat(10)}`, 'GitHub token'],
      ['AKIAIOSFODNN7EXAMPLE', 'AWS access key'],
      [`AIza${'b'.repeat(35)}`, 'Google API key'],
      ['xoxb-1234567890-abcdef', 'Slack token'],
      [`sk-ant-${'c'.repeat(30)}`, 'API secret key'],
      [`npm_${'d'.repeat(36)}`, 'npm token'],
      ['-----BEGIN OPENSSH PRIVATE KEY-----', 'private key'],
      [`eyJ${'e'.repeat(12)}.eyJ${'f'.repeat(12)}.${'g'.repeat(12)}`, 'JSON Web Token']
    ]) {
      assert.deepEqual(kinds(text), [kind], text)
    }
  })

  it('finds personal emails but allows GitHub noreply and reserved example domains', () => {
    assert.deepEqual(kinds('Signed-off-by: Jane <jane.doe@company.co.jp>'), ['email address'])
    assert.deepEqual(kinds('Jane <105904524+jane@users.noreply.github.com>'), [])
    assert.deepEqual(kinds('GitHub <noreply@github.com>'), [])
    assert.deepEqual(kinds('Signed-off-by: dependabot[bot] <support@github.com>'), [])
    assert.deepEqual(kinds('mallory <noreply@github.com.evil.example.org>'), ['email address'])
    assert.deepEqual(kinds('mail a@example.com or b@attacker.test'), [])
  })

  it('finds home directory paths on every platform but not placeholders', () => {
    assert.deepEqual(kinds('see C:\\Users\\jane\\Developer\\repo'), ['home directory path'])
    assert.deepEqual(kinds('see C:/Users/jane/repo'), ['home directory path'])
    assert.deepEqual(kinds('cd /Users/jane/repo'), ['home directory path'])
    assert.deepEqual(kinds('cd /home/jane/repo'), ['home directory path'])
    assert.deepEqual(kinds('C:\\Users\\<you>\\repo and /home/runner/work and ~/repo'), [])
  })

  it('finds private network addresses but not loopback or link-local ones', () => {
    assert.deepEqual(kinds('ssh 192.168.1.20 and 10.0.0.5 and 172.20.3.4'), [
      'private network address',
      'private network address',
      'private network address'
    ])
    assert.deepEqual(kinds('127.0.0.1 169.254.169.254 172.32.0.1'), [])
  })

  it('finds private words case-insensitively and masks them in the report', () => {
    const findings = findSensitive('Built for ACME Corp.\nacme rocks', ['acme'])
    assert.deepEqual(
      findings.map(({ kind, match, line }) => [kind, match, line]),
      [
        ['private word', 'a***', 1],
        ['private word', 'a***', 2]
      ]
    )
  })

  it('passes ordinary commit messages', () => {
    assert.deepEqual(kinds('Fix the grid size for models authored in centimeters\n\nRefs #12'), [])
  })
})

describe('scannableText', () => {
  const bytes = (text: string): Uint8Array => Uint8Array.from(text, (char) => char.charCodeAt(0))

  it('keeps a text file whole', () => {
    assert.equal(scannableText(new TextEncoder().encode('mail me at jane@company.co.jp')), 'mail me at jane@company.co.jp')
  })

  it('drops short look-alikes from binary data but keeps embedded metadata', () => {
    const image = bytes('GIF89a\0\x01\x02Mx@y.dm\0\x03<x:xmpmeta author="jane@company.co.jp"/>\0')
    assert.deepEqual(findSensitive(scannableText(image)).map((finding) => finding.match), ['jane@company.co.jp'])
  })
})
