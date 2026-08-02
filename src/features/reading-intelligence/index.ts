// Production Sprint 46 — Reading Intelligence Lab™ Experience Layer.
// Follows `docs/ARCHITECTURE_CONSOLIDATION_REPORT.md` and three approved
// product decisions:
//   1. `/labs/quantum-speed-reading/intelligence` is the canonical Reading
//      Intelligence Lab™ — no new page/route is created here. This feature
//      is the orchestration layer a future sprint will use to evolve that
//      existing page; it is not wired into any route yet.
//   2. `computeDailyStreak()` (src/lib/exercises/practiceHistory.ts) is the
//      single canonical streak — no Reading-specific streak is computed.
//   3. Mind Score™ (src/lib/exercises/mindScore.ts) is the primary
//      intelligence metric; XP (this feature's own, new, secondary
//      gamification layer) never influences it.
//
// Fundamentally different from the "Real AI Integration™" arc (Sprints
// 23–45): those sprints were 100% self-contained, deterministic, zero real
// I/O. This feature's entire purpose is composing real, live, async,
// Supabase-backed production functions — real I/O through reused functions
// is correct and expected here.
//
// Reuse manifest — every real function this feature composes, verbatim,
// never reimplemented:
//   - journeyProgress.ts: computeJourneyProgress, JourneyProgress, JourneyStageView
//   - continueLearning.ts: getContinueLearningSummary, ContinueLearningSummary
//   - practiceHistory.ts: computeDailyStreak, DailyStreak
//   - mindScore.ts: computeReadingScore, computeMindScore, getMindScoreLabel
//   - queries/getModuleProgress.ts: getModuleProgress, ModuleProgress
//   - queries/getExerciseAccess.ts: ExerciseAccess (type only; buildReadingNavigationContract
//     transforms an already-fetched ExerciseAccess — this feature never calls
//     getExerciseAccess/verifyExerciseIsUnlocked itself, since it does not
//     render or gate any real route yet)
//   - useExerciseSession.ts: ExerciseSessionStage (type only)
//   - MicroVictoryMoment.tsx: its prop shape (type only, via ReadingCompletionContract)
//
// New, legitimate (non-duplicate) additions: XP (xp/computeReadingXp.ts — no
// existing Reading Lab XP system exists to reuse), and the composition/
// aggregation functions themselves (buildReadingJourneyState,
// buildReadingDailyMission, buildReadingProgressSnapshot,
// buildReadingCompletionContract, buildReadingNavigationContract) — each
// reshapes already-computed real data for this Experience Layer's own
// consumers without recomputing any of it.
//
// Out of scope, deliberately: src/features/quantum-speed-reading/adaptive-intelligence/
// (Reading Profile, Reading DNA™, Personal Bests, AI Coach, Goals,
// Achievements, Analytics) — none of the 11 brief-named modules correspond
// to that content; it stays fully isolated, no imports, no changes.
//
// Collision research: zero collisions found for every type/function name in
// this feature. One name actively avoided: `ReadingJourneyStage` already
// exists in src/components/exercise-engine/ReadingJourney.tsx as an
// unrelated 7-value union — not reused here.
//
// No file outside this folder was modified. No new page/route was created.
// `DefaultReadingIntelligenceExperience.load()` is the one file permitted to
// call real production functions/queries directly (mirrors Sprint 41's
// confined-coordinator precedent) — every other file in this feature is a
// pure function operating on already-computed real data.

export * from './types'
export * from './journey'
export * from './dailyMission'
export * from './progress'
export * from './xp'
export * from './completion'
export * from './navigation'
export * from './validation'
export * from './orchestration'
