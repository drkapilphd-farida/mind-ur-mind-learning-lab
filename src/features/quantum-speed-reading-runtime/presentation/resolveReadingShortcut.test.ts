import { describe, expect, it } from 'vitest'
import { resolveReadingShortcut } from './resolveReadingShortcut'

function key(key: string, modifiers: Partial<{ metaKey: boolean; ctrlKey: boolean; altKey: boolean }> = {}): Parameters<typeof resolveReadingShortcut>[0] {
  return { key, metaKey: false, ctrlKey: false, altKey: false, ...modifiers }
}

describe('resolveReadingShortcut', () => {
  it('maps the real named keys to their real actions', () => {
    expect(resolveReadingShortcut(key('ArrowLeft'))).toBe('previous')
    expect(resolveReadingShortcut(key('ArrowRight'))).toBe('next')
    expect(resolveReadingShortcut(key(' '))).toBe('next')
    expect(resolveReadingShortcut(key('Escape'))).toBe('exit-focus-mode')
  })

  it('returns null, honestly, for any unrecognized key', () => {
    expect(resolveReadingShortcut(key('a'))).toBeNull()
    expect(resolveReadingShortcut(key('Enter'))).toBeNull()
    expect(resolveReadingShortcut(key('Tab'))).toBeNull()
  })

  it('never fires while any modifier key is held, to avoid hijacking a browser/OS shortcut', () => {
    expect(resolveReadingShortcut(key('ArrowLeft', { metaKey: true }))).toBeNull()
    expect(resolveReadingShortcut(key('ArrowRight', { ctrlKey: true }))).toBeNull()
    expect(resolveReadingShortcut(key(' ', { altKey: true }))).toBeNull()
  })
})
