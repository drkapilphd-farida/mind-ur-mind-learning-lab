// Photographic Memory™ — Category B: Abstract Icons & Cosmic Symbol
// Clusters. A small arrangement of 3-4 cosmic-themed icons at distinct
// positions, rotations, scales, and colors — deliberately NOT radially
// symmetric like the mandala category, so it reads as a genuinely
// different visual language within the same exercise.
import { shuffle, pickRandom } from '../shuffle'

export type CosmicIconId =
  | 'star'
  | 'sparkles'
  | 'moon'
  | 'sun'
  | 'zap'
  | 'atom'
  | 'circle-dot'
  | 'hexagon'
  | 'aperture'
  | 'compass'
  | 'gem'
  | 'snowflake'
  | 'flame'
  | 'orbit'
  | 'eye'
  | 'infinity'
  | 'feather'
  | 'cloud'
  | 'wind'

export type IconClusterItem = {
  iconId: CosmicIconId
  xPercent: number
  yPercent: number
  rotationDeg: number
  scale: number
  color: string
}

export type IconClusterPattern = {
  id: string
  items: readonly IconClusterItem[]
}

export const ICON_CLUSTER_PATTERNS: readonly IconClusterPattern[] = [
  {
    id: 'celestial-trio',
    items: [
      { iconId: 'star', xPercent: 25, yPercent: 30, rotationDeg: 0, scale: 1, color: '#f59e0b' },
      { iconId: 'moon', xPercent: 65, yPercent: 35, rotationDeg: 15, scale: 0.9, color: '#818cf8' },
      { iconId: 'sparkles', xPercent: 45, yPercent: 70, rotationDeg: -10, scale: 0.8, color: '#f472b6' },
    ],
  },
  {
    id: 'atomic-swirl',
    items: [
      { iconId: 'atom', xPercent: 50, yPercent: 40, rotationDeg: 0, scale: 1.1, color: '#3b82f6' },
      { iconId: 'orbit', xPercent: 25, yPercent: 65, rotationDeg: 20, scale: 0.9, color: '#06b6d4' },
      { iconId: 'zap', xPercent: 75, yPercent: 65, rotationDeg: -15, scale: 0.85, color: '#facc15' },
    ],
  },
  {
    id: 'crystal-cluster',
    items: [
      { iconId: 'gem', xPercent: 30, yPercent: 35, rotationDeg: 10, scale: 1, color: '#a78bfa' },
      { iconId: 'gem', xPercent: 65, yPercent: 30, rotationDeg: -20, scale: 0.85, color: '#c4b5fd' },
      { iconId: 'snowflake', xPercent: 50, yPercent: 70, rotationDeg: 0, scale: 0.9, color: '#5eead4' },
    ],
  },
  {
    id: 'solar-flare',
    items: [
      { iconId: 'sun', xPercent: 50, yPercent: 35, rotationDeg: 0, scale: 1.2, color: '#f97316' },
      { iconId: 'flame', xPercent: 25, yPercent: 65, rotationDeg: 15, scale: 0.9, color: '#ef4444' },
      { iconId: 'flame', xPercent: 75, yPercent: 65, rotationDeg: -15, scale: 0.9, color: '#fb923c' },
    ],
  },
  {
    id: 'hex-portal',
    items: [
      { iconId: 'hexagon', xPercent: 50, yPercent: 50, rotationDeg: 0, scale: 1.3, color: '#6366f1' },
      { iconId: 'aperture', xPercent: 25, yPercent: 25, rotationDeg: 30, scale: 0.7, color: '#8b5cf6' },
      { iconId: 'compass', xPercent: 75, yPercent: 75, rotationDeg: -20, scale: 0.75, color: '#0ea5e9' },
    ],
  },
  {
    id: 'eye-of-cosmos',
    items: [
      { iconId: 'eye', xPercent: 50, yPercent: 45, rotationDeg: 0, scale: 1.1, color: '#0891b2' },
      { iconId: 'star', xPercent: 25, yPercent: 25, rotationDeg: 20, scale: 0.8, color: '#f472b6' },
      { iconId: 'star', xPercent: 75, yPercent: 25, rotationDeg: -20, scale: 0.8, color: '#f472b6' },
      { iconId: 'sparkles', xPercent: 50, yPercent: 75, rotationDeg: 0, scale: 0.85, color: '#facc15' },
    ],
  },
  {
    id: 'drifting-moons',
    items: [
      { iconId: 'moon', xPercent: 30, yPercent: 30, rotationDeg: 0, scale: 1, color: '#c7d2fe' },
      { iconId: 'moon', xPercent: 70, yPercent: 40, rotationDeg: 25, scale: 0.85, color: '#a5b4fc' },
      { iconId: 'cloud', xPercent: 50, yPercent: 70, rotationDeg: -10, scale: 0.9, color: '#94a3b8' },
    ],
  },
  {
    id: 'frost-atom',
    items: [
      { iconId: 'snowflake', xPercent: 50, yPercent: 35, rotationDeg: 0, scale: 1.1, color: '#67e8f9' },
      { iconId: 'atom', xPercent: 25, yPercent: 65, rotationDeg: 20, scale: 0.85, color: '#0ea5e9' },
      { iconId: 'orbit', xPercent: 75, yPercent: 65, rotationDeg: -20, scale: 0.85, color: '#38bdf8' },
    ],
  },
  {
    id: 'wind-compass',
    items: [
      { iconId: 'compass', xPercent: 50, yPercent: 40, rotationDeg: 0, scale: 1.1, color: '#059669' },
      { iconId: 'wind', xPercent: 25, yPercent: 70, rotationDeg: 15, scale: 0.8, color: '#34d399' },
      { iconId: 'feather', xPercent: 75, yPercent: 70, rotationDeg: -15, scale: 0.8, color: '#6ee7b7' },
    ],
  },
  {
    id: 'infinite-spark',
    items: [
      { iconId: 'infinity', xPercent: 50, yPercent: 50, rotationDeg: 0, scale: 1.2, color: '#d946ef' },
      { iconId: 'zap', xPercent: 25, yPercent: 25, rotationDeg: 20, scale: 0.8, color: '#facc15' },
      { iconId: 'zap', xPercent: 75, yPercent: 25, rotationDeg: -20, scale: 0.8, color: '#facc15' },
    ],
  },
  {
    id: 'gemstone-orbit',
    items: [
      { iconId: 'gem', xPercent: 50, yPercent: 35, rotationDeg: 0, scale: 1, color: '#f43f5e' },
      { iconId: 'orbit', xPercent: 25, yPercent: 65, rotationDeg: 20, scale: 0.85, color: '#fb7185' },
      { iconId: 'sparkles', xPercent: 75, yPercent: 65, rotationDeg: -15, scale: 0.8, color: '#fda4af' },
    ],
  },
  {
    id: 'hexagon-cascade',
    items: [
      { iconId: 'hexagon', xPercent: 30, yPercent: 30, rotationDeg: 0, scale: 1, color: '#0d9488' },
      { iconId: 'hexagon', xPercent: 55, yPercent: 50, rotationDeg: 15, scale: 0.85, color: '#2dd4bf' },
      { iconId: 'hexagon', xPercent: 75, yPercent: 70, rotationDeg: -15, scale: 0.7, color: '#5eead4' },
    ],
  },
  {
    id: 'flame-aperture',
    items: [
      { iconId: 'flame', xPercent: 50, yPercent: 40, rotationDeg: 0, scale: 1.1, color: '#f97316' },
      { iconId: 'aperture', xPercent: 25, yPercent: 70, rotationDeg: 20, scale: 0.85, color: '#facc15' },
      { iconId: 'eye', xPercent: 75, yPercent: 70, rotationDeg: -15, scale: 0.8, color: '#fbbf24' },
    ],
  },
  {
    id: 'star-atom-fusion',
    items: [
      { iconId: 'star', xPercent: 30, yPercent: 35, rotationDeg: 0, scale: 1, color: '#8b5cf6' },
      { iconId: 'atom', xPercent: 65, yPercent: 35, rotationDeg: 15, scale: 0.9, color: '#6366f1' },
      { iconId: 'sparkles', xPercent: 50, yPercent: 70, rotationDeg: -10, scale: 0.85, color: '#c4b5fd' },
    ],
  },
  {
    id: 'cloud-feather-drift',
    items: [
      { iconId: 'cloud', xPercent: 35, yPercent: 30, rotationDeg: 0, scale: 1, color: '#64748b' },
      { iconId: 'feather', xPercent: 65, yPercent: 45, rotationDeg: 20, scale: 0.85, color: '#94a3b8' },
      { iconId: 'wind', xPercent: 50, yPercent: 75, rotationDeg: -10, scale: 0.8, color: '#cbd5e1' },
    ],
  },
] as const

