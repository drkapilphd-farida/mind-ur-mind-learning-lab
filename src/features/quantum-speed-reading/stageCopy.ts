// Sprint-12A/12B/12E — Brain Transformation Experience™. Static, honest copy
// per journey stage: an icon, an estimated time (each reusing that stage's
// own already-published estimate where one exists), 3 short "Today's Brain
// Benefit" phrases, one warm supporting sentence for the active stage's
// "Today's Mission™" card (12B), and (12E, Psychology & Motivation™) an
// Expected Outcome™ sentence, a growth statement replacing raw completion
// percentages, a post-completion skill-reinforcement line, and a next-stage
// anticipation teaser. Copy only — every number elsewhere on the dashboard
// still comes from real computeJourneyProgress/getModuleProgress data;
// nothing here is a metric.
export type StageCopy = {
  icon: string
  estimatedTime: string
  benefits: readonly [string, string, string]
  missionSupportingLine: string
  expectedOutcome: string
  growthStatement: string
  completionReinforcementLine: string
  nextStageTeaser: string | null
}

export const STAGE_COPY: Record<string, StageCopy> = {
  'visual-activation': {
    icon: '👁',
    estimatedTime: '10–15 Minutes',
    benefits: ['Improve Focus', 'Improve Visual Stability', 'Prepare for Faster Reading'],
    missionSupportingLine: 'A calm start that wakes up your visual system.',
    expectedOutcome: 'By the end, your eyes and focus will feel calmer and more prepared to train.',
    growthStatement: "You're strengthening your visual stability and focus.",
    completionReinforcementLine: 'Your visual stability and focus have measurably improved.',
    nextStageTeaser: 'Next: Reading Preparation™ — where your eyes learn the rhythm real reading requires.',
  },
  'reading-preparation': {
    icon: '📖',
    estimatedTime: '3–5 Minutes',
    benefits: ['Improve Eye Control', 'Reduce Regression', 'Build Reading Rhythm'],
    missionSupportingLine: 'Warm up before your mind moves at full speed.',
    expectedOutcome: 'By the end, your eyes will move with less backtracking and more control.',
    growthStatement: "You're building steadier eye control and reading rhythm.",
    completionReinforcementLine: 'Your eye control and reading rhythm have measurably improved.',
    nextStageTeaser: 'Next: Core Reading Journey™ — where this steadier rhythm turns into real reading speed. (Optional — you can also skip straight there.)',
  },
  'core-reading-journey': {
    icon: '🚀',
    estimatedTime: '15–20 Minutes',
    benefits: ['Deeper Comprehension', 'Smoother Reading Flow', 'Stronger Focus Endurance'],
    missionSupportingLine: 'Turn practice into real reading fluency.',
    expectedOutcome: "By the end, you'll read longer passages with more flow and better comprehension.",
    growthStatement: "You're turning your training into real reading fluency.",
    completionReinforcementLine: 'Your reading flow and comprehension have measurably improved.',
    nextStageTeaser: 'Next: Reading Intelligence™ — where you can see everything your brain has built.',
  },
  'reading-intelligence': {
    icon: '🧠',
    estimatedTime: 'Explore anytime',
    benefits: ['Track Your Transformation', 'Understand Your Reading Mind', 'See Real Progress Over Time'],
    missionSupportingLine: 'See how far your mind has already come.',
    expectedOutcome: 'An ongoing view of your reading mind — not a one-time finish line.',
    growthStatement: "You're building a clearer picture of your own reading mind.",
    completionReinforcementLine: 'Your reading intelligence resource is always available here.',
    nextStageTeaser: null,
  },
}
