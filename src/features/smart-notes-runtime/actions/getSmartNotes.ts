'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { loadSmartNote } from '../notes/loadSmartNote'
import type { SmartNote } from '../notes/types/SmartNote'

const GetSmartNotesInputSchema = z.object({ documentId: z.string().uuid() })

export type GetSmartNotesResult = { success: true; note: SmartNote | null } | { success: false; error: string }

// Smart Notes™ Sprint-2. Real: loads this learner's real, already-saved
// notes for a document — `note: null` is a real, honest "nothing saved
// yet" (never treated as an error), letting the workspace start from a
// real blank textarea rather than fabricating placeholder content.
export async function getSmartNotes(input: unknown): Promise<GetSmartNotesResult> {
  const parsed = GetSmartNotesInputSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid smart notes request.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not signed in.' }

  const note = await loadSmartNote(supabase, user.id, parsed.data.documentId)
  return { success: true, note }
}
