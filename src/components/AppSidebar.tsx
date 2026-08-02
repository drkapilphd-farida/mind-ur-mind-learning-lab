import Link from 'next/link'
import { NavLinks } from '@/components/NavLinks'
import { LivingBrainLogo } from '@/components/brand/LivingBrainLogo'

export function AppSidebar(): React.JSX.Element {
  return (
    <aside className="flex h-full w-60 flex-col border-r bg-card/80">
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border/60 px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground transition-opacity hover:opacity-70"
        >
          <LivingBrainLogo size={24} decorative={false} animated={false} />
          Mind Ur Mind
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto py-3">
        <NavLinks />
      </div>
    </aside>
  )
}
