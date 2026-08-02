// High-Speed Pictorial Essence Sprint™ (Arcade Hard Mode) — deliberately
// its own folder/content, separate from Photographic Memory™ and every
// other exercise (no shared files, no route collision).
//
// Hard Mode Sprint rewrite — two requirements drove this:
// (1) the 4 recall options are no longer 4 DIFFERENT sibling theme names
//     from the same category (Ocean vs. Sea vs. Lake vs. River) — they're
//     now the exact flashed icon (unrotated, unmodified) plus 3 near-clone
//     variants of that SAME icon, each with one subtle tweak (a rotation,
//     a slightly shifted shade, or a scale change), so a lucky guess based
//     on "it was blue and wavy" no longer works — only true photographic
//     retention of the EXACT rendering passes;
// (2) the theme pool needed a "massive expansion" and now spans 8
//     categories (the original water/cosmic/earth/fire/sky/forest, plus 2
//     new ones — abstract and symbolic — the task explicitly names), 8
//     themes each, 64 total, more than double the original 30.
export type EssenceCategory = 'water' | 'cosmic' | 'earth' | 'fire' | 'sky' | 'forest' | 'abstract' | 'symbolic'

export type EssenceIconId =
  | 'waves'
  | 'droplets'
  | 'droplet'
  | 'sailboat'
  | 'cloud-rain'
  | 'umbrella'
  | 'fish'
  | 'ship'
  | 'sparkles'
  | 'orbit'
  | 'rocket'
  | 'star'
  | 'moon'
  | 'globe'
  | 'satellite'
  | 'telescope'
  | 'mountain'
  | 'mountain-snow'
  | 'layers'
  | 'gem'
  | 'snowflake'
  | 'pickaxe'
  | 'landmark'
  | 'map'
  | 'flame'
  | 'zap'
  | 'radiation'
  | 'sunrise'
  | 'sun'
  | 'thermometer'
  | 'flashlight'
  | 'cooking-pot'
  | 'cloud-lightning'
  | 'wind'
  | 'tornado'
  | 'rainbow'
  | 'cloud-fog'
  | 'cloud-drizzle'
  | 'cloudy'
  | 'cloud-sun'
  | 'tree-pine'
  | 'trees'
  | 'leaf'
  | 'flower'
  | 'wheat'
  | 'sprout'
  | 'palmtree'
  | 'clover'
  | 'infinity'
  | 'scale'
  | 'shuffle'
  | 'blend'
  | 'refresh-cw'
  | 'circle-off'
  | 'boxes'
  | 'puzzle'
  | 'crown'
  | 'key'
  | 'shield'
  | 'trophy'
  | 'flag'
  | 'bell'
  | 'scroll-text'
  | 'waypoints'

export type EssenceTheme = {
  id: string
  label: string
  category: EssenceCategory
  iconId: EssenceIconId
  color: string
}

export const CATEGORY_LABELS: Record<EssenceCategory, string> = {
  water: 'Water',
  cosmic: 'Cosmic',
  earth: 'Earth',
  fire: 'Fire & Energy',
  sky: 'Sky & Air',
  forest: 'Forest & Nature',
  abstract: 'Abstract',
  symbolic: 'Symbolic',
}

