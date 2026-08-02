import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { SessionSnapshot } from '@/core/learning-session-runtime'
import { loadUniversalLearningObject } from '@/features/learning-mode-runtime'
import { findReadingSessionForDocument } from '@/features/quantum-speed-reading-runtime/actions/findReadingSessionForDocument'
import { continueReadingSession } from '@/features/quantum-speed-reading-runtime/actions/continueReadingSession'
import { findMemorySessionForDocument } from '@/features/memory-mode-runtime/actions/findMemorySessionForDocument'
import { continueMemorySession } from '@/features/memory-mode-runtime/actions/continueMemorySession'
import { findSmartNotesSessionForDocument } from '@/features/smart-notes-runtime/actions/findSmartNotesSessionForDocument'
import { continueSmartNotesSession } from '@/features/smart-notes-runtime/actions/continueSmartNotesSession'
import { findFocusSessionForDocument } from '@/features/focus-mode-runtime/actions/findFocusSessionForDocument'
import { continueFocusSession } from '@/features/focus-mode-runtime/actions/continueFocusSession'
import { findMcqsSessionForDocument } from '@/features/mcqs-mode-runtime/actions/findMcqsSessionForDocument'
import { continueMcqsSession } from '@/features/mcqs-mode-runtime/actions/continueMcqsSession'
import { findRevisionSessionForDocument } from '@/features/revision-mode-runtime/actions/findRevisionSessionForDocument'
import { continueRevisionSession } from '@/features/revision-mode-runtime/actions/continueRevisionSession'
import { findResearchSessionForDocument } from '@/features/research-mode-runtime/actions/findResearchSessionForDocument'
import { continueResearchSession } from '@/features/research-mode-runtime/actions/continueResearchSession'
import type { LearningModeId } from '@/constants/learning/learningModes'
import type { LearningWorkspaceState } from '../types/LearningWorkspaceState'

type RealSessionResult = { success: true; snapshot: SessionSnapshot; totalChunks: number; estimatedTimeLeftSeconds: number } | { success: false; error: string }

function toInProgress(result: { snapshot: SessionSnapshot; totalChunks: number; estimatedTimeLeftSeconds: number }, didResume: boolean): LearningWorkspaceState {
  return {
    kind: 'in-progress',
    completionPercentage: result.snapshot.completionPercentage,
    completedChunks: result.snapshot.completedChunkIds.length,
    totalChunks: result.totalChunks,
    estimatedTimeLeftSeconds: result.estimatedTimeLeftSeconds,
    startedAt: result.snapshot.startedAt,
    didResume,
  }
}

async function resolveFromExistingOrUlo(
  supabase: SupabaseClient<Database>,
  documentId: string,
  existingSnapshot: SessionSnapshot | null,
  continueSession: (sessionId: string) => Promise<RealSessionResult>,
): Promise<LearningWorkspaceState> {
  if (existingSnapshot) {
    const result = await continueSession(existingSnapshot.sessionId)
    if (!result.success) return { kind: 'error', message: result.error }
    return toInProgress(result, true)
  }

  const ulo = await loadUniversalLearningObject(supabase, documentId)
  return ulo ? { kind: 'not-started' } : { kind: 'not-processed' }
}

// AI Learning Studio™ Sprint ALS-5, extended ALS-16/ALS-17/ALS-24 — the
// universal Learning Workspace™'s one real read: for each of the seven
// Learning Modes with a genuine session runtime today (Quantum Speed
// Reading™, Memory Mode™, Smart Notes™, Focus Mode™, MCQs™, Revision
// Mode™, Research Mode™), calls the exact same real find/continue
// functions that mode's own dedicated route (`/read`, `/memory`,
// `/notes`, `/focus`, `/mcqs`, `/revision`, `/research`) already calls on
// every load — no new session/runtime logic, only a new dispatcher in
// front of it. Every other Learning Mode (Exam Preparation, AI Mentor)
// has no real runtime to query yet, so it honestly returns 'unavailable'
// rather than guessing or faking a state.
//
// AI Learning Studio™ Sprint ALS-13 — Mind Map™ and Flashcards™ are a
// genuinely different shape: real, but "generate once from the ULO,
// cache, display instantly," never a stepped session. There is no
// find/continue-session pair for either. Reusing this exact
// `'not-processed' | 'not-started'` distinction (via the same real
// `loadUniversalLearningObject` check every other mode's fallback
// already uses) is a faithful, honest reuse of the existing state shape
// — "not started" means "ready to generate," not "ready to resume a
// session" — rather than inventing a new `LearningWorkspaceState` kind
// for a difference the Workspace itself doesn't need to know about.
export async function resolveLearningWorkspaceState(supabase: SupabaseClient<Database>, userId: string, documentId: string, modeId: LearningModeId): Promise<LearningWorkspaceState> {
  if (modeId === 'quantum-speed-reading') {
    const existing = await findReadingSessionForDocument(supabase, userId, documentId)
    return resolveFromExistingOrUlo(supabase, documentId, existing, continueReadingSession)
  }

  if (modeId === 'memory-mode') {
    const existing = await findMemorySessionForDocument(supabase, userId, documentId)
    return resolveFromExistingOrUlo(supabase, documentId, existing, continueMemorySession)
  }

  if (modeId === 'smart-notes') {
    const existing = await findSmartNotesSessionForDocument(supabase, userId, documentId)
    return resolveFromExistingOrUlo(supabase, documentId, existing, continueSmartNotesSession)
  }

  if (modeId === 'focus-mode') {
    const existing = await findFocusSessionForDocument(supabase, userId, documentId)
    return resolveFromExistingOrUlo(supabase, documentId, existing, continueFocusSession)
  }

  if (modeId === 'mcqs') {
    const existing = await findMcqsSessionForDocument(supabase, userId, documentId)
    return resolveFromExistingOrUlo(supabase, documentId, existing, continueMcqsSession)
  }

  if (modeId === 'revision-mode') {
    const existing = await findRevisionSessionForDocument(supabase, userId, documentId)
    return resolveFromExistingOrUlo(supabase, documentId, existing, continueRevisionSession)
  }

  if (modeId === 'research-mode') {
    const existing = await findResearchSessionForDocument(supabase, userId, documentId)
    return resolveFromExistingOrUlo(supabase, documentId, existing, continueResearchSession)
  }

  if (modeId === 'mind-map' || modeId === 'flashcards') {
    const ulo = await loadUniversalLearningObject(supabase, documentId)
    return ulo ? { kind: 'not-started' } : { kind: 'not-processed' }
  }

  return { kind: 'unavailable' }
}
