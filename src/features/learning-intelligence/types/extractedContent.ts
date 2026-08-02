// Pipeline stage 1 output: Document → ExtractedContent. A mock
// ContentExtractor (see parsers/) produces this without ever reading
// the Document's real bytes — no OCR, no PDF parsing, per this
// sprint's explicit scope. Shaped the way a real extractor's output
// would be, so swapping the implementation later doesn't change this
// type.
export type ExtractedContentSection = {
  id: string
  title: string
  text: string
}

export type ExtractedContent = {
  documentId: string
  rawText: string
  sections: readonly ExtractedContentSection[]
}
