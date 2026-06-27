import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default function DashboardPage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Your learning overview.
        </p>
      </div>

      <div className="bg-card rounded-xl border p-6">
        <h2 className="mb-2 font-medium">Your courses</h2>
        <p className="text-muted-foreground text-sm">
          You haven&apos;t enrolled in any courses yet.{' '}
          <Link
            href="/courses"
            className="text-foreground underline-offset-4 hover:underline"
          >
            Browse the catalog
          </Link>{' '}
          to get started.
        </p>
      </div>
    </div>
  )
}
