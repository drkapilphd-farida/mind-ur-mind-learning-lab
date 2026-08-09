import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/service'
import { UploadResourceDialog } from '@/features/school-dashboard/components/UploadResourceDialog'
import { PartnerResourcesAdminGrid } from '@/features/school-dashboard/components/PartnerResourcesAdminGrid'
import type { PartnerResource } from '@/features/school-dashboard/types'

// Load-bearing, same fix as (admin)/admin/page.tsx and (admin)/admin/
// leaderboard/page.tsx, same root cause: the parent (admin)/layout.tsx
// reads cookies() (auto-opting the route into dynamic rendering), but
// this page calls createServiceClient() directly — it never touches
// cookies()/headers(), so it gives Next.js no dynamic-API signal of its
// own. During `next build`'s static-generation attempt, this page's data
// fetch can start executing before the layout's own dynamic bailout is
// caught, hitting createServiceClient()'s missing-service-role-key throw
// in an environment where that build-time env var isn't set. Forcing
// dynamic here skips the static-generation attempt for this route
// entirely, so the page only ever runs per-request (where the real env
// is present).
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export const metadata: Metadata = { title: 'Partner Resources — Admin' }

export default async function AdminPartnerResourcesPage(): Promise<React.JSX.Element> {
  const supabase = createServiceClient()

  const { data: rows } = await supabase
    .from('partner_resources')
    .select('id, title, description, category, file_url, file_type, scheduled_at, display_order, is_published, created_by, created_at, updated_at')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  const resources: PartnerResource[] = (rows ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    fileUrl: row.file_url,
    fileType: row.file_type,
    scheduledAt: row.scheduled_at,
    displayOrder: row.display_order,
    isPublished: row.is_published,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Partner Resources</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {resources.length} resource{resources.length !== 1 ? 's' : ''} shown to every school admin and franchise partner
          </p>
        </div>
        <UploadResourceDialog />
      </div>

      <PartnerResourcesAdminGrid resources={resources} />
    </div>
  )
}
