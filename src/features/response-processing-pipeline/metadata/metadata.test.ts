import { describe, expect, it } from 'vitest'
import { createResponseMetadataExtractor } from './DefaultResponseMetadataExtractor'
import { makeRawResponseMetadataPayload } from '../testFixtures'

describe('DefaultResponseMetadataExtractor (Metadata Extraction)', () => {
  const extractor = createResponseMetadataExtractor()

  it('extracts modelUsed/requestId from a raw metadata payload', () => {
    const raw = makeRawResponseMetadataPayload({ modelUsed: 'gpt-4o', requestId: 'req-1' })
    expect(extractor.extract(raw)).toEqual({ modelUsed: 'gpt-4o', requestId: 'req-1' })
  })

  it('defaults to empty strings when the raw metadata payload is null', () => {
    expect(extractor.extract(null)).toEqual({ modelUsed: '', requestId: '' })
  })
})
