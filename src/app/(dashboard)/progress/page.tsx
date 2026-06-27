import type { Metadata } from 'next'
import Link from 'next/link'
import { BarChart3, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { StatCard } from '@/features/analytics/components/StatCard'
import { CourseProgressRow } from '@/features/analytics/components/CourseProgressRow'

export const metadata: Metadata = {
  title: 'Progress',
}

function formatRelativeDate(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime()
  const diffDays = Math.floor(diffMs / 86_400_000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  const weeks = Math.floor(diffDays / 7)
  if (weeks < 5) return `${weeks}w ago`
  const months = Math.floor(diffDays / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(diffDays / 365)}y ago`
}

export default async function ProgressPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return <div />

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
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My progress</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Your learning stats and activity.
          </p>
        </div>
        <div className="bg-card rounded-xl border p-8 text-center">
          <BarChart3 className="text-muted-foreground/30 mx-auto mb-4 size-10" />
          <p className="font-medium">No progress data yet.</p>
          <p className="text-muted-foreground mt-1 text-sm">
            <Link
              href="/courses"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Enroll in a course
            </Link>{' '}
            to start tracking your progress.
          </p>
        </div>
      </div>
    )
  }

  // Step 2 — courses, lessons, completions, certificates in parallel
  const [courseRes, lessonRes, completionRes, certRes] = await Promise.all([
    supabase
      .from('courses')
      .select('id, title, slug, thumbnail_url')
      .in('id', courseIds)
      .eq('is_published', true),
    supabase
      .from('lessons')
      .select('id, course_id, title, slug')
      .in('course_id', courseIds)
      .eq('is_published', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('lesson_completions')
      .select('lesson_id, completed_at')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false }),
    supabase
      .from('certificates')
      .select('course_id, token')
      .eq('user_id', user.id),
  ])

  const courses = courseRes.data ?? []
  const allLessons = lessonRes.data ?? []
  const allCompletions = completionRes.data ?? []
  const certByCourse = new Map(
    (certRes.data ?? []).map((c) => [c.course_id, c.token]),
  )

  // Build lookup structures
  const courseMap = new Map(courses.map((c) => [c.id, c]))

  // lesson_id → lesson (includes course_id for cross-referencing)
  const lessonMap = new Map(allLessons.map((l) => [l.id, l]))

  // course_id → sorted lesson ID list
  const lessonIdsByCourse = new Map<string, string[]>()
  for (const lesson of allLessons) {
    const ids = lessonIdsByCourse.get(lesson.course_id) ?? []
    ids.push(lesson.id)
    lessonIdsByCourse.set(lesson.course_id, ids)
  }

  // Set of completed lesson IDs (only those belonging to enrolled courses)
  const enrolledLessonIds = new Set(allLessons.map((l) => l.id))
  const completedIds = new Set(
    allCompletions
      .map((c) => c.lesson_id)
      .filter((id) => enrolledLessonIds.has(id)),
  )

  // Latest completion timestamp per course (completions are newest-first)
  const lastActivityByCourse = new Map<string, string>()
  for (const c of allCompletions) {
    const lesson = lessonMap.get(c.lesson_id)
    if (!lesson) continue
    if (!lastActivityByCourse.has(lesson.course_id)) {
      lastActivityByCourse.set(lesson.course_id, c.completed_at)
    }
  }

  // Build per-course progress items
  type ProgressItem = {
    course: { id: string; title: string; slug: string; thumbnail_url: string | null }
    totalLessons: number
    completedLessons: number
    lastActivityLabel: string | null
    nextLessonSlug: string | null
    certificateToken: string | null
  }

  const progressItems: ProgressItem[] = enrollments.flatMap((enrollment) => {
    const course = courseMap.get(enrollment.course_id)
    if (!course) return []
    const lessonIds = lessonIdsByCourse.get(enrollment.course_id) ?? []
    const totalLessons = lessonIds.length
    const completedLessons = lessonIds.filter((id) => completedIds.has(id)).length
    const lastActivity = lastActivityByCourse.get(enrollment.course_id) ?? null
    const nextLesson =
      allLessons.find(
        (l) => l.course_id === enrollment.course_id && !completedIds.has(l.id),
      ) ?? null

    return [
      {
        course,
        totalLessons,
        completedLessons,
        lastActivityLabel:
          lastActivity !== null ? formatRelativeDate(lastActivity) : null,
        nextLessonSlug: nextLesson?.slug ?? null,
        certificateToken: certByCourse.get(enrollment.course_id) ?? null,
      },
    ]
  })

  // Sort: in-progress → finished → not started
  const sorted = [...progressItems].sort((a, b) => {
    const rank = (item: ProgressItem): number => {
      if (item.completedLessons > 0 && item.completedLessons < item.totalLessons)
        return 0
      if (
        item.completedLessons === item.totalLessons &&
        item.totalLessons > 0
      )
        return 1
      return 2
    }
    return rank(a) - rank(b)
  })

  // Summary stats
  const enrolled = enrollments.length
  const finished = progressItems.filter(
    (s) => s.completedLessons === s.totalLessons && s.totalLessons > 0,
  ).length
  const inProgress = progressItems.filter(
    (s) => s.completedLessons > 0 && s.completedLessons < s.totalLessons,
  ).length
  const totalCompleted = completedIds.size

  // Recent activity — top 5 completions with lesson + course info
  const recentActivity = allCompletions.slice(0, 5).flatMap((c) => {
    const lesson = lessonMap.get(c.lesson_id)
    if (!lesson) return []
    const course = courseMap.get(lesson.course_id)
    if (!course) return []
    return [{ lesson, course, completedAt: c.completed_at }]
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My progress</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Your learning stats and activity.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Enrolled" value={enrolled} />
        <StatCard label="Finished" value={finished} />
        <StatCard label="In progress" value={inProgress} />
        <StatCard label="Lessons done" value={totalCompleted} />
      </div>

      {/* Course breakdown */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">Course breakdown</h2>
        {sorted.map((item) => (
          <CourseProgressRow
            key={item.course.id}
            course={item.course}
            totalLessons={item.totalLessons}
            completedLessons={item.completedLessons}
            lastActivityLabel={item.lastActivityLabel}
            nextLessonSlug={item.nextLessonSlug}
            certificateToken={item.certificateToken}
          />
        ))}
      </section>

      {/* Recent activity */}
      {recentActivity.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">Recent activity</h2>
          <div className="bg-card divide-y rounded-xl border">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <CheckCircle2 className="size-4 shrink-0 text-green-600" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {item.lesson.title}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {item.course.title}
                  </p>
                </div>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {formatRelativeDate(item.completedAt)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
