import type { RawResponseMetadataPayload, ResponseMetadata } from '../types'
import type { ResponseMetadataExtractor } from './ResponseMetadataExtractor'

export class DefaultResponseMetadataExtractor implements ResponseMetadataExtractor {
  extract(raw: RawResponseMetadataPayload | null): ResponseMetadata {
    if (raw === null) return { modelUsed: '', requestId: '' }
    return { modelUsed: raw.modelUsed, requestId: raw.requestId }
  }
}

export function createResponseMetadataExtractor(): ResponseMetadataExtractor {
  return new DefaultResponseMetadataExtractor()
}
