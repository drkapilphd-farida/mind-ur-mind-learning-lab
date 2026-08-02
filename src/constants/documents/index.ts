// Compile-time constants for the `documents` domain. Mirrors the CHECK
// constraint in
// supabase/migrations/20260711000002_create_learning_projects_and_documents.sql.

export const DOCUMENT_STATUSES = ['processing', 'ready', 'failed'] as const

// Production AI Cost Optimization — Task 8. Raised from 50MB, not
// removed: a real book-length PDF/DOCX should never hit this ceiling
// (chapter-by-chapter chunking + the real per-chunk cache, Task 2, is
// what actually controls Claude cost for a large document, not an
// artificially low upload limit) — but an unbounded upload is still a
// real availability risk (a single request's memory footprint, storage
// cost) worth guarding against with a high, generous sanity ceiling.
export const MAX_DOCUMENT_SIZE_BYTES = 200 * 1024 * 1024 // 200 MB

// Sprint 1's Upload Experience™ warns (but doesn't block) above this —
// distinct from MAX_DOCUMENT_SIZE_BYTES, which blocks outright.
export const LARGE_DOCUMENT_WARNING_BYTES = 20 * 1024 * 1024 // 20 MB

// The broader future format list this domain anticipates (documents/
// index.ts was authored ahead of any specific upload flow, in Sprint 0).
// 'text/markdown' remains anticipated-but-not-yet-live — not part of
// Universal Upload Experience™'s 5 supported inputs (Sprint LW-1C.2).
export const SUPPORTED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'text/plain',
  'text/markdown',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
] as const

// Universal Upload Experience™ (Sprint LW-1C.2) — what's actually live
// today: PDF (Sprint 1) plus real support for images, camera-captured
// photos (which are just images by the time they reach validation), Word
// documents (.docx and legacy .doc), and plain text. A subset of
// SUPPORTED_DOCUMENT_MIME_TYPES above, not a contradiction of it.
//
// Honesty note: every format here is genuinely selectable, validated by a
// real content check (see validateDocumentFile.ts), and — for .docx/.txt
// — really text-extracted client-side (see documentTextExtraction.ts).
// What's NOT real yet, for every format including PDF: server-side file
// storage. `documents.storage_path` exists in the schema but no Storage
// bucket is wired up anywhere in this app — every upload today, PDF
// included, is a metadata-only insert. This sprint doesn't change that
// pre-existing limit; it just stops it from being PDF-exclusive.
export const ACCEPTED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
] as const

// The magic-byte signature every well-formed PDF starts with — used to
// genuinely detect a corrupted/mislabeled file rather than trusting the
// browser-reported MIME type or file extension alone.
export const PDF_MAGIC_BYTES = [0x25, 0x50, 0x44, 0x46, 0x2d] as const // "%PDF-"

// Real magic-byte signatures for the new image formats (Sprint LW-1C.2) —
// same "never trust the extension/MIME type alone" principle as PDF above.
export const JPEG_MAGIC_BYTES = [0xff, 0xd8, 0xff] as const
export const PNG_MAGIC_BYTES = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] as const
// WEBP: "RIFF" (bytes 0-3) + 4-byte size (skipped) + "WEBP" (bytes 8-11).
export const WEBP_RIFF_MAGIC_BYTES = [0x52, 0x49, 0x46, 0x46] as const // "RIFF"
export const WEBP_FORMAT_MAGIC_BYTES = [0x57, 0x45, 0x42, 0x50] as const // "WEBP"

// DOCX is a ZIP container — this is the standard ZIP local-file-header
// signature, a real (if generic) structural check, backed up by mammoth's
// own parse (a genuine failure there means a truly corrupt/mislabeled
// file, not just a wrong extension).
export const ZIP_MAGIC_BYTES = [0x50, 0x4b, 0x03, 0x04] as const // "PK\x03\x04"

// Legacy .doc (pre-2007 Word) — OLE Compound File Binary Format signature.
// Accepted and genuinely validated, but NOT text-extracted this sprint —
// mammoth only parses .docx; a real .doc parser is a disclosed future hook.
export const OLE_MAGIC_BYTES = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1] as const
