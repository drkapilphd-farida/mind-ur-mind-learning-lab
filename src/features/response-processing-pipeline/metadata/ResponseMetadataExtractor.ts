import type { RawResponseMetadataPayload, ResponseMetadata } from '../types'

// One of the brief's own 10 named responsibilities.
export interface ResponseMetadataExtractor {
  extract(raw: RawResponseMetadataPayload | null): ResponseMetadata
}
