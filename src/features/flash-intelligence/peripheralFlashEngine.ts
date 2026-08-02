// Peripheral Flash™ Engine — Visual Span Training's own challenge logic.
// A stimulus here is never centered: it's one or more targets positioned
// around a fixation point the learner is told to keep looking at. Unlike
// every prior mission, distractor groups keep every position FIXED and
// only swap the CONTENT at each position — isolating "did you actually
// perceive what was in your peripheral vision" as the tested variable,
// not "did you also remember where things were."
//
// Levels 1-4 are word-only, reusing Word Flash's real, family-tagged
// dataset (read-only import — wordFlashDataset.ts is never modified):
// the mission's own stated goals — better chunk reading, better
// multi-line reading — are fundamentally about words. Level 5 (Adaptive
// Mastery) widens the pool to include Number Flash's and Symbol Flash's
// datasets too (also read-only imports, never modified) — each position
// independently carries a `kind`, and a distractor for a given position
// is only ever drawn from the SAME kind, so "spot the odd category out"
// never becomes a shortcut around actually perceiving the content.

import type { ContentItem, ItemResponse, SessionItem } from '@/types/exercise-engine'
import { pickItems, shuffleArray, shuffleIndices } from '@/lib/exercise-engine/randomizationEngine'
import { isVisuallyValid } from '@/lib/exercise-engine/visualWidthValidator'
import type { PeripheralPosition, PeripheralStimulusCount } from './peripheralFlashDifficulty'

export type PeripheralContentKind = 'word' | 'number' | 'symbol'

export type PositionedWord = {
  position: PeripheralPosition
  text: string
}

type WordCandidate = {
  text: string
  family: string | null
  kind: PeripheralContentKind
}

function readFamily(item: ContentItem): string | null {
  const family = item.metadata?.['family']
  return typeof family === 'string' ? family : null
}

// Encodes a positioned group into the single string SessionItem.stimulus
// carries. Deliberately readable as speech ("left: focus, right: learn")
// — FlashStimulus's wrapper applies an aria-label from this raw string
// unconditionally, even with a custom renderStimulus, so a screen reader
// user hears exactly what was shown, in plain words. They can't
// experience the peripheral-positioning training effect itself (there's
// no non-visual equivalent to "recognize this without moving your eyes"),
// but they get full, correct content access — the same principle noted
// when this mission was first scoped.
export function encodePositionedGroup(group: readonly PositionedWord[]): string {
  return group.map((g) => `${g.position}: ${g.text}`).join(', ')
}

export function decodePositionedGroup(encoded: string): PositionedWord[] {
  if (encoded.length === 0) return []
  return encoded.split(', ').map((part) => {
    const [position, text] = part.split(': ')
    return { position: position as PeripheralPosition, text: text ?? '' }
  })
}

function resolveStimulusCount(count: PeripheralStimulusCount, seed: number): 1 | 2 | 3 {
  if (count !== 'adaptive') return count
  const idx = shuffleIndices(3, seed)[0]!
  return (idx + 1) as 1 | 2 | 3
}

type PositionVariant = { position: PeripheralPosition; encoded: string }

// Deterministically shuffles `variants` (seeded, so the same seed always
// produces the same order) then greedily picks up to `count`, preferring
// one from EACH distinct position before ever repeating a position. This
// is what stops a position with an unusually rich candidate pool (e.g. a
// tight curated symbol family like ¢/₹/£/¥) from supplying all 3
// distractors on its own while every other position in a multi-target
// group sits textually identical across all 4 options — found live: a
// Triple Span item where only the symbol position actually varied across
// choices, so a learner could answer correctly without truly perceiving
// the other two targets, undermining this mission's entire point. Falls
// back to repeating a position only when there genuinely aren't enough
// distinct positions with candidates to avoid it.
function pickDiverseByPosition(
  variants: readonly PositionVariant[],
  count: number,
  seed: number,
  exclude: ReadonlySet<string>,
): string[] {
  const shuffled = shuffleArray([...variants], seed)
  const picked: string[] = []
  const usedPositions = new Set<PeripheralPosition>()

  for (const v of shuffled) {
    if (picked.length >= count) break
    if (exclude.has(v.encoded) || picked.includes(v.encoded) || usedPositions.has(v.position)) continue
    picked.push(v.encoded)
    usedPositions.add(v.position)
  }
  for (const v of shuffled) {
    if (picked.length >= count) break
    if (exclude.has(v.encoded) || picked.includes(v.encoded)) continue
    picked.push(v.encoded)
  }
  return picked
}

