import type { Metadata } from 'next'
import { TenantsTable } from '@/features/school-dashboard/components/TenantsTable'

// Load-bearing, same fix as (admin)/admin/page.tsx and (admin)/admin/
// leaderboard/page.tsx, same root cause: TenantsTable calls
// getTenantsOverviewRows(), which uses createServiceClient() directly —
// it never touches cookies()/headers(), so it gives Next.js no
// dynamic-API signal of its own and can execute during `next build`'s
// static-generation attempt, hitting createServiceClient()'s
// missing-service-role-key throw in an environment where that
// build-time env var isn't set. Forcing dynamic here skips the
// static-generation attempt for this route entirely, so the page only
// ever runs per-request (where the real env is present).
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export const metadata: Metadata = { title: 'Partners — Admin' }

export default function AdminPartnersPage(): React.JSX.Element {
  return <TenantsTable type="franchise_partner" newHref="/admin/partners/new" />
}
