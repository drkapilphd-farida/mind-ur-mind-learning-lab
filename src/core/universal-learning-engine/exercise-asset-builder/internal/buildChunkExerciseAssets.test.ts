import { describe, expect, it } from 'vitest'
import { buildChunkExerciseAssets } from './buildChunkExerciseAssets'

describe('buildChunkExerciseAssets', () => {
  it('splits real chapter text into word-count windows without crossing a sentence boundary', () => {
    const content = 'Photosynthesis converts light energy into chemical energy. Chlorophyll absorbs sunlight in leaves.'
    const assets = buildChunkExerciseAssets(content, 'chunk-1', { targetWordsPerChunk: 4 })

    // First sentence has 7 words -> windows of 4 then 3; second sentence has 5 words -> windows of 4 then 1.
    expect(assets.map((a) => a.chunkText)).toEqual([
      'Photosynthesis converts light energy',
      'into chemical energy.',
      'Chlorophyll absorbs sunlight in',
      'leaves.',
    ])
  })

  it('determines wordCount and difficultyTier from the chunk\'s own real word count', () => {
    const assets = buildChunkExerciseAssets('One two. Three four five. Six seven eight nine ten eleven.', 'chunk-1', { targetWordsPerChunk: 6 })
    const byWordCount = new Map(assets.map((a) => [a.chunkText, a.wordCount]))
    expect(byWordCount.get('One two.')).toBe(2)
    expect(assets.find((a) => a.chunkText === 'One two.')?.difficultyTier).toBe('beginner')
    expect(assets.find((a) => a.wordCount === 6)?.difficultyTier).toBe('expert')
  })

  it('maps sourceChapterId onto every chunk', () => {
    const assets = buildChunkExerciseAssets('A short sentence here.', 'chapter-42')
    expect(assets.every((a) => a.sourceChapterId === 'chapter-42')).toBe(true)
  })

  it('produces stable, unique ids by default', () => {
    const assets = buildChunkExerciseAssets('First sentence here now. Second sentence follows soon.', 'chunk-1')
    const ids = assets.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids[0]).toBe('chunk-1-chunk-0')
  })

  it('never throws and returns an empty array for empty content', () => {
    expect(buildChunkExerciseAssets('', 'chunk-1')).toEqual([])
    expect(buildChunkExerciseAssets('   ', 'chunk-1')).toEqual([])
  })

  it('handles a document with no terminal punctuation without crashing', () => {
    const assets = buildChunkExerciseAssets('no punctuation at all just words running on', 'chunk-1', { targetWordsPerChunk: 3 })
    expect(assets.length).toBeGreaterThan(0)
    expect(assets.every((a) => a.wordCount > 0)).toBe(true)
  })
})
