'use client'

import { useState } from 'react'
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
              Mind Ur Mind
            </SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <NavLinks onSelect={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex-1" />

      <InstallButton />
      <ThemeToggle />
      <UserMenu fullName={fullName} avatarUrl={avatarUrl} email={email} />
    </header>
  )
}
