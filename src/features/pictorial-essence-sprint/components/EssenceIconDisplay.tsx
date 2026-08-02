import {
  Waves,
  Droplets,
  Droplet,
  Sailboat,
  CloudRain,
  Umbrella,
  Fish,
  Ship,
  Sparkles,
  Orbit,
  Rocket,
  Star,
  Moon,
  Globe,
  Satellite,
  Telescope,
  Mountain,
  MountainSnow,
  Layers,
  Gem,
  Snowflake,
  Pickaxe,
  Landmark,
  Map,
  Flame,
  Zap,
  Radiation,
  Sunrise,
  Sun,
  Thermometer,
  Flashlight,
  CookingPot,
  CloudLightning,
  Wind,
  Tornado,
  Rainbow,
  CloudFog,
  CloudDrizzle,
  Cloudy,
  CloudSun,
  TreePine,
  Trees,
  Leaf,
  Flower2,
  Wheat,
  Sprout,
  Palmtree,
  Clover,
  Infinity as InfinityIcon,
  Scale,
  Shuffle,
  Blend,
  RefreshCw,
  CircleOff,
  Boxes,
  Puzzle,
  Crown,
  Key,
  Shield,
  Trophy,
  Flag,
  Bell,
  ScrollText,
  Waypoints,
  type LucideIcon,
} from 'lucide-react'
import type { EssenceIconId } from '../pictorialEssenceSprintDataset'

const ESSENCE_ICONS: Record<EssenceIconId, LucideIcon> = {
  waves: Waves,
  droplets: Droplets,
  droplet: Droplet,
  sailboat: Sailboat,
  'cloud-rain': CloudRain,
  umbrella: Umbrella,
  fish: Fish,
  ship: Ship,
  sparkles: Sparkles,
  orbit: Orbit,
  rocket: Rocket,
  star: Star,
  moon: Moon,
  globe: Globe,
  satellite: Satellite,
  telescope: Telescope,
  mountain: Mountain,
  'mountain-snow': MountainSnow,
  layers: Layers,
  gem: Gem,
  snowflake: Snowflake,
  pickaxe: Pickaxe,
  landmark: Landmark,
  map: Map,
  flame: Flame,
  zap: Zap,
  radiation: Radiation,
  sunrise: Sunrise,
  sun: Sun,
  thermometer: Thermometer,
  flashlight: Flashlight,
  'cooking-pot': CookingPot,
  'cloud-lightning': CloudLightning,
  wind: Wind,
  tornado: Tornado,
  rainbow: Rainbow,
  'cloud-fog': CloudFog,
  'cloud-drizzle': CloudDrizzle,
  cloudy: Cloudy,
  'cloud-sun': CloudSun,
  'tree-pine': TreePine,
  trees: Trees,
  leaf: Leaf,
  flower: Flower2,
  wheat: Wheat,
  sprout: Sprout,
  palmtree: Palmtree,
  clover: Clover,
  infinity: InfinityIcon,
  scale: Scale,
  shuffle: Shuffle,
  blend: Blend,
  'refresh-cw': RefreshCw,
  'circle-off': CircleOff,
  boxes: Boxes,
  puzzle: Puzzle,
  crown: Crown,
  key: Key,
  shield: Shield,
  trophy: Trophy,
  flag: Flag,
  bell: Bell,
  'scroll-text': ScrollText,
  waypoints: Waypoints,
}

type EssenceIconDisplayProps = {
  iconId: EssenceIconId
  color: string
  rotationDeg?: number
  scale?: number
  size?: 'large' | 'small'
  className?: string
}

// The flash-phase display for a themed essence: a soft radial glow in
// the theme's own color behind a large, high-impact icon — deliberately
// NO text label, since the whole point is testing whether the learner
// can retain the EXACT rendering. `rotationDeg`/`scale` are Arcade Hard
// Mode's own addition: the 4 recall options render this exact same
// component with the SAME iconId, differing only by these two transform
// props (plus `color`) — one option always renders untouched
// (rotationDeg=0, scale=1, the theme's true color), the other three
// carry a single subtle tweak (see buildEssenceOptions).
export function EssenceIconDisplay({
  iconId,
  color,
  rotationDeg = 0,
  scale = 1,
  size = 'large',
  className,
}: EssenceIconDisplayProps): React.JSX.Element {
  const Icon = ESSENCE_ICONS[iconId]
  const isLarge = size === 'large'

  return (
    <div
      className={`relative flex items-center justify-center rounded-full ${isLarge ? 'size-48 sm:size-56' : 'size-14 sm:size-16'} ${className ?? ''}`}
      style={{ background: `radial-gradient(circle, ${color}33, transparent 70%)` }}
    >
      <Icon
        className={isLarge ? 'size-20 sm:size-24' : 'size-7 sm:size-8'}
        style={{ color, transform: `rotate(${rotationDeg}deg) scale(${scale})` }}
        aria-hidden="true"
      />
    </div>
  )
}
