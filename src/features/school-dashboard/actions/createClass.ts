'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

const CreateClassInputSchema = z
  .object({
    schoolId: z.string().uuid(),
    name: z.string().min(1, 'Class name is required'),
    gradeLevel: z.string().nullable(),
    section: z.string().nullable(),
  })
  .strict()

export type CreateClassResult = { success: true; classId: string } | { success: false; error: string }

// school_admin only — enforced by RLS (classes_insert_admin), re-derived
// here from the request's own session, never trusted from the client.
export async function createClass(input: unknown): Promise<CreateClassResult> {
  const parsed = CreateClassInputSchema.safeParse(input)
  if (!parsed.success) {
    logger.warn('[school-dashboard] createClass input failed validation', { issues: parsed.error.issues })
    return { success: false, error: 'Please check the form for errors.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not signed in.' }
  }

  const { data: row, error } = await supabase
    .from('classes')
    .insert({
      school_id: parsed.data.schoolId,
      name: parsed.data.name,
      grade_level: parsed.data.gradeLevel,
      section: parsed.data.section,
    })
    .select('id')
    .single()

  if (error || !row) {
    logger.warn('[school-dashboard] createClass — insert FAIL', { error: error?.message })
    return { success: false, error: error?.message ?? 'Could not create the class.' }
  }

  return { success: true, classId: row.id }
}
