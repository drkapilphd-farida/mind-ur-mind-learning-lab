// Color & Scene Transformation Journey™ — the second Visualization
// Development exercise, alongside Quantum Mental Object Rotation™. Its
// own folder/content, no shared files with any sibling.
//
// Each round narrates a short, real chain of transformations applied to
// a serene scene — either a 2-step COLOR journey (e.g. an ocean shifting
// blue → turquoise → golden) or a 2-step TIME-OF-DAY journey (e.g. a
// forest moving day → dusk → night) — then hides the scene and asks
// which state it ended on. The chain is built and shown in full before
// the question is ever asked, so the "correct answer" is always exactly
// what the chain's own final link says — never a fabricated ground
// truth the learner had no fair way to know.

export type Scene = {
  id: string
  label: string
  elementLabel: string
}

export const SCENES: readonly Scene[] = [
  { id: 'ocean', label: 'Ocean', elementLabel: 'the water' },
  { id: 'forest', label: 'Forest', elementLabel: 'the canopy' },
  { id: 'desert', label: 'Desert', elementLabel: 'the sand' },
  { id: 'meadow', label: 'Meadow', elementLabel: 'the wildflowers' },
  { id: 'mountain', label: 'Mountain', elementLabel: 'the peak' },
  { id: 'lake', label: 'Lake', elementLabel: 'the surface' },
  { id: 'canyon', label: 'Canyon', elementLabel: 'the rock walls' },
  { id: 'sky', label: 'Sky', elementLabel: 'the horizon' },
]

export type JourneyColorName = 'blue' | 'turquoise' | 'golden' | 'crimson' | 'violet' | 'emerald' | 'amber' | 'rose'

export type JourneyColor = { name: JourneyColorName; label: string; hex: string }

export const JOURNEY_COLORS: readonly JourneyColor[] = [
  { name: 'blue', label: 'Blue', hex: '#3b82f6' },
  { name: 'turquoise', label: 'Turquoise', hex: '#2dd4bf' },
  { name: 'golden', label: 'Golden', hex: '#f5b93d' },
  { name: 'crimson', label: 'Crimson', hex: '#dc2626' },
  { name: 'violet', label: 'Violet', hex: '#8b5cf6' },
  { name: 'emerald', label: 'Emerald', hex: '#10b981' },
  { name: 'amber', label: 'Amber', hex: '#f59e0b' },
  { name: 'rose', label: 'Rose', hex: '#f43f5e' },
]

const JOURNEY_COLOR_BY_NAME: Record<JourneyColorName, JourneyColor> = Object.fromEntries(
  JOURNEY_COLORS.map((color) => [color.name, color]),
) as Record<JourneyColorName, JourneyColor>

export function getJourneyColor(name: JourneyColorName): JourneyColor {
  const color = JOURNEY_COLOR_BY_NAME[name]
  if (color === undefined) throw new Error(`unknown journey color: ${name}`)
  return color
}

export type TimeOfDayName = 'dawn' | 'day' | 'dusk' | 'night'

export type TimeOfDay = { name: TimeOfDayName; label: string; hex: string }

// Kept in real chronological order — round-building below only ever
// samples a genuine consecutive run through this cycle (dawn→day→dusk,
// day→dusk→night, ...), never an invented, impossible sequence.
export const TIME_OF_DAY_SEQUENCE: readonly TimeOfDay[] = [
  { name: 'dawn', label: 'Dawn', hex: '#fbcfe8' },
  { name: 'day', label: 'Day', hex: '#7dd3fc' },
  { name: 'dusk', label: 'Dusk', hex: '#fb923c' },
  { name: 'night', label: 'Night', hex: '#312e81' },
]

const TIME_OF_DAY_BY_NAME: Record<TimeOfDayName, TimeOfDay> = Object.fromEntries(
  TIME_OF_DAY_SEQUENCE.map((time) => [time.name, time]),
) as Record<TimeOfDayName, TimeOfDay>

export function getTimeOfDay(name: TimeOfDayName): TimeOfDay {
  const time = TIME_OF_DAY_BY_NAME[name]
  if (time === undefined) throw new Error(`unknown time of day: ${name}`)
  return time
}

export type RoundType = 'color' | 'time-of-day'

export type ColorTransformationRound = {
  roundType: 'color'
  scene: Scene
  colorChain: readonly JourneyColor[]
  correctColorName: JourneyColorName
  optionColorNames: readonly JourneyColorName[]
}

export type TimeOfDayTransformationRound = {
  roundType: 'time-of-day'
  scene: Scene
  timeChain: readonly TimeOfDay[]
  correctTimeOfDayName: TimeOfDayName
  optionTimeOfDayNames: readonly TimeOfDayName[]
}

export type TransformationRound = ColorTransformationRound | TimeOfDayTransformationRound

// The chain always has exactly 3 links (start → mid → end, narrated as
// 2 transformation steps) — the "progressive instruction steps" the
// brief asks for, never just a single before/after jump.
export const CHAIN_LENGTH = 3
export const STEP_COUNT = CHAIN_LENGTH - 1

function shuffle<T>(values: readonly T[]): T[] {
  const result = [...values]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const atI = result[i]
    const atJ = result[j]
    if (atI === undefined || atJ === undefined) continue
    result[i] = atJ
    result[j] = atI
  }
  return result
}

