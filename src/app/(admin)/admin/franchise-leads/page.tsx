import type { Metadata } from 'next'
import { getFranchiseLeads } from '@/features/franchise-leads/queries/getFranchiseLeads'
import { FranchiseLeadsTable } from '@/features/franchise-leads/components/FranchiseLeadsTable'

// Load-bearing, same fix as (admin)/admin/partners/page.tsx: getFranchiseLeads()
// uses createServiceClient() directly, which gives Next.js no dynamic-API
// signal of its own and can otherwise execute during `next build`'s
// static-generation attempt, hitting the missing-service-role-key throw.
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export const metadata: Metadata = { title: 'Franchise Leads — Admin' }

// Review queue only — separate from /admin/partners/new, which is the
// only place a lead actually becomes a tenant/partner row. Approving a
// lead here just flips its status; the admin still does that step by
// hand, per explicit instruction.
export default async function AdminFranchiseLeadsPage(): Promise<React.JSX.Element> {
  const leads = await getFranchiseLeads()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Franchise Leads</h1>
        <p className="text-sm text-muted-foreground">
          Applications submitted via the public franchise page. Approving a lead here does not create a partner
          account — add approved applicants manually via Partners → Add Partner.
        </p>
      </div>
      <FranchiseLeadsTable rows={leads} />
    </div>
  )
}
