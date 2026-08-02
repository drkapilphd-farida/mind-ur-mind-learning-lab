// Memory Challenge™ — content + scoring for the 2-minute assessment
// lead magnet's memory phase. Self-contained (no imports from Reading
// Sprint's dataset) — this project's own established convention is that
// each area keeps its own copy of shared-shaped logic (scoring formulas,
// shuffle helpers) rather than importing across unrelated feature areas.
//
// Exactly 3 rounds per session, one per category, always in the same
// fixed order (Visual → Digit Span → Word Recall) — a deliberate
// clarity fix: an earlier version randomly mixed 6 rounds across 2
// blended types, which tested fine but read as chaotic to a first-time
// user with no idea what kind of round was coming next or how many
// remained. Fixing "never feels repetitive" a different way now: each
// category still randomly picks ONE of several pre-written sets per
// session, so replays vary, without sacrificing the predictable
// 3-round structure this rewrite is specifically about.

export type MemoryRoundType = 'icon' | 'number' | 'word'

export type MemoryRound = {
  id: string
  type: MemoryRoundType
  categoryLabel: string
  instructionText: string
  prompt: string
  // What's shown during the Display phase — a single digit string for
  // number rounds, or 4 distinct icon-names/words for icon/word rounds.
  displayItems: readonly string[]
  correctAnswer: string
  options: readonly string[]
}

export const CATEGORY_LABELS: Record<MemoryRoundType, string> = {
  icon: 'Visual Memory Test',
  number: 'Digit Span Memory',
  word: 'Word Recall Test',
}

// The fixed round order the brief specifies — never shuffled.
export const CATEGORY_ORDER: readonly MemoryRoundType[] = ['icon', 'number', 'word']

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

// --- Number Memory (Digit Span) rounds --------------------------------
// Each distractor is a genuine digit-transposition of the real number
// (never a wildly different, trivially-eliminated value), so recall
// actually has to be exact — a proper memory challenge, not a coin flip.
type NumberRoundDef = { id: string; digits: string; distractors: readonly [string, string, string] }

const NUMBER_ROUND_DEFS: readonly NumberRoundDef[] = [
  { id: 'num-4-a', digits: '4813', distractors: ['4831', '4183', '8413'] },
  { id: 'num-4-b', digits: '2957', distractors: ['2975', '2597', '9257'] },
  { id: 'num-4-c', digits: '6047', distractors: ['6074', '6407', '6740'] },
  { id: 'num-5-a', digits: '73562', distractors: ['73652', '75362', '73526'] },
  { id: 'num-5-b', digits: '48219', distractors: ['48291', '48129', '42819'] },
  { id: 'num-5-c', digits: '82914', distractors: ['82941', '82194', '89214'] },
  { id: 'num-6-a', digits: '391847', distractors: ['391874', '398147', '319847'] },
  { id: 'num-6-b', digits: '624783', distractors: ['624738', '627483', '642783'] },
  { id: 'num-6-c', digits: '157392', distractors: ['157329', '153792', '175392'] },
]

// --- Icon & Word rounds -------------------------------------------------
// A shared pool per category — each round shows 4 items from the pool;
// the 3 wrong recall options are always drawn from the pool's UNUSED
// remainder, so a wrong answer is never accidentally something that
// actually was on screen.
const ICON_POOL: readonly string[] = [
  'Star', 'Heart', 'Cloud', 'Sun', 'Moon', 'Zap', 'Anchor', 'Feather',
  'Gem', 'Flame', 'Leaf', 'Snowflake', 'Compass', 'Key', 'Shield', 'Rocket',
]

const WORD_POOL: readonly string[] = [
  'RECALL', 'PATTERN', 'DETAIL', 'SEQUENCE', 'IMAGE', 'SYMBOL',
  'ECHO', 'TRACE', 'IMPRINT', 'SIGNAL', 'PULSE', 'ORBIT', 'SPARK', 'DRIFT',
]

type ItemSetRoundDef = { id: string; pool: readonly string[]; shownItems: readonly string[]; correctAnswer: string }

const ICON_ROUND_DEFS: readonly ItemSetRoundDef[] = [
  { id: 'vis-icon-a', pool: ICON_POOL, shownItems: ['Star', 'Heart', 'Cloud', 'Sun'], correctAnswer: 'Heart' },
  { id: 'vis-icon-b', pool: ICON_POOL, shownItems: ['Moon', 'Zap', 'Anchor', 'Feather'], correctAnswer: 'Zap' },
  { id: 'vis-icon-c', pool: ICON_POOL, shownItems: ['Gem', 'Flame', 'Leaf', 'Snowflake'], correctAnswer: 'Flame' },
  { id: 'vis-icon-d', pool: ICON_POOL, shownItems: ['Compass', 'Key', 'Shield', 'Rocket'], correctAnswer: 'Compass' },
  { id: 'vis-icon-e', pool: ICON_POOL, shownItems: ['Star', 'Moon', 'Gem', 'Key'], correctAnswer: 'Gem' },
]

