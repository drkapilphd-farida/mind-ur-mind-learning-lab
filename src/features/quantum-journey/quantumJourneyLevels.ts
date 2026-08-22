import type { JourneyDomain } from './types'
import type { JourneyLengthTier } from './readingContent'

export const TOTAL_JOURNEY_DAYS = 21

export type JourneyStepExerciseId =
  | 'eye-warm-up'
  | 'schulte-grid-drill'
  | 'word-flash'
  | 'brain-gym-circuit'
  | 'esp-zener-telepathy'
  | 'photographic-memory'
  | 'hemispheric-color-sync'
  | 'color-scene-transformation'
  | 'quantum-mental-rotation'

export type JourneyStepExercise = {
  exerciseId: JourneyStepExerciseId
  title: string
  // null = not one of the 3 tracked domains (see domain_performance_
  // sessions migration) — never written to that table, never eligible
  // as a weakness-drill target.
  domain: JourneyDomain | null
}

export type ReadingMode = 'quantum-reading-sprint' | 'phrase' | 'vertical-word' | 'sentence' | 'paragraph' | 'dynamic-chunking'

// 21-Day Transformation Journey™ — Clean 3-Week Phased Curriculum.
//
// Week 1 (Foundation & Brain Gym) — eye movements, foundational reading,
// and one streamlined 2-Minute Brain Gym Circuit™ (Sprint 4™) that
// bundles all 4 quick micro-drills — Saccadic Eye Jump, Peripheral
// Expanding Circle, Fast Pattern Blinking, Cross-Lateral Tap — into one
// fast, skippable session, rather than 4 separate full-length (16-round)
// exercises tediously occupying 4 separate pool slots. 4 real items for
// 7 days — every day still gets a genuinely distinct Step 1 and Step 2.
// No Zener/Intuition content of any kind — not even via Smart Weakness
// Targeting™ (see canInjectWeaknessDrill below).
const WEEK_1_POOL: readonly JourneyStepExercise[] = [
  { exerciseId: 'eye-warm-up', title: 'Eye Warm-up', domain: null },
  { exerciseId: 'schulte-grid-drill', title: 'Schulte Grid™', domain: null },
  { exerciseId: 'word-flash', title: 'Word Flash™', domain: null },
  { exerciseId: 'brain-gym-circuit', title: '2-Minute Brain Gym Circuit™', domain: null },
]

// Week 2 (Expansion & Visualisation) — Right Brain + Visualisation only;
// Intuition/Zener is deliberately absent here too, moved to Week 3.
const WEEK_2_POOL: readonly JourneyStepExercise[] = [
  { exerciseId: 'photographic-memory', title: 'Photographic Memory™', domain: 'right_brain' },
  { exerciseId: 'color-scene-transformation', title: 'Color & Scene Transformation Journey™', domain: 'visualisation' },
  { exerciseId: 'quantum-mental-rotation', title: 'Quantum Mental Object Rotation™', domain: 'visualisation' },
]

// Week 3 (Advanced Quantum Flow & Intuition) — Zener Card Telepathy
// headlines this week (the only week Intuition content ever appears in),
// alongside Right Brain and a Visualisation module of its own — creative
// Visualisation exercises are strategically placed across both Week 2
// and Week 3, never confined to just one week.
const WEEK_3_POOL: readonly JourneyStepExercise[] = [
  { exerciseId: 'esp-zener-telepathy', title: 'ESP Zener Card Telepathy Sprint™', domain: 'intuition' },
  { exerciseId: 'hemispheric-color-sync', title: 'Hemispheric Color-Word Sync Grid™', domain: 'right_brain' },
  { exerciseId: 'quantum-mental-rotation', title: 'Quantum Mental Object Rotation™', domain: 'visualisation' },
]

// Every domain-tracked exercise, grouped by domain — used only to pick a
// weakness-targeting drill (see getWeaknessDrill) that's guaranteed to
// differ from whatever that day's normal Step 2 pick already is, when a
// real alternative exists in that domain.
const DOMAIN_EXERCISE_POOL: Record<Exclude<JourneyDomain, 'reading'>, readonly JourneyStepExercise[]> = {
  intuition: [WEEK_3_POOL[0]!],
  right_brain: [WEEK_2_POOL[0]!, WEEK_3_POOL[1]!],
  visualisation: [WEEK_2_POOL[1]!, WEEK_2_POOL[2]!],
}

// Flexible Mandatory Breathing Rule™ — breath-awareness prep is
// compulsory (no Skip) for the first full week only, Days 1 through 7,
// to build the initial habit. From Day 8 onward a returning user has
// already built that habit, so every day's warm-up is freely skippable
// — respecting their autonomy rather than nagging a user who's already
// shown up 7+ times.
const MANDATORY_BREATHING_DAYS_THRESHOLD = 7

export function isMandatoryBreathingDay(day: number): boolean {
  return day <= MANDATORY_BREATHING_DAYS_THRESHOLD
}

export function getWeekNumber(day: number): 1 | 2 | 3 {
  if (day <= 7) return 1
  if (day <= 14) return 2
  return 3
}

export function getWeekTheme(day: number): string {
  const week = getWeekNumber(day)
  if (week === 1) return 'Foundation & Brain Gym'
  if (week === 2) return 'Expansion & Visualisation'
  return 'Advanced Quantum Flow & Intuition'
}

