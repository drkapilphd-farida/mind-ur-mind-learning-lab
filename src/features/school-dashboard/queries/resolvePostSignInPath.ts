import { createClient } from '@/lib/supabase/server'
import { getSchoolForUser } from './getSchoolForUser'

// Called right after a successful sign-in (password or OAuth), in place
// of the default '/dashboard' redirect — routes each real role to its
// own portal home instead of the student dashboard:
//   - master admin (ADMIN_EMAILS allowlist, same gate as (admin)/layout.tsx)
//     -> /admin
//   - franchise_partner -> /partner-admin
//   - school_admin -> /school-admin
//   - everyone else (student, or no tenant membership at all — the
//     common case for a regular consumer account) -> /dashboard
// Master-admin is checked first and wins over tenant membership, since
// someone allowlisted as a platform admin wants the master console, not
// a specific tenant's portal, even if they also happen to own one.
export async function resolvePostSignInPath(): Promise<string> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((email) => email.trim()) ?? []
  if (user && adminEmails.includes(user.email ?? '')) {
    return '/admin'
  }

  const membership = await getSchoolForUser()

  if (membership === null || membership.member.role === 'student') {
    return '/dashboard'
  }

  return membership.school.type === 'franchise_partner' ? '/partner-admin' : '/school-admin'
}
