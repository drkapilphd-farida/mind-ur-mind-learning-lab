import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, Target } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserProfile } from '@/lib/supabase/getCurrentUserProfile'
import { formatRelativeDate } from '@/lib/formatRelativeDate'
import { CourseProgressCard } from '@/features/courses/components/CourseProgressCard'
import { ContinueLearningCard } from '@/components/exercises/ContinueLearningCard'
import { PracticeSummaryCard } from '@/components/exercises/PracticeSummaryCard'
import { WeeklyActivityChart } from '@/components/exercises/WeeklyActivityChart'
import { SessionHistoryList } from '@/components/exercises/SessionHistoryList'
import { GreetingHeading } from '@/components/dashboard/GreetingHeading'
import { ModuleProgressCard } from '@/components/dashboard/ModuleProgressCard'
import { getModuleProgress } from '@/lib/exercises/queries/getModuleProgress'
import { getPracticeSessions } from '@/lib/exercises/queries/getPracticeSessions'
import { getContinueLearningSummary } from '@/lib/exercises/continueLearning'
import {
  computeDailyStreak,
  computeTodaysProgress,
  computeWeeklyActivity,
  computeTotalPracticeStats,
  buildSessionHistory,
} from '@/lib/exercises/practiceHistory'
import { getMotivationalMessage, getTodaysGoal } from '@/lib/exercises/dashboardInsights'
import { EYE_FOUNDATION_MODULE } from '@/features/quantum-speed-reading/eyeFoundationModule'

export const metadata: Metadata = {
  title: 'Dashboard',
}

const QUANTUM_SPEED_READING_EXERCISE_IDS = EYE_FOUNDATION_MODULE.map((exercise) => exercise.exerciseId)
const EYE_FOUNDATION_MODULE_TITLE = 'Eye Foundation Module™'

