import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolvePostSignInPath } from '@/features/school-dashboard/queries/resolvePostSignInPath'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const requestedNext = searchParams.get('next')

  if (code !== null) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Same rule as signIn.ts: an explicit `next` deep link always wins;
      // no explicit request gets the role-based portal redirect instead
      // of the default student dashboard.
      const next = requestedNext ?? (await resolvePostSignInPath())
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=invalid-link`)
}
