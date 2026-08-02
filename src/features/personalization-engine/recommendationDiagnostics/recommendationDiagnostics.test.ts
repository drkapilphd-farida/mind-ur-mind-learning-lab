import { describe, expect, it } from 'vitest'
import { generateRecommendationDiagnostics } from './generateRecommendationDiagnostics'
import { makePersonalizationRecommendationSet, makeRecommendationGroup, makeRecommendationItem } from '../testFixtures'

describe('generateRecommendationDiagnostics', () => {
  it('counts total recommendations and groups, and reflects validation status', () => {
    const set = makePersonalizationRecommendationSet({
      version: 2,
      groups: [
        makeRecommendationGroup({ category: 'journey', items: [makeRecommendationItem({ id: 'j1' })] }),
        makeRecommendationGroup({ category: 'exercise', items: [makeRecommendationItem({ id: 'e1' }), makeRecommendationItem({ id: 'e2' })] }),
      ],
    })

    const diagnostics = generateRecommendationDiagnostics(set, { valid: true, issues: [] })

    expect(diagnostics).toEqual({ totalRecommendations: 3, groupCount: 2, validationStatus: 'valid', setVersion: 2 })
  })

  it('reports validationStatus: invalid when the validation result is invalid', () => {
    const set = makePersonalizationRecommendationSet({ groups: [] })
    const diagnostics = generateRecommendationDiagnostics(set, { valid: false, issues: [{ type: 'empty-recommendation-set', itemId: null, detail: 'empty' }] })
    expect(diagnostics.validationStatus).toBe('invalid')
    expect(diagnostics.totalRecommendations).toBe(0)
    expect(diagnostics.groupCount).toBe(0)
  })
})
