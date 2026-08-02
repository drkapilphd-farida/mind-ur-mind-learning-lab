// Universal Learning Intelligence Engine™ (ULIE™) — Sprint UCE-1.
// UniversalSource™ is the one object every Learning Mode will ever
// consume — no Learning Mode should read a raw PDF/DOCX/TXT/Image
// directly. Architecture only: this sprint's parser only ever produces
// pdf/docx/doc/txt/image; the remaining source types below are reserved,
// future-ready placeholders (per the brief's own "Future-ready
// placeholders only: Voice, YouTube, Website, Cloud Storage") so a later
// sprint adding real support for one of them is additive, not a breaking
// type change.
// 'unknown' is a real, honest member of this union — detectType() returns
// it for any file whose declared MIME type isn't recognized at all. It
// only ever appears in isolation (as detectType()'s own return value or
// inside an 'unsupported-type' error path); parse() never calls
// prepare()/buildUniversalSource for an 'unknown' type, so a real
// UniversalSource object never carries it.
export type UniversalSourceType = 'pdf' | 'docx' | 'doc' | 'txt' | 'image' | 'voice' | 'youtube' | 'website' | 'cloud-storage' | 'unknown'

// The upload-processing pipeline's own transient states — distinct from
// DocumentStatus (src/types/documents/index.ts, 'processing'|'ready'|
// 'failed', mirrored to the database's real CHECK constraint). This type
// describes a client-side parse in flight; DocumentStatus describes a
// persisted row's lifecycle. Never conflated, never converted between —
// touching the database is explicitly out of this sprint's scope.
export type UniversalUploadStatus = 'waiting' | 'validating' | 'accepted' | 'preparing' | 'ready' | 'failed'

export type UniversalSource = {
  id: string
  name: string
  mimeType: string
  extension: string | null
  size: number
  // No real language detection exists or is in scope this sprint — an
  // honest placeholder, never a guess.
  language: string | null
  sourceType: UniversalSourceType
  status: UniversalUploadStatus
  uploadedAt: string
  metadata: Readonly<Record<string, unknown>>
}
