import assert from 'node:assert/strict'
import { type ConsoleLine, type FrameReport, PARSE_FAILURE_LOG } from './harness.ts'

// Lines three.js itself prints about a model it is given (bad tracks, failed decodes). Fuzzed and
// malformed models are expected to cause them; ordinary models are not.
const THREE_LOG = /^(Error: )?THREE\./

// An exception of these kinds inside a "could not parse" line is a bug in the viewer, not a bad file.
const VIEWER_BUG = /\b(TypeError|ReferenceError|SyntaxError: (?!.*JSON))/

type Allowances = {
  /** The viewer may refuse the file. */
  allowParseFailure?: boolean
  /** three.js may complain about the model. */
  allowThreeLogs?: boolean
}

function unexpectedConsole(lines: ConsoleLine[], { allowParseFailure, allowThreeLogs }: Allowances): string[] {
  return lines
    .filter(({ text }) => {
      if (text.startsWith(PARSE_FAILURE_LOG)) return !allowParseFailure || VIEWER_BUG.test(text)
      if (THREE_LOG.test(text)) return !allowThreeLogs
      return true
    })
    .map(({ type, text }) => `${type}: ${text.slice(0, 400)}`)
}

/** The frame stayed inside Orca's sandbox: no egress, no CSP violation, no host call, no crash or stray log. */
export function assertContained(report: FrameReport, allowances: Allowances = {}): void {
  assert.deepEqual(report.egress, [], 'the frame tried to reach the network')
  assert.deepEqual(report.cspViolations, [], 'the frame violated Orca’s content security policy')
  assert.deepEqual(report.hostCalls, [], 'a read-only viewer must not call Orca beyond reading the document')
  assert.deepEqual(report.pageErrors, [], 'the frame threw an uncaught error')
  assert.deepEqual(unexpectedConsole(report.console, allowances), [], 'the frame logged something unexpected')
}
