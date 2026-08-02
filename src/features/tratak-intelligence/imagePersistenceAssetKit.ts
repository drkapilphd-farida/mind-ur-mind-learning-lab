// Image Persistence™ — Premium Asset Kit (Sprint 53). An OFFLINE asset-
// generation kit — pure functions and design data only, never imported by
// any runtime UI component. Consumed solely by
// scripts/image-persistence/generateAssets.mts (which writes the actual SVG
// files into public/assets/image-persistence/) and this file's own test,
// which proves the inversion math is exact. Mirrors this feature's existing
// convention of colocating dev-only tooling inside the feature folder (see
// devImagePersistenceTools.ts) rather than a separate top-level package.
//
// Honesty note (carried forward from imagePersistencePool.ts's own
// disclosure): this repo has no image-generation model, so the "human
// faces" produced here are upgraded abstract/geometric face-motif art, the
// same honest category as the 2 legacy images they replace — not
// photorealistic portraits. See docs/IMAGE_PERSISTENCE_ASSET_PIPELINE.md
// for the real-asset pipeline this kit's output is a placeholder for.
//
// Every design below uses ONLY flat, fully-opaque fills (fillOpacity
// defaults to 1, never partial) and a solid background rect — no strokes,
// no gradients, no transparency. That constraint is deliberate: it makes
// "inverted" a true, exact, per-pixel negative (each channel replaced by
// 255-minus-itself) rather than an approximation, since there is no alpha
// blending to account for.

export function invertHexColor(hex: string): string {
  const match = /^#([0-9a-fA-F]{6})$/.exec(hex)
  if (match === null) throw new Error(`invertHexColor: "${hex}" is not a #rrggbb hex color.`)
  const value = match[1] as string
  const channel = (offset: number): string => (255 - parseInt(value.slice(offset, offset + 2), 16)).toString(16).padStart(2, '0')
  return `#${channel(0)}${channel(2)}${channel(4)}`
}

type ColorMapper = (hex: string) => string

function colorMapperFor(invert: boolean): ColorMapper {
  return invert ? invertHexColor : (hex: string) => hex
}

const VIEW_BOX_SIZE = 800
const CENTER = VIEW_BOX_SIZE / 2

// ---------------------------------------------------------------------------
// Mandalas — extends MandalaIllustration.tsx's parametric concentric-layer
// technique (that component itself is untouched; this is a separate, new
// set of designs for Image Persistence's own pool) with more layers, richer
// colour, and an inner rotated star core for genuine sacred-geometry
// complexity ("suitable for Tratak... rich symmetry... highly detailed").

export type MandalaPetalLayer = { count: number; radius: number; rx: number; ry: number; color: string }
export type MandalaStarCore = { points: number; outerRadius: number; innerRadius: number; color: string }

export type MandalaDesign = {
  id: string
  alt: string
  backgroundColor: string
  layers: readonly MandalaPetalLayer[]
  core: MandalaStarCore
}

export const MANDALA_DESIGNS: readonly MandalaDesign[] = [
  {
    id: 'mandala-01',
    alt: 'A complex 6-ring multicolour sacred-geometry mandala with an 8-point star core',
    backgroundColor: '#111827',
    layers: [
      { count: 24, radius: 340, rx: 40, ry: 14, color: '#f97316' },
      { count: 20, radius: 290, rx: 36, ry: 13, color: '#ec4899' },
      { count: 16, radius: 240, rx: 32, ry: 12, color: '#8b5cf6' },
      { count: 12, radius: 190, rx: 28, ry: 11, color: '#06b6d4' },
      { count: 10, radius: 140, rx: 22, ry: 9, color: '#facc15' },
      { count: 8, radius: 95, rx: 18, ry: 8, color: '#10b981' },
    ],
    core: { points: 8, outerRadius: 55, innerRadius: 25, color: '#ef4444' },
  },
  {
    id: 'mandala-02',
    alt: 'A complex 6-ring multicolour sacred-geometry mandala with a 6-point star core',
    backgroundColor: '#1e1b4b',
    layers: [
      { count: 20, radius: 330, rx: 38, ry: 14, color: '#14b8a6' },
      { count: 18, radius: 280, rx: 34, ry: 13, color: '#f43f5e' },
      { count: 14, radius: 230, rx: 30, ry: 12, color: '#eab308' },
      { count: 12, radius: 180, rx: 26, ry: 10, color: '#3b82f6' },
      { count: 8, radius: 130, rx: 20, ry: 9, color: '#a855f7' },
      { count: 6, radius: 85, rx: 16, ry: 7, color: '#22c55e' },
    ],
    core: { points: 6, outerRadius: 50, innerRadius: 22, color: '#f97316' },
  },
  {
    id: 'mandala-03',
    alt: 'A complex 6-ring multicolour sacred-geometry mandala with a 10-point star core',
    backgroundColor: '#0c0a1a',
    layers: [
      { count: 28, radius: 350, rx: 42, ry: 15, color: '#06b6d4' },
      { count: 22, radius: 300, rx: 36, ry: 13, color: '#d946ef' },
      { count: 18, radius: 250, rx: 32, ry: 12, color: '#f59e0b' },
      { count: 14, radius: 200, rx: 28, ry: 11, color: '#22d3ee' },
      { count: 10, radius: 150, rx: 24, ry: 10, color: '#fb7185' },
      { count: 8, radius: 100, rx: 20, ry: 9, color: '#84cc16' },
    ],
    core: { points: 10, outerRadius: 58, innerRadius: 26, color: '#8b5cf6' },
  },
]

function starPoints(cx: number, cy: number, points: number, outerRadius: number, innerRadius: number): string {
  const step = Math.PI / points
  const coords: string[] = []
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const angle = i * step - Math.PI / 2
    coords.push(`${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`)
  }
  return coords.join(' ')
}

