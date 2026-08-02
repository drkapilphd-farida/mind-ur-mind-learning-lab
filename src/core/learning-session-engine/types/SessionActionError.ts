// Universal Learning Session Engine™ (LSE-1). Plain data, not a thrown
// Error — the same Result-type convention this whole arc has used
// throughout (ExtractionResult, AIFoundationResult, LearningChunk
// ValidationResult, ...), never exception-based control flow for an
// expected failure like an illegal state transition.
export type SessionActionErrorCode = 'invalid-transition' | 'ulo-mismatch'

export type SessionActionError = {
  code: SessionActionErrorCode
  message: string
}
