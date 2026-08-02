import { ACCEPTED_DOCUMENT_MIME_TYPES } from '@/constants/documents'
import type { ContentExtractor } from '../contracts'
import { MockPdfContentExtractor } from './mockPdfContentExtractor'
import { UnsupportedDocumentTypeError } from './UnsupportedDocumentTypeError'

// Dependency inversion at the mime-type boundary: callers ask for "the
// ContentExtractor for this mimeType" and get back something typed only
// as the ContentExtractor interface — never a concrete class reference.
// Reuses the platform's real ACCEPTED_DOCUMENT_MIME_TYPES constant
// (`@/constants/documents`) as the registry key rather than a second,
// separately-hardcoded 'application/pdf' string. Registering a future
// mime type (e.g. once PPT/DOCX move off "Coming Soon") is one new map
// entry plus one new extractor class — never a change to this
// function's signature or to any caller.
const EXTRACTOR_REGISTRY: Readonly<Record<string, () => ContentExtractor>> = {
  [ACCEPTED_DOCUMENT_MIME_TYPES[0]]: () => new MockPdfContentExtractor(),
}

export function createContentExtractor(mimeType: string | null): ContentExtractor {
  const factory = mimeType ? EXTRACTOR_REGISTRY[mimeType] : undefined
  if (!factory) throw new UnsupportedDocumentTypeError(mimeType)
  return factory()
}
