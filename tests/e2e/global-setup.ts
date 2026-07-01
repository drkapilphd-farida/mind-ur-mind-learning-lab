import { createClient } from '@supabase/supabase-js'
import { mkdir } from 'fs/promises'
import path from 'path'

const TEST_EMAIL = 'e2e@mind-ur-mind.test'
const TEST_PASSWORD = 'E2eTestPass123!'
const TEST_COURSE_SLUG = 'e2e-test-course'
const TEST_LESSON_SLUG = 'e2e-test-lesson'

export default async function globalSetup(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for E2E tests. ' +
        'Copy .env.example to .env.local and fill in the values.',
    )
  }

  await mkdir(path.join(process.cwd(), 'tests/.auth'), { recursive: true })

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Create test user — email_confirm: true bypasses email verification
  const { error: createUserError } = await supabase.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
  })

  if (createUserError) {
    const msg = createUserError.message.toLowerCase()
    if (!msg.includes('already registered') && !msg.includes('already been registered')) {
      throw new Error(`E2E setup: failed to create test user — ${createUserError.message}`)
    }
  }

  // Create test course (idempotent — select first, insert if missing)
  const { data: existingCourse } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', TEST_COURSE_SLUG)
    .single()

  let courseId: string

  if (existingCourse) {
    courseId = existingCourse.id
    await supabase
      .from('courses')
      .update({ is_published: true, price_cents: 0 })
      .eq('id', courseId)
  } else {
    const { data: newCourse, error: courseErr } = await supabase
      .from('courses')
      .insert({
        title: 'E2E Test Course',
        slug: TEST_COURSE_SLUG,
        is_published: true,
        price_cents: 0,
      })
      .select('id')
      .single()

    if (courseErr || !newCourse) {
      throw new Error(`E2E setup: failed to create test course — ${courseErr?.message}`)
    }
    courseId = newCourse.id
  }

  // Create test lesson (idempotent)
  const { data: existingLesson } = await supabase
    .from('lessons')
    .select('id')
    .eq('course_id', courseId)
    .eq('slug', TEST_LESSON_SLUG)
    .single()

  if (!existingLesson) {
    const { error: lessonErr } = await supabase.from('lessons').insert({
      course_id: courseId,
      title: 'E2E Test Lesson',
      slug: TEST_LESSON_SLUG,
      is_published: true,
      sort_order: 0,
      duration_seconds: 300,
    })

    if (lessonErr) {
      throw new Error(`E2E setup: failed to create test lesson — ${lessonErr.message}`)
    }
  }

  // Expose to test workers (inherited by child processes) and teardown
  process.env.E2E_TEST_COURSE_SLUG = TEST_COURSE_SLUG
  process.env.E2E_TEST_LESSON_SLUG = TEST_LESSON_SLUG
  process.env.E2E_TEST_COURSE_ID = courseId

  // Persist credentials for the Playwright setup test to consume
  const credsPath = path.join(process.cwd(), 'tests/.auth/credentials.json')
  await import('fs/promises').then(({ writeFile }) =>
    writeFile(credsPath, JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }))
  )

  // Programmatically sign in and write Playwright storageState so the UI setup can reuse it
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!anonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required to create Playwright storage state')
  }

  const anon = createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false } })
  const { data: signInData, error: signInError } = await anon.auth.signInWithPassword({ email: TEST_EMAIL, password: TEST_PASSWORD })
  if (signInError) {
    throw new Error(`E2E setup: failed to sign in test user — ${signInError.message}`)
  }

  const session = signInData.session
  if (!session) {
    throw new Error('E2E setup: sign-in did not return a session')
  }

  // Ensure the test user is enrolled in the test course so enrollment-related
  // UI tests can run reliably without depending on client sign-up flows.
  try {
    const userId = session.user.id
    const { error: enrollErr } = await supabase
      .from('enrollments')
      .insert({ user_id: userId, course_id: courseId })

    if (enrollErr && enrollErr.code !== '23505') {
      throw new Error(`E2E setup: failed to ensure enrollment — ${enrollErr.message}`)
    }
  } catch (e: any) {
    // If something unexpected happened, rethrow
    if (e && e.message) throw e
  }

  // Optionally ensure the lesson is marked complete for the test user so
  // lesson/completion flows are deterministic for E2E tests that toggle state.
  try {
    const { data: lessonRow } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', courseId)
      .eq('slug', TEST_LESSON_SLUG)
      .single()

    if (lessonRow && lessonRow.id) {
      const lessonId = lessonRow.id
      const { error: compErr } = await supabase
        .from('lesson_completions')
        .insert({ user_id: session.user.id, lesson_id: lessonId })

      if (compErr && compErr.code !== '23505') {
        throw new Error(`E2E setup: failed to ensure lesson completion — ${compErr.message}`)
      }
    }
  } catch (e: any) {
    if (e && e.message) throw e
  }

  const projectRef = new URL(url).hostname.split('.')[0]
  const storageKey = `sb-${projectRef}-auth-token`

  const storageState = {
    cookies: [
      {
        name: storageKey,
        value: JSON.stringify(session),
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
        expires: session.expires_at || undefined,
      },
    ],
    origins: [
      {
        origin: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
        localStorage: [
          {
            name: storageKey,
            value: JSON.stringify(session),
          },
        ],
      },
    ],
  }

  const storagePath = path.join(process.cwd(), 'tests/.auth/user.json')
  await import('fs/promises').then(({ writeFile }) => writeFile(storagePath, JSON.stringify(storageState)))
}
