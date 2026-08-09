import type { Metadata } from 'next'
import { getQualityControlStats } from '@/features/school-dashboard/queries/getQualityControlStats'
import { QualityControlTable } from '@/features/school-dashboard/components/QualityControlTable'

// Load-bearing, same fix as (admin)/admin/page.tsx and (admin)/admin/
// leaderboard/page.tsx, same root cause: getQualityControlStats() calls
// createServiceClient() directly, which never touches cookies()/
// headers() — so it gives Next.js no dynamic-API signal of its own and
// can execute during `next build`'s static-generation attempt, hitting
// createServiceClient()'s missing-service-role-key throw in an
// environment where that build-time env var isn't set. Forcing dynamic
// here skips the static-generation attempt for this route entirely, so
// the page only ever runs per-request (where the real env is present).
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export const metadata: Metadata = { title: 'Quality Control — Admin' }

export default async function AdminQualityControlPage(): Promise<React.JSX.Element> {
  const rows = await getQualityControlStats()
  const needsReviewCount = rows.filter((row) => row.needsReview).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Quality Control</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Parent NPS across every school and franchise partner.
          {needsReviewCount > 0 && ` ${needsReviewCount} tenant${needsReviewCount !== 1 ? 's' : ''} flagged for review.`}
        </p>
      </div>

      <QualityControlTable rows={rows} />
    </div>
  )
}
