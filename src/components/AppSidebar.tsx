import Link from 'next/link'
import { NavLinks } from '@/components/NavLinks'

export function AppSidebar(): React.JSX.Element {
  return (
    <aside className="bg-card flex h-full w-60 flex-col border-r">
      <div className="flex h-14 shrink-0 items-center border-b px-4">
        <Link
          href="/dashboard"
          className="text-sm font-semibold tracking-tight"
        >
          Mind Ur Mind Learning Lab™
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <NavLinks />
      </div>
    </aside>
  )
}
