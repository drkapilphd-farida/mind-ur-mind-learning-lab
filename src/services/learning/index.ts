// Business logic for the `learning` domain (Learning Projects + Learning
// Sessions). Implemented against
// supabase/migrations/20260711000002_create_learning_projects_and_documents.sql
// and 20260711000003_create_learning_sessions.sql — see
// docs/adr/0002-domain-layered-architecture.md. `api/learning/` is the
// only intended caller. `startLearningSession` is out of scope for
// Sprint 1 (First Learning Project™ doesn't create a session — Sprint 2
// / Learning Workspace™ does) and still throws.

import { NotImplementedError } from '@/lib/errors'
import { createClient } from '@/lib/supabase/server'
import { DAILY_INSIGHTS } from '@/constants/learning'
import type { LearningProject, LearningSession, LearningSessionType } from '@/types/learning'

// The exact columns Sprint 1's Dashboard needs — no `select('*')`, so
// adding a column to the table later never silently changes this
// query's shape.
const LEARNING_PROJECT_COLUMNS = 'id, user_id, family_id, title, description, status, created_at, updated_at' as const

type LearningProjectRow = {
  id: string
  user_id: string
  family_id: string | null
  title: string
  description: string | null
  // The generated Supabase type widens this CHECK-constrained column to
  // `string` — narrowed back to the real union here, since the database
  // constraint (learning_projects.status CHECK) already guarantees one
  // of the three values.
  status: string
  created_at: string
  updated_at: string
}

function toLearningProject(row: LearningProjectRow): LearningProject {
  return {
    id: row.id,
    userId: row.user_id,
    familyId: row.family_id,
    title: row.title,
    description: row.description,
    status: row.status as LearningProject['status'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function listLearningProjects(userId: string): Promise<readonly LearningProject[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('learning_projects')
    .select(LEARNING_PROJECT_COLUMNS)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) throw new Error(`listLearningProjects failed: ${error.message}`)

  return (data ?? []).map(toLearningProject)
}

// Scoped by both id and user_id — never trust a route param alone, even
// though RLS already enforces this at the database layer (defense in
// depth, matching the rest of this domain's query style).
export async function getLearningProject(userId: string, id: string): Promise<LearningProject | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('learning_projects')
    .select(LEARNING_PROJECT_COLUMNS)
    .eq('user_id', userId)
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(`getLearningProject failed: ${error.message}`)

  return data ? toLearningProject(data) : null
}

export type CreateLearningProjectInput = {
  userId: string
  title: string
}

export async function createLearningProject(input: CreateLearningProjectInput): Promise<LearningProject> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('learning_projects')
    .insert({ user_id: input.userId, title: input.title, status: 'active' })
    .select(LEARNING_PROJECT_COLUMNS)
    .single()

  if (error) throw new Error(`createLearningProject failed: ${error.message}`)

  return toLearningProject(data)
}

export type StartLearningSessionInput = {
  userId: string
  learningProjectId: string | null
  sessionType: LearningSessionType
}

// One function for all four session types (Reading/Memory/Revision/
// Research), per the domain model's extensibility requirement — never
// startReadingSession/startMemorySession/... as separate functions.
export async function startLearningSession(input: StartLearningSessionInput): Promise<LearningSession> {
  throw new NotImplementedError(`startLearningSession(sessionType=${input.sessionType}) — Learning Sessions sprint`)
}

// Sprint LW-1A — Welcome Experience™. A pure, deterministic "insight of the
// day" — the same calendar day always yields the same insight for every
// user (no I/O, no randomness), selected from DAILY_INSIGHTS by day-of-year.
// This is the explicit, disclosed swap point for a future real AI-generated,
// personalized insight (see docs/PRODUCTION_HANDOFF_LW_1A.md) — the
// deterministic selection is never presented as AI-generated.
export function getDailyInsight(date: Date): string {
  const startOfYear = Date.UTC(date.getUTCFullYear(), 0, 1)
  const startOfDay = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  const dayOfYear = Math.floor((startOfDay - startOfYear) / (24 * 60 * 60 * 1000))
  const insight = DAILY_INSIGHTS[dayOfYear % DAILY_INSIGHTS.length]
  if (insight === undefined) throw new Error('getDailyInsight: DAILY_INSIGHTS is empty.')
  return insight
}
