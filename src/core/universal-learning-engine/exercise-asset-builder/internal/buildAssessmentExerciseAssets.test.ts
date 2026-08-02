import { describe, expect, it } from 'vitest'
import { makeBundle, makeMcqs } from './testFixtures'
import { buildAssessmentExerciseAssets } from './buildAssessmentExerciseAssets'

describe('buildAssessmentExerciseAssets', () => {
  it('maps question/options/correctAnswerIndex to prompt/options/correctIndex verbatim', () => {
    const bundle = makeBundle()
    const assets = buildAssessmentExerciseAssets(makeMcqs(), bundle.chapterId, bundle.learningObjects)

    expect(assets[0]).toMatchObject({
      prompt: 'What is the definition of "Photosynthesis"?',
      options: ['The process of converting light into chemical energy.', 'The process cells use to release energy from glucose.'],
      correctIndex: 0,
    })
  })

  it('preserves questionKind as the single honest literal', () => {
    const bundle = makeBundle()
    const assets = buildAssessmentExerciseAssets(makeMcqs(), bundle.chapterId, bundle.learningObjects)
    expect(assets.every((a) => a.questionKind === 'definition')).toBe(true)
  })

  it('resolves sourceObjectId by joining the question\'s real term against learningObjects', () => {
    const bundle = makeBundle()
    const assets = buildAssessmentExerciseAssets(makeMcqs(), bundle.chapterId, bundle.learningObjects)
    expect(assets[0]?.sourceObjectId).toBe('obj-photosynthesis')
    expect(assets[1]?.sourceObjectId).toBe('obj-respiration')
  })

  it('degrades sourceObjectId to null for an unresolvable term, never throwing', () => {
    const bundle = makeBundle()
    const mcqs = [{ question: 'What is the definition of "Unknown Concept"?', options: ['a', 'b'], correctAnswerIndex: 0 }]
    const assets = buildAssessmentExerciseAssets(mcqs, bundle.chapterId, bundle.learningObjects)
    expect(assets[0]?.sourceObjectId).toBeNull()
  })

  it('produces stable, unique ids by default', () => {
    const bundle = makeBundle()
    const assets = buildAssessmentExerciseAssets(makeMcqs(), bundle.chapterId, bundle.learningObjects)
    const ids = assets.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids[0]).toBe('chunk-1-mcq-0')
  })

  it('never throws and returns an empty array for a chapter with no mcqs', () => {
    const bundle = makeBundle()
    expect(buildAssessmentExerciseAssets([], bundle.chapterId, bundle.learningObjects)).toEqual([])
  })
})
