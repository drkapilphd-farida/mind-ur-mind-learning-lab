import { shuffleIndices } from '@/lib/exercise-engine/randomizationEngine'
import { FOCUS_COLORS, FOCUS_SHAPES, generateFocusObjectGrid, nextFraction, type FocusObject } from './focusObjects'
import {
  VISUAL_SEARCH_COLOR_DESCRIPTION_FROM_ROUND,
  VISUAL_SEARCH_MAX_SIMILAR_DECOYS,
  VISUAL_SEARCH_MAX_SIMILAR_DECOYS_FROM_ROUND,
  VISUAL_SEARCH_OBJECT_COUNTS,
  VISUAL_SEARCH_ROUND_COUNT,
  VISUAL_SEARCH_SIMILAR_DECOYS_FROM_ROUND,
  VISUAL_SEARCH_SMALLER_TARGET_FROM_ROUND,
} from './focusTimingConfig'

export type VisualSearchRound = {
  objects: readonly FocusObject[]
  targetId: string
  targetLabel: string
  targetIsSmall: boolean
}

function displayShape(shape: FocusObject['shape']): string {
  return shape[0]!.toUpperCase() + shape.slice(1)
}

function displayColor(color: FocusObject['color']): string {
  return color[0]!.toUpperCase() + color.slice(1)
}

// One pass is always enough: reassigning a colliding object's shape to
// the next shape in the fixed cycle can never re-collide with the real
// target's own (unchanged) shape.
function disambiguate(objects: FocusObject[], target: FocusObject, useColor: boolean): FocusObject[] {
  return objects.map((object, index) => {
    if (index === 0) return object
    const shapeMatches = object.shape === target.shape
    const collides = useColor ? shapeMatches && object.color === target.color : shapeMatches
    if (!collides) return object
    const nextShape = FOCUS_SHAPES[(FOCUS_SHAPES.indexOf(object.shape) + 1) % FOCUS_SHAPES.length]!
    return { ...object, shape: nextShape }
  })
}

// Real "target similarity": a real, bounded number of non-target
// objects are reshaped to share EXACTLY one of the real target's own
// two attributes (shape OR colour, never both — that would silently
// create a second real target), so scanning genuinely takes longer
// without the search ever becoming unanswerable.
function addSimilarDecoys(objects: FocusObject[], target: FocusObject, count: number, seed: number): FocusObject[] {
  const candidateIndices = objects.map((_, index) => index).filter((index) => index !== 0)
  const chosen = new Set(shuffleIndices(candidateIndices.length, seed).slice(0, count).map((i) => candidateIndices[i]!))

  return objects.map((object, index) => {
    if (!chosen.has(index)) return object
    const shareShape = nextFraction(seed + index * 7 + 3) < 0.5
    if (shareShape) {
      const color = object.color === target.color ? FOCUS_COLORS[(FOCUS_COLORS.indexOf(object.color) + 1) % FOCUS_COLORS.length]! : object.color
      return { ...object, shape: target.shape, color }
    }
    const shape = object.shape === target.shape ? FOCUS_SHAPES[(FOCUS_SHAPES.indexOf(object.shape) + 1) % FOCUS_SHAPES.length]! : object.shape
    return { ...object, color: target.color, shape }
  })
}

// Visual Search™ — 5-Level Progressive Difficulty Ladder™ (Sprint-1.7
// RULE-01/02/03). "Generate fresh layouts every round... never reuse the
// same grid repeatedly." Real density rises every level
// (`VISUAL_SEARCH_OBJECT_COUNTS`); each later level keeps every earlier
// real dimension active and adds exactly one more — Level 2 describes
// the real target by shape AND colour (not shape alone), Level 3 adds
// one real near-duplicate decoy, Level 4 a second, Level 5 shrinks the
// real target itself.
export function generateVisualSearchRound(roundIndex: number, seed: number): VisualSearchRound {
  const count = VISUAL_SEARCH_OBJECT_COUNTS[Math.min(roundIndex, VISUAL_SEARCH_OBJECT_COUNTS.length - 1)]!
  const useColor = roundIndex >= VISUAL_SEARCH_COLOR_DESCRIPTION_FROM_ROUND
  const rawObjects = generateFocusObjectGrid(count, seed)
  const target = rawObjects[0]!
  let objects = disambiguate(rawObjects, target, useColor)

  const decoyCount = roundIndex >= VISUAL_SEARCH_MAX_SIMILAR_DECOYS_FROM_ROUND ? VISUAL_SEARCH_MAX_SIMILAR_DECOYS : roundIndex >= VISUAL_SEARCH_SIMILAR_DECOYS_FROM_ROUND ? 1 : 0
  if (decoyCount > 0) objects = addSimilarDecoys(objects, target, decoyCount, seed + 700)

  return {
    objects,
    targetId: target.id,
    targetLabel: useColor ? `the ${displayColor(target.color)} ${displayShape(target.shape)}` : `the ${displayShape(target.shape)}`,
    targetIsSmall: roundIndex >= VISUAL_SEARCH_SMALLER_TARGET_FROM_ROUND,
  }
}

export { VISUAL_SEARCH_ROUND_COUNT }