// Generates up to 3 distractor groups for a positioned word group. Every
// distractor keeps the exact same positions as the original — only the
// content at each position changes — preferring a family-confusable swap
// (Word Flash's / Symbol Flash's existing family metadata) before falling
// back to any other pool candidate. Every candidate offered for a given
// position is restricted to that position's own content kind (word /
// number / symbol) — a Level 5 item mixing kinds across positions never
// lets a learner spot the odd-one-out by category instead of actually
// perceiving it. Across the 3 distractors, positions are diversified
// (see pickDiverseByPosition) so a multi-target item genuinely tests
// every target, not just whichever one happens to have the richest pool.
function generateGroupDistractors(group: PositionedWord[], pool: WordCandidate[], seed: number): string[] {
  const originalEncoded = encodePositionedGroup(group)
  const wordsInGroup = new Set(group.map((g) => g.text))
  const familyVariants: PositionVariant[] = []
  const otherVariants: PositionVariant[] = []
  const seenFamily = new Set<string>()
  const seenOther = new Set<string>()

  group.forEach((positioned, idx) => {
    const original = pool.find((w) => w.text === positioned.text)
    const family = original?.family ?? null
    const kind = original?.kind ?? 'word'

    const familyCandidates = family !== null
      ? pool.filter((w) => w.family === family && w.text !== positioned.text && w.kind === kind)
      : []
    for (const replacement of familyCandidates) {
      const variant = [...group]
      variant[idx] = { position: positioned.position, text: replacement.text }
      const encoded = encodePositionedGroup(variant)
      if (encoded !== originalEncoded && !seenFamily.has(encoded)) {
        seenFamily.add(encoded)
        familyVariants.push({ position: positioned.position, encoded })
      }
    }

    const familyTexts = new Set(familyCandidates.map((f) => f.text))
    const otherCandidates = pool.filter((w) => !wordsInGroup.has(w.text) && !familyTexts.has(w.text) && w.kind === kind)
    for (const replacement of otherCandidates) {
      const variant = [...group]
      variant[idx] = { position: positioned.position, text: replacement.text }
      const encoded = encodePositionedGroup(variant)
      if (encoded !== originalEncoded && !seenOther.has(encoded)) {
        seenOther.add(encoded)
        otherVariants.push({ position: positioned.position, encoded })
      }
    }
  })

  const familyPicked = pickDiverseByPosition(familyVariants, 3, seed, new Set())
  if (familyPicked.length >= 3) return familyPicked
  const otherPicked = pickDiverseByPosition(otherVariants, 3 - familyPicked.length, seed + 99991, new Set(familyPicked))
  return [...familyPicked, ...otherPicked]
}

