import { describe, expect, it } from 'vitest'
import { splitIntoReadingGroups } from './splitIntoReadingGroups'

describe('splitIntoReadingGroups', () => {
  it('never drops or changes a single real word — rejoining reconstructs the input', () => {
    const content = 'Photosynthesis is the process plants use to convert light into chemical energy. Chlorophyll absorbs sunlight to power this reaction. The products are glucose and oxygen.'
    const groups = splitIntoReadingGroups(content, 10)
    expect(groups.join(' ')).toBe(content)
  })

  it('never splits a sentence across two groups', () => {
    const content = 'This is one real sentence with quite a few words in it that goes on. Short one.'
    const groups = splitIntoReadingGroups(content, 5)
    expect(groups[0]).toBe('This is one real sentence with quite a few words in it that goes on.')
    expect(groups[1]).toBe('Short one.')
  })

  it('returns a single group for short real content', () => {
    const content = 'A short real sentence.'
    expect(splitIntoReadingGroups(content)).toEqual(['A short real sentence.'])
  })

  it('returns an empty array for empty content', () => {
    expect(splitIntoReadingGroups('')).toEqual([])
    expect(splitIntoReadingGroups('   ')).toEqual([])
  })
})
