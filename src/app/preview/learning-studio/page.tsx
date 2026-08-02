import type { Metadata } from 'next'
import { getStudioHomeViewState, StudioHome } from '@/features/ai-learning-studio'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'AI Learning Studio',
}

// AI Learning Studio™ Sprint ALS-1 — Foundation. Replaces Sprint 0's
// static six-module placeholder grid with the real production shell:
// existing-project detection, a resume entry point, and the "Start New
// Learning Project" CTA, built entirely on the same `listLearningProjects`
// / `ProjectCard` / `LearningProjectsEmptyState` the real Dashboard
// already ships (see docs/PRODUCTION_HANDOFF_AI_LEARNING_STUDIO_SPRINT_1.md
// for what stayed untouched: the five `ModulePlaceholder` module routes
// and their local `navConfig.ts` are no longer linked from this page, but
// remain in place, unmodified, for a future sprint to reuse or retire).
export default async function LearningStudioHubPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return <div />

  const viewState = await getStudioHomeViewState(user.id)

  return <StudioHome viewState={viewState} />
}
