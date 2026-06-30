import Link from 'next/link'
import { NavLinks } from '@/components/NavLinks'

export function AppSidebar(): React.JSX.Element {
  return (
    <aside className="flex h-full w-60 flex-col border-r bg-card/80">
      <div className="flex h-14 shrink-0 items-center border-b border-border/60 px-4">
        <Link
          href="/dashboard"
          className="text-sm font-semibold tracking-tight text-foreground transition-opacity hover:opacity-70"
        >
          Mind Ur Mind Learning Lab™
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto py-3">
        <NavLinks />
      </div>
    </aside>
  )
}
