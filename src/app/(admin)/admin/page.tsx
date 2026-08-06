import type { Metadata } from 'next'
import { getTenantsOverviewRows } from '@/features/school-dashboard/queries/getTenantsOverviewRows'
import { PlatformOverviewCards } from '@/features/school-dashboard/components/PlatformOverviewCards'
import { QuickActionsToolbar } from '@/features/school-dashboard/components/QuickActionsToolbar'

export const metadata: Metadata = { title: 'Admin Overview' }

// The B2B platform's own overview — schools, partners, seats, AI usage,
// subscription health. Course/lesson/enrollment/certificate stats
// (the legacy course-marketplace feature, still real and still
// manageable from /admin/courses) intentionally don't live here anymore
// — this platform is the multi-tenant school/franchise business, not a
// direct course marketplace, and the overview should read that way.
export default async function AdminOverviewPage(): Promise<React.JSX.Element> {
  const tenants = await getTenantsOverviewRows()

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1 text-sm">Master admin control center.</p>
        </div>
        <QuickActionsToolbar tenants={tenants} />
      </div>

      <PlatformOverviewCards />
    </div>
  )
}
