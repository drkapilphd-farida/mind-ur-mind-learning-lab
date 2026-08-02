import type { UniversalLearningDocument } from '../types/UniversalLearningDocument'

// Universal Learning Intelligence Engine™ (ULIE™) — Sprint UCE-2. Plain
// data, not a thrown Error subclass — same Result-type convention as
// UCE-1's UniversalUploadError, never exception-based control flow for
// expected failure cases.
export type ExtractionErrorCode = 'unreadable-document' | 'corrupted-document' | 'unsupported-encoding' | 'extraction-failed' | 'empty-extraction'

export type ExtractionError = {
  code: ExtractionErrorCode
  message: string
}

export type ExtractionResult = { success: true; document: UniversalLearningDocument } | { success: false; error: ExtractionError }
