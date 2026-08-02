// Production Sprint 48 — Reading Intelligence Journey™ Integration.
// Continues the Reading Intelligence Lab™ arc: Sprint 46
// (src/features/reading-intelligence/, real data composition) + Sprint 47
// (src/features/premium-reading-player/, real presentation components).
//
// Duplication research (done before any code was written) mapped every
// brief-named module against what already exists:
//   - Welcome            -> Sprint 47 WelcomeAnimation
//   - Daily Mission       -> Sprint 47 DailyMissionBanner + Sprint 46 ReadingDailyMission
//   - Continue Learning   -> Sprint 46 (getContinueLearningSummary reuse, exposed via dailyMission)
//   - Session Progress    -> existing SessionProgress.tsx + Sprint 46 ReadingProgressSnapshot
//   - Completion Experience / Session Summary -> Sprint 47 ReadingPlayerSummaryScreen
//   - Micro Victory       -> existing MicroVictoryMoment.tsx
//   - Next Recommendation -> derived from Sprint 46's own journey.stages (see below)
//   - Exercise Queue      -> NOTHING existing (confirmed by grep) — the only
//     genuinely new concept this sprint adds.
//
// Every one of the brief's 8 numbered rules is satisfied structurally, not
// just by intent:
//   1. Journey layer only      — zero new .tsx, zero new page/route.
//   2. Reuse every existing implementation — createReadingIntelligenceExperience()
//      (Sprint 46) is this feature's sole data source, called unmodified.
//   3. Never duplicate datasets — no dataset file touched; ExerciseSequenceItem[]
//      is caller-supplied, never fetched or hardcoded here.
//   4. Never duplicate scoring  — mindScore/readingScore fields are direct
//      reads of Sprint 46's already-computed values.
//   5. Never duplicate streaks  — streak is Sprint 46's DailyStreak, unchanged.
//   6. Never duplicate XP       — xp is Sprint 46's ReadingXp, unchanged.
//   7. Never duplicate journey logic — computeJourneyProgress/JourneyProgress
//      is never recomputed, only re-read from experience.journeyState.journey.
//   8. Never create another Reading Runtime — no engine, no player, no
//      exercise-rendering code anywhere in this feature.
//
// The one confined reuse seam: orchestration/DefaultReadingIntelligenceJourneyOrchestrator.ts
// is the only file importing a real, non-type value from another
// src/features/* folder (createReadingIntelligenceExperience). Every other
// file receives already-computed data as plain arguments and is a pure
// function — mirrors Sprint 46's own "one confined seam" discipline exactly.
//
// Collision research: zero collisions for every type/function name here.
//
// No existing file was modified. No new page/route was created. Wiring this
// journey's output into Sprint 47's PremiumReadingPlayer props on a real
// page remains deferred to a future, explicit sprint.

export * from './types'
export * from './queue'
export * from './journey'
export * from './validation'
export * from './orchestration'
