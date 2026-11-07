// The toolbar's last choices, kept in the frame's own localStorage: Orca gives each plugin its own,
// on disk and cleared on uninstall. Older Orca frames refuse storage, and then nothing is kept.

export type ViewerPreferences = { dark: boolean; wireframe: boolean; guides: boolean }

const KEY = 'viewer-preferences'
export const DEFAULT_PREFERENCES: ViewerPreferences = { dark: false, wireframe: false, guides: true }

export function loadPreferences(): ViewerPreferences {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    if (typeof stored !== 'object' || stored === null) return { ...DEFAULT_PREFERENCES }
    const flag = (name: keyof ViewerPreferences): boolean => {
      const value = Object.getOwnPropertyDescriptor(stored, name)?.value
      return typeof value === 'boolean' ? value : DEFAULT_PREFERENCES[name]
    }
    return { dark: flag('dark'), wireframe: flag('wireframe'), guides: flag('guides') }
  } catch {
    return { ...DEFAULT_PREFERENCES }
  }
}

export function savePreferences(preferences: ViewerPreferences): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(preferences))
  } catch {
    // Storage refused or full: the choice still holds until the viewer closes.
  }
}
