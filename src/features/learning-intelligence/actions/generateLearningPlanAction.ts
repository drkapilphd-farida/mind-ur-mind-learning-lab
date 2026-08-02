'use server'

// Orchestration Server Action (Sprint 3, Chunk 4). Thin by design,
// matching this codebase's existing Server Action convention (see
// src/app/preview/learning-projects/new/actions.ts): validate input,
// authorize, delegate. Reuses the existing, unmodified
// `listDocuments` from `@/api/documents` (Sprint 1, locked) rather than
// adding a new single-row query — no changes to any Sprint 1/2 file.
// Not called from any page yet — this chunk adds orchestration
// plumbing only, per its own approved scope.

import { z } from 'zod'
import { listDocuments } from '@/api/documents'
import { createClient } from '@/lib/supabase/server'
import { createLearningIntelligenceEngine } from '../engine'
import type { LearningPlan } from '../types'

const GenerateLearningPlanSchema = z.object({
  documentId: z.string().uuid(),
})

export type GenerateLearningPlanResult = { success: true; plan: LearningPlan } | { success: false; error: string }

export async function generateLearningPlanAction(documentId: string): Promise<GenerateLearningPlanResult> {
  const parsed = GenerateLearningPlanSchema.safeParse({ documentId })
  if (!parsed.success) {
    return { success: false, error: 'This document could not be found.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'You must be signed in to continue.' }
  }

  const documents = await listDocuments(user.id)
  const document = documents.find((candidate) => candidate.id === parsed.data.documentId)

  if (!document) {
    return { success: false, error: 'This document could not be found.' }
  }

  const engine = createLearningIntelligenceEngine()
  const plan = await engine.generateLearningPlan(document)

  return { success: true, plan }
}
