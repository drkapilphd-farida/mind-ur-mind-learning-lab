import type { Document, ExtractedContent } from '../types'

// Pipeline stage 1's contract. `parsers/mockContentExtractor.ts`
// implements this today with deterministic mock text — no OCR, no PDF
// parsing, per this sprint's explicit scope. A future real extractor
// (genuine PDF/text extraction) implements this exact same interface;
// nothing that depends on ContentExtractor needs to change.
export interface ContentExtractor {
  extract(document: Document): Promise<ExtractedContent>
}
