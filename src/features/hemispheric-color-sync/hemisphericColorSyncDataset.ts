// Hemispheric Color-Word Sync Grid™ — the third Right Brain Activation
// exercise, alongside Photographic Memory™ and High-Speed Pictorial
// Essence Sprint™. Its own folder/content, no shared files with either
// sibling.
//
// The core mechanic is a classic Stroop-effect conflict: every round
// shows a color NAME rendered in a deliberately MISMATCHED ink color
// (the word "RED" painted blue, never red) — reading the word and
// perceiving its ink pull in two different directions, which is exactly
// the "dual hemispheric conflict" the task asks for. A dynamic per-round
// prompt then asks the learner to resolve the conflict one of two ways:
// tap the swatch matching what the WORD says, or tap the swatch matching
// the actual INK color — never both, and never told in advance which
// one a given round will ask for, so autopilot reading never works.

export type ColorName = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange'

export type ColorSwatch = {
  name: ColorName
  label: string
  hex: string
}

// 6 colors — enough that the 3 "extra" distractors in a round are never
// the same set twice in a row, without so many that a word/ink label
// ever gets hard to read at a glance.
export const COLOR_PALETTE: readonly ColorSwatch[] = [
  { name: 'red', label: 'RED', hex: '#ef4444' },
  { name: 'blue', label: 'BLUE', hex: '#3b82f6' },
  { name: 'green', label: 'GREEN', hex: '#22c55e' },
  { name: 'yellow', label: 'YELLOW', hex: '#eab308' },
  { name: 'purple', label: 'PURPLE', hex: '#a855f7' },
  { name: 'orange', label: 'ORANGE', hex: '#f97316' },
] as const

const COLOR_BY_NAME: Record<ColorName, ColorSwatch> = Object.fromEntries(COLOR_PALETTE.map((swatch) => [swatch.name, swatch])) as Record<
  ColorName,
  ColorSwatch
>

export function getColorSwatch(name: ColorName): ColorSwatch {
  const swatch = COLOR_BY_NAME[name]
  if (swatch === undefined) throw new Error(`unknown color name: ${name}`)
  return swatch
}

export type PromptMode = 'word' | 'ink'

export type StroopRound = {
  wordColorName: ColorName
  inkColorName: ColorName
  promptMode: PromptMode
  correctColorName: ColorName
  optionColorNames: readonly ColorName[]
}

// Exactly 16 rounds per session — the suite's own practice standard,
// non-negotiable per the task brief.
export const ROUNDS_PER_SESSION = 16

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

function pickRandom<T>(values: readonly T[]): T {
  const value = values[Math.floor(Math.random() * values.length)]
  if (value === undefined) throw new Error('cannot pick from an empty pool')
  return value
}

// Builds one round's 4 options: the correct answer, the round's OTHER
// color (word if the prompt is ink, or vice versa — the exact color a
// learner would land on by reading instead of perceiving, or perceiving
// instead of reading, so the conflict is a genuine trap, not a decoration),
// plus 2 more colors drawn from the remaining palette.
function buildOptions(correctColorName: ColorName, trapColorName: ColorName): readonly ColorName[] {
  const remainingPool = COLOR_PALETTE.map((swatch) => swatch.name).filter(
    (name) => name !== correctColorName && name !== trapColorName,
  )
  const extraDistractors = shuffle(remainingPool).slice(0, 2)
  return shuffle([correctColorName, trapColorName, ...extraDistractors])
}

// A single round is always a genuine Stroop conflict: the ink color
// never matches the word's own meaning, and the prompt always asks for
// exactly one of the two (never both at once).
export function buildRound(promptMode: PromptMode): StroopRound {
  const wordColorName = pickRandom(COLOR_PALETTE).name
  const inkPool = COLOR_PALETTE.map((swatch) => swatch.name).filter((name) => name !== wordColorName)
  const inkColorName = pickRandom(inkPool)

  const correctColorName = promptMode === 'word' ? wordColorName : inkColorName
  const trapColorName = promptMode === 'word' ? inkColorName : wordColorName
  const optionColorNames = buildOptions(correctColorName, trapColorName)

  return { wordColorName, inkColorName, promptMode, correctColorName, optionColorNames }
}

// The whole session is built upfront (this project's "fair pool
// sampling" convention): exactly half the rounds prompt for the WORD,
// half for the INK, shuffled into an unpredictable order rather than
// leaving the split to chance.
export function buildSessionRounds(): readonly StroopRound[] {
  const half = ROUNDS_PER_SESSION / 2
  const promptSequence = shuffle([
    ...Array.from({ length: half }, (): PromptMode => 'word'),
    ...Array.from({ length: half }, (): PromptMode => 'ink'),
  ])
  return promptSequence.map((promptMode) => buildRound(promptMode))
}

// Streak & scoring — mirrors this project's established formula shape
// (every 2 consecutive correct matches bumps the multiplier by +1,
// applied to a flat base-points value, plus a fast-reflex bonus for
// answering well inside the strict recall window). Deliberately its own
// independent copy, not imported from any sibling exercise's dataset.
export const BASE_POINTS_PER_CORRECT_MATCH = 100
const STREAK_MULTIPLIER_STEP = 2
export const RECALL_TIME_LIMIT_MS = 2000
export const TIMING_BONUS_WINDOW_MS = 800
export const TIMING_BONUS_POINTS = 30

export function computeStreakMultiplier(streak: number): number {
  return 1 + Math.floor(streak / STREAK_MULTIPLIER_STEP)
}

export function computePointsForCorrectMatch(streakAfterThisGuess: number, reactionTimeMs: number): number {
  const base = BASE_POINTS_PER_CORRECT_MATCH * computeStreakMultiplier(streakAfterThisGuess)
  const timingBonus = reactionTimeMs <= TIMING_BONUS_WINDOW_MS ? TIMING_BONUS_POINTS : 0
  return base + timingBonus
}

// A one-time bonus for a flawless run (every round correct), added to
// the session's total once at completion.
export const PERFECT_SESSION_BONUS = 400
