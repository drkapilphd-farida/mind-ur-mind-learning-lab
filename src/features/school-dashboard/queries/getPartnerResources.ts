import { createClient } from '@/lib/supabase/server'
import type { PartnerResource, PartnerResourceType } from '../types'

// RLS (partner_resources_select_partners) does the real gating — only a
// signed-in, active franchise_partner sees published rows at all; anyone
// else gets an empty array back, not an error.
export async function getPartnerResources(): Promise<PartnerResource[]> {
  const supabase = await createClient()

  const { data: rows } = await supabase
    .from('partner_resources')
    .select('id, title, description, resource_type, url, scheduled_at, display_order, is_published, created_at, updated_at')
    .order('display_order', { ascending: true })

  if (!rows) {
    return []
  }

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    resourceType: row.resource_type as PartnerResourceType,
    url: row.url,
    scheduledAt: row.scheduled_at,
    displayOrder: row.display_order,
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}
