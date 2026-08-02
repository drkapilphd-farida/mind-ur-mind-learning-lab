// Production Sprint 50 — Reading Intelligence Lab™ Premium Experience.
// Continues the Reading Intelligence Lab™ arc: Sprint 46 (reading-intelligence,
// data), Sprint 47 (premium-reading-player, session presentation), Sprint 48
// (reading-intelligence-journey, integration), Sprint 49 (Lab Home refactor,
// the arc's one live-page change so far). This sprint is presentation and
// orchestration only, over already-loaded data — no engine, dataset,
// scoring, streak, or journey logic lives here.
//
// Architecture validation (done before any code was written) mapped all 15
// brief-named pieces against what already exists in the real, live product:
//   1. Premium Welcome Experience  -> JourneyHero's own greeting (dashboard
//      context) — Sprint 47's WelcomeAnimation stays the correct choice for
//      the pre-EXERCISE-SESSION welcome specifically, a different context,
//      not re-invoked here.
//   2. Beautiful Continue Learning -> src/components/exercises/ContinueLearningCard.tsx
//   3. Daily Mission Card          -> Sprint 47 DailyMissionBanner
//   4. Reading Journey Card        -> JourneyHero + JourneyTimeline
//      (src/features/quantum-speed-reading/components/dashboard/)
//   5. Mind Score Card             -> src/features/quantum-speed-reading/components/ai-reading-coach/MindScoreCard.tsx
//      — NOT src/components/dashboard/MindScoreCard.tsx, a same-named but
//      different component on a 0-100 scale for a different context
//      (confirmed by that file's own comment: "The local mindScore above
//      remains 0-100 for MindScoreCard"). The ai-reading-coach one is the
//      real 0-1000, getMindScoreLabel-shaped Mind Score™.
//   6. Progress Rings              -> src/components/exercises/ProgressRing.tsx
//      (used internally by ContinueLearningCard)
//   7. Session Status              -> NEW (status/buildReadingSessionStatus.ts +
//      components/ReadingSessionStatusCard.tsx) — no journey-level status
//      summary existed; SessionProgress.tsx is per-exercise only.
//   8. Next Recommended Exercise   -> NEW as a standalone card
//      (recommendation/buildReadingNextRecommendation.ts +
//      components/NextRecommendationCard.tsx) — the data already existed
//      (Sprint 46 dailyMission, Sprint 48 nextRecommendation), only the
//      presentational reshape is new.
//   9. Premium Completion Summary  -> Sprint 47 ReadingPlayerSummaryScreen
//  10. Micro Victory animations    -> src/components/exercises/MicroVictoryMoment.tsx
//  11. Smooth transitions          -> usePhaseFadeClass + Sprint 47 ExerciseTransition
//  12. Loading skeletons           -> src/components/ui/loading-card.tsx (LoadingCard),
//      already used by the existing src/app/labs/quantum-speed-reading/loading.tsx
//  13. Empty states                -> src/components/ui/empty-state-card.tsx
//  14. Error states                -> Next.js's own error.tsx App Router convention
//      (already established at multiple route levels) — no new component
//  15. Mobile/Desktop responsiveness -> not a component; applied to the 2 new
//      components and the composition below via the same Tailwind
//      breakpoint conventions already used throughout (sm:/md:/lg:)
//
// Net new code: two small presentational components (7, 8) plus one
// composition component (ReadingIntelligenceDashboardExperience) that
// arranges all 15 into one cohesive, responsive view. Everything else is
// genuine reuse, confirmed by direct inspection of each file, not assumed.
//
// Collision research: zero collisions for every new type/function/component
// name here. One pre-existing collision *avoided*, not created: two
// `MindScoreCard` components already exist in the codebase on different
// scales for different contexts — this feature uses only the correct one
// (see item 5 above).
//
// No new page/route. No modification to any existing component, engine, or
// prior sprint's feature folder. No wiring into any live page this sprint
// (confirmed scope decision) — ReadingIntelligenceDashboardExperience takes
// already-loaded data as props; a future sprint decides whether/how to load
// that data on a real page.

export * from './types'
export * from './status'
export * from './recommendation'
export * from './components'
