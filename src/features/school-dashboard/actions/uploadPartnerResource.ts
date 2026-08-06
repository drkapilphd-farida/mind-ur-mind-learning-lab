'use server'

import { randomUUID } from 'node:crypto'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logger } from '@/lib/logger'

export type UploadPartnerResourceResult = { success: true; id: string } | { success: false; error: string }

// Mirrors the bucket's own file_size_limit/allowed_mime_types
// (20260806000004) — checked here too so a rejected upload gets a clean
// error message from this action instead of a raw Storage API error.
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'video/mp4',
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

// Master-admin only. Takes FormData directly (not a JSON object like
// every other action here) because it carries a real File — Server
// Actions natively support this. Uploads to the partner-resources
// bucket via the service-role client (no client-facing Storage write
// policy exists for this bucket at all — see the migration's own
// comment: master admin has no DB-expressible identity for RLS to
// check, same posture as every other master-admin write in this app),
// then inserts the DB row. If the DB insert fails after a successful
// upload, the orphaned file is best-effort cleaned up rather than left
// dangling in the bucket.
export async function uploadPartnerResource(formData: FormData): Promise<UploadPartnerResourceResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((email) => email.trim()) ?? []
  if (!user || !adminEmails.includes(user.email ?? '')) {
    logger.warn('[school-dashboard] uploadPartnerResource — unauthorized attempt', { userId: user?.id ?? null })
    return { success: false, error: 'Not authorized.' }
  }

  const title = String(formData.get('title') ?? '').trim()
  const descriptionRaw = String(formData.get('description') ?? '').trim()
  const category = String(formData.get('category') ?? '').trim()
  const scheduledAtRaw = String(formData.get('scheduledAt') ?? '').trim()
  const file = formData.get('file')

  if (title.length < 2) {
    return { success: false, error: 'Title must be at least 2 characters.' }
  }
  if (category.length < 1) {
    return { success: false, error: 'Category is required.' }
  }
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: 'Please choose a file to upload.' }
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { success: false, error: 'This file is too large — the limit is 50MB.' }
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { success: false, error: 'This file type is not supported — please upload a PDF, MP4, image, or Word document.' }
  }

  const serviceClient = createServiceClient()

  const extension = file.name.split('.').pop() ?? 'bin'
  const storagePath = `${randomUUID()}.${extension}`
  const { error: uploadError } = await serviceClient.storage.from('partner-resources').upload(storagePath, file, { contentType: file.type })

  if (uploadError) {
    logger.warn('[school-dashboard] uploadPartnerResource — storage upload FAIL', { error: uploadError.message })
    return { success: false, error: 'Could not upload the file. Please try again.' }
  }

  const {
    data: { publicUrl },
  } = serviceClient.storage.from('partner-resources').getPublicUrl(storagePath)

  const { data: row, error: insertError } = await serviceClient
    .from('partner_resources')
    .insert({
      title,
      description: descriptionRaw === '' ? null : descriptionRaw,
      category,
      file_url: publicUrl,
      file_type: file.type,
      scheduled_at: scheduledAtRaw === '' ? null : new Date(scheduledAtRaw).toISOString(),
      display_order: 0,
      created_by: user.id,
    })
    .select('id')
    .single()

  if (insertError || !row) {
    logger.warn('[school-dashboard] uploadPartnerResource — insert FAIL', { error: insertError?.message })
    await serviceClient.storage.from('partner-resources').remove([storagePath])
    return { success: false, error: insertError?.message ?? 'Could not save the resource.' }
  }

  return { success: true, id: row.id }
}
