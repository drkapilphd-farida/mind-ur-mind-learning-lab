import { redirect } from 'next/navigation'
import { Playfair_Display, Inter } from 'next/font/google'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserProfile } from '@/lib/supabase/getCurrentUserProfile'
import { getSchoolForUser } from '@/features/school-dashboard/queries/getSchoolForUser'
import { AppShell } from '@/components/shell/AppShell'
import { SCHOOL_ADMIN_NAV_ITEMS } from './navConfig'

// School Corporate™ Design Tokens — Playfair Display (headings) + Inter
// (UI text), scoped to this route group only via CSS variables, exactly
// the technique (dashboard)/layout.tsx already uses for Plus Jakarta
// Sans/Inter. .school-corporate (globals.css) reads these vars; every
// other route keeps the app's default Geist font and neutral palette.
const playfairDisplay = Playfair_Display({ variable: '--font-playfair', subsets: ['latin'] })
const interCorporate = Inter({ variable: '--font-inter-corporate', subsets: ['latin'] })

export default async function SchoolAdminLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const membership = await getSchoolForUser()

  // Students use the existing, unmodified consumer dashboard — this
  // admin/teacher shell is only for school_admin/teacher roles. No
  // membership at all means this user isn't part of any school. A
  // franchise partner has their own portal (/partner-admin) — each
  // portal URL strictly serves its own tenant type, even though the
  // underlying data/components are shared (see TenantHomeContent.tsx).
  if (membership === null || membership.member.role === 'student') {
    redirect('/dashboard')
  }
  if (membership.school.type === 'franchise_partner') {
    redirect('/partner-admin')
  }

  const profile = await getCurrentUserProfile(user.id)

  return (
    <div className={`school-corporate ${playfairDisplay.variable} ${interCorporate.variable}`}>
      <AppShell
        brandLabel={membership.school.name}
        brandLogoUrl={membership.school.logoUrl}
        brandHref="/school-admin"
        navItems={SCHOOL_ADMIN_NAV_ITEMS}
        fullName={profile?.fullName ?? null}
        avatarUrl={profile?.avatarUrl ?? null}
        email={user.email ?? ''}
        contentMaxWidth="wide"
      >
        {children}
      </AppShell>
    </div>
  )
}
