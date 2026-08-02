import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LearningProjectsEmptyState } from '@/components/learning/LearningProjectsEmptyState'
import { ProjectCard } from '@/components/learning/ProjectCard'
import { ICON_SIZE } from '@/lib/designSystem/icons'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import type { StudioHomeViewState } from '../types/StudioHomeViewState'

type StudioHomeProps = {
  viewState: StudioHomeViewState
}

// The permanent AI Learning Studio™ home shell — every future sprint
// (Upload Experience, Universal Content Engine, Learning Blueprint,
// Workspace) adds to this component rather than replacing it. Reuses the
// exact `ProjectCard`/`LearningProjectsEmptyState` the real Dashboard
// already ships, so "existing project detection" never has two
// implementations. Deliberately lighter than the Dashboard (no
// greeting/stats) — this route's one job is getting the learner into a
// learning project, resumed or new.
export function StudioHome({ viewState }: StudioHomeProps): React.JSX.Element {
  return (
    <div className="space-y-10">
      <div>
        <p className={TYPOGRAPHY.label}>AI Learning Studio™</p>
        <h1 className={cn(TYPOGRAPHY.h1, 'mt-1')}>Studio</h1>
        {viewState.kind === 'active' && <p className={cn(TYPOGRAPHY.small, 'mt-2')}>Every document becomes a learning journey.</p>}
      </div>

      {viewState.kind === 'empty' ? (
        <LearningProjectsEmptyState />
      ) : (
        <>
          {viewState.resumeProject !== null && (
            <section>
              <p className={TYPOGRAPHY.label}>Continue Learning</p>
              <div className="mt-3 max-w-sm">
                <ProjectCard project={viewState.resumeProject} />
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center justify-between">
              <p className={TYPOGRAPHY.label}>Your Learning Projects</p>
              <Button asChild variant="ghost" size="sm">
                <Link href="/preview/learning-projects/new">
                  <Plus className={ICON_SIZE.sm} aria-hidden="true" />
                  New Project
                </Link>
              </Button>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {viewState.projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </section>

          <section>
            <p className={TYPOGRAPHY.label}>Start Something New</p>
            <div className="mt-3">
              <Button asChild size="lg" className="rounded-full">
                <Link href="/preview/learning-projects/new">
                  <span aria-hidden="true">➕</span> Start New Learning Project
                </Link>
              </Button>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
