// What decoders may still produce during the current parse. The budget is checked from headers before
// parsing; this checks what the decoders actually return, so a header that misstates its size, or an
// attribute layout the budget cannot see, still cannot leave more than the allowance on the page.

export class DecodeAllowanceError extends Error {
  constructor() {
    super('decoded data exceeds what the file declared')
    this.name = 'DecodeAllowanceError'
  }
}

let remaining = Number.POSITIVE_INFINITY
let spent = 0

/** Starts a parse with `bytes` of decoded output allowed. */
export function resetDecodeAllowance(bytes: number): void {
  remaining = bytes
  spent = 0
}

/** Decoded bytes counted since the parse started. */
export function decodedBytes(): number {
  return spent
}

/** Counts `bytes` of decoded output against the allowance; throws once it is spent. */
export function spendDecodeAllowance(bytes: number): void {
  remaining -= bytes
  spent += bytes
  if (remaining < 0) throw new DecodeAllowanceError()
}