export function buildPeripheralFlashItems(params: {
  wordPool: ContentItem[]
  // Level 5 (Adaptive Mastery) only — when provided and non-empty, each
  // stimulus independently draws from words, numbers, or symbols instead
  // of words only. Omitted (the default for every other level), behavior
  // is byte-for-byte identical to the word-only engine this always was.
  numberPool?: ContentItem[]
  symbolPool?: ContentItem[]
  stimulusCount: PeripheralStimulusCount
  allowedPositions: readonly PeripheralPosition[]
  targetCount: number
  seed: number
}): SessionItem[] {
  const { wordPool, numberPool = [], symbolPool = [], stimulusCount, allowedPositions, targetCount, seed } = params
  if (wordPool.length === 0 || allowedPositions.length === 0) return []

  const toCandidates = (pool: ContentItem[], kind: PeripheralContentKind): WordCandidate[] =>
    pool
      .map((w) => ({ text: w.content, family: readFamily(w), kind }))
      .filter((w) => isVisuallyValid(w.text, 'option'))

  const validWords: WordCandidate[] = [
    ...toCandidates(wordPool, 'word'),
    ...toCandidates(numberPool, 'number'),
    ...toCandidates(symbolPool, 'symbol'),
  ]

  const seen = new Set<string>()
  const uniqueWords = validWords.filter((w) => {
    const key = `${w.kind}:${w.text}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  if (uniqueWords.length === 0) return []

  const items: SessionItem[] = []
  const usedStimuli = new Set<string>()

  for (let i = 0; i < targetCount; i++) {
    const itemSeed = seed + i * 31337
    const count = Math.min(resolveStimulusCount(stimulusCount, itemSeed), allowedPositions.length, uniqueWords.length)
    if (count < 1) continue

    const positions = pickItems([...allowedPositions], count, itemSeed + 1)
    const words = pickItems(uniqueWords, count, itemSeed + 2)
    if (positions.length < count || words.length < count) continue

    const group: PositionedWord[] = positions.map((position, idx) => ({ position, text: words[idx]!.text }))
    const encoded = encodePositionedGroup(group)
    if (usedStimuli.has(encoded)) continue

    const distractors = generateGroupDistractors(group, uniqueWords, itemSeed)
    if (distractors.length < 3) continue

    usedStimuli.add(encoded)
    const options = shuffleArray([encoded, ...distractors], itemSeed)
    const correctIndex = options.indexOf(encoded)

    items.push({
      id: `peripheral-flash-${i}-${itemSeed}`,
      stimulus: encoded,
      stimulusLabel: `Peripheral flash: ${encoded}`,
      options,
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
    })
  }

  return items
}

// ── Visual Span Training metrics (Mission Complete) ───────────────────────

// Visual Span — the honest, direct answer to "how much can this learner
// perceive in one fixation": the average number of simultaneous
// positioned words actually presented per item this session. For a fixed
// tier this is just that tier's stimulusCount; at Master (adaptive) it's
// the true average of whatever was actually thrown at them.
export function computeVisualSpan(itemStimulusCounts: readonly number[]): number {
  if (itemStimulusCounts.length === 0) return 0
  const total = itemStimulusCounts.reduce((sum, c) => sum + c, 0)
  return Math.round((total / itemStimulusCounts.length) * 10) / 10
}

// Peripheral Awareness Score — blends accuracy (main driver) with how
// demanding the session actually was (average visual span), so a
// high-accuracy Beginner session and a high-accuracy Master session don't
// score identically — the Master session was genuinely harder to
// perceive correctly. Capped at 100.
export function computePeripheralAwarenessScore(accuracyPercent: number, averageVisualSpan: number): number {
  const spanBonus = Math.min(20, (averageVisualSpan - 1) * 10) // +0 at span 1, +20 at span 3
  return Math.max(0, Math.min(100, Math.round(accuracyPercent * 0.8 + spanBonus)))
}

// ── Left / right side breakdown (AI Brain Coach) ──────────────────────────

export type PeripheralSide = 'left' | 'right'

function sidesTouchedByGroup(group: readonly PositionedWord[]): Set<PeripheralSide> {
  const sides = new Set<PeripheralSide>()
  for (const { position } of group) {
    if (position === 'left' || position === 'top-left' || position === 'bottom-left') sides.add('left')
    if (position === 'right' || position === 'top-right' || position === 'bottom-right') sides.add('right')
  }
  return sides
}

export type PeripheralSideBreakdown = {
  left: { correct: number; total: number }
  right: { correct: number; total: number }
}

// Attributes each response to left or right peripheral recognition — but
// ONLY when its item's positions touch exactly one side. An item spanning
// both (e.g. every Horizontal Span item, or a Triple Span item that
// happens to include both a left and a right position) can't be honestly
// credited to one side alone, so it's excluded rather than guessed at.
export function computeSideBreakdown(
  responses: readonly ItemResponse[],
  itemStimuli: ReadonlyMap<string, string>,
): PeripheralSideBreakdown {
  const breakdown: PeripheralSideBreakdown = { left: { correct: 0, total: 0 }, right: { correct: 0, total: 0 } }
  for (const response of responses) {
    if (response.skipped) continue
    const encoded = itemStimuli.get(response.itemId)
    if (encoded === undefined) continue
    const sides = sidesTouchedByGroup(decodePositionedGroup(encoded))
    if (sides.size !== 1) continue
    const side = [...sides][0]!
    breakdown[side].total++
    if (response.isCorrect) breakdown[side].correct++
  }
  return breakdown
}

const MIN_SIDE_SAMPLES = 3
const MIN_SIDE_GAP_POINTS = 15

// Only names a weaker side when there's enough single-side data on BOTH
// sides AND a genuinely meaningful gap between them — same threshold-gated
// pattern Mixed Flash's AI Coach uses, to avoid ever claiming a weakness
// that's really just noise or a tie.
export function findWeakerSide(breakdown: PeripheralSideBreakdown): PeripheralSide | null {
  const { left, right } = breakdown
  if (left.total < MIN_SIDE_SAMPLES || right.total < MIN_SIDE_SAMPLES) return null
  const leftPct = (left.correct / left.total) * 100
  const rightPct = (right.correct / right.total) * 100
  if (Math.abs(leftPct - rightPct) < MIN_SIDE_GAP_POINTS) return null
  return leftPct < rightPct ? 'left' : 'right'
}