const WORD_ROUND_DEFS: readonly ItemSetRoundDef[] = [
  { id: 'vis-word-a', pool: WORD_POOL, shownItems: ['RECALL', 'PATTERN', 'DETAIL', 'SEQUENCE'], correctAnswer: 'PATTERN' },
  { id: 'vis-word-b', pool: WORD_POOL, shownItems: ['IMAGE', 'SYMBOL', 'ECHO', 'TRACE'], correctAnswer: 'ECHO' },
  { id: 'vis-word-c', pool: WORD_POOL, shownItems: ['IMPRINT', 'SIGNAL', 'PULSE', 'ORBIT'], correctAnswer: 'SIGNAL' },
  { id: 'vis-word-d', pool: WORD_POOL, shownItems: ['SPARK', 'DRIFT', 'RECALL', 'IMAGE'], correctAnswer: 'DRIFT' },
]

function buildNumberRound(def: NumberRoundDef): MemoryRound {
  return {
    id: def.id,
    type: 'number',
    categoryLabel: CATEGORY_LABELS.number,
    instructionText: 'Memorize this number before it disappears.',
    prompt: 'Which number did you just see?',
    displayItems: [def.digits],
    correctAnswer: def.digits,
    options: shuffle([def.digits, ...def.distractors]),
  }
}

function buildItemSetRound(type: 'icon' | 'word', def: ItemSetRoundDef): MemoryRound {
  if (!def.shownItems.includes(def.correctAnswer)) {
    throw new Error(`memory round "${def.id}" has a correctAnswer that was never actually shown`)
  }
  const unusedPool = def.pool.filter((item) => !def.shownItems.includes(item))
  if (unusedPool.length < 3) {
    throw new Error(`memory round "${def.id}" doesn't have enough unused pool items for 3 honest distractors`)
  }
  const distractors = shuffle(unusedPool).slice(0, 3)
  const noun = type === 'icon' ? 'icon' : 'word'
  return {
    id: def.id,
    type,
    categoryLabel: CATEGORY_LABELS[type],
    instructionText: `Memorize these 4 ${noun}s before they disappear.`,
    prompt: `Which ${noun} was in your set?`,
    displayItems: def.shownItems,
    correctAnswer: def.correctAnswer,
    options: shuffle([def.correctAnswer, ...distractors]),
  }
}

// The full embedded dataset — 18 pre-written sets across the 3
// categories (9 number, 5 icon, 4 word), comfortably over the original
// brief's 15-20 minimum.
export const MEMORY_CHALLENGE_ROUNDS_TOTAL = NUMBER_ROUND_DEFS.length + ICON_ROUND_DEFS.length + WORD_ROUND_DEFS.length

// Exactly 3 rounds per session, one per category, always in
// CATEGORY_ORDER — a fixed, predictable structure the learner can
// follow, never a randomized mix of round types.
export const SESSION_ROUND_COUNT = CATEGORY_ORDER.length

export function buildSessionRounds(): readonly MemoryRound[] {
  const iconDef = shuffle(ICON_ROUND_DEFS)[0]
  const numberDef = shuffle(NUMBER_ROUND_DEFS)[0]
  const wordDef = shuffle(WORD_ROUND_DEFS)[0]
  if (iconDef === undefined || numberDef === undefined || wordDef === undefined) {
    throw new Error('one of the memory round category pools is unexpectedly empty')
  }
  return [buildItemSetRound('icon', iconDef), buildNumberRound(numberDef), buildItemSetRound('word', wordDef)]
}

// --- Pacing -----------------------------------------------------------
const MS_PER_DIGIT = 400
const DIGIT_DISPLAY_FLOOR_MS = 1500
export const VISUAL_DISPLAY_DURATION_MS = 2200
export const RECALL_TIME_LIMIT_MS = 4000
export const COUNTDOWN_STATES: readonly string[] = ['3', '2', '1', 'GO!']
export const COUNTDOWN_TOTAL_MS = 3000
export const COUNTDOWN_STEP_MS = COUNTDOWN_TOTAL_MS / COUNTDOWN_STATES.length

export function getDisplayDurationMs(round: MemoryRound): number {
  if (round.type === 'number') {
    const digits = round.displayItems[0] ?? ''
    return Math.max(DIGIT_DISPLAY_FLOOR_MS, digits.length * MS_PER_DIGIT)
  }
  return VISUAL_DISPLAY_DURATION_MS
}

// --- Scoring ------------------------------------------------------------
const STREAK_MULTIPLIER_STEP = 2
export const BASE_POINTS_PER_CORRECT_MATCH = 100
export const TIMING_BONUS_WINDOW_MS = 1500
export const TIMING_BONUS_POINTS = 30

export function computeStreakMultiplier(streak: number): number {
  return 1 + Math.floor(streak / STREAK_MULTIPLIER_STEP)
}

export function computePointsForCorrectMatch(streakAfterThisGuess: number, reactionTimeMs: number): number {
  const base = BASE_POINTS_PER_CORRECT_MATCH * computeStreakMultiplier(streakAfterThisGuess)
  const timingBonus = reactionTimeMs <= TIMING_BONUS_WINDOW_MS ? TIMING_BONUS_POINTS : 0
  return base + timingBonus
}

export type MemoryEfficiencyLabel = 'Exceptional Pattern Recall' | 'Strong Pattern Recall' | 'Developing Recall' | 'Building Foundations'

export function getMemoryEfficiencyLabel(efficiencyPercent: number): MemoryEfficiencyLabel {
  if (efficiencyPercent >= 90) return 'Exceptional Pattern Recall'
  if (efficiencyPercent >= 75) return 'Strong Pattern Recall'
  if (efficiencyPercent >= 50) return 'Developing Recall'
  return 'Building Foundations'
}
