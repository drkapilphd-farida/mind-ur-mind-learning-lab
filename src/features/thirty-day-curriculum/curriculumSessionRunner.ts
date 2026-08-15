// In-Page Step-by-Step Master Player™ — the sessionStorage-backed queue
// used ONLY when DayMasterPlayer.tsx has to hand off to one of the 16
// server-gated exercises (real Pro/sequential-unlock checks live in
// their own page.tsx — see curriculumGatedExercises.ts; embedding them
// directly would silently bypass that gate). Every OTHER, embeddable
// exercise is sequenced by DayMasterPlayer purely via local React state
// and never touches this module at all — see that file's own doc comment
// for why keeping this session "active" during in-page playback would
// make each embedded exercise's own internal curriculum-session hook
// fight the wizard's direct completion callback. Session-scoped
// (sessionStorage, not localStorage): closing the tab or starting a
// fresh day naturally abandons any half-finished hand-off rather than
// leaving stale state to resume days later.
import { getCurriculumExerciseById, type CurriculumExerciseCategory } from './curriculumExerciseCatalog'
import { buildCurriculumDayPlan, type CurriculumDayExercises } from './curriculumDatabase'

export const CURRICULUM_SESSION_STORAGE_KEY = 'qsr-active-curriculum-session'

// Brain Gym -> Right-Brain/Intuition -> Visualization -> Reading
// Intelligence — the exact order the spec names, matching
// ThirtyDayCurriculumDayDetail.tsx's own CATEGORY_ORDER.
const SESSION_CATEGORY_ORDER: readonly CurriculumExerciseCategory[] = ['brain-gym', 'right-brain-intuition', 'visualization', 'reading-intelligence']

export type ActiveCurriculumSession = {
  day: number
  exerciseIds: readonly string[]
  currentIndex: number
}

// Exported so DayMasterPlayer.tsx can build the exact same flattened,
// correctly-ordered queue for its own in-page rendering without
// duplicating the category-order logic.
export function buildSessionQueue(exercises: CurriculumDayExercises): readonly string[] {
  const groups: Record<CurriculumExerciseCategory, readonly { id: string }[]> = {
    'brain-gym': exercises.brainGym,
    'right-brain-intuition': exercises.rightBrainIntuition,
    visualization: exercises.visualization,
    'reading-intelligence': exercises.readingIntelligence,
  }
  return SESSION_CATEGORY_ORDER.flatMap((category) => groups[category].map((exercise) => exercise.id))
}

function isValidSession(value: unknown): value is ActiveCurriculumSession {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return (
    typeof record.day === 'number' &&
    Array.isArray(record.exerciseIds) &&
    record.exerciseIds.every((id) => typeof id === 'string') &&
    typeof record.currentIndex === 'number'
  )
}

function saveSession(session: ActiveCurriculumSession): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(CURRICULUM_SESSION_STORAGE_KEY, JSON.stringify(session))
  } catch {
    // sessionStorage full or blocked — the playlist just won't auto-advance; harmless.
  }
}

export function startCurriculumSession(day: number): ActiveCurriculumSession {
  const plan = buildCurriculumDayPlan(day)
  const exerciseIds = buildSessionQueue(plan.exercises)
  const session: ActiveCurriculumSession = { day, exerciseIds, currentIndex: 0 }
  saveSession(session)
  return session
}

// In-Page Master Player™ — used only when handing off to one of the 16
// server-gated exercises (Pro/sequential-unlock — see
// curriculumGatedExercises.ts). The wizard drives every other, embeddable
// exercise via local React state with no sessionStorage involvement at
// all (see DayMasterPlayer.tsx's own doc comment for why); this function
// exists purely so a gated exercise's own already-working smart
// exit/complete wiring (unchanged since it was built) knows exactly which
// step of the day it's standing in for, without needing to have replayed
// every step before it.
export function startCurriculumSessionAtStep(day: number, stepIndex: number): ActiveCurriculumSession {
  const plan = buildCurriculumDayPlan(day)
  const exerciseIds = buildSessionQueue(plan.exercises)
  const clampedIndex = Math.min(Math.max(stepIndex, 0), Math.max(exerciseIds.length - 1, 0))
  const session: ActiveCurriculumSession = { day, exerciseIds, currentIndex: clampedIndex }
  saveSession(session)
  return session
}

export function loadActiveCurriculumSession(): ActiveCurriculumSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(CURRICULUM_SESSION_STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isValidSession(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function clearActiveCurriculumSession(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(CURRICULUM_SESSION_STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function getCurrentSessionExerciseId(session: ActiveCurriculumSession): string | null {
  return session.exerciseIds[session.currentIndex] ?? null
}

export function isSessionOnFinalExercise(session: ActiveCurriculumSession): boolean {
  return session.currentIndex >= session.exerciseIds.length - 1
}

// Advances the CURRENT active session (read fresh from storage, not
// trusted from a stale caller-held reference) to the next exercise and
// persists it. Returns null — and clears storage — once the queue is
// exhausted, which the caller (curriculumReturnRouting.ts) treats as "the
// whole day's playlist is complete."
export function advanceCurriculumSession(): ActiveCurriculumSession | null {
  const current = loadActiveCurriculumSession()
  if (current === null) return null
  const nextIndex = current.currentIndex + 1
  if (nextIndex >= current.exerciseIds.length) {
    clearActiveCurriculumSession()
    return null
  }
  const next: ActiveCurriculumSession = { ...current, currentIndex: nextIndex }
  saveSession(next)
  return next
}

export function getCurrentSessionExerciseHref(session: ActiveCurriculumSession): string | null {
  const exerciseId = getCurrentSessionExerciseId(session)
  if (exerciseId === null) return null
  return getCurriculumExerciseById(exerciseId)?.href ?? null
}
