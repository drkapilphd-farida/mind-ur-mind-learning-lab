import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BookOpen, LayoutDashboard, ListOrdered } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const adminEmails =
    process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim()) ?? []
  if (!adminEmails.includes(user.email ?? '')) redirect('/dashboard')

  return (
    <div className="flex min-h-screen">
      {/* Admin sidebar */}
      <aside className="bg-card flex w-56 shrink-0 flex-col border-r">
        <div className="flex h-14 items-center border-b px-4">
          <span className="text-sm font-semibold">Admin Panel</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <Link
            href="/admin"
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          >
            <LayoutDashboard className="size-4" />
            Overview
          </Link>
          <Link
            href="/admin/courses"
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          >
            <BookOpen className="size-4" />
            Courses
          </Link>
        </nav>
        <div className="border-t p-4">
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-xs transition-colors"
          >
            <ListOrdered className="size-3.5" />
            Back to app
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  )
}
