// Photographic Memory™ — Category A: Complex Geometric & Mandala
// Patterns. Moved from the retired mandala-photographic-dash feature
// (now one of 4 categories instead of the whole exercise). Separate from
// the unrelated V1 "Mandala Tratak" gaze-fixation feature
// (src/features/tratak-intelligence/, lab: visual-intelligence) — no
// shared files. Reuses the same proven radial-shape SVG technique that
// feature's own MandalaIllustration.tsx already validates (rotated
// shapes in concentric rings around a center dot), parametrized across
// 30 distinct patterns spanning 4 shape families (petal/diamond/
// triangle/circle).
import { shuffle, pickRandom } from '../shuffle'

export type MandalaLayerShape = 'petal' | 'diamond' | 'triangle' | 'circle'

export type MandalaPetalLayer = {
  shape: MandalaLayerShape
  count: number
  radius: number
  rx: number
  ry: number
  color: string
}

export type MandalaPatternDefinition = {
  id: string
  layers: readonly MandalaPetalLayer[]
  centerColor: string
}

export const MANDALA_PATTERNS: readonly MandalaPatternDefinition[] = [
  {
    id: 'indigo-bloom',
    layers: [
      { shape: 'petal', count: 16, radius: 150, rx: 40, ry: 15, color: '#6366f1' },
      { shape: 'petal', count: 10, radius: 100, rx: 28, ry: 12, color: '#8b5cf6' },
      { shape: 'petal', count: 6, radius: 55, rx: 18, ry: 8, color: '#d946ef' },
    ],
    centerColor: '#8b5cf6',
  },
  {
    id: 'emerald-tide',
    layers: [
      { shape: 'petal', count: 12, radius: 145, rx: 34, ry: 14, color: '#10b981' },
      { shape: 'petal', count: 8, radius: 95, rx: 26, ry: 11, color: '#14b8a6' },
      { shape: 'petal', count: 5, radius: 50, rx: 16, ry: 7, color: '#06b6d4' },
    ],
    centerColor: '#14b8a6',
  },
  {
    id: 'amber-crown',
    layers: [
      { shape: 'petal', count: 20, radius: 160, rx: 30, ry: 12, color: '#f59e0b' },
      { shape: 'petal', count: 14, radius: 120, rx: 24, ry: 10, color: '#f97316' },
      { shape: 'petal', count: 9, radius: 80, rx: 20, ry: 9, color: '#f43f5e' },
      { shape: 'petal', count: 5, radius: 45, rx: 14, ry: 6, color: '#fbbf24' },
    ],
    centerColor: '#f59e0b',
  },
  {
    id: 'sky-wheel',
    layers: [
      { shape: 'petal', count: 10, radius: 130, rx: 36, ry: 16, color: '#0ea5e9' },
      { shape: 'petal', count: 6, radius: 65, rx: 22, ry: 10, color: '#3b82f6' },
    ],
    centerColor: '#0ea5e9',
  },
  {
    id: 'rose-lattice',
    layers: [
      { shape: 'petal', count: 8, radius: 140, rx: 32, ry: 14, color: '#f43f5e' },
      { shape: 'petal', count: 8, radius: 90, rx: 26, ry: 12, color: '#ec4899' },
      { shape: 'petal', count: 4, radius: 50, rx: 18, ry: 8, color: '#d946ef' },
    ],
    centerColor: '#f43f5e',
  },
  {
    id: 'lime-radiance',
    layers: [
      { shape: 'petal', count: 24, radius: 155, rx: 26, ry: 11, color: '#84cc16' },
      { shape: 'petal', count: 16, radius: 115, rx: 22, ry: 10, color: '#a3e635' },
      { shape: 'petal', count: 10, radius: 75, rx: 18, ry: 8, color: '#10b981' },
      { shape: 'petal', count: 6, radius: 40, rx: 12, ry: 6, color: '#facc15' },
    ],
    centerColor: '#84cc16',
  },
  {
    id: 'violet-hex',
    layers: [
      { shape: 'petal', count: 6, radius: 145, rx: 38, ry: 16, color: '#8b5cf6' },
      { shape: 'petal', count: 6, radius: 100, rx: 30, ry: 13, color: '#6366f1' },
      { shape: 'petal', count: 6, radius: 55, rx: 20, ry: 9, color: '#3b82f6' },
    ],
    centerColor: '#6366f1',
  },
  {
    id: 'ember-burst',
    layers: [
      { shape: 'petal', count: 18, radius: 135, rx: 28, ry: 12, color: '#f97316' },
      { shape: 'petal', count: 9, radius: 70, rx: 22, ry: 10, color: '#ef4444' },
    ],
    centerColor: '#ef4444',
  },
  {
    id: 'cyan-halo',
    layers: [
      { shape: 'petal', count: 10, radius: 150, rx: 32, ry: 14, color: '#06b6d4' },
      { shape: 'petal', count: 10, radius: 105, rx: 26, ry: 12, color: '#0ea5e9' },
      { shape: 'petal', count: 5, radius: 55, rx: 16, ry: 7, color: '#6366f1' },
    ],
    centerColor: '#06b6d4',
  },
  {
    id: 'fuchsia-mosaic',
    layers: [
      { shape: 'petal', count: 12, radius: 160, rx: 30, ry: 12, color: '#d946ef' },
      { shape: 'petal', count: 12, radius: 120, rx: 26, ry: 11, color: '#ec4899' },
      { shape: 'petal', count: 8, radius: 80, rx: 20, ry: 9, color: '#f43f5e' },
      { shape: 'petal', count: 4, radius: 40, rx: 14, ry: 6, color: '#f59e0b' },
    ],
    centerColor: '#d946ef',
  },
  {
    id: 'teal-diamond-ring',
    layers: [
      { shape: 'diamond', count: 12, radius: 150, rx: 26, ry: 26, color: '#14b8a6' },
      { shape: 'petal', count: 8, radius: 95, rx: 24, ry: 11, color: '#5eead4' },
      { shape: 'circle', count: 5, radius: 50, rx: 14, ry: 14, color: '#0e7490' },
    ],
    centerColor: '#14b8a6',
  },
  {
    id: 'crimson-triangle-veil',
    layers: [
      { shape: 'triangle', count: 10, radius: 150, rx: 30, ry: 30, color: '#ef4444' },
      { shape: 'triangle', count: 10, radius: 100, rx: 22, ry: 22, color: '#f87171' },
      { shape: 'petal', count: 6, radius: 55, rx: 16, ry: 7, color: '#fca5a5' },
    ],
    centerColor: '#ef4444',
  },
  {
    id: 'golden-triangle-sun',
    layers: [
      { shape: 'triangle', count: 16, radius: 160, rx: 26, ry: 26, color: '#f59e0b' },
      { shape: 'diamond', count: 8, radius: 105, rx: 22, ry: 22, color: '#fbbf24' },
      { shape: 'circle', count: 4, radius: 50, rx: 14, ry: 14, color: '#fde68a' },
    ],
    centerColor: '#f59e0b',
  },
  {
    id: 'cobalt-diamond-star',
    layers: [
      { shape: 'diamond', count: 10, radius: 145, rx: 30, ry: 30, color: '#3b82f6' },
      { shape: 'diamond', count: 10, radius: 95, rx: 22, ry: 22, color: '#60a5fa' },
      { shape: 'petal', count: 5, radius: 50, rx: 16, ry: 7, color: '#93c5fd' },
    ],
    centerColor: '#3b82f6',
  },
  {
    id: 'jade-circle-orbit',
    layers: [
      { shape: 'circle', count: 14, radius: 155, rx: 20, ry: 20, color: '#10b981' },
      { shape: 'circle', count: 10, radius: 110, rx: 16, ry: 16, color: '#34d399' },
      { shape: 'circle', count: 6, radius: 60, rx: 12, ry: 12, color: '#6ee7b7' },
    ],
    centerColor: '#059669',
  },
  {
    id: 'magenta-petal-swirl',
    layers: [
      { shape: 'petal', count: 14, radius: 150, rx: 32, ry: 13, color: '#d946ef' },
      { shape: 'petal', count: 10, radius: 100, rx: 24, ry: 10, color: '#f0abfc' },
      { shape: 'diamond', count: 5, radius: 50, rx: 16, ry: 16, color: '#a21caf' },
    ],
    centerColor: '#d946ef',
  },
  {
    id: 'copper-triangle-crown',
    layers: [
      { shape: 'triangle', count: 20, radius: 165, rx: 24, ry: 24, color: '#f97316' },
      { shape: 'triangle', count: 12, radius: 115, rx: 20, ry: 20, color: '#fb923c' },
      { shape: 'triangle', count: 6, radius: 55, rx: 14, ry: 14, color: '#fdba74' },
    ],
    centerColor: '#ea580c',
  },
  {
    id: 'sapphire-mixed-bloom',
    layers: [
      { shape: 'petal', count: 12, radius: 150, rx: 30, ry: 13, color: '#0ea5e9' },
      { shape: 'diamond', count: 8, radius: 100, rx: 22, ry: 22, color: '#7dd3fc' },
      { shape: 'triangle', count: 4, radius: 50, rx: 16, ry: 16, color: '#0369a1' },
    ],
    centerColor: '#0ea5e9',
  },
  {
    id: 'plum-diamond-lattice',
    layers: [
      { shape: 'diamond', count: 8, radius: 140, rx: 32, ry: 32, color: '#9333ea' },
      { shape: 'diamond', count: 8, radius: 90, rx: 24, ry: 24, color: '#c084fc' },
      { shape: 'petal', count: 4, radius: 45, rx: 16, ry: 7, color: '#6b21a8' },
    ],
    centerColor: '#9333ea',
  },
  {
    id: 'citrus-circle-flare',
    layers: [
      { shape: 'circle', count: 18, radius: 155, rx: 22, ry: 22, color: '#facc15' },
      { shape: 'petal', count: 10, radius: 105, rx: 24, ry: 10, color: '#fde047' },
      { shape: 'diamond', count: 5, radius: 50, rx: 14, ry: 14, color: '#ca8a04' },
    ],
    centerColor: '#eab308',
  },
  {
    id: 'rose-triangle-bloom',
    layers: [
      { shape: 'triangle', count: 12, radius: 150, rx: 28, ry: 28, color: '#f43f5e' },
      { shape: 'petal', count: 8, radius: 100, rx: 24, ry: 11, color: '#fda4af' },
      { shape: 'circle', count: 4, radius: 50, rx: 14, ry: 14, color: '#be123c' },
    ],
    centerColor: '#f43f5e',
  },
  {
    id: 'slate-diamond-web',
    layers: [
      { shape: 'diamond', count: 16, radius: 160, rx: 24, ry: 24, color: '#64748b' },
      { shape: 'diamond', count: 10, radius: 110, rx: 20, ry: 20, color: '#94a3b8' },
      { shape: 'diamond', count: 5, radius: 55, rx: 14, ry: 14, color: '#334155' },
    ],
    centerColor: '#475569',
  },
  {
    id: 'emerald-triangle-shard',
    layers: [
      { shape: 'triangle', count: 14, radius: 150, rx: 26, ry: 26, color: '#059669' },
      { shape: 'triangle', count: 10, radius: 100, rx: 20, ry: 20, color: '#34d399' },
      { shape: 'petal', count: 5, radius: 50, rx: 16, ry: 7, color: '#a7f3d0' },
    ],
    centerColor: '#059669',
  },
  {
    id: 'amethyst-circle-halo',
    layers: [
      { shape: 'circle', count: 12, radius: 155, rx: 24, ry: 24, color: '#8b5cf6' },
      { shape: 'circle', count: 8, radius: 105, rx: 18, ry: 18, color: '#c4b5fd' },
      { shape: 'petal', count: 4, radius: 50, rx: 16, ry: 7, color: '#5b21b6' },
    ],
    centerColor: '#7c3aed',
  },
  {
    id: 'tangerine-diamond-blossom',
    layers: [
      { shape: 'diamond', count: 14, radius: 150, rx: 26, ry: 26, color: '#fb923c' },
      { shape: 'petal', count: 10, radius: 100, rx: 24, ry: 11, color: '#fdba74' },
      { shape: 'circle', count: 5, radius: 50, rx: 14, ry: 14, color: '#c2410c' },
    ],
    centerColor: '#f97316',
  },
  {
    id: 'teal-triangle-current',
    layers: [
      { shape: 'triangle', count: 18, radius: 160, rx: 24, ry: 24, color: '#0d9488' },
      { shape: 'triangle', count: 10, radius: 105, rx: 20, ry: 20, color: '#2dd4bf' },
      { shape: 'diamond', count: 5, radius: 50, rx: 14, ry: 14, color: '#134e4a' },
    ],
    centerColor: '#0d9488',
  },
  {
    id: 'berry-mixed-mandala',
    layers: [
      { shape: 'petal', count: 10, radius: 150, rx: 28, ry: 12, color: '#be185d' },
      { shape: 'triangle', count: 8, radius: 100, rx: 22, ry: 22, color: '#f472b6' },
      { shape: 'circle', count: 4, radius: 50, rx: 14, ry: 14, color: '#831843' },
    ],
    centerColor: '#be185d',
  },
  {
    id: 'steel-petal-orbit',
    layers: [
      { shape: 'petal', count: 16, radius: 155, rx: 24, ry: 10, color: '#475569' },
      { shape: 'circle', count: 10, radius: 105, rx: 18, ry: 18, color: '#94a3b8' },
      { shape: 'diamond', count: 5, radius: 50, rx: 14, ry: 14, color: '#1e293b' },
    ],
    centerColor: '#334155',
  },
  {
    id: 'sunrise-triangle-corona',
    layers: [
      { shape: 'triangle', count: 20, radius: 165, rx: 22, ry: 22, color: '#fbbf24' },
      { shape: 'triangle', count: 12, radius: 115, rx: 20, ry: 20, color: '#f97316' },
      { shape: 'triangle', count: 6, radius: 55, rx: 14, ry: 14, color: '#ef4444' },
    ],
    centerColor: '#f59e0b',
  },
  {
    id: 'arctic-diamond-frost',
    layers: [
      { shape: 'diamond', count: 12, radius: 150, rx: 26, ry: 26, color: '#38bdf8' },
      { shape: 'petal', count: 8, radius: 100, rx: 24, ry: 11, color: '#bae6fd' },
      { shape: 'circle', count: 4, radius: 50, rx: 14, ry: 14, color: '#0284c7' },
    ],
    centerColor: '#0ea5e9',
  },
] as const

