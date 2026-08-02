import { describe, expect, it } from 'vitest'
import { filterQualityContent, isQualityContent } from './qualityFilter'

describe('isQualityContent', () => {
  it('FIX-13 — rejects real content that is too short to be unambiguous', () => {
    expect(isQualityContent('a')).toBe(false)
    expect(isQualityContent('ok')).toBe(true)
  })

  it('FIX-13 — rejects real content matching the blocklist', () => {
    expect(isQualityContent('idiot')).toBe(false)
  })

  it('accepts ordinary real curated words', () => {
    expect(isQualityContent('mountain')).toBe(true)
  })
})

describe('filterQualityContent', () => {
  it('FIX-02/FIX-13 — removes real case-insensitive duplicates, preserving order', () => {
    const result = filterQualityContent(['Mango', 'mango', 'Kiwi'])
    expect(result).toEqual(['Mango', 'Kiwi'])
  })

  it('never throws on an empty real input', () => {
    expect(filterQualityContent([])).toEqual([])
  })
})
