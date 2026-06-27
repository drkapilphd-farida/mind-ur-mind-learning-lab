'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

export function createClient(): ReturnType<typeof createBrowserClient<Database>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
        'Check your .env.local file.',
    )
  }

  return createBrowserClient<Database>(url, key)
}
