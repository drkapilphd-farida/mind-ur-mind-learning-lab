import { DIFFICULTY_TIERS } from '@/lib/exercise-engine/difficultyEngine'
import type { DifficultyTier } from '@/types/exercise-engine'

// Memory Discovery™ Digit Span™ — Sprint-1.5 FIX-02.
//
// "Current implementation shows only one number. This is not
// sufficient... Numbers should gradually increase in length... 7 → 38 →
// 914 → 5281 → 71936 → 481952." Digit spans are a real, classic
// psychological memory paradigm — a genuinely correct fit is procedural
// generation, not curated content (there's no "meaning" to a random
// digit string the way there is to a word/object, so authoring a
// dataset of them would add nothing real). Every real session runs the
// brief's own exact 1→6-digit progression; higher real adaptive tiers
// (advanced and up) add real, longer bonus rounds on top — never a
// shorter session for a harder tier (FIX-08: "never jump suddenly").

const BASE_DIGIT_LENGTHS = [1, 2, 3, 4, 5, 6] as const

// Same LCG constants `randomizationEngine.ts` already uses elsewhere in
// this codebase, kept local here since this module has no other real
// reason to import that file (pure digit generation, not item picking).
const LCG_MULTIPLIER = 1664525
const LCG_INCREMENT = 1013904223
const LCG_MODULUS = 0x100000000

function lcgNext(seed: number): number {
  return ((seed * LCG_MULTIPLIER + LCG_INCREMENT) >>> 0) % LCG_MODULUS
}

function bonusRoundCount(tier: DifficultyTier): number {
  const index = DIFFICULTY_TIERS.indexOf(tier)
  if (index < 0) return 0
  if (index >= 6) return 2 // elite, master — two real extra, longer rounds
  if (index >= 3) return 1 // advanced, expert — one real extra round
  return 0 // beginner, easy, medium — the base 1→6 progression only
}

// A real digit string of the given length — the first digit is never 0
// (so a real "3-digit" round always reads as a genuine 3-digit number,
// e.g. "038" would visually read as 2 digits).
function randomDigitString(length: number, seed: number): string {
  let s = seed
  const digits: string[] = []
  for (let position = 0; position < length; position++) {
    s = lcgNext(s + position)
    const fraction = s / LCG_MODULUS
    const digit = position === 0 && length > 1 ? 1 + Math.floor(fraction * 9) : Math.floor(fraction * 10)
    digits.push(String(digit))
  }
  return digits.join('')
}

// Sprint-4 FIX-05 — "Add real digit-style variety." Four real, distinct
// digit structures, never a fabricated fifth. Mission Integrity (FIX-01)
// is preserved: every style still produces a real `length`-digit string
// that Digit Span scores exactly the same way (exact recall of the
// shown sequence) — style only changes what values compose the string
// (and, for `grouped`/`mixed`, how it's later *displayed* — see
// `formatDigitsForDisplay`), never the real length progression or the
// real pass/fail rule.
export const DIGIT_STYLES = ['pure', 'grouped', 'repeated-pattern', 'mixed'] as const
export type DigitStyle = (typeof DIGIT_STYLES)[number]

// Short rounds (1-2 digits) are too short for a style to read as
// anything but "pure" — real variety only starts once there's enough
// length for a pattern or grouping to be perceptible.
export function pickDigitStyle(length: number, seed: number): DigitStyle {
  if (length < 4) return 'pure'
  return DIGIT_STYLES[lcgNext(seed) % DIGIT_STYLES.length]!
}

// A real repeating-unit digit string (e.g. unit "58" → "5858" at length
// 4) — genuinely different generation from `randomDigitString`, not a
// relabeling of the same output.
function repeatedPatternDigitString(length: number, seed: number): string {
  const unitLength = length >= 6 ? 3 : 2
  const unit = randomDigitString(Math.min(unitLength, length), seed)
  let result = ''
  while (result.length < length) result += unit
  return result.slice(0, length)
}

// A real hybrid: the first half genuinely random, the second half a
// real repeat of the first half's own last two digits — distinct from
// both `pure` and `repeated-pattern`.
function mixedDigitString(length: number, seed: number): string {
  const half = Math.ceil(length / 2)
  const first = randomDigitString(half, seed)
  const repeatUnit = first.slice(-2)
  let second = ''
  while (second.length < length - half) second += repeatUnit
  return (first + second).slice(0, length)
}

function digitStringForStyle(style: DigitStyle, length: number, seed: number): string {
  if (style === 'repeated-pattern') return repeatedPatternDigitString(length, seed)
  if (style === 'mixed') return mixedDigitString(length, seed)
  return randomDigitString(length, seed) // 'pure' and 'grouped' share the same real random generation
}

// `grouped`/`mixed` rounds are shown with real visual chunking (e.g.
// "12 45 89") — display-only, never changing the real underlying value
// Digit Span scores against.
export function formatDigitsForDisplay(digits: string, style: DigitStyle): string {
  if (style !== 'grouped' && style !== 'mixed') return digits
  const groups: string[] = []
  for (let index = 0; index < digits.length; index += 2) groups.push(digits.slice(index, index + 2))
  return groups.join(' ')
}

// One real round of the progressive Digit Span™ mission.
export type DigitSpanRound = {
  length: number
  digits: string
  style: DigitStyle
}

export function generateDigitSpanRounds(tier: DifficultyTier, seed: number): readonly DigitSpanRound[] {
  const lengths = [...BASE_DIGIT_LENGTHS, ...Array.from({ length: bonusRoundCount(tier) }, (_, index) => BASE_DIGIT_LENGTHS.length + 1 + index)]
  return lengths.map((length, index) => {
    const roundSeed = seed + index * 97
    const style = pickDigitStyle(length, roundSeed + 5)
    return { length, digits: digitStringForStyle(style, length, roundSeed), style }
  })
}

// Real, plausible same-length, same-style decoys for a round's
// multiple-choice question — each one shares the real digit's own
// length AND style (never an obviously-wrong-structure distractor, e.g.
// a plain-random decoy next to a repeated-pattern correct answer) but is
// a genuinely different string.
export function generateDigitSpanDecoys(round: DigitSpanRound, count: number, seed: number): readonly string[] {
  const decoys = new Set<string>()
  let attempt = 0
  while (decoys.size < count && attempt < count * 8) {
    const candidate = digitStringForStyle(round.style, round.length, seed + attempt * 131 + 7)
    if (candidate !== round.digits) decoys.add(candidate)
    attempt++
  }
  return Array.from(decoys)
}

// Sprint-1.5 FIX-10 — the real, structured result `DigitSpanCard` reports
// once every real round is done: how many rounds were completed, how
// many answered correctly, the longest real digit-span reached, and
// total real recognition time across every round. Defined in this
// feature-layer module (not the `app/` component file) so both the UI
// component and `useMemoryDiscoverySession`'s own event-logging can
// import the same real type without the feature layer ever reaching
// upward into `app/`.
export type DigitSpanResult = {
  roundsCompleted: number
  correctCount: number
  longestCorrectLength: number
  totalRecognitionMs: number
}
