// Thrown by createContentExtractor() for a mimeType with no registered
// extractor. Deliberately a real, specific error rather than a silent
// fallback to empty content — "no placeholder shortcuts" applies to
// failure modes too. Self-contained to this feature rather than
// extending `src/lib/errors.ts`'s NotImplementedError, since this isn't
// "not built yet" — it's a genuine, permanent "this type isn't
// supported" condition.
export class UnsupportedDocumentTypeError extends Error {
  constructor(mimeType: string | null) {
    super(`No ContentExtractor is registered for mimeType: ${mimeType ?? '(null)'}`)
    this.name = 'UnsupportedDocumentTypeError'
  }
}
