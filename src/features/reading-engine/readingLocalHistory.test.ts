import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { loadBestWpm, recordBestWpmSession } from './readingLocalHistory'

// This suite's default vitest environment is 'node' (see vitest.config.ts),
// so `window`/`localStorage` don't exist unless stubbed — same approach as
// readingPreferences.test.ts.
function createMemoryStorage(): Storage {
  const store = new Map<string, string>()
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => {
      store.clear()
    },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size
    },
  }
}

beforeEach(() => {
  vi.stubGlobal('window', {})
  vi.stubGlobal('localStorage', createMemoryStorage())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('loadBestWpm', () => {
  it('returns 0 when nothing is stored', () => {
    expect(loadBestWpm('test-key')).toBe(0)
  })

  it('falls back to 0 for corrupted storage', () => {
    localStorage.setItem('test-key', '{not-json')
    expect(loadBestWpm('test-key')).toBe(0)
  })

  it('falls back to 0 for a negative or non-numeric bestWpm', () => {
    localStorage.setItem('test-key', JSON.stringify({ bestWpm: -5 }))
    expect(loadBestWpm('test-key')).toBe(0)
    localStorage.setItem('test-key', JSON.stringify({ bestWpm: 'fast' }))
    expect(loadBestWpm('test-key')).toBe(0)
  })

  it('returns 0 when window is unavailable (SSR)', () => {
    vi.unstubAllGlobals()
    expect(loadBestWpm('test-key')).toBe(0)
  })
})

describe('recordBestWpmSession', () => {
  it('records the first session as the best', () => {
    expect(recordBestWpmSession('test-key', 250)).toBe(250)
    expect(loadBestWpm('test-key')).toBe(250)
  })

  it('keeps the higher of two sessions', () => {
    recordBestWpmSession('test-key', 250)
    expect(recordBestWpmSession('test-key', 180)).toBe(250)
    expect(recordBestWpmSession('test-key', 400)).toBe(400)
    expect(loadBestWpm('test-key')).toBe(400)
  })

  it('keeps separate keys independent', () => {
    recordBestWpmSession('mode-a', 300)
    recordBestWpmSession('mode-b', 150)
    expect(loadBestWpm('mode-a')).toBe(300)
    expect(loadBestWpm('mode-b')).toBe(150)
  })
})
