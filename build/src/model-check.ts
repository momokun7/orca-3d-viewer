import type { GltfModelData } from './gltf-document-inspection.ts'
import { ParseAbortedError, ParseTimeoutError } from './gltf-model-parse.ts'
import type { ModelCheck } from './model-refusal.ts'

// Set by build.mjs to the bundled model-check-worker.ts.
declare const MODEL_CHECK_WORKER_SOURCE: string

// Well past the budget's own deadline (BUDGET.checkMilliseconds), which ends a slow check first.
export const CHECK_TIMEOUT_MS = 15_000

let workerUrl: string | null = null

export class ModelCheckError extends Error {
  constructor(reason: string) {
    super(`model check failed: ${reason}`)
    this.name = 'ModelCheckError'
  }
}

/**
 * Runs checkModel in a fresh worker, so a check that never returns can be stopped and cannot freeze
 * the page. The worker ends with the check: on its answer, after `timeoutMs`, or when `signal` aborts.
 */
export function checkModelOffThread(
  data: GltfModelData,
  { timeoutMs = CHECK_TIMEOUT_MS, signal }: { timeoutMs?: number; signal?: AbortSignal } = {}
): Promise<ModelCheck> {
  if (signal?.aborted) return Promise.reject(new ParseAbortedError())
  workerUrl ??= URL.createObjectURL(new Blob([MODEL_CHECK_WORKER_SOURCE], { type: 'text/javascript' }))
  const worker = new Worker(workerUrl)
  return new Promise<ModelCheck>((resolve, reject) => {
    const settle = (): void => {
      worker.terminate()
      clearTimeout(timer)
      signal?.removeEventListener('abort', onAbort)
    }
    const onAbort = (): void => {
      settle()
      reject(new ParseAbortedError())
    }
    const timer = setTimeout(() => {
      settle()
      reject(new ParseTimeoutError(timeoutMs))
    }, timeoutMs)
    signal?.addEventListener('abort', onAbort, { once: true })
    worker.onmessage = (event: MessageEvent<ModelCheck | { failed: string }>) => {
      settle()
      if ('failed' in event.data) reject(new ModelCheckError(event.data.failed))
      else resolve(event.data)
    }
    worker.onerror = (event) => {
      settle()
      reject(new ModelCheckError(event.message || 'the worker stopped'))
    }
    worker.postMessage(data)
  })
}
