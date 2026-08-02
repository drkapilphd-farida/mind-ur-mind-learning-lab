import { ACCEPTED_DOCUMENT_MIME_TYPES } from '@/constants/documents'
import type { UniversalSourceType } from '../types/UniversalSource'

// Universal Learning Intelligence Engine™ (ULIE™) — Sprint UCE-1. Thin
// MIME-type → UniversalSourceType mapping. Deliberately does NOT
// reimplement byte-signature checking — that real detection work already
// lives in validateDocumentFile.ts (see validateUniversalUpload.ts, which
// delegates to it) and isn't duplicated here. This function only answers
// "what category does the declared MIME type claim to be," reusing
// ACCEPTED_DOCUMENT_MIME_TYPES as the single source of truth for what's
// even a known type, rather than a second hardcoded list.
export function detectSourceType(file: File): UniversalSourceType {
  if (!(ACCEPTED_DOCUMENT_MIME_TYPES as readonly string[]).includes(file.type)) {
    return 'unknown'
  }

  switch (file.type) {
    case 'application/pdf':
      return 'pdf'
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'docx'
    case 'application/msword':
      return 'doc'
    case 'text/plain':
      return 'txt'
    case 'image/jpeg':
    case 'image/png':
    case 'image/webp':
    case 'image/heic':
    case 'image/heif':
      return 'image'
    default:
      return 'unknown'
  }
}
