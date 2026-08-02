import { describe, expect, it } from 'vitest'
import { computeEdgeId } from './computeEdgeId'

describe('computeEdgeId', () => {
  it('is deterministic for the same type/source/target/direction', () => {
    expect(computeEdgeId('part-of', 'a', 'b', 'directed')).toBe(computeEdgeId('part-of', 'a', 'b', 'directed'))
  })

  it('treats source->target and target->source as different edges when directed', () => {
    expect(computeEdgeId('part-of', 'a', 'b', 'directed')).not.toBe(computeEdgeId('part-of', 'b', 'a', 'directed'))
  })

  it('treats source->target and target->source as the SAME edge when undirected', () => {
    expect(computeEdgeId('related-to', 'a', 'b', 'undirected')).toBe(computeEdgeId('related-to', 'b', 'a', 'undirected'))
  })

  it('produces different ids for different edge types over the same nodes', () => {
    expect(computeEdgeId('part-of', 'a', 'b', 'directed')).not.toBe(computeEdgeId('depends-on', 'a', 'b', 'directed'))
  })
})