function buildColorRound(scene: Scene): ColorTransformationRound {
  const colorChain = shuffle(JOURNEY_COLORS).slice(0, CHAIN_LENGTH)
  const finalColor = colorChain[colorChain.length - 1]
  if (finalColor === undefined) throw new Error('color chain unexpectedly empty')
  const correctColorName = finalColor.name
  const distractorPool = JOURNEY_COLORS.filter((color) => color.name !== correctColorName)
  const distractors = shuffle(distractorPool)
    .slice(0, 3)
    .map((color) => color.name)
  const optionColorNames = shuffle([correctColorName, ...distractors])
  return { roundType: 'color', scene, colorChain, correctColorName, optionColorNames }
}

function buildTimeOfDayRound(scene: Scene): TimeOfDayTransformationRound {
  const startIndex = Math.floor(Math.random() * TIME_OF_DAY_SEQUENCE.length)
  const timeChain = Array.from({ length: CHAIN_LENGTH }, (_, offset) => {
    const time = TIME_OF_DAY_SEQUENCE[(startIndex + offset) % TIME_OF_DAY_SEQUENCE.length]
    if (time === undefined) throw new Error('time-of-day sequence unexpectedly empty')
    return time
  })
  const finalTime = timeChain[timeChain.length - 1]
  if (finalTime === undefined) throw new Error('time chain unexpectedly empty')
  const correctTimeOfDayName = finalTime.name
  // Only 4 times of day ever exist, so the option set is always the
  // full set, shuffled — never a sampled subset.
  const optionTimeOfDayNames = shuffle(TIME_OF_DAY_SEQUENCE.map((time) => time.name))
  return { roundType: 'time-of-day', scene, timeChain, correctTimeOfDayName, optionTimeOfDayNames }
}

// The very first moment shown, before any transformation has happened —
// establishes the scene's true starting state, so "shifts from X to Y"
// in the first transition step always refers to something the learner
// actually saw, never an assumed baseline.
export function getIntroNarration(scene: Scene, roundType: RoundType, startLabel: string): string {
  return roundType === 'color'
    ? `Picture ${scene.label}'s ${scene.elementLabel}, beginning in ${startLabel}.`
    : `Picture the ${scene.label}, beginning at ${startLabel}.`
}

// The narration for one step of the chain — kept as a pure, testable
// function rather than embedded directly in JSX, so its wording can be
// verified the same way the rest of this dataset is.
export function getStepNarration(scene: Scene, roundType: RoundType, stepIndex: number, fromLabel: string, toLabel: string): string {
  if (stepIndex === 0) {
    return roundType === 'color'
      ? `${scene.label}'s ${scene.elementLabel} shifts from ${fromLabel} to ${toLabel}.`
      : `${scene.label} shifts from ${fromLabel} into ${toLabel}.`
  }
  return `Then it transforms again — from ${fromLabel} into ${toLabel}.`
}

// Exactly 16 rounds — this suite's practice standard. Half color
// journeys, half time-of-day journeys (never left to chance), and every
// one of the 8 scenes appears exactly twice across the session — this
// project's "fair pool sampling" convention.
export const ROUNDS_PER_SESSION = 16

export function buildSessionRounds(): readonly TransformationRound[] {
  const half = ROUNDS_PER_SESSION / 2
  const typeSequence = shuffle([
    ...Array.from({ length: half }, (): RoundType => 'color'),
    ...Array.from({ length: half }, (): RoundType => 'time-of-day'),
  ])
  const sceneSequence = shuffle([...shuffle(SCENES), ...shuffle(SCENES)])

  return typeSequence.map((roundType, index) => {
    const scene = sceneSequence[index]
    if (scene === undefined) throw new Error('scene sequence unexpectedly empty')
    return roundType === 'color' ? buildColorRound(scene) : buildTimeOfDayRound(scene)
  })
}

// "2-3 seconds" of hold time per narrated step, matching the pace this
// suite already establishes for presentation-style phases.
export const STEP_DURATION_MS = 3_000

// A fixed pause after the chain finishes and the scene hides, giving the
// learner a moment to hold the final state in mind before the 4 options
// appear.
export const TRACKING_DURATION_MS = 2_500

// The recall window once the 4 options appear — long enough to actually
// think back through a short narrated chain.
export const RECALL_TIME_LIMIT_MS = 6_000

export const BASE_POINTS_PER_CORRECT_MATCH = 120
const STREAK_MULTIPLIER_STEP = 2
export const TIMING_BONUS_WINDOW_MS = 2_000
export const TIMING_BONUS_POINTS = 40

export function computeStreakMultiplier(streak: number): number {
  return 1 + Math.floor(streak / STREAK_MULTIPLIER_STEP)
}

export function computePointsForCorrectMatch(streakAfterThisGuess: number, reactionTimeMs: number): number {
  const base = BASE_POINTS_PER_CORRECT_MATCH * computeStreakMultiplier(streakAfterThisGuess)
  const timingBonus = reactionTimeMs <= TIMING_BONUS_WINDOW_MS ? TIMING_BONUS_POINTS : 0
  return base + timingBonus
}

// A one-time bonus for a flawless session (every round correct), added
// to the session's total once at completion.
export const PERFECT_SESSION_BONUS = 500
