import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, Plus } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/service'
import { Button } from '@/components/ui/button'
import { DeleteButton } from '@/features/admin/components/DeleteButton'
import { deletePartnerResource } from '@/features/school-dashboard/actions/deletePartnerResource'

export const metadata: Metadata = { title: 'Partner Resources — Admin' }

const RESOURCE_TYPE_LABELS: Record<string, string> = {
  zoom_session: 'Live Zoom training',
  marketing_material: 'Marketing material',
  sales_guide: 'Sales guide',
}

export default async function AdminPartnerResourcesPage(): Promise<React.JSX.Element> {
  const supabase = createServiceClient()

  const { data: resources } = await supabase
    .from('partner_resources')
    .select('id, title, resource_type, url, scheduled_at, is_published')
    .order('display_order', { ascending: true })

  const allResources = resources ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Partner Resources</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {allResources.length} resource{allResources.length !== 1 ? 's' : ''} shown to every franchise partner
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/partner-resources/new">
            <Plus className="size-4" />
            New resource
          </Link>
        </Button>
      </div>

      {allResources.length === 0 ? (
        <div className="bg-card rounded-xl border p-10 text-center">
          <BookOpen className="text-muted-foreground/30 mx-auto mb-4 size-10" />
          <p className="text-muted-foreground text-sm">
            No resources yet.{' '}
            <Link href="/admin/partner-resources/new" className="text-foreground hover:underline">
              Add the first one.
            </Link>
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-muted-foreground px-4 py-3 text-left font-medium">Title</th>
                <th className="text-muted-foreground px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {allResources.map((resource) => (
                <tr key={resource.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
                      {resource.title}
                    </a>
                  </td>
                  <td className="px-4 py-3">{RESOURCE_TYPE_LABELS[resource.resource_type] ?? resource.resource_type}</td>
                  <td className="px-4 py-3 text-right">
                    <DeleteButton label={resource.title} deleteAction={deletePartnerResource.bind(null, { id: resource.id })} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
