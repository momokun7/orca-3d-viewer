// Formats untrusted and numeric values for display: lengths with a fitting unit, byte counts, and
// file names a model supplies, which must neither flood the notice nor masquerade as other text.

const UNITS: [string, number][] = [
  ['km', 1000],
  ['m', 1],
  ['mm', 1e-3],
  ['µm', 1e-6],
  ['nm', 1e-9]
]

export type LengthFormat = { unit: string; format: (meters: number) => string }

/** One unit for a set of lengths in meters, chosen for the largest so the rest read beside it. */
export function lengthFormat(meters: number[], locale: string): LengthFormat {
  const largest = Math.max(...meters.map(Math.abs), 0)
  const fitting = UNITS.find(([, factor]) => largest >= factor) ?? UNITS[UNITS.length - 1]
  // Why 'km' only from 10 km, and m for nothing at all: buildings read better in meters, and 0 has no scale.
  const [unit, scale] = largest === 0 || (fitting[0] === 'km' && largest < 10_000) ? UNITS[1] : fitting
  const number = new Intl.NumberFormat(locale, { maximumSignificantDigits: 3 })
  return { unit, format: (value) => number.format(value / scale) }
}

export function formatCount(value: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(value)
}

export function formatBytes(bytes: number, locale: string): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let value = bytes
  let index = 0
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024
    index++
  }
  return `${new Intl.NumberFormat(locale, { maximumSignificantDigits: 3 }).format(value)} ${units[index]}`
}

// Controls (Cc), invisible formatting such as bidirectional overrides, zero-width characters and tags
// (Cf), and line or paragraph separators: they can reorder, hide or split the text around them.
const CONTROL_CHARACTERS = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/gu
export const MAX_NAME_CHARACTERS = 80
export const MAX_LISTED_NAMES = 3

/** A name from the model, stripped of control characters and cut to a readable length. */
export function cleanName(name: string): string {
  const clean = name.replace(CONTROL_CHARACTERS, '').trim()
  const characters = [...clean]
  return characters.length > MAX_NAME_CHARACTERS ? `${characters.slice(0, MAX_NAME_CHARACTERS - 1).join('')}…` : clean
}

/** A cleaned name, quoted so it reads as the model's text rather than the viewer's. */
export function displayName(name: string): string {
  return `“${cleanName(name)}”`
}

/** At most a few names, then how many more there are. */
export function nameList(
  names: string[],
  more: (list: string, count: number) => string
): string {
  const listed = names.slice(0, MAX_LISTED_NAMES).map(displayName).join(', ')
  return names.length > MAX_LISTED_NAMES ? more(listed, names.length - MAX_LISTED_NAMES) : listed
}
