// Business logic for the `generated_learning_content` domain. Implemented
// against supabase/migrations/20260719000002_create_generated_learning_content.sql
// — see docs/adr/0002-domain-layered-architecture.md.
// `api/generatedLearningContent/` is the only intended caller.

import type { Json } from '@/lib/supabase/types'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export type GeneratedLearningContentModeId = 'mind-map' | 'flashcards'

// Read with the caller's own authenticated client — RLS already scopes
// this to the caller's own documents (via the real `documents.user_id`
// join in the migration's own SELECT policy), so no separate ownership
// check is duplicated here. `T` is intentionally not constrained to
// `Json`: the domain types this stores (`MindMapOutline`, `FlashCardDeck`)
// use `readonly` arrays throughout, matching this codebase's own
// convention for domain types, while the generated `Json` type is
// mutable-array-only — a real TypeScript variance mismatch with no real
// safety consequence (a readonly array serializes identically to a
// mutable one). The cast to/from `Json` happens here, once, at the true
// serialization boundary, rather than forcing every domain type in this
// codebase to abandon `readonly` to satisfy it.
export async function getGeneratedLearningContent<T>(documentId: string, modeId: GeneratedLearningContentModeId): Promise<T | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('generated_learning_content').select('data').eq('document_id', documentId).eq('mode_id', modeId).maybeSingle()

  if (error) throw new Error(`getGeneratedLearningContent failed: ${error.message}`)

  return data ? (data.data as T) : null
}

// Real, system-authoritative content (a pure derivation of an already-
// real, already-saved Universal Learning Object™) — the same
// service-role-write, no-authenticated-write-policy pattern this app
// already established for `universal_learning_objects` (see that
// migration's own comment for why). Only ever called after the caller's
// own auth + ownership check has already passed, exactly like
// `saveUniversalLearningObject`.
export async function saveGeneratedLearningContent<T>(documentId: string, modeId: GeneratedLearningContentModeId, data: T): Promise<void> {
  const supabase = createServiceClient()
  const { error } = await supabase.from('generated_learning_content').upsert({ document_id: documentId, mode_id: modeId, data: data as unknown as Json }, { onConflict: 'document_id,mode_id' })

  if (error) throw new Error(`saveGeneratedLearningContent failed: ${error.message}`)
}
