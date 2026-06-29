import { cache } from 'react'
import { createClient } from './server'

export type CurrentUserProfile = {
  fullName: string | null
  avatarUrl: string | null
}

// Wrapped in React's cache() so the dashboard layout and the dashboard page
// (both Server Components in the same request) share one query instead of
// two — the layout already needed this for the Topbar before this sprint.
export const getCurrentUserProfile = cache(async (userId: string): Promise<CurrentUserProfile | null> => {
  const supabase = await createClient()
  const { data } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', userId).single()

  if (!data) return null

  return { fullName: data.full_name, avatarUrl: data.avatar_url }
})
