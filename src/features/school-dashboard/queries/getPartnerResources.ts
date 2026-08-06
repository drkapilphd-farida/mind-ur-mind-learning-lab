import { createClient } from '@/lib/supabase/server'
import type { PartnerResource } from '../types'

// RLS (partner_resources_select_tenant_admins) does the real gating —
// only a signed-in, active school_admin or franchise_partner sees
// published rows at all; anyone else gets an empty array back, not an
// error. Shared by both /partner-admin/resources and
// /school-admin/resources — same query, same table, RLS decides who
// actually sees rows.
export async function getPartnerResources(): Promise<PartnerResource[]> {
  const supabase = await createClient()

  const { data: rows } = await supabase
    .from('partner_resources')
    .select('id, title, description, category, file_url, file_type, scheduled_at, display_order, is_published, created_by, created_at, updated_at')
    .order('display_order', { ascending: true })

  if (!rows) {
    return []
  }

  return rows.map((row) => ({
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
}
