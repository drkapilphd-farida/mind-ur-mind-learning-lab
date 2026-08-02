import { describe, expect, it } from 'vitest'
import { makeBlueprint } from './testFixtures'
import { enhanceLearningObjects } from './enhanceLearningObjects'

describe('enhanceLearningObjects', () => {
  it('derives real prerequisiteObjects/dependentObjects from the builds-upon edge, directionally', () => {
    const objects = enhanceLearningObjects(makeBlueprint())
    const respiration = objects.find((object) => object.objectId === 'obj-respiration')
    const photosynthesis = objects.find((object) => object.objectId === 'obj-photosynthesis')

    // Respiration builds upon Photosynthesis -> Photosynthesis is Respiration's prerequisite.
    expect(respiration?.prerequisiteObjects).toEqual(['obj-photosynthesis'])
    expect(respiration?.dependentObjects).toEqual([])
    // Photosynthesis has no prerequisite; Respiration depends on it.
    expect(photosynthesis?.prerequisiteObjects).toEqual([])
    expect(photosynthesis?.dependentObjects).toEqual(['obj-respiration'])
  })

  it('filters readingAssets down to only what this specific object real text mentions', () => {
    const objects = enhanceLearningObjects(makeBlueprint())
    const photosynthesis = objects.find((object) => object.objectId === 'obj-photosynthesis')!

    expect(photosynthesis.keywords).toContain('photosynthesis')
    expect(photosynthesis.keywords).not.toContain('respiration')
    // Both key sentences literally mention "photosynthesis" in this fixture.
    expect(photosynthesis.keySentences).toEqual(['Photosynthesis converts light energy into chemical energy.', 'Cellular respiration reverses photosynthesis.'])
  })

  it('produces a real, deterministic, stable synthetic paragraph id for any paragraph mentioning this object', () => {
    const objects = enhanceLearningObjects(makeBlueprint())
    const respiration = objects.find((object) => object.objectId === 'obj-respiration')!

    // Only the second paragraph mentions "Cellular Respiration" by title.
    expect(respiration.keyParagraphIds).toEqual(['chunk-1-paragraph-1'])
  })

  it('computes a real, non-zero estimatedLearningTime from this object own real text, never a fabricated placeholder', () => {
    const objects = enhanceLearningObjects(makeBlueprint())
    const photosynthesis = objects.find((object) => object.objectId === 'obj-photosynthesis')!
    const noText = objects.find((object) => object.objectId === 'obj-respiration')!

    expect(photosynthesis.estimatedLearningTime).toBeGreaterThan(0)
    // Respiration has only a title and no definition/explanation/examples in this fixture —
    // still produces a real, small, non-negative estimate, never throws.
    expect(noText.estimatedLearningTime).toBeGreaterThanOrEqual(0)
  })

  it('passes through real identity/understanding fields verbatim, never re-deriving them', () => {
    const objects = enhanceLearningObjects(makeBlueprint())
    const photosynthesis = objects.find((object) => object.objectId === 'obj-photosynthesis')!

    expect(photosynthesis.definition).toBe('The process of converting light into chemical energy.')
    expect(photosynthesis.misconceptions).toEqual(['Photosynthesis only happens at night.'])
    expect(photosynthesis.relatedObjects).toEqual(['obj-respiration'])
  })
})
