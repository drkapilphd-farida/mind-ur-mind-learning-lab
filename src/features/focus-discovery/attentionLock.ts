import { shuffleIndices } from '@/lib/exercise-engine/randomizationEngine'
import { generateFocusObjectGrid, nextFraction, type FocusObject } from './focusObjects'
import {
  ATTENTION_LOCK_BLINKING_FROM_ROUND,
  ATTENTION_LOCK_MOVEMENT_FROM_ROUND,
  ATTENTION_LOCK_OBJECT_COUNTS,
  ATTENTION_LOCK_ROUND_COUNT,
  ATTENTION_LOCK_SIMILAR_COLOR_FROM_ROUND,
  ATTENTION_LOCK_SMALLER_TARGET_FROM_ROUND,
} from './focusTimingConfig'

export type AttentionLockRound = {
  objects: readonly FocusObject[]
  targetShape: FocusObject['shape']
  targetColor: FocusObject['color']
  targetIds: readonly string[]
  // Sprint-1.5/Sprint-1.7 — real, cumulative distraction dimensions. The
  // target RULE never changes (FIX-13) — only these ever escalate.
  movingIds: readonly string[]
  smallIds: readonly string[]
  blinkingIds: readonly string[]
}

// Attention Lock™ — 5-Level Progressive Difficulty Ladder™ (Sprint-1.7
// RULE-01/02/03). Real object count rises every level (8→16→24→32→40);
// each later level keeps every earlier real distraction dimension active
// and adds exactly one NEW one on top (similar colours → movement →
// smaller target → blinking) — "increase only one variable at a time,"
// never several simultaneously.
export function generateAttentionLockRound(roundIndex: number, seed: number): AttentionLockRound {
  const count = ATTENTION_LOCK_OBJECT_COUNTS[Math.min(roundIndex, ATTENTION_LOCK_OBJECT_COUNTS.length - 1)]!
  const objects = generateFocusObjectGrid(count, seed)
  const anchor = objects[0]!
  const targetShape = anchor.shape
  const targetColor = anchor.color

  // Level 2 — "similar colours": a real, deterministic subset of
  // non-target objects gets recoloured to the real target's own colour
  // (never its shape too — that would silently create a new real
  // target), so filtering by colour alone stops being enough.
  const withSimilarColor =
    roundIndex >= ATTENTION_LOCK_SIMILAR_COLOR_FROM_ROUND
      ? objects.map((object, index) => {
          if (index === 0 || object.shape === targetShape) return object
          const wantsRecolor = nextFraction(seed + index * 13 + 401) < 0.35
          return wantsRecolor ? { ...object, color: targetColor } : object
        })
      : objects

  const targetIds = withSimilarColor.filter((object) => object.shape === targetShape && object.color === targetColor).map((object) => object.id)

  // Level 3 — "moving distractors": a real, seeded subset of objects
  // (targets included — motion never changes what the rule measures,
  // only how hard it is to visually track) drifts gently.
  const movingIds =
    roundIndex >= ATTENTION_LOCK_MOVEMENT_FROM_ROUND
      ? shuffleIndices(withSimilarColor.length, seed + 601)
          .slice(0, Math.ceil(withSimilarColor.length * 0.25))
          .map((index) => withSimilarColor[index]!.id)
      : []

  // Level 4 — "smaller targets": the real target itself (not the
  // distractors) renders at a real, reduced scale — a genuinely harder
  // real visual search, never a different rule.
  const smallIds = roundIndex >= ATTENTION_LOCK_SMALLER_TARGET_FROM_ROUND ? targetIds : []

  // Level 5 — "blinking elements": one final real distraction dimension,
  // a real seeded subset of objects (independent of which ones move).
  const blinkingIds =
    roundIndex >= ATTENTION_LOCK_BLINKING_FROM_ROUND
      ? shuffleIndices(withSimilarColor.length, seed + 801)
          .slice(0, Math.ceil(withSimilarColor.length * 0.25))
          .map((index) => withSimilarColor[index]!.id)
      : []

  return { objects: withSimilarColor, targetShape, targetColor, targetIds, movingIds, smallIds, blinkingIds }
}

export { ATTENTION_LOCK_ROUND_COUNT }
