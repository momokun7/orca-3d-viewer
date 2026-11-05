/** A BCP-47 tag Intl can format with, from whatever Orca or the OS reports; English when it cannot. */
export function resolveLocale(...candidates: (string | undefined)[]): string {
  for (const candidate of candidates) {
    if (!candidate) continue
    try {
      const [supported] = Intl.NumberFormat.supportedLocalesOf(candidate.replace(/_/g, '-'))
      if (supported) return supported
    } catch {
      // Why: a malformed tag throws RangeError; try the next candidate.
    }
  }
  return 'en'
}
