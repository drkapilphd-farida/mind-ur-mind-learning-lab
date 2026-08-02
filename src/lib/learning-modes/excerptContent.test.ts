import { describe, expect, it } from 'vitest'
import { excerptContent } from './excerptContent'

describe('excerptContent', () => {
  it('returns real content unchanged, with isExcerpt false, when under the max length', () => {
    const result = excerptContent('A short, real sentence.')
    expect(result).toEqual({ text: 'A short, real sentence.', isExcerpt: false })
  })

  it('excerpts real content over the max length at a real word boundary, disclosed via isExcerpt', () => {
    const longContent = `${'real word '.repeat(120)}tail.`

    const result = excerptContent(longContent)

    expect(result.isExcerpt).toBe(true)
    expect(result.text.length).toBeLessThan(longContent.length)
    expect(result.text.endsWith('…')).toBe(true)
    expect(result.text.endsWith(' …')).toBe(false)
  })

  it('honors a real, caller-supplied maxLength', () => {
    const content = 'one two three four five six seven eight nine ten'

    const result = excerptContent(content, 15)

    expect(result.isExcerpt).toBe(true)
    expect(result.text).toBe('one two three…')
  })
})
