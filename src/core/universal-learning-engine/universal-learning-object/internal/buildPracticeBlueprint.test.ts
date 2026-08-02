import { describe, expect, it } from 'vitest'
import { makeScenario } from '../testFixtures'
import { buildPracticeBlueprint } from './buildPracticeBlueprint'

describe('buildPracticeBlueprint', () => {
  it('includes one entry per concept analysis', async () => {
    const { analysis } = await makeScenario()
    const blueprint = buildPracticeBlueprint(analysis)
    expect(blueprint.entries).toHaveLength(analysis.conceptAnalyses.length)
  })

  it('sorts entries by real importance, descending', async () => {
    const { analysis } = await makeScenario()
    const blueprint = buildPracticeBlueprint(analysis)
    for (let i = 1; i < blueprint.entries.length; i += 1) {
      expect(blueprint.entries[i - 1]!.importance).toBeGreaterThanOrEqual(blueprint.entries[i]!.importance)
    }
  })

  it('reuses the real suggestedPracticeStrategy verbatim, never recomputing it', async () => {
    const { analysis } = await makeScenario()
    const blueprint = buildPracticeBlueprint(analysis)
    for (const entry of blueprint.entries) {
      const source = analysis.conceptAnalyses.find((concept) => concept.conceptNodeId === entry.conceptNodeId)
      expect(entry.suggestedStrategy).toBe(source?.suggestedPracticeStrategy)
    }
  })
})
