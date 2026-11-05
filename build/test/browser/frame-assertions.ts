import assert from 'node:assert/strict'
import type { FrameReport } from './harness.ts'

// Errors logged when a model cannot be parsed: the viewer's own, and the one three.js' Draco
// worker prints before the viewer shows its message.
const PARSE_FAILURE_LOGS = ['glTF Viewer: could not parse the model', 'Error: THREE.DRACOLoader: Decoding failed']

/** The frame stayed inside Orca's sandbox: no egress, no CSP violation, no host call, no crash. */
export function assertContained(report: FrameReport, { allowParseFailure = false } = {}): void {
  assert.deepEqual(report.egress, [], 'the frame tried to reach the network')
  assert.deepEqual(report.cspViolations, [], 'the frame violated Orca’s content security policy')
  assert.deepEqual(report.hostCalls, [], 'a read-only viewer must not call Orca beyond reading the document')
  assert.deepEqual(report.pageErrors, [], 'the frame threw an uncaught error')
  const consoleErrors = allowParseFailure
    ? report.consoleErrors.filter((line) => !PARSE_FAILURE_LOGS.some((log) => line.startsWith(log)))
    : report.consoleErrors
  assert.deepEqual(consoleErrors, [], 'the frame logged an unexpected error')
}