export function buildMandalaSvg(design: MandalaDesign, invert: boolean): string {
  const color = colorMapperFor(invert)
  const petals = design.layers
    .map((layer) => {
      const angleStep = 360 / layer.count
      return Array.from({ length: layer.count }, (_, index) => {
        const angle = angleStep * index
        return `<ellipse cx="${CENTER}" cy="${CENTER - layer.radius}" rx="${layer.rx}" ry="${layer.ry}" fill="${color(layer.color)}" transform="rotate(${angle} ${CENTER} ${CENTER})" />`
      }).join('\n    ')
    })
    .join('\n    ')
  const core = `<polygon points="${starPoints(CENTER, CENTER, design.core.points, design.core.outerRadius, design.core.innerRadius)}" fill="${color(design.core.color)}" />`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW_BOX_SIZE} ${VIEW_BOX_SIZE}" role="img" aria-label="${design.alt}">
    <rect width="${VIEW_BOX_SIZE}" height="${VIEW_BOX_SIZE}" fill="${color(design.backgroundColor)}" />
    ${petals}
    ${core}
  </svg>
`
}

// ---------------------------------------------------------------------------
// Human-face motifs — abstract geometric art (see honesty note above), built
// from concentric "halo" disks layered back-to-front (largest first) behind
// a centred head silhouette with geometric eye/brow/nose/mouth marks.
// Deliberately non-skin-tone abstract colour palettes throughout, matching
// this codebase's existing convention for this exact honest limitation.

export type HaloRing = { radius: number; color: string }

export type FaceMotifDesign = {
  id: string
  alt: string
  backgroundColor: string
  haloRings: readonly HaloRing[]
  headColor: string
  markColor: string
  noseColor: string
}

export const FACE_MOTIF_DESIGNS: readonly FaceMotifDesign[] = [
  {
    id: 'human-face-01',
    alt: 'An abstract geometric face motif in warm amber tones, with three halo rings',
    backgroundColor: '#fafaf9',
    haloRings: [
      { radius: 260, color: '#fde68a' },
      { radius: 210, color: '#fbbf24' },
      { radius: 160, color: '#f59e0b' },
    ],
    headColor: '#c2703d',
    markColor: '#1c1917',
    noseColor: '#a85a34',
  },
  {
    id: 'human-face-02',
    alt: 'An abstract geometric face motif in cool sky-blue tones, with four halo rings',
    backgroundColor: '#f8fafc',
    haloRings: [
      { radius: 270, color: '#bae6fd' },
      { radius: 225, color: '#7dd3fc' },
      { radius: 180, color: '#38bdf8' },
      { radius: 135, color: '#0284c7' },
    ],
    headColor: '#475569',
    markColor: '#0f172a',
    noseColor: '#334155',
  },
  {
    id: 'human-face-03',
    alt: 'An abstract geometric face motif in rose-violet tones, with three halo rings',
    backgroundColor: '#fdf4ff',
    haloRings: [
      { radius: 255, color: '#fbcfe8' },
      { radius: 200, color: '#f472b6' },
      { radius: 145, color: '#db2777' },
    ],
    headColor: '#6d28d9',
    markColor: '#1e1b4b',
    noseColor: '#5b21b6',
  },
  {
    id: 'human-face-04',
    alt: 'An abstract geometric face motif in emerald-green tones, with four halo rings',
    backgroundColor: '#f0fdf4',
    haloRings: [
      { radius: 265, color: '#bbf7d0' },
      { radius: 220, color: '#86efac' },
      { radius: 175, color: '#4ade80' },
      { radius: 130, color: '#16a34a' },
    ],
    headColor: '#134e4a',
    markColor: '#052e16',
    noseColor: '#115e59',
  },
]

export function buildFaceMotifSvg(design: FaceMotifDesign, invert: boolean): string {
  const color = colorMapperFor(invert)
  const halos = [...design.haloRings]
    .sort((a, b) => b.radius - a.radius)
    .map((ring) => `<circle cx="${CENTER}" cy="${CENTER}" r="${ring.radius}" fill="${color(ring.color)}" />`)
    .join('\n    ')

  const headRx = 140
  const headRy = 170
  const headCy = CENTER + 20
  const eyeOffsetX = 50
  const eyeCy = headCy - 20

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW_BOX_SIZE} ${VIEW_BOX_SIZE}" role="img" aria-label="${design.alt}">
    <rect width="${VIEW_BOX_SIZE}" height="${VIEW_BOX_SIZE}" fill="${color(design.backgroundColor)}" />
    ${halos}
    <ellipse cx="${CENTER}" cy="${headCy}" rx="${headRx}" ry="${headRy}" fill="${color(design.headColor)}" />
    <ellipse cx="${CENTER - eyeOffsetX}" cy="${eyeCy}" rx="22" ry="12" fill="${color(design.markColor)}" />
    <ellipse cx="${CENTER + eyeOffsetX}" cy="${eyeCy}" rx="22" ry="12" fill="${color(design.markColor)}" />
    <rect x="${CENTER - eyeOffsetX - 22}" y="${eyeCy - 34}" width="24" height="8" fill="${color(design.markColor)}" />
    <rect x="${CENTER + eyeOffsetX - 2}" y="${eyeCy - 34}" width="24" height="8" fill="${color(design.markColor)}" />
    <polygon points="${CENTER - 10},${eyeCy + 40} ${CENTER + 10},${eyeCy + 40} ${CENTER},${eyeCy + 65}" fill="${color(design.noseColor)}" />
    <rect x="${CENTER - 32}" y="${eyeCy + 90}" width="64" height="10" rx="5" fill="${color(design.markColor)}" />
  </svg>
`
}
