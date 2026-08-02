import { validateDocumentFile, type DocumentValidationResult } from '@/lib/validateDocumentFile'
import type { UniversalUploadError } from '../errors/UniversalUploadError'
import type { UniversalValidationResult } from '../types/UniversalUploadParser'

export type ValidateDocumentFileFn = (file: File) => Promise<DocumentValidationResult>

type DocumentValidationFailureReason = Extract<DocumentValidationResult, { valid: false }>['reason']

const REASON_MESSAGE: Record<DocumentValidationFailureReason, string> = {
  'unsupported-type': "That file type isn't supported for what you selected.",
  'too-large': 'This file is too large. Please choose a file up to 50 MB.',
  corrupted: "This file doesn't look valid. Please check it and try again.",
}

const REASON_CODE: Record<DocumentValidationFailureReason, UniversalUploadError['code']> = {
  'unsupported-type': 'unsupported-type',
  'too-large': 'file-too-large',
  corrupted: 'corrupted-file',
}

// Universal Learning Intelligence Engine™ (ULIE™) — Sprint UCE-1. A thin
// wrapper around the existing, real, already-tested validateDocumentFile
// (magic-byte/content checks per format) — never reimplemented here.
// Translates its 3-code result into the engine's 5-code error model,
// preserving today's exact user-facing message text for every existing
// case. Wrapped in try/catch: any unexpected throw from the underlying
// byte-reading maps to 'unknown-error' — real new defensive coverage,
// added here rather than by editing validateDocumentFile.ts itself.
// `validateFn` is a dependency-injection seam (defaults to the real
// function) so tests can exercise this wrapper's own mapping logic
// without re-testing validateDocumentFile's already-covered byte-signature
// checks.
export async function validateUniversalUpload(file: File, validateFn: ValidateDocumentFileFn = validateDocumentFile): Promise<UniversalValidationResult> {
  try {
    const result = await validateFn(file)
    if (result.valid) {
      return { valid: true, warning: result.warning }
    }
    return { valid: false, error: { code: REASON_CODE[result.reason], message: REASON_MESSAGE[result.reason] } }
  } catch {
    return { valid: false, error: { code: 'unknown-error', message: 'Something went wrong while checking this file. Please try again.' } }
  }
}
