import {
  Atom,
  Book,
  Brain,
  Building,
  Calculator,
  Camera,
  Clock,
  Code,
  Compass,
  Cpu,
  Database,
  Flag,
  FlaskConical,
  Gem,
  Globe,
  Heart,
  Key,
  Layers,
  Leaf,
  Lightbulb,
  Lock,
  Map,
  Moon,
  Music,
  Palette,
  Puzzle,
  Rocket,
  Scale,
  Shield,
  Star,
  Sun,
  Tag,
  Target,
  TreePine,
  Trophy,
  Users,
  Waves,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react'

// Keyword icon whitelist — the model chooses a name per keyword (see
// quantumDocumentIntelligenceTool.ts's icon enum, which is generated
// from this same map so the two can never drift apart), but the name is
// only ever used to look up a real component here, never passed to a
// dynamic import or rendered as-is. A name outside this list (a
// hallucination, or an old cached/stored row from before this list
// changed) safely falls back to Tag rather than breaking the tab.
export const KEYWORD_ICON_MAP: Record<string, LucideIcon> = {
  brain: Brain,
  shield: Shield,
  zap: Zap,
  book: Book,
  layers: Layers,
  target: Target,
  compass: Compass,
  cpu: Cpu,
  atom: Atom,
  flask: FlaskConical,
  calculator: Calculator,
  globe: Globe,
  heart: Heart,
  lightbulb: Lightbulb,
  map: Map,
  scale: Scale,
  clock: Clock,
  users: Users,
  trophy: Trophy,
  puzzle: Puzzle,
  key: Key,
  lock: Lock,
  star: Star,
  flag: Flag,
  gem: Gem,
  rocket: Rocket,
  tree: TreePine,
  wrench: Wrench,
  database: Database,
  tag: Tag,
  palette: Palette,
  music: Music,
  camera: Camera,
  code: Code,
  building: Building,
  leaf: Leaf,
  sun: Sun,
  moon: Moon,
  waves: Waves,
}

export const KEYWORD_ICON_NAMES: readonly string[] = Object.keys(KEYWORD_ICON_MAP)

const DEFAULT_KEYWORD_ICON: LucideIcon = Tag

export function resolveKeywordIcon(iconName: string | null | undefined): LucideIcon {
  if (iconName === null || iconName === undefined) return DEFAULT_KEYWORD_ICON
  return KEYWORD_ICON_MAP[iconName.toLowerCase().trim()] ?? DEFAULT_KEYWORD_ICON
}
