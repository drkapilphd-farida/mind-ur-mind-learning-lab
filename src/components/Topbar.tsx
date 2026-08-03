'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { NavLinks } from '@/components/NavLinks'
import { UserMenu } from '@/components/UserMenu'
import { LivingBrainLogo } from '@/components/brand/LivingBrainLogo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { InstallButton } from '@/components/InstallButton'

type TopbarProps = {
  fullName: string | null
  avatarUrl: string | null
  email: string
}

export function Topbar({
  fullName,
  avatarUrl,
  email,
}: TopbarProps): React.JSX.Element {
  const [open, setOpen] = useState(false)

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

        <SheetContent side="left" className="w-60 p-0" showCloseButton={false}>
          <SheetHeader className="flex h-14 shrink-0 flex-row items-center gap-2 border-b px-4 py-0 space-y-0">
            <LivingBrainLogo size={22} decorative={false} animated={false} />
            <SheetTitle className="text-sm font-semibold tracking-tight">
              Quantum Mind
            </SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <NavLinks onSelect={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Branding Header™ — always visible on mobile (desktop already has
          the persistent AppSidebar wordmark, so this stays md:hidden to
          avoid showing the logo twice). Same brand-logo-wrap/brand-
          gradient-text technique as AppSidebar.tsx and the Document
          Detail page header — the CSS's own fallback values mean the
          breathing glow renders correctly here too, with no missedDays
          prop needed. */}
      <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
        <span className="brand-logo-wrap">
          <LivingBrainLogo size={22} decorative={false} animated={false} />
          <span className="brand-logo-warmth" aria-hidden="true" />
        </span>
        <span className="brand-gradient-text text-sm font-bold tracking-tight">Quantum Mind</span>
      </Link>

      <div className="flex-1" />

      <ThemeToggle />
      <InstallButton />
      <UserMenu fullName={fullName} avatarUrl={avatarUrl} email={email} />
    </header>
  )
}
