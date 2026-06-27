import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppSidebar } from '@/components/AppSidebar'
import { Topbar } from '@/components/Topbar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <div className="bg-muted/30 flex h-screen overflow-hidden">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:flex">
        <AppSidebar />
      </div>

      {/* Main column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          fullName={profile?.full_name ?? null}
          avatarUrl={profile?.avatar_url ?? null}
          email={user.email ?? ''}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