export type MandalaOptionContent = {
  kind: 'mandala'
  optionId: string
  pattern: MandalaPatternDefinition
  rotationOffsetDeg: number
}

const LAYER_TWEAK_KINDS = ['radius', 'size', 'count'] as const
type LayerTweakKind = (typeof LAYER_TWEAK_KINDS)[number]

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

// One subtle tweak to a single layer of an otherwise-identical clone of
// the target pattern — genuinely hard to spot without having truly
// memorized the flash, unlike swapping in an unrelated pattern.
function cloneWithSubtleLayerTweak(pattern: MandalaPatternDefinition, layerIndex: number, tweakKind: LayerTweakKind): MandalaPatternDefinition {
  const layers = pattern.layers.map((layer, index) => {
    if (index !== layerIndex) return layer
    if (tweakKind === 'radius') {
      const delta = randomBetween(6, 12) * (Math.random() < 0.5 ? -1 : 1)
      return { ...layer, radius: Math.max(20, layer.radius + delta) }
    }
    if (tweakKind === 'size') {
      const scale = 1 + randomBetween(0.14, 0.24) * (Math.random() < 0.5 ? -1 : 1)
      return { ...layer, rx: Math.max(6, layer.rx * scale), ry: Math.max(4, layer.ry * scale) }
    }
    const delta = Math.random() < 0.5 ? -1 : 1
    return { ...layer, count: Math.max(4, layer.count + delta) }
  })
  return { ...pattern, layers }
}

