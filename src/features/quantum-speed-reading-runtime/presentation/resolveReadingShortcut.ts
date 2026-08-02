export type ReadingShortcutAction = 'previous' | 'next' | 'exit-focus-mode'

export type ReadingKeyEvent = {
  key: string
  metaKey: boolean
  ctrlKey: boolean
  altKey: boolean
}

// Quantum Speed Reading™ Production Sprint-3. Pure. Maps a real keyboard
// event's real fields to at most one real reading action — never fires
// with any modifier key held (avoids hijacking a browser/OS shortcut
// that happens to share a key), and only recognizes the exact keys this
// sprint names: ← previous, → / Space next, Esc exit Focus Mode. Every
// other key resolves to `null`, a real, honest "no shortcut here" —
// never a fallback guess.
export function resolveReadingShortcut(event: ReadingKeyEvent): ReadingShortcutAction | null {
  if (event.metaKey || event.ctrlKey || event.altKey) return null

  switch (event.key) {
    case 'ArrowLeft':
      return 'previous'
    case 'ArrowRight':
    case ' ':
      return 'next'
    case 'Escape':
      return 'exit-focus-mode'
    default:
      return null
  }
}