// 8 themes per category (64 total) — real, named, semantically genuine
// concepts spanning abstract, cosmic, nature, and symbolic domains (no
// lorem ipsum). Each theme's icon is now used ONLY as the flash target
// and the near-clone options' shared base glyph — categories no longer
// drive decoy selection (see buildEssenceOptions below), so themes within
// a category no longer need to look alike; they just need enough variety
// that rounds never repeat too quickly.
export const ESSENCE_THEMES: readonly EssenceTheme[] = [
  { id: 'ocean', label: 'Ocean', category: 'water', iconId: 'waves', color: '#0ea5e9' },
  { id: 'sea', label: 'Sea', category: 'water', iconId: 'droplets', color: '#0284c7' },
  { id: 'lake', label: 'Lake', category: 'water', iconId: 'droplet', color: '#38bdf8' },
  { id: 'river', label: 'River', category: 'water', iconId: 'sailboat', color: '#0891b2' },
  { id: 'waterfall', label: 'Waterfall', category: 'water', iconId: 'cloud-rain', color: '#06b6d4' },
  { id: 'monsoon-rain', label: 'Monsoon Rain', category: 'water', iconId: 'umbrella', color: '#0369a1' },
  { id: 'coral-reef', label: 'Coral Reef', category: 'water', iconId: 'fish', color: '#14b8a6' },
  { id: 'sailing-voyage', label: 'Sailing Voyage', category: 'water', iconId: 'ship', color: '#155e75' },

  { id: 'galaxy', label: 'Galaxy', category: 'cosmic', iconId: 'sparkles', color: '#8b5cf6' },
  { id: 'nebula', label: 'Nebula', category: 'cosmic', iconId: 'orbit', color: '#a855f7' },
  { id: 'comet', label: 'Comet', category: 'cosmic', iconId: 'rocket', color: '#7c3aed' },
  { id: 'starfield', label: 'Starfield', category: 'cosmic', iconId: 'star', color: '#6d28d9' },
  { id: 'moonlight', label: 'Moonlight', category: 'cosmic', iconId: 'moon', color: '#9333ea' },
  { id: 'distant-planet', label: 'Distant Planet', category: 'cosmic', iconId: 'globe', color: '#7e22ce' },
  { id: 'satellite-orbit', label: 'Satellite Orbit', category: 'cosmic', iconId: 'satellite', color: '#a78bfa' },
  { id: 'deep-space', label: 'Deep Space', category: 'cosmic', iconId: 'telescope', color: '#6b21a8' },

  { id: 'mountain', label: 'Mountain', category: 'earth', iconId: 'mountain', color: '#64748b' },
  { id: 'glacier', label: 'Glacier', category: 'earth', iconId: 'mountain-snow', color: '#7dd3fc' },
  { id: 'canyon', label: 'Canyon', category: 'earth', iconId: 'layers', color: '#b45309' },
  { id: 'cave', label: 'Cave', category: 'earth', iconId: 'gem', color: '#a78bfa' },
  { id: 'tundra', label: 'Tundra', category: 'earth', iconId: 'snowflake', color: '#93c5fd' },
  { id: 'quarry', label: 'Quarry', category: 'earth', iconId: 'pickaxe', color: '#78716c' },
  { id: 'ancient-ruins', label: 'Ancient Ruins', category: 'earth', iconId: 'landmark', color: '#a8a29e' },
  { id: 'terrain-map', label: 'Terrain Map', category: 'earth', iconId: 'map', color: '#166534' },

  { id: 'fire', label: 'Fire', category: 'fire', iconId: 'flame', color: '#ef4444' },
  { id: 'lightning', label: 'Lightning', category: 'fire', iconId: 'zap', color: '#facc15' },
  { id: 'energy-vortex', label: 'Energy Vortex', category: 'fire', iconId: 'radiation', color: '#f97316' },
  { id: 'sunrise', label: 'Sunrise', category: 'fire', iconId: 'sunrise', color: '#fb923c' },
  { id: 'solar-flare', label: 'Solar Flare', category: 'fire', iconId: 'sun', color: '#eab308' },
  { id: 'molten-heat', label: 'Molten Heat', category: 'fire', iconId: 'thermometer', color: '#dc2626' },
  { id: 'torchlight', label: 'Torchlight', category: 'fire', iconId: 'flashlight', color: '#f59e0b' },
  { id: 'hearth-fire', label: 'Hearth Fire', category: 'fire', iconId: 'cooking-pot', color: '#c2410c' },

  { id: 'storm', label: 'Storm', category: 'sky', iconId: 'cloud-lightning', color: '#475569' },
  { id: 'wind', label: 'Wind', category: 'sky', iconId: 'wind', color: '#94a3b8' },
  { id: 'tornado', label: 'Tornado', category: 'sky', iconId: 'tornado', color: '#64748b' },
  { id: 'aurora', label: 'Aurora', category: 'sky', iconId: 'rainbow', color: '#22d3ee' },
  { id: 'fog', label: 'Fog', category: 'sky', iconId: 'cloud-fog', color: '#cbd5e1' },
  { id: 'drizzle', label: 'Drizzle', category: 'sky', iconId: 'cloud-drizzle', color: '#38bdf8' },
  { id: 'overcast-sky', label: 'Overcast Sky', category: 'sky', iconId: 'cloudy', color: '#78716c' },
  { id: 'sunny-breeze', label: 'Sunny Breeze', category: 'sky', iconId: 'cloud-sun', color: '#fbbf24' },

  { id: 'forest', label: 'Forest', category: 'forest', iconId: 'tree-pine', color: '#166534' },
  { id: 'jungle', label: 'Jungle', category: 'forest', iconId: 'trees', color: '#15803d' },
  { id: 'meadow', label: 'Meadow', category: 'forest', iconId: 'leaf', color: '#65a30d' },
  { id: 'wildflower-field', label: 'Wildflower Field', category: 'forest', iconId: 'flower', color: '#db2777' },
  { id: 'wheat-field', label: 'Wheat Field', category: 'forest', iconId: 'wheat', color: '#ca8a04' },
  { id: 'sprouting-seed', label: 'Sprouting Seed', category: 'forest', iconId: 'sprout', color: '#4ade80' },
  { id: 'palm-grove', label: 'Palm Grove', category: 'forest', iconId: 'palmtree', color: '#059669' },
  { id: 'clover-patch', label: 'Clover Patch', category: 'forest', iconId: 'clover', color: '#22c55e' },

  { id: 'infinity-loop', label: 'Infinity', category: 'abstract', iconId: 'infinity', color: '#7c3aed' },
  { id: 'balance', label: 'Balance', category: 'abstract', iconId: 'scale', color: '#0891b2' },
  { id: 'chaos', label: 'Chaos', category: 'abstract', iconId: 'shuffle', color: '#dc2626' },
  { id: 'fusion', label: 'Fusion', category: 'abstract', iconId: 'blend', color: '#d946ef' },
  { id: 'cycle', label: 'Cycle', category: 'abstract', iconId: 'refresh-cw', color: '#0ea5e9' },
  { id: 'void', label: 'Void', category: 'abstract', iconId: 'circle-off', color: '#1e293b' },
  { id: 'complexity', label: 'Complexity', category: 'abstract', iconId: 'boxes', color: '#f59e0b' },
  { id: 'enigma', label: 'Enigma', category: 'abstract', iconId: 'puzzle', color: '#8b5cf6' },

  { id: 'crown-of-power', label: 'Crown of Power', category: 'symbolic', iconId: 'crown', color: '#eab308' },
  { id: 'golden-key', label: 'Golden Key', category: 'symbolic', iconId: 'key', color: '#a16207' },
  { id: 'shield-of-honor', label: 'Shield of Honor', category: 'symbolic', iconId: 'shield', color: '#1e3a8a' },
  { id: 'victory-trophy', label: 'Victory Trophy', category: 'symbolic', iconId: 'trophy', color: '#ca8a04' },
  { id: 'banner-flag', label: 'Banner Flag', category: 'symbolic', iconId: 'flag', color: '#dc2626' },
  { id: 'temple-bell', label: 'Temple Bell', category: 'symbolic', iconId: 'bell', color: '#f59e0b' },
  { id: 'ancient-scroll', label: 'Ancient Scroll', category: 'symbolic', iconId: 'scroll-text', color: '#78350f' },
  { id: 'sacred-path', label: 'Sacred Path', category: 'symbolic', iconId: 'waypoints', color: '#0d9488' },
] as const

