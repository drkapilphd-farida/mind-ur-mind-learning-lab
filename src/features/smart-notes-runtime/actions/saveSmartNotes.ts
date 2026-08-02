'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { saveSmartNote } from '../notes/saveSmartNote'

// A real, disclosed, generous-but-bounded cap — protects the database
// column and the textarea from an unbounded paste, not a validated
// pedagogical limit.
const MAX_NOTE_LENGTH = 50000

const SaveSmartNotesInputSchema = z.object({ documentId: z.string().uuid(), content: z.string().max(MAX_NOTE_LENGTH) })

export type SaveSmartNotesResult = { success: true; updatedAt: string } | { success: false; error: string }

// Smart Notes™ Sprint-2. Real, explicit save — this sprint's own "no
// premium polish yet" rule keeps this to an explicit Save action rather
// than a debounced autosave, which would be a real UX decision (timing,
// save-status indicators, conflict handling) beyond "the presentation
// layer required for taking, editing, saving and restoring notes."
export async function saveSmartNotes(input: unknown): Promise<SaveSmartNotesResult> {
  const parsed = SaveSmartNotesInputSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid smart notes request.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not signed in.' }

  const updatedAt = await saveSmartNote(supabase, user.id, parsed.data.documentId, parsed.data.content)
  if (updatedAt === null) return { success: false, error: 'Failed to save your notes.' }

  return { success: true, updatedAt }
}
