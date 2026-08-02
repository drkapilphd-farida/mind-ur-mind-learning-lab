import {
  Star,
  Sparkles,
  Moon,
  Sun,
  Zap,
  Atom,
  CircleDot,
  Hexagon,
  Aperture,
  Compass,
  Gem,
  Snowflake,
  Flame,
  Orbit,
  Eye,
  Infinity as InfinityIcon,
  Feather,
  Cloud,
  Wind,
  type LucideIcon,
} from 'lucide-react'
import type { CosmicIconId, IconClusterPattern } from '../categories/iconClusterCategory'

const COSMIC_ICONS: Record<CosmicIconId, LucideIcon> = {
  star: Star,
  sparkles: Sparkles,
  moon: Moon,
  sun: Sun,
  zap: Zap,
  atom: Atom,
  'circle-dot': CircleDot,
  hexagon: Hexagon,
  aperture: Aperture,
  compass: Compass,
  gem: Gem,
  snowflake: Snowflake,
  flame: Flame,
  orbit: Orbit,
  eye: Eye,
  infinity: InfinityIcon,
  feather: Feather,
  cloud: Cloud,
  wind: Wind,
}

type IconClusterDisplayProps = {
  cluster: IconClusterPattern
  className?: string
}

// Renders a small, deliberately NOT radially-symmetric arrangement of
// cosmic icons — plain absolutely-positioned HTML/CSS (not nested SVG),
// since a cluster's items sit at arbitrary, non-repeating positions
// rather than the mandala category's rotational-symmetry pattern.
export function IconClusterDisplay({ cluster, className }: IconClusterDisplayProps): React.JSX.Element {
  return (
    <div className={`relative ${className ?? ''}`}>
      {cluster.items.map((item, index) => {
        const Icon = COSMIC_ICONS[item.iconId]
        return (
          <div
            key={index}
            className="absolute"
            style={{
              left: `${item.xPercent}%`,
              top: `${item.yPercent}%`,
              transform: `translate(-50%, -50%) rotate(${item.rotationDeg}deg) scale(${item.scale})`,
              color: item.color,
            }}
          >
            <Icon className="size-9 sm:size-11" aria-hidden="true" />
          </div>
        )
      })}
    </div>
  )
}
