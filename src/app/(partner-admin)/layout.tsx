import { redirect } from 'next/navigation'
import { Playfair_Display, Inter } from 'next/font/google'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserProfile } from '@/lib/supabase/getCurrentUserProfile'
import { getSchoolForUser } from '@/features/school-dashboard/queries/getSchoolForUser'
import { AppShell } from '@/components/shell/AppShell'
import { PARTNER_ADMIN_NAV_ITEMS } from './navConfig'

// Same School Corporate™ theme/font scoping as (school-admin)/layout.tsx
// — a franchise partner's chrome isn't visually distinct from a school's
// (only their own logo/name differ, injected via AppShell's
// brandLogoUrl/brandLabel props below); see .school-corporate in
// globals.css.
const playfairDisplay = Playfair_Display({ variable: '--font-playfair', subsets: ['latin'] })
const interCorporate = Inter({ variable: '--font-inter-corporate', subsets: ['latin'] })

export default async function PartnerAdminLayout({
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

  // Students use the existing, unmodified consumer dashboard. A school's
  // own admin/teacher has their own portal (/school-admin) — each portal
  // URL strictly serves its own tenant type.
  if (membership === null || membership.member.role === 'student') {
    redirect('/dashboard')
  }
  if (membership.school.type === 'school') {
    redirect('/school-admin')
  }

  const profile = await getCurrentUserProfile(user.id)

  return (
    <div className={`school-corporate ${playfairDisplay.variable} ${interCorporate.variable}`}>
      <AppShell
        brandLabel={membership.school.name}
        brandLogoUrl={membership.school.logoUrl}
        brandHref="/partner-admin"
        navItems={PARTNER_ADMIN_NAV_ITEMS}
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
