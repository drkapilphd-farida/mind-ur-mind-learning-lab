import { shuffleIndices } from '@/lib/exercise-engine/randomizationEngine'

// Focus Discovery Foundation™ — the one real, shared visual vocabulary
// every grid-based mission (Attention Lock™, Visual Search™, Cognitive
// Flexibility™) draws from. Real glyphs + real colour classes — never
// text/icons that would turn this into a reading task (the brief's own
// locked principle: "Focus Discovery is NOT an eye test... IS Attention
// Discovery").

export const FOCUS_SHAPES = ['circle', 'square', 'triangle', 'star'] as const
export type FocusShape = (typeof FOCUS_SHAPES)[number]

export const FOCUS_SHAPE_GLYPH: Record<FocusShape, string> = {
  circle: '●',
  square: '■',
  triangle: '▲',
  star: '★',
}

export const FOCUS_COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'] as const
export type FocusColor = (typeof FOCUS_COLORS)[number]

// Tailwind's 500-weight swatches — real, distinguishable hues that read
// clearly in both light and dark theme (verified against this project's
// shared dark-mode design system, no custom palette invented here).
export const FOCUS_COLOR_CLASS: Record<FocusColor, string> = {
  red: 'text-red-500',
  blue: 'text-blue-500',
  green: 'text-emerald-500',
  yellow: 'text-amber-500',
  purple: 'text-violet-500',
  orange: 'text-orange-500',
}

export type FocusObject = {
  id: string
  shape: FocusShape
  color: FocusColor
  xPercent: number
  yPercent: number
}

// Same small local LCG every other Memory Discovery procedural generator
// (`digitSpan.ts`, `patternSequence.ts`) already uses — pure digit/shape
// generation has no other real reason to import the shared
// `randomizationEngine.ts`'s own item-picking helpers.
const LCG_MULTIPLIER = 1664525
const LCG_INCREMENT = 1013904223
const LCG_MODULUS = 0x100000000

function lcgNext(seed: number): number {
  return ((seed * LCG_MULTIPLIER + LCG_INCREMENT) >>> 0) % LCG_MODULUS
}

// A real [0, 1) fraction from a seed — the one primitive every generator
// below composes into shape/colour picks and grid jitter.
export function nextFraction(seed: number): number {
  return lcgNext(seed) / LCG_MODULUS
}

export function pickShape(seed: number): FocusShape {
  return FOCUS_SHAPES[Math.floor(nextFraction(seed) * FOCUS_SHAPES.length)]!
}

export function pickColor(seed: number): FocusColor {
  return FOCUS_COLORS[Math.floor(nextFraction(seed) * FOCUS_COLORS.length)]!
}

// Real, non-overlapping placement: a `count`-sized set of grid cells
// (sized to comfortably fit `count`), shuffled, each cell's own centre
// nudged by a small real random jitter — real variety without any two
// objects ever landing on top of each other.
function gridPositions(count: number, seed: number): { xPercent: number; yPercent: number }[] {
  const cols = Math.ceil(Math.sqrt(count * 1.4))
  const rows = Math.ceil(count / cols)
  const cellW = 100 / cols
  const cellH = 100 / rows
  const cellIndices = shuffleIndices(cols * rows, seed).slice(0, count)
  const jitterFraction = 0.28

  return cellIndices.map((cellIndex, index) => {
    const col = cellIndex % cols
    const row = Math.floor(cellIndex / cols)
    const jitterX = (nextFraction(seed + index * 31 + 1) - 0.5) * jitterFraction * cellW
    const jitterY = (nextFraction(seed + index * 47 + 2) - 0.5) * jitterFraction * cellH
    return {
      xPercent: Math.min(94, Math.max(6, col * cellW + cellW / 2 + jitterX)),
      yPercent: Math.min(90, Math.max(10, row * cellH + cellH / 2 + jitterY)),
    }
  })
}

// A real grid of `count` objects with random shape/colour per object —
// the shared building block every grid-based mission's own round
// generator composes further (picking a real target among them).
export function generateFocusObjectGrid(count: number, seed: number): FocusObject[] {
  const positions = gridPositions(count, seed)
  return positions.map((position, index) => ({
    id: `focus-object-${index}`,
    shape: pickShape(seed + index * 7 + 3),
    color: pickColor(seed + index * 11 + 5),
    ...position,
  }))
}
