import { describe, expect, it } from 'vitest'
import type { WordExerciseAsset, ChunkExerciseAsset, AssessmentExerciseAsset } from '../types/ExerciseAsset'
import { validateWordExerciseAssets, validateChunkExerciseAssets, validateAssessmentExerciseAssets } from './validateExerciseAssets'

const validWord: WordExerciseAsset = { id: 'w1', word: 'focus', wordLabel: 'focus', difficultyTier: 'easy', locale: 'en', priority: 1, sourceObjectId: null }
const validChunk: ChunkExerciseAsset = { id: 'c1', chunkText: 'deep focus training', wordCount: 3, difficultyTier: 'easy', sourceChapterId: 'chunk-1' }
const validAssessment: AssessmentExerciseAsset = { id: 'a1', prompt: 'What is X?', options: ['a', 'b'], correctIndex: 0, sourceObjectId: 'obj-1', questionKind: 'definition' }

describe('validateWordExerciseAssets', () => {
  it('passes a well-formed list', () => {
    expect(validateWordExerciseAssets([validWord])).toEqual({ valid: true, errors: [] })
  })

  it('flags an empty array', () => {
    const result = validateWordExerciseAssets([])
    expect(result.valid).toBe(false)
    expect(result.errors[0]?.field).toBe('assets')
  })

  it('flags a duplicate id', () => {
    const result = validateWordExerciseAssets([validWord, validWord])
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.field === 'id')).toBe(true)
  })

  it('flags an empty word', () => {
    const result = validateWordExerciseAssets([{ ...validWord, word: '  ' }])
    expect(result.errors.some((e) => e.field === 'word')).toBe(true)
  })

  it('flags an invalid difficulty tier', () => {
    const result = validateWordExerciseAssets([{ ...validWord, difficultyTier: 'not-a-tier' as WordExerciseAsset['difficultyTier'] }])
    expect(result.errors.some((e) => e.field === 'difficultyTier')).toBe(true)
  })
})

describe('validateChunkExerciseAssets', () => {
  it('passes a well-formed list', () => {
    expect(validateChunkExerciseAssets([validChunk])).toEqual({ valid: true, errors: [] })
  })

  it('flags empty chunkText and non-positive wordCount', () => {
    const result = validateChunkExerciseAssets([{ ...validChunk, chunkText: '', wordCount: 0 }])
    expect(result.errors.some((e) => e.field === 'chunkText')).toBe(true)
    expect(result.errors.some((e) => e.field === 'wordCount')).toBe(true)
  })
})

describe('validateAssessmentExerciseAssets', () => {
  const knownIds = new Set(['obj-1'])

  it('passes a well-formed list with a resolvable sourceObjectId', () => {
    expect(validateAssessmentExerciseAssets([validAssessment], knownIds)).toEqual({ valid: true, errors: [] })
  })

  it('flags fewer than 2 options', () => {
    const result = validateAssessmentExerciseAssets([{ ...validAssessment, options: ['only-one'] }], knownIds)
    expect(result.errors.some((e) => e.field === 'options')).toBe(true)
  })

  it('flags an out-of-range correctIndex', () => {
    const result = validateAssessmentExerciseAssets([{ ...validAssessment, correctIndex: 5 }], knownIds)
    expect(result.errors.some((e) => e.field === 'correctIndex')).toBe(true)
  })

  it('flags an unknown sourceObjectId as an invalid reference', () => {
    const result = validateAssessmentExerciseAssets([{ ...validAssessment, sourceObjectId: 'obj-does-not-exist' }], knownIds)
    expect(result.errors.some((e) => e.field === 'sourceObjectId')).toBe(true)
  })

  it('accepts a null sourceObjectId as valid (an honest absence, not a broken reference)', () => {
    const result = validateAssessmentExerciseAssets([{ ...validAssessment, sourceObjectId: null }], knownIds)
    expect(result.valid).toBe(true)
  })
})
