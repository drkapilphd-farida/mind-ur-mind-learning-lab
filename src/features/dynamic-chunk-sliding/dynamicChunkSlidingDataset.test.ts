import { describe, expect, it } from 'vitest'
import { splitIntoChunks, DYNAMIC_CHUNK_SLIDING_UNITS } from './dynamicChunkSlidingDataset'

describe('splitIntoChunks', () => {
  it('splits an even-length sentence into 4-word groups', () => {
    expect(splitIntoChunks('one two three four five six seven eight')).toEqual(['one two three four', 'five six seven eight'])
  })

  it('never leaves an orphan group smaller than minSize', () => {
    // 9 words: a naive greedy-4 split would leave a trailing 1-word chunk.
    const chunks = splitIntoChunks('one two three four five six seven eight nine')
    for (const chunk of chunks) {
      expect(chunk.split(' ').length).toBeGreaterThanOrEqual(3)
    }
  })

  it('every chunk has 3 or 4 words', () => {
    const chunks = splitIntoChunks('a b c d e f g h i j k')
    for (const chunk of chunks) {
      const wordCount = chunk.split(' ').length
      expect(wordCount === 3 || wordCount === 4).toBe(true)
    }
  })

  it('reassembles back to the original words in order', () => {
    const text = 'the quick brown fox jumps over the lazy dog today'
    const chunks = splitIntoChunks(text)
    expect(chunks.join(' ')).toBe(text)
  })
})

describe('DYNAMIC_CHUNK_SLIDING_UNITS', () => {
  it('produces at least one unit', () => {
    expect(DYNAMIC_CHUNK_SLIDING_UNITS.length).toBeGreaterThan(0)
  })

  it('gives every unit a unique id', () => {
    const ids = new Set(DYNAMIC_CHUNK_SLIDING_UNITS.map((unit) => unit.id))
    expect(ids.size).toBe(DYNAMIC_CHUNK_SLIDING_UNITS.length)
  })
})