function getWeekPool(day: number): readonly JourneyStepExercise[] {
  const week = getWeekNumber(day)
  if (week === 1) return WEEK_1_POOL
  if (week === 2) return WEEK_2_POOL
  return WEEK_3_POOL
}

// Deterministic, offset-by-one rotation through that week's pool — Step
// 1 and Step 2 are guaranteed to never be the same exercise on the same
// day, whether the week's pool has 2 or 3 real items.
export function getStep1AndStep2(day: number): { step1: JourneyStepExercise; step2: JourneyStepExercise } {
  const pool = getWeekPool(day)
  const dayIndexInWeek = (day - 1) % 7
  const step1 = pool[dayIndexInWeek % pool.length]!
  const step2 = pool[(dayIndexInWeek + 1) % pool.length]!
  return { step1, step2 }
}

// Smart Weakness Targeting™ — a real exercise from the struggling
// domain's own pool, preferring one that differs from `avoidExerciseId`
// (that day's already-scheduled Step 2 pick) so a triggered day never
// shows the identical exercise twice — falls back to the same exercise
// only when the domain has just one real option (Intuition).
export function getWeaknessDrill(domain: Exclude<JourneyDomain, 'reading'>, avoidExerciseId?: JourneyStepExerciseId): JourneyStepExercise {
  const pool = DOMAIN_EXERCISE_POOL[domain]
  return pool.find((exercise) => exercise.exerciseId !== avoidExerciseId) ?? pool[0]!
}

// Clean 3-Week Phased Curriculum — Smart Weakness Targeting™ is not
// allowed to break a week's own theme. Week 1 stays strictly Brain Gym
// (no domain injection of any kind, ever). Week 2 stays Zener-free —
// Right Brain/Visualisation injection is fine (already that week's own
// theme), Intuition injection is suppressed until Week 3. Week 3 allows
// every domain, Intuition especially, since that's its whole point.
export function canInjectWeaknessDrill(domain: Exclude<JourneyDomain, 'reading'>, day: number): boolean {
  const week = getWeekNumber(day)
  if (week === 1) return false
  if (week === 2) return domain !== 'intuition'
  return true
}

// Full Reading Sprint Variety™ + Progressive Reading™ — every reading
// intelligence mode (the classic Quantum Speed Reading Sprint/Chunking,
// Phrase, Vertical Word, Sentence, and Paragraph reading — plus Dynamic
// Chunking as a 6th bonus mode) rotates deterministically across all 21
// days, cycling every 6 days so the sequence never feels random or
// repeats the same mode two days running near a cycle boundary.
// RetentionCheckPhase (Step 4) pairs with every one of these EXCEPT
// Dynamic Chunking — the Rich Indian-Centric Content Database™
// (../readingContent) gives Phrase/Vertical-Word/Sentence/Paragraph modes
// genuine comprehension+retention MCQs on the same real passage, the same
// real pairing the classic Sprint already had. Dynamic Chunking
// (ProgressiveChunkReadingExperience) draws from its own separate
// content-engine, structurally incompatible with ReadingSet-shaped
// retention questions — so it gets a different, lightweight Step 4
// instead (DynamicChunkingRecallCheck, Dynamic Chunking Feedback Loop
// Fix™), never a dropped step (see QuantumJourneySession.tsx's own
// handling of 'dynamic-chunking' days).
const READING_MODE_ROTATION: readonly ReadingMode[] = [
  'quantum-reading-sprint',
  'phrase',
  'vertical-word',
  'sentence',
  'paragraph',
  'dynamic-chunking',
]

export function getReadingMode(day: number): ReadingMode {
  return READING_MODE_ROTATION[(day - 1) % READING_MODE_ROTATION.length]!
}

// Progressive Reading™ — reading length grows naturally as the journey
// progresses: Week 1 draws from the database's 'short' passages, Week 2
// from 'medium', Week 3 from 'long' — without needing 21 distinct tiers.
export function getReadingLengthTier(day: number): JourneyLengthTier {
  const week = getWeekNumber(day)
  if (week === 1) return 'short'
  if (week === 2) return 'medium'
  return 'long'
}

// Dynamic Zener Card Naming Variant™ — the same real exercise
// (esp-zener-telepathy: same drill, same accuracy tracking, same
// 'intuition' domain) shown under two different display names depending
// on which audience is looking at it. Productivity/QSR-ad traffic sees
// "Pattern Intuition Sprint™" — a pattern-recognition framing that fits
// a speed-reading/productivity pitch; organic/spiritual-angle traffic
// sees the original "ESP Zener Card Telepathy™". This only ever changes
// the label a learner reads on screen (and what's fed to the AI Coach
// prompt, so its generated message stays consistent with what the
// learner just saw) — never the exercise itself, its scoring, or its
// domain classification.
export type ExerciseLabelVariant = 'productivity' | 'spiritual'

const ZENER_LABEL_BY_VARIANT: Record<ExerciseLabelVariant, string> = {
  productivity: 'Pattern Intuition Sprint™',
  spiritual: 'ESP Zener Card Telepathy™',
}

export function resolveExerciseDisplayTitle(exercise: JourneyStepExercise, variant: ExerciseLabelVariant): string {
  return exercise.exerciseId === 'esp-zener-telepathy' ? ZENER_LABEL_BY_VARIANT[variant] : exercise.title
}