export default async function DashboardPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Layout redirects unauthenticated users; user is guaranteed here
  if (!user) return <div />

  // Quantum Speed Reading Lab summary — reused from the Learning Journey
  // Engine (Sprint 2A) and the practice-session engine (Sprint 2C), not
  // re-derived here. Shown regardless of course enrollment, since the Lab
  // is independent of the course catalog. getCurrentUserProfile is wrapped
  // in React's cache(), so this doesn't re-query profiles — the dashboard
  // layout already fetched it for the Topbar in the same request.
  const [labProgress, labSessions, profile] = await Promise.all([
    getModuleProgress('quantum-speed-reading', QUANTUM_SPEED_READING_EXERCISE_IDS),
    getPracticeSessions('quantum-speed-reading'),
    getCurrentUserProfile(user.id),
  ])
  const labSummary = getContinueLearningSummary(labProgress, EYE_FOUNDATION_MODULE)
  const labStreak = computeDailyStreak(labSessions)
  const labToday = computeTodaysProgress(labSessions)
  const labWeek = computeWeeklyActivity(labSessions)
  const labTotals = computeTotalPracticeStats(labSessions)
  const labCompletionPercent =
    labProgress.totalCount > 0 ? Math.round((labProgress.completedCount / labProgress.totalCount) * 100) : 0
  const labRemaining = labProgress.totalCount - labProgress.completedCount
  const studentFirstName = profile?.fullName?.trim().split(' ')[0] ?? 'there'

  const welcomeSection = (
    <div>
      <GreetingHeading studentName={studentFirstName} />
      <p className="mt-1 text-sm text-muted-foreground">
        {getMotivationalMessage(labProgress, labStreak, EYE_FOUNDATION_MODULE_TITLE)}
      </p>
    </div>
  )

  const labCard = (
    <ContinueLearningCard
      variant="hero"
      eyebrow="Quantum Speed Reading Lab™"
      title={labSummary.isComplete ? 'Module complete' : (labSummary.currentExercise?.title ?? EYE_FOUNDATION_MODULE_TITLE)}
      actionLabel={labSummary.actionLabel}
      actionHref={labSummary.currentExercise?.href ?? null}
      completedCount={labSummary.completedCount}
      totalCount={labSummary.totalCount}
      lastCompletedTitle={labSummary.lastCompletedTitle}
      isComplete={labSummary.isComplete}
      remainingCount={labRemaining}
    />
  )

  const todaysGoalBlock = (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
      <Target className="size-4 shrink-0 text-primary" aria-hidden="true" />
      <p className="text-sm text-foreground">
        <span className="font-medium">Today&apos;s goal — </span>
        {getTodaysGoal(labProgress, labStreak, labToday, labSummary.currentExercise ?? null)}
      </p>
    </div>
  )

  const practiceSection = (
    <div className="space-y-4">
      <PracticeSummaryCard
        currentStreak={labStreak.currentStreak}
        bestStreak={labStreak.bestStreak}
        totalCompletedSessions={labTotals.totalCompletedSessions}
        totalPracticeMinutes={Math.round(labTotals.totalPracticeMs / 60_000)}
        completionPercent={labCompletionPercent}
      />
      <WeeklyActivityChart days={labWeek} />
    </div>
  )

  const moduleProgressSection = (
    <div className="space-y-3">
      <h2 className="text-base font-semibold">Your Labs</h2>
      <div className="space-y-3">
        <ModuleProgressCard
          status="available"
          labName="Quantum Speed Reading Lab™"
          completedCount={labProgress.completedCount}
          totalCount={labProgress.totalCount}
          href="/labs/quantum-speed-reading"
        />
        <ModuleProgressCard status="coming-soon" labName="Memory Intelligence Lab™" />
        <ModuleProgressCard status="coming-soon" labName="Focus Intelligence Lab™" />
      </div>
    </div>
  )

  const recentActivitySection = (
    <div className="space-y-3">
      <h2 className="text-base font-semibold">Recent activity</h2>
      <SessionHistoryList sessions={buildSessionHistory(labSessions, EYE_FOUNDATION_MODULE, 5)} formatDate={formatRelativeDate} />
    </div>
  )

  // Step 1 — enrollments
  const { data: enrollmentData } = await supabase
    .from('enrollments')
    .select('course_id, enrolled_at')
    .eq('user_id', user.id)
    .order('enrolled_at', { ascending: false })

  const enrollments = enrollmentData ?? []
  const courseIds = enrollments.map((e) => e.course_id)

  if (courseIds.length === 0) {
    return (
      <div className="space-y-6">
        {welcomeSection}
        {labCard}
        {todaysGoalBlock}
        {practiceSection}
        {moduleProgressSection}
        {recentActivitySection}

        <div className="bg-card rounded-xl border p-8 text-center">
          <BookOpen className="text-muted-foreground/30 mx-auto mb-4 size-10" />
          <p className="font-medium">You haven&apos;t enrolled in any courses yet.</p>
          <p className="text-muted-foreground mt-1 text-sm">
            <Link
              href="/courses"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Browse the catalog
            </Link>{' '}
            to get started.
          </p>
        </div>
      </div>
    )
  }

  // Step 2 — courses + lessons + completions in parallel
  const [courseRes, lessonRes, completionRes] = await Promise.all([
    supabase
      .from('courses')
      .select('id, title, slug, thumbnail_url')
      .in('id', courseIds)
      .eq('is_published', true),
    supabase
      .from('lessons')
      .select('id, course_id, slug, sort_order')
      .in('course_id', courseIds)
      .eq('is_published', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('lesson_completions')
      .select('lesson_id')
      .eq('user_id', user.id),
  ])

  const courses = courseRes.data ?? []
  const allLessons = lessonRes.data ?? []
  const completedIds = new Set((completionRes.data ?? []).map((c) => c.lesson_id))

  // Index courses and lessons by course_id
  const courseMap = new Map(courses.map((c) => [c.id, c]))

  const lessonsByCourse = new Map<
    string,
    Array<{ id: string; slug: string; sort_order: number }>
  >()
  for (const lesson of allLessons) {
    const existing = lessonsByCourse.get(lesson.course_id) ?? []
    existing.push(lesson)
    lessonsByCourse.set(lesson.course_id, existing)
  }

  // Build ordered progress entries (respects enrollment order)
  const progressItems = enrollments.flatMap((enrollment) => {
    const course = courseMap.get(enrollment.course_id)
    if (!course) return []

    const lessons = lessonsByCourse.get(enrollment.course_id) ?? []
    const totalLessons = lessons.length
    const completedLessons = lessons.filter((l) => completedIds.has(l.id)).length
    const nextLesson = lessons.find((l) => !completedIds.has(l.id)) ?? null

    return [
      {
        course,
        totalLessons,
        completedLessons,
        nextLessonSlug: nextLesson?.slug ?? null,
      },
    ]
  })

  return (
    <div className="space-y-6">
      {welcomeSection}
      <p className="text-sm text-muted-foreground">
        {progressItems.length} course{progressItems.length !== 1 ? 's' : ''} enrolled
      </p>

      {labCard}
      {todaysGoalBlock}
      {practiceSection}
      {moduleProgressSection}
      {recentActivitySection}

      <div className="space-y-4">
        {progressItems.map((item) => (
          <CourseProgressCard
            key={item.course.id}
            course={item.course}
            totalLessons={item.totalLessons}
            completedLessons={item.completedLessons}
            nextLessonSlug={item.nextLessonSlug}
          />
        ))}
      </div>
    </div>
  )
}
