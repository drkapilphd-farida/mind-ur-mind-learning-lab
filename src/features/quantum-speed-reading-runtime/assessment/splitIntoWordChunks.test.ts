import { describe, expect, it } from 'vitest'
import { splitIntoWordChunks } from './splitIntoWordChunks'

describe('splitIntoWordChunks', () => {
  it('splits real content into fixed-size word groups regardless of sentence boundaries', () => {
    expect(splitIntoWordChunks('one two three four five six seven', 3)).toEqual(['one two three', 'four five six', 'seven'])
  })

  it('never drops or reorders a real word', () => {
    const content = 'The quick brown fox jumps over the lazy dog.'
    const chunks = splitIntoWordChunks(content, 3)
    expect(chunks.join(' ')).toBe(content)
  })

  it('returns an empty array for empty content', () => {
    expect(splitIntoWordChunks('   ', 3)).toEqual([])
  })
})
