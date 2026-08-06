import type { Metadata } from 'next'
import { getPartnerResources } from '@/features/school-dashboard/queries/getPartnerResources'
import { PartnerResourcesGrid } from '@/features/school-dashboard/components/PartnerResourcesGrid'

export const metadata: Metadata = { title: 'Resources' }

export default async function SchoolResourcesPage(): Promise<React.JSX.Element> {
  const resources = await getPartnerResources()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Resources</h1>
        <p className="text-muted-foreground mt-1 text-sm">Marketing kits and sales resources provided by HQ — browse, filter, preview, and download.</p>
      </div>

      <PartnerResourcesGrid resources={resources} />
    </div>
  )
}
