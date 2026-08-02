import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { NewLearningProjectWizard } from '@/components/learning/NewLearningProjectWizard'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'New Learning Project',
}

// Sprint 1, Chunk 2 — New Learning Project™. Auth check matches the
// existing /preview/dashboard convention; the 3-step wizard itself is a
// Client Component (form state, drag & drop, upload progress).
export default async function NewLearningProjectPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/preview/learning-projects/new')

  return <NewLearningProjectWizard />
}
