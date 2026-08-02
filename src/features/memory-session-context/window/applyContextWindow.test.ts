import { describe, expect, it } from 'vitest'
import { applyContextWindow } from './applyContextWindow'
import { makeContextEntry } from '../testFixtures'

describe('applyContextWindow', () => {
  const entries = [
    makeContextEntry({ id: 'a', summary: 'aaaaa' }),
    makeContextEntry({ id: 'b', summary: 'bbbbb' }),
    makeContextEntry({ id: 'c', summary: 'ccccc' }),
  ]

  it('returns everything unchanged when both limits are null', () => {
    const result = applyContextWindow(entries, { maxEntries: null, maxPayloadSize: null }, 'drop-oldest')
    expect(result.map((e) => e.id)).toEqual(['a', 'b', 'c'])
  })

  it('applies maxEntries with drop-oldest, keeping the most recently added entries', () => {
    const result = applyContextWindow(entries, { maxEntries: 2, maxPayloadSize: null }, 'drop-oldest')
    expect(result.map((e) => e.id)).toEqual(['b', 'c'])
  })

  it('applies maxEntries with drop-newest, keeping the earliest entries', () => {
    const result = applyContextWindow(entries, { maxEntries: 2, maxPayloadSize: null }, 'drop-newest')
    expect(result.map((e) => e.id)).toEqual(['a', 'b'])
  })

  it('does not trim when entries.length is already within maxEntries', () => {
    const result = applyContextWindow(entries, { maxEntries: 10, maxPayloadSize: null }, 'drop-oldest')
    expect(result.map((e) => e.id)).toEqual(['a', 'b', 'c'])
  })

  it('applies maxPayloadSize with drop-oldest, trimming from the front until the budget fits', () => {
    const result = applyContextWindow(entries, { maxEntries: null, maxPayloadSize: 10 }, 'drop-oldest')
    expect(result.map((e) => e.id)).toEqual(['b', 'c'])
  })

  it('applies maxPayloadSize with drop-newest, trimming from the back until the budget fits', () => {
    const result = applyContextWindow(entries, { maxEntries: null, maxPayloadSize: 10 }, 'drop-newest')
    expect(result.map((e) => e.id)).toEqual(['a', 'b'])
  })

  it('can trim to an empty array when the budget is smaller than any single entry', () => {
    const result = applyContextWindow(entries, { maxEntries: null, maxPayloadSize: 1 }, 'drop-oldest')
    expect(result).toEqual([])
  })

  it('applies maxEntries before maxPayloadSize', () => {
    const result = applyContextWindow(entries, { maxEntries: 2, maxPayloadSize: 5 }, 'drop-oldest')
    expect(result.map((e) => e.id)).toEqual(['c'])
  })

  it('never mutates the given array — returns a new one', () => {
    const result = applyContextWindow(entries, { maxEntries: 2, maxPayloadSize: null }, 'drop-oldest')
    expect(result).not.toBe(entries)
    expect(entries.map((e) => e.id)).toEqual(['a', 'b', 'c'])
  })
})
