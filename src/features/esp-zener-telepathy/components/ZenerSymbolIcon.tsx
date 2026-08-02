'use client'

import { Circle, Plus, Waves, Square, Star, type LucideIcon } from 'lucide-react'
import type { ZenerSymbolId } from '../espZenerDataset'

const ZENER_ICONS: Record<ZenerSymbolId, LucideIcon> = {
  circle: Circle,
  cross: Plus,
  waves: Waves,
  square: Square,
  star: Star,
}

type ZenerSymbolIconProps = {
  symbolId: ZenerSymbolId
  className?: string
}

export function ZenerSymbolIcon({ symbolId, className }: ZenerSymbolIconProps): React.JSX.Element {
  const Icon = ZENER_ICONS[symbolId]
  return <Icon className={className} strokeWidth={2.25} aria-hidden="true" />
}
