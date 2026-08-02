import { createClient } from '@/lib/supabase/server'
import type { ReadingProfile } from './readingIntelligenceTypes'

// Minimal persistence model for per-user Adaptive Reading Profile.
// Stores a lightweight `profile` JSON blob keyed by `user_id` and updated_at.

export async function loadReadingProfile(userId: string): Promise<ReadingProfile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reading_profiles')
    .select('profile')
    .eq('user_id', userId)
    .single()

  if (error) return null
  return (data as { profile: ReadingProfile } | null)?.profile ?? null
}

export async function saveReadingProfile(userId: string, profile: ReadingProfile): Promise<boolean> {
  const supabase = await createClient()
  const now = new Date().toISOString()
  const { error } = await supabase.from('reading_profiles').upsert(
    { user_id: userId, profile, updated_at: now },
    { onConflict: 'user_id' },
  )

  return !error
}

export type StoredReadingProfile = {
  userId: string
  profile: ReadingProfile
  updatedAt: string
}
