import { describe, expect, it } from 'vitest'
import { makeBundle, makeMcqs } from './internal/testFixtures'
import { buildExerciseAssets, EXERCISE_ASSET_BUILDER_VERSION } from './buildExerciseAssets'

describe('buildExerciseAssets', () => {
  const baseInput = {
    documentId: 'doc-1',
    chapterId: 'chunk-1',
    chapterContent: 'Photosynthesis converts light energy into chemical energy. Chlorophyll absorbs sunlight in leaves.',
    locale: null,
    bundle: makeBundle(),
    assessmentMcqs: makeMcqs(),
  }

  it('produces all three Tier-1 asset arrays from one real chapter', () => {
    const result = buildExerciseAssets(baseInput)
    expect(result.words.length).toBe(baseInput.bundle.wordAssets.length)
    expect(result.chunks.length).toBeGreaterThan(0)
    expect(result.assessments.length).toBe(baseInput.assessmentMcqs.length)
  })

  it('reports the builder version and a real generatedAt timestamp', () => {
    const result = buildExerciseAssets(baseInput)
    expect(result.builderVersion).toBe(EXERCISE_ASSET_BUILDER_VERSION)
    expect(() => new Date(result.generatedAt).toISOString()).not.toThrow()
  })

  it('validates every generated array and reports a clean result for well-formed input', () => {
    const result = buildExerciseAssets(baseInput)
    expect(result.validation.words.valid).toBe(true)
    expect(result.validation.chunks.valid).toBe(true)
    expect(result.validation.assessments.valid).toBe(true)
  })

  it('defaults a null locale to en for the Word assets', () => {
    const result = buildExerciseAssets(baseInput)
    expect(result.words.every((word) => word.locale === 'en')).toBe(true)
  })

  it('never throws for an empty chapter (no words, no mcqs, empty content)', () => {
    const emptyInput = { ...baseInput, chapterContent: '', bundle: makeBundle({ wordAssets: [] }), assessmentMcqs: [] }
    const result = buildExerciseAssets(emptyInput)
    expect(result.words).toEqual([])
    expect(result.chunks).toEqual([])
    expect(result.assessments).toEqual([])
    expect(result.validation.words.valid).toBe(false)
  })
})
