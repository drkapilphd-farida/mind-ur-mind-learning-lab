'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { NavLinks } from '@/components/NavLinks'
import { UserMenu } from '@/components/UserMenu'
import { MobileSignOutButton } from '@/components/MobileSignOutButton'
import { LivingBrainLogo } from '@/components/brand/LivingBrainLogo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { InstallButton } from '@/components/InstallButton'
import { interpolateHexColor } from '@/lib/color/interpolateHex'
import type { AppDomain } from '@/lib/domains/appDomain'
import { getDomainTagline } from '@/lib/domains/domainTagline'

const BRAND_A = '#2b4ce8'
const BRAND_B = '#0fd9a0'
const WARNING_RED = '#ef4444'

type TopbarProps = {
  fullName: string | null
  avatarUrl: string | null
  email: string
  // Brand Logo Warmth™ — real, 0–1, computed once in (dashboard)/layout.tsx
  // via computeStreakWarmthIntensity — see AppSidebar.tsx's identical
  // prop. Mobile users only ever see this header (AppSidebar is
  // `hidden md:flex`), so without this the streak-urgency tint never
  // shows on mobile regardless of actual streak state.
  warmthIntensity: number
  // School Dashboard white-labeling — see AppSidebar.tsx's identical props.
  brandName?: string | null
  brandLogoUrl?: string | null
  // Domain Split™ — see AppSidebar.tsx's identical prop.
  appDomain: AppDomain
}

export function Topbar({
  fullName,
  avatarUrl,
  email,
  warmthIntensity,
  brandName = null,
  brandLogoUrl = null,
  appDomain,
}: TopbarProps): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const glowA = interpolateHexColor(BRAND_A, WARNING_RED, warmthIntensity)
  const glowB = interpolateHexColor(BRAND_B, WARNING_RED, warmthIntensity)

  return (
    <header className="bg-background flex h-14 shrink-0 items-center gap-4 border-b px-4 lg:px-6">
      {/* Mobile hamburger */}
      <Sheet open={open} onOpenChange={setOpen}>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="size-5" />
        </Button>

        <SheetContent side="left" className="w-60 gap-0 p-0" showCloseButton={false}>
          <SheetHeader className="flex h-14 shrink-0 flex-row items-center gap-2 border-b px-4 py-0 space-y-0">
            {brandLogoUrl !== null ? (
              <Image src={brandLogoUrl} alt="" width={22} height={22} className="size-[22px] rounded object-contain" unoptimized />
            ) : (
              <LivingBrainLogo size={22} decorative={false} animated={false} />
            )}
            <SheetTitle className="text-sm font-semibold tracking-tight">
              {brandName ?? 'Quantum Mind'}
            </SheetTitle>
          </SheetHeader>
          {/* Consistent Branding™ — see AppSidebar.tsx's identical row. */}
          <p className="border-b border-border/60 px-4 py-2 text-[11px] font-medium text-muted-foreground">{getDomainTagline(appDomain)}</p>
          <div className="flex-1 overflow-y-auto py-4">
            <NavLinks onSelect={() => setOpen(false)} appDomain={appDomain} />
          </div>
          <SheetFooter className="border-t border-border/60 p-2">
            <MobileSignOutButton />
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Branding Header™ — always visible on mobile (desktop already has
          the persistent AppSidebar wordmark, so this stays md:hidden to
          avoid showing the logo twice). Same brand-logo-wrap/brand-
          gradient-text/Brand Logo Warmth™ technique as AppSidebar.tsx,
          driven by the same real warmthIntensity prop — mobile users only
          ever see this header, so this is the surface where the
          streak-urgency tint actually matters most. Sized at 36px (w-9) —
          real Android device testing found the previous 22px mark read as
          barely-there next to the hamburger icon and the header's other
          36-40px touch targets. */}
      <Link href="/dashboard" className="flex shrink-0 items-center gap-2 md:hidden">
        {brandLogoUrl !== null ? (
          <Image src={brandLogoUrl} alt="" width={36} height={36} className="size-9 shrink-0 rounded object-contain" unoptimized />
        ) : (
          <span
            className="brand-logo-wrap shrink-0"
            style={
              {
                '--missed-intensity': warmthIntensity * 0.8,
                '--logo-glow-a': `${glowA}aa`,
                '--logo-glow-b': `${glowB}88`,
              } as React.CSSProperties
            }
          >
            <LivingBrainLogo size={36} className="size-9" decorative={false} animated={false} />
            <span className="brand-logo-warmth" aria-hidden="true" />
          </span>
        )}
        <span className="brand-gradient-text text-base font-bold tracking-tight">{brandName ?? 'Quantum Mind'}</span>
      </Link>

      <div className="flex-1" />

      <ThemeToggle />
      <InstallButton />
      {/* Global Account Dropdown™ (Phase 4) — desktop now shows the fuller
          row-style trigger at the bottom of AppSidebar instead; this
          compact trigger stays for mobile only, which has no persistent
          sidebar to anchor that row to. */}
      <div className="md:hidden">
        <UserMenu fullName={fullName} avatarUrl={avatarUrl} email={email} />
      </div>
    </header>
  )
}
