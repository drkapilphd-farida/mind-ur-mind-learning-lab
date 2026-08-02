import type { UniversalUploadError } from '../errors/UniversalUploadError'
import type { UniversalSource, UniversalSourceType } from './UniversalSource'

export type UniversalValidationResult = { valid: true; warning: 'large-file' | null } | { valid: false; error: UniversalUploadError }

export type ParseResult = { success: true; source: UniversalSource } | { success: false; error: UniversalUploadError }

// Universal Learning Intelligence Engine™ (ULIE™) — Sprint UCE-1.
// UniversalUploadParser™ is the ONLY gateway between an uploaded file and
// the Learning Engine. Architecture only, exactly the brief's own 5
// methods — no future methods (chunking, extraction-into-content,
// translation, etc.) are added here; those belong to later sprints
// (UCE-2 Universal Extraction Engine™ onward).
//
// `prepare()` takes the file plus its already-detected type/metadata —
// the brief's own zero-arg example is read as illustrative shorthand; a
// builder needs its inputs to build anything.
//
// Reserved extension point (documented, not implemented): a future
// `checkDuplicate` step belongs in `parse()`'s pipeline once a caller can
// supply a real duplicate-check — src/api/documents's existing
// `hasDocumentWithTitle` is the real future implementation, deliberately
// not called from here since it's server-only (needs a Supabase client)
// and this parser is a pure, DB-independent client-side utility.
export interface UniversalUploadParser {
  detectType(file: File): UniversalSourceType
  validate(file: File): Promise<UniversalValidationResult>
  extractMetadata(file: File): Promise<Readonly<Record<string, unknown>>>
  prepare(file: File, sourceType: UniversalSourceType, metadata: Readonly<Record<string, unknown>>): Promise<UniversalSource>
  parse(file: File): Promise<ParseResult>
}
