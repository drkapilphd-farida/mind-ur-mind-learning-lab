import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import type { Json } from '@/lib/supabase/types'

// Shared Learning Runtime — Memory Mode™ Sprint-1 shared-extraction.
// Moved verbatim from Quantum Speed Reading™'s own `persistence/uloRecord.ts`
// (Sprint-1) — the Learning Mode Loader's own record shape, matching
// `universal_learning_objects`
// (supabase/migrations/20260717000001_create_universal_learning_objects.sql)
// exactly. Already fully mode-agnostic — a ULO belongs to a document, not
// a Learning Mode. `data` is cast through `unknown` — a
// `UniversalLearningObject` is genuinely, structurally JSON-safe (every
// field is a string, number, boolean, plain object, or array; every
// timestamp is already a real ISO string, never a `Date`), but
// TypeScript's recursive `Json` union and this object's own `readonly`
// array fields don't structurally unify without an explicit assertion —
// a real, narrow cast at a real serialization boundary, not a widening
// escape hatch.
export type UniversalLearningObjectRecord = {
  document_id: string
  ulo_id: string
  ulo_version_revision: number
  data: Json
}

export function toUniversalLearningObjectRecord(ulo: UniversalLearningObject): UniversalLearningObjectRecord {
  return {
    document_id: ulo.documentId,
    ulo_id: ulo.id,
    ulo_version_revision: ulo.version.revision,
    data: ulo as unknown as Json,
  }
}

// Real, minimal shape check — never a full re-validation of everything
// UCE-1…6 already guaranteed at construction time. This table only ever
// stores what our own system wrote (never untrusted external input), so
// this exists to catch a genuinely corrupted/foreign row honestly rather
// than to re-derive UCE's own construction guarantees a second time.
export function fromUniversalLearningObjectRecord(data: Json): UniversalLearningObject | null {
  if (!isUniversalLearningObjectShaped(data)) return null
  return data as unknown as UniversalLearningObject
}

function isUniversalLearningObjectShaped(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.documentId === 'string' &&
    typeof candidate.version === 'object' &&
    typeof candidate.knowledge === 'object' &&
    typeof candidate.analysis === 'object' &&
    typeof candidate.learning === 'object' &&
    typeof candidate.experience === 'object' &&
    typeof candidate.audit === 'object'
  )
}