const ALL_CATEGORIES: readonly EssenceCategory[] = ['water', 'cosmic', 'earth', 'fire', 'sky', 'forest', 'abstract', 'symbolic']

// Exactly 2 rounds per category (16 total) — a deliberate, non-arbitrary
// choice: every one of the 8 categories gets equal representation every
// session, never left to chance.
export const ROUNDS_PER_SESSION = ALL_CATEGORIES.length * 2

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

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

// A small, subtle shade shift (each RGB channel nudged by up to ±40,
// clamped) — close enough to read as "the same color family" at a
// glance, far enough to be a genuinely different hex value up close.
function shiftColorSlightly(hex: string): string {
  const channel = (start: number): number => {
    const value = Number.parseInt(hex.slice(start, start + 2), 16)
    const delta = Math.floor(randomBetween(-40, 40))
    return Math.min(255, Math.max(0, value + delta))
  }
  const toHexPair = (value: number): string => value.toString(16).padStart(2, '0')
  return `#${toHexPair(channel(1))}${toHexPair(channel(3))}${toHexPair(channel(5))}`
}

export type EssenceOption = {
  optionId: string
  rotationDeg: number
  color: string
  scale: number
}

export type EssenceRound = {
  category: EssenceCategory
  target: EssenceTheme
  correctOptionId: string
  options: readonly EssenceOption[]
}

const TWEAK_KINDS = ['rotation', 'color', 'scale'] as const
type TweakKind = (typeof TWEAK_KINDS)[number]

