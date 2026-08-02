import { describe, expect, it } from 'vitest'
import { mergeConfigurationEntries } from './mergeConfigurationEntries'

describe('mergeConfigurationEntries', () => {
  it('returns an empty array when given no layers', () => {
    expect(mergeConfigurationEntries()).toEqual([])
  })

  it('merges disjoint keys from multiple layers', () => {
    const result = mergeConfigurationEntries([{ key: 'a', value: 1 }], [{ key: 'b', value: 2 }])
    expect(result).toEqual([
      { key: 'a', value: 1 },
      { key: 'b', value: 2 },
    ])
  })

  it('later layers override earlier layers for the same key', () => {
    const result = mergeConfigurationEntries([{ key: 'a', value: 1 }], [{ key: 'a', value: 2 }])
    expect(result).toEqual([{ key: 'a', value: 2 }])
  })

  it('deduplicates within a single layer, keeping the last occurrence', () => {
    const result = mergeConfigurationEntries([
      { key: 'a', value: 1 },
      { key: 'a', value: 2 },
    ])
    expect(result).toEqual([{ key: 'a', value: 2 }])
  })

  it('sorts the result by key for determinism regardless of input order', () => {
    const result = mergeConfigurationEntries([
      { key: 'z', value: 1 },
      { key: 'a', value: 2 },
    ])
    expect(result.map((entry) => entry.key)).toEqual(['a', 'z'])
  })
})
