import type { Metadata } from 'next'
import { Calendar, Download, FileText } from 'lucide-react'
import { getPartnerResources } from '@/features/school-dashboard/queries/getPartnerResources'
import type { PartnerResource, PartnerResourceType } from '@/features/school-dashboard/types'

export const metadata: Metadata = { title: 'Partner Resources' }

const SECTION_LABELS: Record<PartnerResourceType, string> = {
  zoom_session: 'Live Zoom Trainings',
  marketing_material: 'Marketing Materials',
  sales_guide: 'Sales Guides',
}

const SECTION_ICONS: Record<PartnerResourceType, typeof Calendar> = {
  zoom_session: Calendar,
  marketing_material: Download,
  sales_guide: FileText,
}

function ResourceGroup({ type, resources }: { type: PartnerResourceType; resources: readonly PartnerResource[] }): React.JSX.Element | null {
  if (resources.length === 0) return null
  const Icon = SECTION_ICONS[type]

  return (
    <div>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="size-4" />
        {SECTION_LABELS[type]}
      </h2>
      <ul className="divide-y rounded-xl border bg-card">
        {resources.map((resource) => (
          <li key={resource.id} className="px-4 py-3">
            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline">
              {resource.title}
            </a>
            {resource.description !== null && <p className="text-muted-foreground mt-1 text-sm">{resource.description}</p>}
            {resource.scheduledAt !== null && (
              <p className="text-muted-foreground mt-1 text-xs">{new Date(resource.scheduledAt).toLocaleString()}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default async function PartnerResourcesPage(): Promise<React.JSX.Element> {
  const resources = await getPartnerResources()

  const zoomSessions = resources.filter((resource) => resource.resourceType === 'zoom_session')
  const marketingMaterials = resources.filter((resource) => resource.resourceType === 'marketing_material')
  const salesGuides = resources.filter((resource) => resource.resourceType === 'sales_guide')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Partner Resources</h1>
        <p className="text-muted-foreground mt-1 text-sm">Live trainings, marketing materials, and sales guides for growing your academy.</p>
      </div>

      {resources.length === 0 ? (
        <div className="bg-card rounded-xl border p-10 text-center">
          <p className="text-muted-foreground text-sm">No resources have been added yet — check back soon.</p>
        </div>
      ) : (
        <>
          <ResourceGroup type="zoom_session" resources={zoomSessions} />
          <ResourceGroup type="marketing_material" resources={marketingMaterials} />
          <ResourceGroup type="sales_guide" resources={salesGuides} />
        </>
      )}
    </div>
  )
}
