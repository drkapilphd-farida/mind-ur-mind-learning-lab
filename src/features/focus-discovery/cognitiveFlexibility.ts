import { shuffleIndices } from '@/lib/exercise-engine/randomizationEngine'
import { FOCUS_COLORS, generateFocusObjectGrid, nextFraction, pickColor, pickShape, type FocusColor, type FocusObject, type FocusShape } from './focusObjects'
import { COGNITIVE_FLEXIBILITY_ROUND_COUNT, COGNITIVE_FLEXIBILITY_ROUND_OBJECT_COUNTS, COGNITIVE_FLEXIBILITY_TARGETS_PER_ROUND } from './focusTimingConfig'

export type CognitiveFlexibilityRule =
  | { kind: 'color'; value: FocusColor }
  // Sprint-1.5 FIX-06 — "Ignore Blue": a real inhibition rule (tap
  // everything EXCEPT this colour) — a genuinely different cognitive
  // demand from `color` (naming what to tap), not just its opposite
  // phrased differently.
  | { kind: 'exclude-color'; value: FocusColor }
  | { kind: 'shape'; value: FocusShape }
  | { kind: 'motion' }

export type CognitiveFlexibilityRound = {
  objects: readonly FocusObject[]
  rule: CognitiveFlexibilityRule
  targetIds: readonly string[]
  // Which real object ids are "moving" this round — populated for every
  // round (not just `motion` rounds) so a later round's own habit-
  // response check can still ask "would this object have matched the
  // PREVIOUS round's rule," even when that previous rule was `motion`.
  movingIds: readonly string[]
}

const RULE_KINDS = ['color', 'exclude-color', 'shape', 'motion'] as const
type RuleKind = (typeof RULE_KINDS)[number]

// Whether a real object matches a real rule — the one shared check both
// this module's own round generation AND the interactive component's
// cross-round "incorrect habit response" detection use, so the two can
// never silently disagree on what "matches" means.
export function matchesRule(object: FocusObject, rule: CognitiveFlexibilityRule, movingIds: readonly string[]): boolean {
  if (rule.kind === 'color') return object.color === rule.value
  if (rule.kind === 'exclude-color') return object.color !== rule.value
  if (rule.kind === 'shape') return object.shape === rule.value
  return movingIds.includes(object.id)
}

// Sprint-1.5 FIX-06/FIX-09 — "rule switching should become less
// predictable... avoid announcing every rule change too early." A real,
// seeded pick, never the fixed color→color→shape→motion order Sprint-1
// always used — with the one real, honest constraint that this real
// round's own rule KIND never repeats the real PREVIOUS round's own kind
// (so every round is a genuine switch, never a repeat framed as new).
function pickNextRuleKind(previousKind: RuleKind | null, seed: number, prefersReducedMotion: boolean): RuleKind {
  const availableKinds: readonly RuleKind[] = prefersReducedMotion ? RULE_KINDS.filter((kind) => kind !== 'motion') : RULE_KINDS
  const kindPool = availableKinds.filter((kind) => kind !== previousKind)
  return kindPool[Math.floor(nextFraction(seed) * kindPool.length)]!
}

function generateRule(previousKind: RuleKind | null, seed: number, prefersReducedMotion: boolean): CognitiveFlexibilityRule {
  const kind = pickNextRuleKind(previousKind, seed, prefersReducedMotion)
  if (kind === 'motion') return { kind: 'motion' }
  if (kind === 'shape') return { kind: 'shape', value: pickShape(seed + 1) }
  return { kind, value: pickColor(seed + 2) }
}

function generateRoundContent(rule: CognitiveFlexibilityRule, levelIndex: number, seed: number): CognitiveFlexibilityRound {
  const count = COGNITIVE_FLEXIBILITY_ROUND_OBJECT_COUNTS[Math.min(levelIndex, COGNITIVE_FLEXIBILITY_ROUND_OBJECT_COUNTS.length - 1)]!
  const objects = generateFocusObjectGrid(count, seed)
  const movingCount = Math.min(COGNITIVE_FLEXIBILITY_TARGETS_PER_ROUND, objects.length)
  const movingIds = rule.kind === 'motion' ? shuffleIndices(objects.length, seed + 999).slice(0, movingCount).map((index) => objects[index]!.id) : []

  let targetIds = objects.filter((object) => matchesRule(object, rule, movingIds)).map((object) => object.id)

  // A real random grid can genuinely land on zero matches for a
  // colour/shape rule (a real, honest edge case) — rather than leaving
  // the round silently unanswerable, patch the grid's own first object
  // to honestly satisfy the rule, the same "always at least one real
  // match" guarantee Attention Lock's own generator relies on.
  if (rule.kind !== 'motion' && targetIds.length === 0) {
    const first = objects[0]!
    const patched =
      rule.kind === 'shape'
        ? { ...first, shape: rule.value }
        : // `color`/`exclude-color` both need a real object whose colour
          // matches `color`'s own required value — `exclude-color`'s own
          // "match" is defined as NOT this colour, so patching to any
          // OTHER real colour (not `rule.value`) is what makes it match.
          rule.kind === 'color'
          ? { ...first, color: rule.value }
          : { ...first, color: FOCUS_COLORS[(FOCUS_COLORS.indexOf(rule.value) + 1) % FOCUS_COLORS.length]! }
    objects[0] = patched
    targetIds = [patched.id]
  }

  return { objects, rule, targetIds, movingIds }
}

// Cognitive Flexibility™ — 5-Level Progressive Difficulty Ladder™
// (Sprint-1.7), refactored in Sprint-1.8 into a real LAZY, one-round-at-
// a-time generator (mirroring Attention Lock™/Visual Search™) so the
// Adaptive Difficulty Engine™ can decouple the real round COUNTER
// (`roundNumber`, always 0→4, always drives real rule-kind freshness)
// from the real content DIFFICULTY LEVEL (`levelIndex`, the real object
// count ladder — advances only when the PREVIOUS round's own real
// accuracy earned it). `previousRule` — the real PREVIOUS round's own
// rule (`null` for the real first round), so this round's own rule kind
// never repeats it.
export function generateCognitiveFlexibilityRound(
  levelIndex: number,
  roundNumber: number,
  previousRule: CognitiveFlexibilityRule | null,
  seed: number,
  prefersReducedMotion: boolean,
): CognitiveFlexibilityRound {
  const roundSeed = seed + roundNumber * 211
  const rule = generateRule(previousRule?.kind ?? null, roundSeed, prefersReducedMotion)
  return generateRoundContent(rule, levelIndex, roundSeed + 500)
}

export { COGNITIVE_FLEXIBILITY_ROUND_COUNT }
