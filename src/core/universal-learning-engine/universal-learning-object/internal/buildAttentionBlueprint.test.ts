import { describe, expect, it } from 'vitest'
import { makeScenario } from '../testFixtures'
import { buildAttentionBlueprint } from './buildAttentionBlueprint'

describe('buildAttentionBlueprint', () => {
  it('produces one entry per chunk analysis', async () => {
    const { analysis } = await makeScenario()
    const blueprint = buildAttentionBlueprint(analysis)
    expect(blueprint.entries).toHaveLength(analysis.chunkAnalyses.length)
  })

  it('classifies a high cognitive load chunk as high focus', async () => {
    const { analysis } = await makeScenario()
    const withHighLoad = { ...analysis, chunkAnalyses: [{ ...analysis.chunkAnalyses[0]!, expectedCognitiveLoad: 0.9 }] }
    const blueprint = buildAttentionBlueprint(withHighLoad)
    expect(blueprint.entries[0]?.focusLevel).toBe('high')
  })

  it('classifies a low cognitive load chunk as low focus', async () => {
    const { analysis } = await makeScenario()
    const withLowLoad = { ...analysis, chunkAnalyses: [{ ...analysis.chunkAnalyses[0]!, expectedCognitiveLoad: 0.1 }] }
    const blueprint = buildAttentionBlueprint(withLowLoad)
    expect(blueprint.entries[0]?.focusLevel).toBe('low')
  })

  it('classifies a moderate cognitive load chunk as moderate focus', async () => {
    const { analysis } = await makeScenario()
    const withModerateLoad = { ...analysis, chunkAnalyses: [{ ...analysis.chunkAnalyses[0]!, expectedCognitiveLoad: 0.5 }] }
    const blueprint = buildAttentionBlueprint(withModerateLoad)
    expect(blueprint.entries[0]?.focusLevel).toBe('moderate')
  })
})
