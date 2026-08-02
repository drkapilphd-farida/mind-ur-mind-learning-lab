import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { createSupabaseSessionPersistenceAdapter, loadUniversalLearningObject } from '@/features/learning-mode-runtime'
import { computeMemoryLearningProfile } from '@/features/memory-mode-runtime/intelligence'
import { computeSmartNotesLearningProfile } from '@/features/smart-notes-runtime/intelligence'
import { countSmartNotesWithContent } from '@/features/smart-notes-runtime/notes/countSmartNotesWithContent'
import { listDocumentSectionHeadings } from '@/features/mcqs-mode-runtime/presentation/listDocumentSectionHeadings'
import { listLearningProjects } from '@/api/learning'
import { computeDaysSinceLastSession } from './computeDaysSinceLastSession'
import { resolveMostRecentDocumentId } from './resolveMostRecentDocumentId'
import type { MentorActiveDocumentContext, MentorSessionContext } from '../types/MentorSessionContext'

const MAX_ACTIVE_DOCUMENT_HEADINGS = 5

// AI Mentor™ Sprint ALS-21. Real, honest grounding in the learner's own
// most recently active document — its real title, and the first few real
// section headings from its real ULO (`listDocumentSectionHeadings`, the
// exact same function MCQs™ already uses; no new parsing). Returns
// `null`, honestly, if the ULO can no longer be loaded (a deleted
// document, for instance) — never a guessed or stale title.
async function resolveActiveDocumentContext(supabase: SupabaseClient<Database>, documentId: string): Promise<MentorActiveDocumentContext | null> {
  const ulo = await loadUniversalLearningObject(supabase, documentId)
  if (!ulo) return null

  const headings = listDocumentSectionHeadings(ulo)
    .slice(0, MAX_ACTIVE_DOCUMENT_HEADINGS)
    .map((heading) => heading.heading)

  return { documentId, title: ulo.knowledge.document.title, sectionHeadings: headings }
}

// AI Mentor™ Sprint-1 — Foundation. Runtime integration — the real point
// of this module: read-only aggregation across Reading, Memory, Smart
// Notes, and Learning Projects, reusing each mode's own real persistence
// and intelligence exactly as built, never a second implementation.
//
// Memory's own `computeMemoryLearningProfile` and Smart Notes' own
// `computeSmartNotesLearningProfile` (each mode's real Sprint-3 work) are
// imported directly rather than re-derived — this is the one place in the
// codebase where importing across Learning Mode feature boundaries is the
// intended design, not an accidental coupling: AI Mentor's entire purpose
// is to consume the others' real data. Reading has no equivalent profile
// function (QSR's real Sprint-1–3 track never built one), so its own
// count is derived directly and honestly from the same real
// `listByLearner` call every other mode already uses — no new query
// shape, no new business logic invented for reading.
//
// AI Mentor™ Sprint-3 amendment: `daysSinceLast*Session` are now computed
// from the same real snapshot arrays already fetched here — no second
// query, no duplicate fetch — feeding `recommendMentorFocus.ts`'s real
// recommendations. Still no AI call, no AI-generated text — every field
// on the returned context remains real, structural data.
//
// AI Mentor™ Sprint ALS-21 amendment — `activeDocument`. A production
// audit confirmed AI Mentor™ never referenced any real document content,
// only aggregate counts — a deliberate original design choice (see
// `src/features/ai-mentor-runtime/index.ts`'s own comment on why AI
// Mentor isn't chunk/ULO-shaped), but one worth honestly partially
// closing: `resolveMostRecentDocumentId` reuses the exact same
// `readingSnapshots`/`memorySnapshots`/`smartNotesSnapshots` already
// fetched above (no new query) to find which real document the learner
// was most recently active in, then `resolveActiveDocumentContext` loads
// its real ULO and real section headings — the same real primitives
// MCQs™ already uses. AI Mentor™ still has no per-document *session*
// model of its own; this only grounds its prompt in one honest,
// real fact about what the learner is currently working on.
export async function buildMentorSessionContext(supabase: SupabaseClient<Database>, learnerId: string): Promise<MentorSessionContext> {
  const readingPersistence = createSupabaseSessionPersistenceAdapter(supabase, learnerId, 'reading')
  const memoryPersistence = createSupabaseSessionPersistenceAdapter(supabase, learnerId, 'memory')
  const smartNotesPersistence = createSupabaseSessionPersistenceAdapter(supabase, learnerId, 'smart-notes')

  const [readingSnapshots, memorySnapshots, smartNotesSnapshots, documentsWithNotes, learningProjects] = await Promise.all([
    readingPersistence.listByLearner(learnerId),
    memoryPersistence.listByLearner(learnerId),
    smartNotesPersistence.listByLearner(learnerId),
    countSmartNotesWithContent(supabase, learnerId),
    listLearningProjects(learnerId),
  ])

  const memoryProfile = computeMemoryLearningProfile(memorySnapshots)
  const smartNotesProfile = computeSmartNotesLearningProfile(smartNotesSnapshots, documentsWithNotes)

  const mostRecentDocumentId = resolveMostRecentDocumentId(readingSnapshots, memorySnapshots, smartNotesSnapshots)
  const activeDocument = mostRecentDocumentId !== null ? await resolveActiveDocumentContext(supabase, mostRecentDocumentId) : null

  return {
    learnerId,
    learningProjectsCount: learningProjects.length,
    readingSessionsCompleted: readingSnapshots.filter((snapshot) => snapshot.status === 'completed').length,
    memorySessionsCompleted: memoryProfile.sessionsCompleted,
    memoryAverageConfidenceScore: memoryProfile.averageConfidenceScore,
    smartNotesSessionsCompleted: smartNotesProfile.sessionsCompleted,
    documentsWithNotes: smartNotesProfile.documentsWithNotes,
    daysSinceLastReadingSession: computeDaysSinceLastSession(readingSnapshots),
    daysSinceLastMemorySession: computeDaysSinceLastSession(memorySnapshots),
    daysSinceLastSmartNotesSession: computeDaysSinceLastSession(smartNotesSnapshots),
    activeDocument,
  }
}
