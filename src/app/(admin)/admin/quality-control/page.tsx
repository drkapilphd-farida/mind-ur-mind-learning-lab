import type { Metadata } from 'next'
import { getQualityControlStats } from '@/features/school-dashboard/queries/getQualityControlStats'
import { QualityControlTable } from '@/features/school-dashboard/components/QualityControlTable'

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
