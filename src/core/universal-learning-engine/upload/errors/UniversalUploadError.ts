// Universal Learning Intelligence Engine™ (ULIE™) — Sprint UCE-1.
// Plain data, not a thrown Error subclass — matches this codebase's
// established Result-type convention (DocumentValidationResult,
// TextExtractionResult) rather than introducing exception-based control
// flow for expected failure cases. `message` is always a real, specific,
// ready-to-display string set at the point of creation — a genuine
// extraction failure carries mammoth's/file.text()'s own real error text
// verbatim, never a generic fallback covering a specific, known cause.
export type UniversalUploadErrorCode = 'unsupported-type' | 'file-too-large' | 'corrupted-file' | 'unreadable-file' | 'unknown-error'

export type UniversalUploadError = {
  code: UniversalUploadErrorCode
  message: string
}
