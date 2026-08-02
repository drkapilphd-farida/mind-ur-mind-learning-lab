import { describe, expect, it } from 'vitest'
import { ICON_CLUSTER_PATTERNS, buildIconClusterRound } from './iconClusterCategory'

describe('ICON_CLUSTER_PATTERNS', () => {
  it('defines 15 distinct clusters, each with at least 3 items', () => {
    expect(ICON_CLUSTER_PATTERNS.length).toBe(15)
    const ids = new Set(ICON_CLUSTER_PATTERNS.map((cluster) => cluster.id))
    expect(ids.size).toBe(15)
    for (const cluster of ICON_CLUSTER_PATTERNS) {
      expect(cluster.items.length).toBeGreaterThanOrEqual(3)
    }
  })
})

describe('buildIconClusterRound', () => {
  it('always includes the real target among exactly 4 unique options', () => {
    for (let i = 0; i < 15; i += 1) {
      const { target, correctOptionId, options } = buildIconClusterRound(new Set())
      expect(options.length).toBe(4)
      expect(new Set(options.map((o) => o.optionId)).size).toBe(4)
      expect(target.optionId).toBe(correctOptionId)
    }
  })

  it('gives every decoy a cluster that differs from the target', () => {
    const { target, correctOptionId, options } = buildIconClusterRound(new Set())
    const decoys = options.filter((o) => o.optionId !== correctOptionId)
    expect(decoys.length).toBe(3)
    for (const decoy of decoys) {
      expect(decoy.cluster).not.toEqual(target.cluster)
    }
  })
})
