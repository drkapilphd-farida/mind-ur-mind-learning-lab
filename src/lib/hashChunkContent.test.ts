import { describe, expect, it } from 'vitest'
import { hashChunkContent } from './hashChunkContent'

describe('hashChunkContent', () => {
  it('returns the identical hash for identical real content', () => {
    expect(hashChunkContent('Photosynthesis converts light into chemical energy.')).toBe(hashChunkContent('Photosynthesis converts light into chemical energy.'))
  })

  it('returns a different hash when the real content genuinely differs', () => {
    expect(hashChunkContent('Photosynthesis converts light into chemical energy.')).not.toBe(hashChunkContent('Photosynthesis converts light into chemical energy!'))
  })

  it('returns a real, non-empty hex string', () => {
    const hash = hashChunkContent('Some real chunk content.')
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })
})