// A small whole-pattern rotation (6-20 degrees, either direction) — the
// classic "did I misremember the orientation" trick, applied on top of
// the layer tweak so every decoy differs from the target in two subtle,
// independent ways at once.
function randomSubtleRotationDeg(): number {
  const magnitude = randomBetween(6, 20)
  return Math.random() < 0.5 ? -magnitude : magnitude
}

export type MandalaRoundResult = {
  target: MandalaOptionContent
  correctOptionId: string
  options: readonly MandalaOptionContent[]
}

// The 4 options are the real target (unrotated, unmodified) plus 3
// near-clones of that SAME pattern, each carrying exactly one of the 3
// tweak kinds (so decoys are never all-the-same kind of different) plus
// its own small random rotation.
export function buildMandalaRound(excludeIds: ReadonlySet<string>): MandalaRoundResult {
  const candidates = MANDALA_PATTERNS.filter((pattern) => !excludeIds.has(pattern.id))
  const pool = candidates.length > 0 ? candidates : MANDALA_PATTERNS
  const targetPattern = pickRandom(pool)

  const correctOptionId = targetPattern.id
  const correctOption: MandalaOptionContent = { kind: 'mandala', optionId: correctOptionId, pattern: targetPattern, rotationOffsetDeg: 0 }

  const decoyOptions: MandalaOptionContent[] = LAYER_TWEAK_KINDS.map((tweakKind, decoyIndex) => {
    const layerIndex = decoyIndex % targetPattern.layers.length
    return {
      kind: 'mandala',
      optionId: `${targetPattern.id}-decoy-${decoyIndex}`,
      pattern: cloneWithSubtleLayerTweak(targetPattern, layerIndex, tweakKind),
      rotationOffsetDeg: randomSubtleRotationDeg(),
    }
  })

  return {
    target: correctOption,
    correctOptionId,
    options: shuffle([correctOption, ...decoyOptions]),
  }
}
