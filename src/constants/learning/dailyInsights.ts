// Sprint LW-1A — Welcome Experience™. A small, fixed set of learning-science
// insights shown one-per-day on the Welcome screen. Deliberately simple,
// non-personalized copy — this is the placeholder swap point for a future
// AI-generated, personalized insight (see getDailyInsight in
// services/learning/index.ts for the selection logic this feeds).

export const DAILY_INSIGHTS: readonly string[] = [
  'Understanding is stronger than memorizing.',
  'Learning a little every day beats cramming.',
  'Focus creates memory.',
  'Curiosity is the fastest path to mastery.',
  'Small, consistent effort compounds into real skill.',
  'Teaching an idea back to yourself reveals what you truly know.',
  'Rest is part of learning, not a break from it.',
] as const
