import Link from 'next/link'
import { NavLinks } from '@/components/NavLinks'
import { LivingBrainLogo } from '@/components/brand/LivingBrainLogo'
import { interpolateHexColor } from '@/lib/color/interpolateHex'

const BRAND_A = '#2b4ce8'
const BRAND_B = '#0fd9a0'
const WARNING_RED = '#ef4444'

// Brand Logo Warmth™ — missedDays reaches full warning intensity by 5
// consecutive missed days; a cap, not a hard wall, so the effect reads as
// "increasingly urgent" rather than snapping straight to alarming after a
// single missed day. --missed-intensity caps at 0.8 (see globals.css) so
// the brand mark is never fully replaced by red.
const MAX_WARNING_MISSED_DAYS = 5

type AppSidebarProps = {
  missedDays: number
}

export function AppSidebar({ missedDays }: AppSidebarProps): React.JSX.Element {
  const intensity = Math.min(missedDays / MAX_WARNING_MISSED_DAYS, 1)
  const glowA = interpolateHexColor(BRAND_A, WARNING_RED, intensity)
  const glowB = interpolateHexColor(BRAND_B, WARNING_RED, intensity)

  return (
    <aside className="flex h-full w-60 flex-col border-r bg-card/80">
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-border/60 px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 text-sm font-semibold tracking-tight text-foreground transition-opacity hover:opacity-70"
        >
          <span
            className="brand-logo-wrap"
            style={
              {
                '--missed-intensity': intensity * 0.8,
                '--logo-glow-a': `${glowA}aa`,
                '--logo-glow-b': `${glowB}88`,
              } as React.CSSProperties
            }
          >
            <LivingBrainLogo size={24} decorative={false} animated={false} />
            <span className="brand-logo-warmth" aria-hidden="true" />
          </span>
          <span className="brand-gradient-text">Mind Ur Mind</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto py-3">
        <NavLinks />
      </div>
    </aside>
  )
}
