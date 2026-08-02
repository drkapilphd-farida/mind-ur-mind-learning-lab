import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { listLearningProjects } from '@/api/learning'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LearningProjectsEmptyState } from '@/components/learning/LearningProjectsEmptyState'
import { ProjectCard } from '@/components/learning/ProjectCard'
import { DashboardBackgroundProcessingPoller } from '@/components/learning/DashboardBackgroundProcessingPoller'
import { ICON_SIZE } from '@/lib/designSystem/icons'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { getCurrentUserProfile } from '@/lib/supabase/getCurrentUserProfile'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Dashboard',
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

type StatCardProps = {
  value: string
  label: string
  caption?: string
}

function StatCard({ value, label, caption }: StatCardProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
        <p className={TYPOGRAPHY.caption}>
          {label}
          {caption !== undefined ? ` · ${caption}` : ''}
        </p>
      </CardHeader>
    </Card>
  )
}

// The AI Learning Studio™ Dashboard — replaces Sprint 0's ModulePlaceholder
// on this exact route (routing/layout/shell untouched, only page content
// changes, per docs/adr/0001... "swapping this out... never touches
// routing/layout"). Learning Project is the permanent container: when
// none exist, the whole page is the premium empty state, not a grid of
// hollow zeros.
export default async function PreviewDashboardPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return <div />

  const [profile, projects] = await Promise.all([getCurrentUserProfile(user.id), listLearningProjects(user.id)])

  const firstName = profile?.fullName?.trim().split(' ')[0]
  const hasProjects = projects.length > 0
  const activeProject = projects.find((project) => project.status === 'active')
  const completedCount = projects.filter((project) => project.status === 'completed').length

  return (
    <div className="space-y-10">
      <DashboardBackgroundProcessingPoller />
      <div>
        <p className={TYPOGRAPHY.label}>AI Learning Studio™</p>
        <h1 className={cn(TYPOGRAPHY.h1, 'mt-1')}>
          {getGreeting()}
          {firstName !== undefined && firstName.length > 0 ? `, ${firstName}` : ''}.
        </h1>
        {hasProjects && <p className={cn(TYPOGRAPHY.small, 'mt-2')}>Every document becomes a learning journey.</p>}
      </div>

      {!hasProjects ? (
        <LearningProjectsEmptyState />
      ) : (
        <>
          {activeProject !== undefined && (
            <section>
              <p className={TYPOGRAPHY.label}>Continue Learning</p>
              <div className="mt-3 max-w-sm">
                <ProjectCard project={activeProject} />
              </div>
            </section>
          )}

          <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatCard value={String(projects.length)} label="Learning Projects" />
            <StatCard value="—" label="Learning Minutes" caption="Coming soon" />
            <StatCard value={String(completedCount)} label="Completed" />
          </section>

          <section>
            <div className="flex items-center justify-between">
              <p className={TYPOGRAPHY.label}>Recent Learning Projects</p>
              <Button asChild size="sm" className="rounded-full">
                <Link href="/preview/learning-projects/new">
                  <Plus className={ICON_SIZE.sm} aria-hidden="true" />
                  Upload Your Content
                </Link>
              </Button>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.slice(0, 6).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </section>

          <section>
            <p className={TYPOGRAPHY.label}>Recent Activity</p>
            <Card className="mt-3">
              <CardContent className="py-6 text-center">
                <p className={TYPOGRAPHY.small}>Activity tracking is coming soon.</p>
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  )
}
