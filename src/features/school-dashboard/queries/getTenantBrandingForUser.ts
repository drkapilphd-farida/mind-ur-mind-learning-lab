import { createClient } from '@/lib/supabase/server'

export type TenantBranding = { name: string; logoUrl: string }

// Feeds the white-labeled consumer header (AppSidebar/Topbar) — resolves
// the SIGNED-IN CONSUMER user's own tenant branding, i.e. "if this
// person is a student of a school or franchise partner that has set a
// logo, show it instead of the default Quantum Mind mark." Returns null
// for the vast majority of users (no tenant membership, or a tenant that
// hasn't uploaded a logo yet) — the caller falls back to the default
// mark in that case, never a broken image.
export async function getTenantBrandingForUser(userId: string): Promise<TenantBranding | null> {
  const supabase = await createClient()

  const { data: memberRow } = await supabase
    .from('school_members')
    .select('school_id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()

  if (!memberRow) {
    return null
  }

  const { data: schoolRow } = await supabase.from('schools').select('name, logo_url').eq('id', memberRow.school_id).maybeSingle()

  if (!schoolRow || !schoolRow.logo_url) {
    return null
  }

  return { name: schoolRow.name, logoUrl: schoolRow.logo_url }
}
