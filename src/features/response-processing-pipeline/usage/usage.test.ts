import { describe, expect, it } from 'vitest'
import { createUsageExtractor } from './DefaultUsageExtractor'
import { makeRawUsagePayload } from '../testFixtures'

describe('DefaultUsageExtractor (Usage Extraction)', () => {
  const extractor = createUsageExtractor()

  it('extracts token counts from a raw usage payload', () => {
    const raw = makeRawUsagePayload({ promptTokens: 10, completionTokens: 20, totalTokens: 30 })
    expect(extractor.extract(raw)).toEqual({ promptTokens: 10, completionTokens: 20, totalTokens: 30 })
  })

  it('defaults to all-zero when the raw usage payload is null', () => {
    expect(extractor.extract(null)).toEqual({ promptTokens: 0, completionTokens: 0, totalTokens: 0 })
  })
})
