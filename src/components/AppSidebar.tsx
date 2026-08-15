import Link from 'next/link'
import Image from 'next/image'
import { NavLinks } from '@/components/NavLinks'
import { LivingBrainLogo } from '@/components/brand/LivingBrainLogo'
import { interpolateHexColor } from '@/lib/color/interpolateHex'

const BRAND_A = '#2b4ce8'
const BRAND_B = '#0fd9a0'
const WARNING_RED = '#ef4444'

type AppSidebarProps = {
  // Brand Logo Warmth™ — real, 0–1, computed once in (dashboard)/layout.tsx
  // via computeStreakWarmthIntensity so this and Topbar.tsx can never
  // silently disagree on what counts as "urgent." --missed-intensity caps
  // at 0.8 (see globals.css) so the brand mark is never fully replaced by
  // red.
  warmthIntensity: number
  // School Dashboard white-labeling — set only for a student who belongs
  // to a school/franchise partner that has uploaded a logo; falls back
  // to the default Quantum Mind mark otherwise (the vast majority of
  // users, who aren't part of any tenant).
  brandName?: string | null
  brandLogoUrl?: string | null
}

export function AppSidebar({ warmthIntensity, brandName = null, brandLogoUrl = null }: AppSidebarProps): React.JSX.Element {
  const glowA = interpolateHexColor(BRAND_A, WARNING_RED, warmthIntensity)
  const glowB = interpolateHexColor(BRAND_B, WARNING_RED, warmthIntensity)

  return (
    <aside className="flex h-full w-60 flex-col border-r bg-card/80">
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-border/60 px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 text-sm font-semibold tracking-tight text-foreground transition-opacity hover:opacity-70"
        >
          {brandLogoUrl !== null ? (
            <Image src={brandLogoUrl} alt="" width={24} height={24} className="size-6 shrink-0 rounded object-contain" unoptimized />
          ) : (
            <span
              className="brand-logo-wrap"
              style={
                {
                  '--missed-intensity': warmthIntensity * 0.8,
                  '--logo-glow-a': `${glowA}aa`,
                  '--logo-glow-b': `${glowB}88`,
                } as React.CSSProperties
              }
            >
              <LivingBrainLogo size={24} decorative={false} animated={false} />
              <span className="brand-logo-warmth" aria-hidden="true" />
            </span>
          )}
          <span className="brand-gradient-text">{brandName ?? 'Quantum Mind'}</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto py-3">
        <NavLinks />
      </div>
    </aside>
  )
}
