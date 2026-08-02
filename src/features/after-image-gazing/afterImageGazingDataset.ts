// After-Image / Complementary Color Gazing™ — the fourth Right Brain
// Activation exercise, alongside Photographic Memory™, High-Speed
// Pictorial Essence Sprint™, and Hemispheric Color-Word Sync Grid™. Its
// own folder/content, no shared files with any sibling.
//
// The mechanic is a real optical phenomenon, not a puzzle: staring at a
// saturated color fatigues the retina's cones tuned to that hue, so when
// the eye then looks at a neutral surface it briefly perceives the
// opponent (complementary) color as a faint afterimage. Because that
// afterimage is a genuine physiological response, this exercise never
// scores it as "correct" or "wrong" — a learner who sees nothing has a
// perfectly normal retina, not a failure. Every round instead asks an
// honest, subjective retention question and scores THAT — never a
// fabricated ground truth about what someone's eyes actually did.
//
// This dataset intentionally does NOT include any real, identifiable
// person's likeness. The brief's "Actor/Actress" duotone category is
// implemented as generic, anonymous human-figure silhouettes instead —
// nobody depicted is a real or recognizable individual. Using real
// celebrity photos/likenesses (even stylized ones) in a commercial
// product carries real right-of-publicity and licensing risk that a
// generic silhouette sidesteps entirely, while still delivering the
// same high-contrast, humanoid duotone visual this category is for.

export type GazeCategory = 'geometric' | 'cosmic' | 'silhouette'

// 'master' plays a randomized deck spanning every category — the other
// three narrow the deck to just one.
export type GazeCategorySelection = GazeCategory | 'master'

export const GAZE_CATEGORY_LABELS: Record<GazeCategory, string> = {
  geometric: 'Geometric Forms',
  cosmic: 'Cosmic & Sacred Symbols',
  silhouette: 'Silhouette Portraits',
}

type BaseHueName = 'red' | 'green' | 'blue' | 'yellow' | 'cyan' | 'magenta'

type BaseHue = {
  name: BaseHueName
  hex: string
  complementaryLabel: string
  complementaryHex: string
}

// The classical opponent-color pairing used to describe (never to
// "test") what a learner might notice in the afterimage phase. Reused
// across all 3 categories below rather than inventing a new hue per
// asset — the color science stays correct and every asset still gets
// real visual variety from its shape/symbol/figure, not from a
// proliferation of ad-hoc hues.
const BASE_HUES: readonly BaseHue[] = [
  { name: 'red', hex: '#ef4444', complementaryLabel: 'Cyan', complementaryHex: '#22d3ee' },
  { name: 'green', hex: '#22c55e', complementaryLabel: 'Magenta', complementaryHex: '#ec4899' },
  { name: 'blue', hex: '#3b82f6', complementaryLabel: 'Amber', complementaryHex: '#f59e0b' },
  { name: 'yellow', hex: '#eab308', complementaryLabel: 'Indigo', complementaryHex: '#6366f1' },
  { name: 'cyan', hex: '#22d3ee', complementaryLabel: 'Red', complementaryHex: '#ef4444' },
  { name: 'magenta', hex: '#ec4899', complementaryLabel: 'Green', complementaryHex: '#22c55e' },
]

