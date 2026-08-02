import { describe, expect, it } from 'vitest'
import { makeScenario } from '../testFixtures'
import { buildMemoryBlueprint } from './buildMemoryBlueprint'

describe('buildMemoryBlueprint', () => {
  it('includes one entry per chunk analysis', async () => {
    const { analysis } = await makeScenario()
    const blueprint = buildMemoryBlueprint(analysis)
    expect(blueprint.entries).toHaveLength(analysis.chunkAnalyses.length)
  })

  it('sorts entries by real memoryDifficulty, descending', async () => {
    const { analysis } = await makeScenario()
    const blueprint = buildMemoryBlueprint(analysis)
    for (let i = 1; i < blueprint.entries.length; i += 1) {
      expect(blueprint.entries[i - 1]!.memoryDifficulty).toBeGreaterThanOrEqual(blueprint.entries[i]!.memoryDifficulty)
    }
  })

  it('returns an empty blueprint when there are no chunks', async () => {
    const { analysis } = await makeScenario()
    const blueprint = buildMemoryBlueprint({ ...analysis, chunkAnalyses: [] })
    expect(blueprint.entries).toEqual([])
  })
})
