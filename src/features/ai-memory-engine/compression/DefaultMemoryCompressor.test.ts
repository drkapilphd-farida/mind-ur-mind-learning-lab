import { describe, expect, it } from 'vitest'
import { createMemoryCompressor } from './DefaultMemoryCompressor'
import { makeMemoryRecord } from '../testFixtures'

describe('DefaultMemoryCompressor', () => {
  const compressor = createMemoryCompressor()

  it('returns an empty array for maxRecords <= 0', () => {
    expect(compressor.compress([makeMemoryRecord()], 0)).toEqual([])
  })

  it('keeps the highest-priority records first', () => {
    const low = makeMemoryRecord({ id: 'low', priority: 'low' })
    const critical = makeMemoryRecord({ id: 'critical', priority: 'critical' })
    const result = compressor.compress([low, critical], 1)
    expect(result.map((record) => record.id)).toEqual(['critical'])
  })

  it('breaks ties within the same priority by most recent first', () => {
    const older = makeMemoryRecord({ id: 'older', priority: 'high', createdAt: '2026-01-01T00:00:00.000Z' })
    const newer = makeMemoryRecord({ id: 'newer', priority: 'high', createdAt: '2026-01-02T00:00:00.000Z' })
    const result = compressor.compress([older, newer], 1)
    expect(result.map((record) => record.id)).toEqual(['newer'])
  })

  it('never returns more than maxRecords', () => {
    const records = Array.from({ length: 10 }, (_, index) => makeMemoryRecord({ id: `r${index}` }))
    expect(compressor.compress(records, 3)).toHaveLength(3)
  })

  it('returns everything when maxRecords exceeds the input size', () => {
    const records = [makeMemoryRecord({ id: 'a' }), makeMemoryRecord({ id: 'b' })]
    expect(compressor.compress(records, 100)).toHaveLength(2)
  })
})
