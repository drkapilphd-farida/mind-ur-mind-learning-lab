// Smart Exit & Auto-Advance™ — the single function every "back to the
// lab index" call site across the exercise catalog gets wrapped with, so
// an exercise opened as part of an active Daily Session Playlist returns
// the learner to the curriculum (and advances the playlist) instead of
// dumping them at the generic lab root. Every wrapped call site falls
// back to its ORIGINAL, unchanged destination whenever there is no
// active session, or the active session's current exercise isn't this
// one (e.g. the learner opened this exercise directly, outside the
// curriculum) — zero behavior change for non-curriculum usage.
//
// Two variants, because the shared engines this wraps distinguish two
// real cases:
//   - "smart exit" — an early abandon (Escape key, explicit mid-exercise
//     Exit button) — ends the whole playlist rather than silently
//     crediting a skipped exercise as done.
//   - "smart complete" — the natural "you're finished, back to lab"
//     action — advances the playlist to the next exercise, or, on the
//     final exercise, marks the day complete and returns to the day
//     view with a celebration flag.
// A number of simpler exercise engines collapse both cases into one
// button/call site; those are wrapped with the "complete" variant, since
// that call site is only reachable after the exercise's own completion
// screen renders (never a genuine mid-session cancel) — see each batch
// edit's own file for the specific reasoning.
import { advanceCurriculumSession, clearActiveCurriculumSession, getCurrentSessionExerciseHref, isSessionOnFinalExercise, loadActiveCurriculumSession } from './curriculumSessionRunner'
import { markCurriculumDayComplete } from './curriculumProgress'
import { isCheckpointDay } from './curriculumDatabase'

const CURRICULUM_ROUTE = '/labs/quantum-speed-reading/thirty-day-curriculum'

function buildDayReturnUrl(day: number, dayComplete: boolean): string {
  const params = new URLSearchParams({ view: 'day', day: String(day) })
  if (dayComplete) params.set('dayComplete', '1')
  return `${CURRICULUM_ROUTE}?${params.toString()}`
}

function isThisExerciseTheActiveSessionStep(exerciseId: string): boolean {
  const session = loadActiveCurriculumSession()
  if (session === null) return false
  return session.exerciseIds[session.currentIndex] === exerciseId
}

// Pure, side-effect-free — safe to call at render time (e.g. to decide
// whether to show a "Continue Session" button at all). Both
// `getCurriculumSmart*Href` functions below MUTATE session storage as
// they compute their result, so neither is safe to bind directly into a
// passive prop (like a `<Link href={...}>`) that could be re-evaluated on
// every render — they must only ever be called imperatively, inside a
// real click/keydown handler, exactly once per actual navigation.
export function isCurriculumSessionCurrentExercise(exerciseId: string): boolean {
  return isThisExerciseTheActiveSessionStep(exerciseId)
}

// Early abandon — ends the playlist (no credit, no advance) and returns
// to the day view. Falls back to `fallbackHref` unchanged outside an
// active matching session.
export function getCurriculumSmartExitHref(exerciseId: string, fallbackHref: string): string {
  const session = loadActiveCurriculumSession()
  if (session === null || session.exerciseIds[session.currentIndex] !== exerciseId) return fallbackHref
  const { day } = session
  clearActiveCurriculumSession()
  return buildDayReturnUrl(day, false)
}

// Natural completion — advances to the next exercise in the playlist, or
// (on the final exercise) marks the day complete and returns to the day
// view flagged for its celebration recap. Falls back to `fallbackHref`
// unchanged outside an active matching session.
export function getCurriculumSmartCompleteHref(exerciseId: string, fallbackHref: string): string {
  if (!isThisExerciseTheActiveSessionStep(exerciseId)) return fallbackHref

  const session = loadActiveCurriculumSession()
  if (session === null) return fallbackHref
  const { day } = session

  if (!isSessionOnFinalExercise(session)) {
    const advanced = advanceCurriculumSession()
    const nextHref = advanced !== null ? getCurrentSessionExerciseHref(advanced) : null
    if (nextHref !== null) return nextHref
  }

  // Final exercise (or the queue otherwise ran out) — the playlist itself
  // is done. On a checkpoint day (1/7/14/21/30), finishing the regular
  // exercise queue must NOT mark the day complete — that day's real
  // completion condition is the WPM + comprehension assessment
  // (see recordCurriculumCheckpoint), never bypassable by just clicking
  // through exercises. Every other day marks complete right here.
  clearActiveCurriculumSession()
  if (isCheckpointDay(day)) {
    return buildDayReturnUrl(day, false)
  }
  markCurriculumDayComplete(day)
  return buildDayReturnUrl(day, true)
}
