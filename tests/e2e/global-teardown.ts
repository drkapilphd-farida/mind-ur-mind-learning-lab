import { createClient } from '@supabase/supabase-js'

export default async function globalTeardown(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const courseId = process.env.E2E_TEST_COURSE_ID

  if (!url || !serviceKey || !courseId) return

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Cascade delete removes lessons, enrollments, lesson_completions, certificates
  await supabase.from('courses').delete().eq('id', courseId)
}
