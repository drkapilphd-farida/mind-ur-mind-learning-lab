// Photographic Memory™ — Category D: Color-Shape Matrix. A small 3x2
// grid of colored shapes flashed briefly; the 3 decoys change exactly
// ONE cell's color OR shape (never both), leaving the other 5 cells
// byte-identical — "spot the one changed cell" hard mode.
import { shuffle, pickRandom } from '../shuffle'

export type ColorShapeName = 'circle' | 'square' | 'triangle' | 'diamond'

export type ColorShapeCell = {
  shape: ColorShapeName
  color: string
}

export type ColorShapePattern = {
  id: string
  cells: readonly ColorShapeCell[]
}

const SHAPES: readonly ColorShapeName[] = ['circle', 'square', 'triangle', 'diamond']
const COLORS: readonly string[] = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e', '#facc15', '#0ea5e9']

export const COLOR_SHAPE_PATTERNS: readonly ColorShapePattern[] = [
  { id: 'grid-1', cells: [{ shape: 'square', color: '#ef4444' }, { shape: 'circle', color: '#3b82f6' }, { shape: 'triangle', color: '#f59e0b' }, { shape: 'diamond', color: '#10b981' }, { shape: 'circle', color: '#8b5cf6' }, { shape: 'square', color: '#f43f5e' }] },
  { id: 'grid-2', cells: [{ shape: 'circle', color: '#06b6d4' }, { shape: 'triangle', color: '#d946ef' }, { shape: 'square', color: '#84cc16' }, { shape: 'diamond', color: '#f97316' }, { shape: 'triangle', color: '#3b82f6' }, { shape: 'circle', color: '#10b981' }] },
  { id: 'grid-3', cells: [{ shape: 'diamond', color: '#8b5cf6' }, { shape: 'square', color: '#f59e0b' }, { shape: 'circle', color: '#f43f5e' }, { shape: 'triangle', color: '#06b6d4' }, { shape: 'diamond', color: '#84cc16' }, { shape: 'square', color: '#d946ef' }] },
  { id: 'grid-4', cells: [{ shape: 'triangle', color: '#10b981' }, { shape: 'circle', color: '#f97316' }, { shape: 'diamond', color: '#3b82f6' }, { shape: 'square', color: '#ef4444' }, { shape: 'circle', color: '#facc15' }, { shape: 'triangle', color: '#8b5cf6' }] },
  { id: 'grid-5', cells: [{ shape: 'square', color: '#0ea5e9' }, { shape: 'diamond', color: '#f43f5e' }, { shape: 'triangle', color: '#84cc16' }, { shape: 'circle', color: '#d946ef' }, { shape: 'square', color: '#f59e0b' }, { shape: 'diamond', color: '#10b981' }] },
  { id: 'grid-6', cells: [{ shape: 'circle', color: '#ef4444' }, { shape: 'circle', color: '#3b82f6' }, { shape: 'square', color: '#f59e0b' }, { shape: 'triangle', color: '#8b5cf6' }, { shape: 'diamond', color: '#06b6d4' }, { shape: 'square', color: '#10b981' }] },
  { id: 'grid-7', cells: [{ shape: 'triangle', color: '#f43f5e' }, { shape: 'diamond', color: '#84cc16' }, { shape: 'circle', color: '#f97316' }, { shape: 'square', color: '#d946ef' }, { shape: 'triangle', color: '#0ea5e9' }, { shape: 'diamond', color: '#facc15' }] },
  { id: 'grid-8', cells: [{ shape: 'square', color: '#8b5cf6' }, { shape: 'triangle', color: '#10b981' }, { shape: 'diamond', color: '#ef4444' }, { shape: 'circle', color: '#f59e0b' }, { shape: 'square', color: '#06b6d4' }, { shape: 'triangle', color: '#f43f5e' }] },
  { id: 'grid-9', cells: [{ shape: 'diamond', color: '#3b82f6' }, { shape: 'square', color: '#facc15' }, { shape: 'circle', color: '#84cc16' }, { shape: 'triangle', color: '#d946ef' }, { shape: 'diamond', color: '#f97316' }, { shape: 'circle', color: '#0ea5e9' }] },
  { id: 'grid-10', cells: [{ shape: 'circle', color: '#f43f5e' }, { shape: 'diamond', color: '#8b5cf6' }, { shape: 'square', color: '#10b981' }, { shape: 'triangle', color: '#f59e0b' }, { shape: 'circle', color: '#3b82f6' }, { shape: 'diamond', color: '#d946ef' }] },
  { id: 'grid-11', cells: [{ shape: 'triangle', color: '#06b6d4' }, { shape: 'square', color: '#ef4444' }, { shape: 'diamond', color: '#facc15' }, { shape: 'circle', color: '#8b5cf6' }, { shape: 'triangle', color: '#10b981' }, { shape: 'square', color: '#f97316' }] },
  { id: 'grid-12', cells: [{ shape: 'diamond', color: '#d946ef' }, { shape: 'circle', color: '#f59e0b' }, { shape: 'triangle', color: '#3b82f6' }, { shape: 'square', color: '#84cc16' }, { shape: 'diamond', color: '#ef4444' }, { shape: 'circle', color: '#06b6d4' }] },
  { id: 'grid-13', cells: [{ shape: 'square', color: '#f43f5e' }, { shape: 'triangle', color: '#0ea5e9' }, { shape: 'circle', color: '#facc15' }, { shape: 'diamond', color: '#8b5cf6' }, { shape: 'square', color: '#10b981' }, { shape: 'triangle', color: '#d946ef' }] },
  { id: 'grid-14', cells: [{ shape: 'circle', color: '#84cc16' }, { shape: 'diamond', color: '#f97316' }, { shape: 'square', color: '#3b82f6' }, { shape: 'triangle', color: '#ef4444' }, { shape: 'circle', color: '#d946ef' }, { shape: 'diamond', color: '#06b6d4' }] },
  { id: 'grid-15', cells: [{ shape: 'triangle', color: '#8b5cf6' }, { shape: 'square', color: '#facc15' }, { shape: 'diamond', color: '#f43f5e' }, { shape: 'circle', color: '#10b981' }, { shape: 'triangle', color: '#f97316' }, { shape: 'square', color: '#0ea5e9' }] },
] as const

