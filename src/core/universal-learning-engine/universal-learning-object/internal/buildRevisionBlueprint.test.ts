import { describe, expect, it } from 'vitest'
import { makeScenario } from '../testFixtures'
import { buildRevisionBlueprint } from './buildRevisionBlueprint'

describe('buildRevisionBlueprint', () => {
  it('includes one entry per concept analysis', async () => {
    const { analysis } = await makeScenario()
    const blueprint = buildRevisionBlueprint(analysis)
    expect(blueprint.entries).toHaveLength(analysis.conceptAnalyses.length)
  })

  it('sorts entries by real revisionPriority, descending', async () => {
    const { analysis } = await makeScenario()
    const blueprint = buildRevisionBlueprint(analysis)
    for (let i = 1; i < blueprint.entries.length; i += 1) {
      expect(blueprint.entries[i - 1]!.revisionPriority).toBeGreaterThanOrEqual(blueprint.entries[i]!.revisionPriority)
    }
  })

  it('reuses the real suggestedRevisionStrategy verbatim, never recomputing it', async () => {
    const { analysis } = await makeScenario()
    const blueprint = buildRevisionBlueprint(analysis)
    for (const entry of blueprint.entries) {
      const source = analysis.conceptAnalyses.find((concept) => concept.conceptNodeId === entry.conceptNodeId)
      expect(entry.suggestedStrategy).toBe(source?.suggestedRevisionStrategy)
    }
  })

  it('returns an empty blueprint when there are no concepts', async () => {
    const { analysis } = await makeScenario()
    const blueprint = buildRevisionBlueprint({ ...analysis, conceptAnalyses: [] })
    expect(blueprint.entries).toEqual([])
  })
})
