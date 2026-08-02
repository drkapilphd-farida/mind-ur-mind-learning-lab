import { describe, expect, it } from 'vitest'
import { createEmptyChunkEnrichment } from './createEmptyChunkEnrichment'

describe('createEmptyChunkEnrichment', () => {
  it('returns an object with no enrichment fields set', () => {
    expect(createEmptyChunkEnrichment()).toEqual({})
  })

  it('returns a new object on every call', () => {
    expect(createEmptyChunkEnrichment()).not.toBe(createEmptyChunkEnrichment())
  })
})
