'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logger } from '@/lib/logger'

const DeletePartnerResourceInputSchema = z.object({ id: z.string().uuid() }).strict()

export type DeletePartnerResourceResult = { success: true } | { success: false; error: string }

// Extracts the storage object path from a partner-resources public URL
// (".../storage/v1/object/public/partner-resources/<path>") — the DB
// only stores the full public URL, not the bare path, so this is the
// one place that needs to reverse it.
function storagePathFromPublicUrl(publicUrl: string): string | null {
  const marker = '/storage/v1/object/public/partner-resources/'
  const index = publicUrl.indexOf(marker)
  return index === -1 ? null : publicUrl.slice(index + marker.length)
}

export async function deletePartnerResource(input: unknown): Promise<DeletePartnerResourceResult> {
  const parsed = DeletePartnerResourceInputSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Invalid resource id.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((email) => email.trim()) ?? []
  if (!user || !adminEmails.includes(user.email ?? '')) {
    logger.warn('[school-dashboard] deletePartnerResource — unauthorized attempt', { userId: user?.id ?? null })
    return { success: false, error: 'Not authorized.' }
  }

  const serviceClient = createServiceClient()

  const { data: resource } = await serviceClient.from('partner_resources').select('file_url').eq('id', parsed.data.id).maybeSingle()

  const { error } = await serviceClient.from('partner_resources').delete().eq('id', parsed.data.id)

  if (error) {
    logger.warn('[school-dashboard] deletePartnerResource — delete FAIL', { error: error.message })
    return { success: false, error: error.message }
  }

  // Best-effort — the DB row is already gone either way; an orphaned
  // file left in storage is a cheap, non-urgent cleanup issue, not
  // worth failing the whole delete over.
  if (resource) {
    const storagePath = storagePathFromPublicUrl(resource.file_url)
    if (storagePath !== null) {
      const { error: removeError } = await serviceClient.storage.from('partner-resources').remove([storagePath])
      if (removeError) {
        logger.warn('[school-dashboard] deletePartnerResource — storage cleanup FAIL', { storagePath, error: removeError.message })
      }
    }
  }

  return { success: true }
}