export type IconClusterOptionContent = {
  kind: 'icon-cluster'
  optionId: string
  cluster: IconClusterPattern
}

const ITEM_TWEAK_KINDS = ['rotation', 'position', 'scale'] as const
type ItemTweakKind = (typeof ITEM_TWEAK_KINDS)[number]

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

// One subtle tweak to a single item of an otherwise-identical clone of
// the target cluster — mirrors the mandala category's own
// cloneWithSubtleLayerTweak, applied to a cluster item's transform
// instead of a mandala layer's geometry.
function cloneWithSubtleItemTweak(cluster: IconClusterPattern, itemIndex: number, tweakKind: ItemTweakKind): IconClusterPattern {
  const items = cluster.items.map((item, index) => {
    if (index !== itemIndex) return item
    if (tweakKind === 'rotation') {
      const delta = randomBetween(15, 35) * (Math.random() < 0.5 ? -1 : 1)
      return { ...item, rotationDeg: item.rotationDeg + delta }
    }
    if (tweakKind === 'position') {
      const dx = randomBetween(8, 16) * (Math.random() < 0.5 ? -1 : 1)
      const dy = randomBetween(8, 16) * (Math.random() < 0.5 ? -1 : 1)
      return {
        ...item,
        xPercent: Math.min(90, Math.max(10, item.xPercent + dx)),
        yPercent: Math.min(90, Math.max(10, item.yPercent + dy)),
      }
    }
    const scaleDelta = 1 + randomBetween(0.2, 0.35) * (Math.random() < 0.5 ? -1 : 1)
    return { ...item, scale: Math.max(0.4, item.scale * scaleDelta) }
  })
  return { ...cluster, items }
}

export type IconClusterRoundResult = {
  target: IconClusterOptionContent
  correctOptionId: string
  options: readonly IconClusterOptionContent[]
}

export function buildIconClusterRound(excludeIds: ReadonlySet<string>): IconClusterRoundResult {
  const candidates = ICON_CLUSTER_PATTERNS.filter((cluster) => !excludeIds.has(cluster.id))
  const pool = candidates.length > 0 ? candidates : ICON_CLUSTER_PATTERNS
  const targetCluster = pickRandom(pool)

  const correctOptionId = targetCluster.id
  const correctOption: IconClusterOptionContent = { kind: 'icon-cluster', optionId: correctOptionId, cluster: targetCluster }

  const decoyOptions: IconClusterOptionContent[] = ITEM_TWEAK_KINDS.map((tweakKind, decoyIndex) => {
    const itemIndex = decoyIndex % targetCluster.items.length
    return {
      kind: 'icon-cluster',
      optionId: `${targetCluster.id}-decoy-${decoyIndex}`,
      cluster: cloneWithSubtleItemTweak(targetCluster, itemIndex, tweakKind),
    }
  })

  return {
    target: correctOption,
    correctOptionId,
    options: shuffle([correctOption, ...decoyOptions]),
  }
}
