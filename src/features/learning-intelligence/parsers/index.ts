// Pipeline stage 1: Document → ExtractedContent. `createContentExtractor`
// is the intended entry point — engine/ (Chunk 4) and any other future
// consumer should call it rather than importing a concrete extractor
// class directly, keeping the mime-type-to-implementation mapping in
// one place.

export { createContentExtractor } from './createContentExtractor'
export { MockPdfContentExtractor } from './mockPdfContentExtractor'
export { UnsupportedDocumentTypeError } from './UnsupportedDocumentTypeError'
