import {
  Sun,
  Moon,
  Sparkle,
  Sparkles,
  Orbit,
  Infinity as InfinityIcon,
  Eye,
  Flower2,
  Rainbow,
  Feather,
  Gem,
  Zap,
  Wind,
  Waves,
  User,
  UserRound,
  PersonStanding,
  CircleUserRound,
  SquareUserRound,
  Contact2,
  type LucideIcon,
} from 'lucide-react'
import type { GazeAsset, GazeVisualKind } from '../afterImageGazingDataset'

const COSMIC_ICONS: Partial<Record<GazeVisualKind, LucideIcon>> = {
  sun: Sun,
  moon: Moon,
  sparkle: Sparkle,
  sparkles: Sparkles,
  orbit: Orbit,
  infinity: InfinityIcon,
  eye: Eye,
  flower: Flower2,
  rainbow: Rainbow,
  feather: Feather,
  gem: Gem,
  zap: Zap,
  wind: Wind,
  waves: Waves,
}

// Generic, anonymous person-shaped glyphs only — never a real or
// identifiable individual. This is the deliberate substitute for the
// brief's "Actor/Actress" duotone category.
const SILHOUETTE_ICONS: Partial<Record<GazeVisualKind, LucideIcon>> = {
  'figure-user': User,
  'figure-user-round': UserRound,
  'figure-standing': PersonStanding,
  'figure-circle-frame': CircleUserRound,
  'figure-square-frame': SquareUserRound,
  'figure-contact': Contact2,
}

// clip-path polygons for the shapes plain border-radius can't express;
// circle/square use border-radius instead (no clip-path needed).
function getGeometricStyle(kind: GazeVisualKind, hex: string): React.CSSProperties {
  const base: React.CSSProperties = { backgroundColor: hex }
  if (kind === 'circle') return { ...base, borderRadius: '9999px' }
  if (kind === 'square') return { ...base, borderRadius: '1.5rem' }
  if (kind === 'triangle') return { ...base, clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }
  if (kind === 'hexagon') return { ...base, clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }
  if (kind === 'pentagon') return { ...base, clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }
  if (kind === 'octagon') {
    return { ...base, clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }
  }
  if (kind === 'diamond') return { ...base, clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }
  // star
  return {
    ...base,
    clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
  }
}

// A concentric-ring mandala — entirely inset-positioned within its own
// bounded container, so it can never bleed past the card regardless of
// viewport width.
function MandalaRings({ hex }: { hex: string }): React.JSX.Element {
  return (
    <div className="relative size-36 sm:size-40">
      <div className="absolute inset-0 rounded-full border-[6px]" style={{ borderColor: hex, opacity: 0.9 }} />
      <div className="absolute inset-[16%] rounded-full border-[5px]" style={{ borderColor: hex, opacity: 0.65 }} />
      <div className="absolute inset-[32%] rounded-full border-[4px]" style={{ borderColor: hex, opacity: 0.4 }} />
      <div className="absolute inset-[46%] rounded-full" style={{ backgroundColor: hex }} />
    </div>
  )
}

// A simple glowing ring — the one cosmic symbol (Halo Ring) with no
// matching lucide icon, so it's drawn the same inset-bounded way as the
// mandala rings above.
function HaloRing({ hex }: { hex: string }): React.JSX.Element {
  return (
    <div className="relative size-36 sm:size-40">
      <div className="absolute inset-[10%] rounded-full border-[10px]" style={{ borderColor: hex }} />
    </div>
  )
}

type GazeVisualDisplayProps = {
  asset: GazeAsset
}

// Renders whichever of the 3 categories the current round's asset
// belongs to. Geometric and cosmic both sit on a soft radial glow (the
// same treatment every flash-style exercise in this project uses);
// silhouette duotone cards deliberately do NOT use a glow — a flat,
// solid color field is the whole point of the duotone-poster look, and
// keeps the visual honest about what it's showing (nobody real).
export function GazeVisualDisplay({ asset }: GazeVisualDisplayProps): React.JSX.Element {
  if (asset.category === 'silhouette') {
    const Icon = SILHOUETTE_ICONS[asset.visualKind]
    return (
      <div
        className="flex size-56 items-center justify-center rounded-2xl ring-1 ring-border/50 sm:size-64"
        style={{ backgroundColor: asset.dominantHex }}
      >
        {Icon !== undefined && <Icon className="size-24 sm:size-28" style={{ color: asset.accentHex ?? '#ffffff' }} aria-hidden="true" />}
      </div>
    )
  }

  return (
    <div
      className="relative flex size-56 items-center justify-center sm:size-64"
      style={{ background: `radial-gradient(circle, ${asset.dominantHex}55, transparent 70%)` }}
    >
      {asset.category === 'geometric' &&
        (asset.visualKind === 'mandala-rings' ? (
          <MandalaRings hex={asset.dominantHex} />
        ) : (
          <div className="size-36 sm:size-40" style={getGeometricStyle(asset.visualKind, asset.dominantHex)} />
        ))}

      {asset.category === 'cosmic' &&
        (asset.visualKind === 'halo' ? (
          <HaloRing hex={asset.dominantHex} />
        ) : (
          (() => {
            const Icon = COSMIC_ICONS[asset.visualKind]
            if (Icon === undefined) return null
            return <Icon className="size-24 sm:size-28" style={{ color: asset.dominantHex }} aria-hidden="true" />
          })()
        ))}
    </div>
  )
}