function buildTweakedOption(target: EssenceTheme, tweakKind: TweakKind, decoyIndex: number): EssenceOption {
  const base: EssenceOption = { optionId: `${target.id}-decoy-${decoyIndex}`, rotationDeg: 0, color: target.color, scale: 1 }
  if (tweakKind === 'rotation') {
    const magnitude = randomBetween(15, 35)
    return { ...base, rotationDeg: Math.random() < 0.5 ? -magnitude : magnitude }
  }
  if (tweakKind === 'color') {
    return { ...base, color: shiftColorSlightly(target.color) }
  }
  const scaleDelta = 1 + randomBetween(0.15, 0.3) * (Math.random() < 0.5 ? -1 : 1)
  return { ...base, scale: Math.max(0.5, scaleDelta) }
}

// Hard Mode Sprint — the 4 options are the real flashed icon (unrotated,
// unmodified, at its true color and scale) plus 3 near-clones of that
// SAME icon, each carrying exactly one of the 3 tweak kinds (so decoys
// are never all-the-same kind of different): a rotation, a subtly
// shifted shade, or a scale change. "Extremely similar... only very
// subtle differences" now means genuinely so — every option renders the
// identical glyph, just three of the four are quietly wrong.
export function buildEssenceOptions(target: EssenceTheme): { correctOptionId: string; options: readonly EssenceOption[] } {
  const correctOptionId = `${target.id}-original`
  const correctOption: EssenceOption = { optionId: correctOptionId, rotationDeg: 0, color: target.color, scale: 1 }
  const decoyOptions = TWEAK_KINDS.map((tweakKind, index) => buildTweakedOption(target, tweakKind, index))
  return { correctOptionId, options: shuffle([correctOption, ...decoyOptions]) }
}

// Builds the whole session upfront: a shuffled sequence of 2 rounds per
// category, each round's target a theme not yet used this session for
// that category.
export function buildSessionRounds(): readonly EssenceRound[] {
  const categorySequence = shuffle(ALL_CATEGORIES.flatMap((category) => [category, category]))
  const usedIdsByCategory: Record<EssenceCategory, Set<string>> = {
    water: new Set(),
    cosmic: new Set(),
    earth: new Set(),
    fire: new Set(),
    sky: new Set(),
    forest: new Set(),
    abstract: new Set(),
    symbolic: new Set(),
  }

  return categorySequence.map((category) => {
    const themesInCategory = ESSENCE_THEMES.filter((theme) => theme.category === category)
    const usedIds = usedIdsByCategory[category]
    const candidates = themesInCategory.filter((theme) => !usedIds.has(theme.id))
    const pool = candidates.length > 0 ? candidates : themesInCategory
    const targetIndex = Math.floor(Math.random() * pool.length)
    const target = pool[targetIndex]
    if (target === undefined) throw new Error('essence theme pool unexpectedly empty')
    usedIds.add(target.id)

    const { correctOptionId, options } = buildEssenceOptions(target)
    return { category, target, correctOptionId, options }
  })
}

// Streak & scoring — every 2 consecutive correct matches bumps the
// multiplier by +1 (streak 0-1 -> x1, 2-3 -> x2, ...), applied to a flat
// base-points value per correct match, plus a "lightning reflex" bonus
// for answering within the first third of the recall window. Recalibrated
// for Arcade Hard Mode's much tighter 1.5s recall window (was a 2s bonus
// threshold inside a 5s window) — 500ms now, so the bonus still rewards
// genuinely instant reactions rather than most of the window. Deliberately
// its own independent copy of the streak formula (not imported from any
// sibling exercise's dataset file).
export const BASE_POINTS_PER_CORRECT_MATCH = 150
const STREAK_MULTIPLIER_STEP = 2
export const TIMING_BONUS_WINDOW_MS = 500
export const TIMING_BONUS_POINTS = 50

export function computeStreakMultiplier(streak: number): number {
  return 1 + Math.floor(streak / STREAK_MULTIPLIER_STEP)
}

export function computePointsForCorrectMatch(streakAfterThisGuess: number, reactionTimeMs: number): number {
  const base = BASE_POINTS_PER_CORRECT_MATCH * computeStreakMultiplier(streakAfterThisGuess)
  const timingBonus = reactionTimeMs <= TIMING_BONUS_WINDOW_MS ? TIMING_BONUS_POINTS : 0
  return base + timingBonus
}

// A one-time bonus for a flawless dash (every round correct — never
// possible in the same session as a Game Over, since losing all lives
// always means at least one round wasn't correct), added to the
// session's total once at completion.
export const PERFECT_SESSION_BONUS = 500

// Arcade Hard Mode's own addition — a 3-lives system. A wrong click or a
// recall timeout costs a life; losing the last one ends the sprint early
// (Game Over) rather than continuing to the next round.
export const MAX_LIVES = 3