function capitalize(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`
}

export type GazeVisualKind =
  // geometric
  | 'circle'
  | 'square'
  | 'triangle'
  | 'hexagon'
  | 'pentagon'
  | 'octagon'
  | 'diamond'
  | 'star'
  | 'mandala-rings'
  // cosmic
  | 'sun'
  | 'moon'
  | 'sparkle'
  | 'sparkles'
  | 'orbit'
  | 'infinity'
  | 'eye'
  | 'flower'
  | 'rainbow'
  | 'feather'
  | 'gem'
  | 'zap'
  | 'wind'
  | 'halo'
  | 'waves'
  // silhouette — generic, anonymous humanoid glyphs; never a real person
  | 'figure-user'
  | 'figure-user-round'
  | 'figure-standing'
  | 'figure-circle-frame'
  | 'figure-square-frame'
  | 'figure-contact'

export type GazeAsset = {
  id: string
  label: string
  category: GazeCategory
  visualKind: GazeVisualKind
  // The color occupying the most visual area — this is what actually
  // drives the afterimage, and what complementaryLabel/Hex is computed
  // from. For silhouette duotone cards this is the large background
  // field, NOT the (much smaller) icon drawn on top.
  dominantHex: string
  dominantColorLabel: string
  // Only set for silhouette assets — the contrasting color the figure
  // icon itself is drawn in, on top of dominantHex.
  accentHex?: string
  complementaryLabel: string
  complementaryHex: string
  // Only meaningful for silhouette assets: 'duotone' is a bold saturated
  // color field behind a white figure; 'negative' is a true photographic
  // negative — a stark black field behind a white figure (or the
  // reverse), the classic high-contrast Trataka negative-portrait look,
  // maximizing the luminance delta against the neutral afterimage panel.
  treatment?: 'duotone' | 'negative'
}

const GEOMETRIC_SHAPES: readonly { kind: GazeVisualKind; label: string }[] = [
  { kind: 'circle', label: 'Circle' },
  { kind: 'square', label: 'Square' },
  { kind: 'triangle', label: 'Triangle' },
  { kind: 'hexagon', label: 'Hexagon' },
  { kind: 'pentagon', label: 'Pentagon' },
  { kind: 'octagon', label: 'Octagon' },
  { kind: 'diamond', label: 'Diamond' },
  { kind: 'star', label: 'Star' },
  { kind: 'mandala-rings', label: 'Mandala Rings' },
]

// 9 shapes × 2 hues each = 18 geometric assets.
function buildGeometricAssets(): readonly GazeAsset[] {
  const assets: GazeAsset[] = []
  GEOMETRIC_SHAPES.forEach((shape, shapeIndex) => {
    for (let variant = 0; variant < 2; variant += 1) {
      const hue = BASE_HUES[(shapeIndex * 2 + variant) % BASE_HUES.length]
      if (hue === undefined) throw new Error('base hue pool unexpectedly empty')
      assets.push({
        id: `geometric-${shape.kind}-${hue.name}`,
        label: `${capitalize(hue.name)} ${shape.label}`,
        category: 'geometric',
        visualKind: shape.kind,
        dominantHex: hue.hex,
        dominantColorLabel: capitalize(hue.name),
        complementaryLabel: hue.complementaryLabel,
        complementaryHex: hue.complementaryHex,
      })
    }
  })
  return assets
}

const COSMIC_SYMBOLS: readonly { kind: GazeVisualKind; label: string }[] = [
  { kind: 'sun', label: 'Sun' },
  { kind: 'moon', label: 'Moon' },
  { kind: 'sparkle', label: 'Star Spark' },
  { kind: 'sparkles', label: 'Sparkles' },
  { kind: 'orbit', label: 'Orbit' },
  { kind: 'infinity', label: 'Infinity Loop' },
  { kind: 'eye', label: 'Inner Eye' },
  { kind: 'flower', label: 'Lotus Bloom' },
  { kind: 'rainbow', label: 'Aura Arc' },
  { kind: 'feather', label: 'Feather' },
  { kind: 'gem', label: 'Crystal' },
  { kind: 'zap', label: 'Energy Spark' },
  { kind: 'wind', label: 'Wind Spirit' },
  { kind: 'halo', label: 'Halo Ring' },
  { kind: 'waves', label: 'Cosmic Wave' },
]

// 15 distinct cosmic/spiritual symbols, one hue each (rotated through
// the same 6-hue palette) = 15 cosmic assets.
function buildCosmicAssets(): readonly GazeAsset[] {
  return COSMIC_SYMBOLS.map((symbol, index) => {
    const hue = BASE_HUES[index % BASE_HUES.length]
    if (hue === undefined) throw new Error('base hue pool unexpectedly empty')
    return {
      id: `cosmic-${symbol.kind}`,
      label: symbol.label,
      category: 'cosmic' as const,
      visualKind: symbol.kind,
      dominantHex: hue.hex,
      dominantColorLabel: capitalize(hue.name),
      complementaryLabel: hue.complementaryLabel,
      complementaryHex: hue.complementaryHex,
    }
  })
}

const SILHOUETTE_FIGURES: readonly { kind: GazeVisualKind; label: string }[] = [
  { kind: 'figure-user', label: 'Portrait Silhouette' },
  { kind: 'figure-user-round', label: 'Rounded Portrait Silhouette' },
  { kind: 'figure-standing', label: 'Standing Figure Silhouette' },
  { kind: 'figure-circle-frame', label: 'Framed Portrait Silhouette' },
  { kind: 'figure-square-frame', label: 'Studio Portrait Silhouette' },
  { kind: 'figure-contact', label: 'Profile Card Silhouette' },
]

// A true photographic negative — the classic high-contrast Trataka
// negative-portrait treatment: a stark, near-pure black or white field
// (never a mid-tone) behind the opposite-color figure. Deliberately not
// pure #000/#fff (a hairline off pure black/white avoids the harshest
// possible clipping while staying visually indistinguishable from true
// black/white). Alternates which polarity a given figure gets, for
// variety across the category.
function buildNegativeAsset(figure: { kind: GazeVisualKind; label: string }, figureIndex: number): GazeAsset {
  const isDarkField = figureIndex % 2 === 0
  return {
    id: `silhouette-${figure.kind}-negative`,
    label: `${figure.label} — Negative Inversion`,
    category: 'silhouette',
    visualKind: figure.kind,
    dominantHex: isDarkField ? '#050505' : '#fafafa',
    dominantColorLabel: isDarkField ? 'Black' : 'White',
    accentHex: isDarkField ? '#ffffff' : '#0a0a0a',
    complementaryLabel: isDarkField ? 'Bright glow' : 'Soft dark echo',
    complementaryHex: isDarkField ? '#ffffff' : '#18181b',
    treatment: 'negative',
  }
}

// 6 generic, anonymous figure glyphs, each with 1 true negative
// (black/white) treatment plus 2 colorful duotone hues = 18 silhouette
// assets total — high-contrast cards (either a bold color field or a
// stark black/white negative, both always paired with a plain white or
// black figure) optimized for vivid afterimages, without depicting any
// real or identifiable person.
function buildSilhouetteAssets(): readonly GazeAsset[] {
  const assets: GazeAsset[] = []
  SILHOUETTE_FIGURES.forEach((figure, figureIndex) => {
    assets.push(buildNegativeAsset(figure, figureIndex))
    for (let variant = 0; variant < 2; variant += 1) {
      const hue = BASE_HUES[(figureIndex * 2 + variant) % BASE_HUES.length]
      if (hue === undefined) throw new Error('base hue pool unexpectedly empty')
      assets.push({
        id: `silhouette-${figure.kind}-${hue.name}`,
        label: `${figure.label} — ${capitalize(hue.name)} Duotone`,
        category: 'silhouette',
        visualKind: figure.kind,
        dominantHex: hue.hex,
        dominantColorLabel: capitalize(hue.name),
        accentHex: '#ffffff',
        complementaryLabel: hue.complementaryLabel,
        complementaryHex: hue.complementaryHex,
        treatment: 'duotone',
      })
    }
  })
  return assets
}

// The full master deck — at least 50 unique items per the brief (18 +
// 15 + 18 = 51), spanning all 3 categories.
export const GAZE_ASSETS: readonly GazeAsset[] = [...buildGeometricAssets(), ...buildCosmicAssets(), ...buildSilhouetteAssets()]

export type GazeRound = {
  asset: GazeAsset
  gazeDurationMs: number
}

// Kept deliberately short (6, not the suite's usual 16) because each
// round's gaze phase alone runs 15-30s; a 16-round version of this
// specific exercise would run 5-10+ minutes, working against the
// serene, unhurried pace the mechanic depends on. The 50+ asset
// expansion widens the POOL each round draws from (so replays across
// many sessions rarely repeat the same asset), not the length of any
// single session.
export const ROUNDS_PER_SESSION = 6

// "e.g., 15 to 30 seconds" per the brief — picked per round from a small
// fixed set (not a single hardcoded value) so back-to-back rounds don't
// feel identically paced.
export const GAZE_DURATION_CHOICES_MS: readonly number[] = [15_000, 20_000, 25_000, 30_000]

// Long enough for a genuine afterimage to be noticed and fade naturally,
// short enough that the session keeps moving.
export const AFTERIMAGE_DURATION_MS = 8_000

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

function pickRandom<T>(values: readonly T[]): T {
  const value = values[Math.floor(Math.random() * values.length)]
  if (value === undefined) throw new Error('cannot pick from an empty pool')
  return value
}

// Builds one session's rounds from whichever deck the learner picked on
// the settings screen: a single category's pool, or the full master
// deck spanning all 3. Every category (and the master deck) comfortably
// exceeds ROUNDS_PER_SESSION, so this project's "fair pool sampling"
// convention holds — every asset in one session is guaranteed distinct,
// never repeated, never left purely to chance which ones appear.
export function buildSessionRounds(categorySelection: GazeCategorySelection = 'master'): readonly GazeRound[] {
  const pool = categorySelection === 'master' ? GAZE_ASSETS : GAZE_ASSETS.filter((asset) => asset.category === categorySelection)
  const shuffledPool = shuffle(pool)
  return shuffledPool.slice(0, ROUNDS_PER_SESSION).map((asset) => ({ asset, gazeDurationMs: pickRandom(GAZE_DURATION_CHOICES_MS) }))
}

// The only honest per-round outcome: what the learner themselves
// reported noticing, never a computed "right answer".
export type RetentionRating = 'clear' | 'faint' | 'none'

export const RETENTION_RATING_LABELS: Record<RetentionRating, string> = {
  clear: 'Yes, clearly',
  faint: 'A faint glimpse',
  none: 'Not really',
}

// Every rating still earns real points — genuine participation and
// attention have value regardless of an individual retina's response,
// so "none" is never scored as a zero/failure.
export const RETENTION_BASE_POINTS: Record<RetentionRating, number> = {
  clear: 100,
  faint: 50,
  none: 10,
}

const STREAK_MULTIPLIER_STEP = 2

export function computeStreakMultiplier(streak: number): number {
  return 1 + Math.floor(streak / STREAK_MULTIPLIER_STEP)
}

export function computePointsForRating(rating: RetentionRating, streakAfterThisRound: number): number {
  return RETENTION_BASE_POINTS[rating] * computeStreakMultiplier(streakAfterThisRound)
}

// The streak tracks sustained attention, not a lucky guess: any
// perceived afterimage (clear OR faint) continues it, and only an
// honestly reported "not really" breaks it.
export function nextStreak(currentStreak: number, rating: RetentionRating): number {
  return rating === 'none' ? 0 : currentStreak + 1
}

// A one-time bonus for reporting "clear" on every single round, added to
// the session's total once at completion.
export const PERFECT_SESSION_BONUS = 300