export type ColorShapeOptionContent = {
  kind: 'color-shape'
  optionId: string
  pattern: ColorShapePattern
}

function otherShape(current: ColorShapeName): ColorShapeName {
  const others = SHAPES.filter((shape) => shape !== current)
  return pickRandom(others)
}

function otherColor(current: string): string {
  const others = COLORS.filter((color) => color !== current)
  return pickRandom(others)
}

// Changes exactly one cell's shape OR color (never both) — the rest of
// the grid stays byte-identical to the target.
function cloneWithSubtleCellTweak(pattern: ColorShapePattern, cellIndex: number, tweakKind: 'shape' | 'color'): ColorShapePattern {
  const cells = pattern.cells.map((cell, index) => {
    if (index !== cellIndex) return cell
    if (tweakKind === 'shape') return { ...cell, shape: otherShape(cell.shape) }
    return { ...cell, color: otherColor(cell.color) }
  })
  return { ...pattern, cells }
}

export type ColorShapeRoundResult = {
  target: ColorShapeOptionContent
  correctOptionId: string
  options: readonly ColorShapeOptionContent[]
}

export function buildColorShapeRound(excludeIds: ReadonlySet<string>): ColorShapeRoundResult {
  const candidates = COLOR_SHAPE_PATTERNS.filter((pattern) => !excludeIds.has(pattern.id))
  const pool = candidates.length > 0 ? candidates : COLOR_SHAPE_PATTERNS
  const targetPattern = pickRandom(pool)

  const correctOptionId = targetPattern.id
  const correctOption: ColorShapeOptionContent = { kind: 'color-shape', optionId: correctOptionId, pattern: targetPattern }

  const tweakKinds: readonly ('shape' | 'color')[] = ['shape', 'color', 'shape']
  const decoyOptions: ColorShapeOptionContent[] = tweakKinds.map((tweakKind, decoyIndex) => {
    const cellIndex = (decoyIndex * 2) % targetPattern.cells.length
    return {
      kind: 'color-shape',
      optionId: `${targetPattern.id}-decoy-${decoyIndex}`,
      pattern: cloneWithSubtleCellTweak(targetPattern, cellIndex, tweakKind),
    }
  })

  return {
    target: correctOption,
    correctOptionId,
    options: shuffle([correctOption, ...decoyOptions]),
  }
}
