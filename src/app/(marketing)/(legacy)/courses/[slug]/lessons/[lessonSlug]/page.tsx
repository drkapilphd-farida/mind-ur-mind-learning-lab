import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { LessonContent } from '@/features/courses/components/LessonContent'
import { LessonSidebar } from '@/features/courses/components/LessonSidebar'
import { LessonRightPanel } from '@/features/courses/components/LessonRightPanel'
import { MarkCompleteButton } from '@/features/courses/components/MarkCompleteButton'

type LessonPageProps = {
  params: Promise<{ slug: string; lessonSlug: string }>
}

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { slug, lessonSlug } = await params
  const supabase = await createClient()

  const { data: course } = await supabase
    .from('courses')
    .select('id, title')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!course) return { title: 'Lesson' }

  const { data: lesson } = await supabase
    .from('lessons')
    .select('title')
    .eq('course_id', course.id)
    .eq('slug', lessonSlug)
    .single()

  return { title: lesson?.title ?? 'Lesson' }
}

export default async function LessonPage({
  params,
}: LessonPageProps): Promise<React.JSX.Element> {
  const { slug, lessonSlug } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`/login?next=/courses/${slug}/lessons/${lessonSlug}`)

  // Load course
  const { data: course } = await supabase
    .from('courses')
    .select('id, title, slug')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!course) notFound()

  // Verify enrollment — redirect to course page if not enrolled
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .single()

  if (!enrollment) redirect(`/courses/${slug}`)

  // Load the current lesson
  const { data: lesson } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', course.id)
    .eq('slug', lessonSlug)
    .eq('is_published', true)
    .single()

  if (!lesson) notFound()

  // Load all published lessons for sidebar + prev/next
  const { data: allLessonData } = await supabase
    .from('lessons')
    .select('id, title, slug, duration_seconds, sort_order')
    .eq('course_id', course.id)
    .eq('is_published', true)
    .order('sort_order', { ascending: true })

  const allLessons = allLessonData ?? []

  // Load the user's completions for this course
  const lessonIds = allLessons.map((l) => l.id)
  const completedIds: string[] = []

  if (lessonIds.length > 0) {
    const { data: completionData } = await supabase
      .from('lesson_completions')
      .select('lesson_id')
      .eq('user_id', user.id)
      .in('lesson_id', lessonIds)

    for (const c of completionData ?? []) {
      completedIds.push(c.lesson_id)
    }
  }

  const isCompleted = completedIds.includes(lesson.id)

  // Compute prev / next navigation
  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id)
  const prevLesson = currentIndex > 0 ? (allLessons[currentIndex - 1] ?? null) : null
  const nextLesson =
    currentIndex < allLessons.length - 1
      ? (allLessons[currentIndex + 1] ?? null)
      : null

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden">
      {/* Lesson topbar */}
      <div className="bg-background flex h-12 shrink-0 items-center gap-3 border-b px-4">
        <Link
          href={`/courses/${slug}`}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors"
        >
          <ChevronLeft className="size-4" />
          Back to course
        </Link>
        <Separator orientation="vertical" className="h-4" />
        <h1 className="text-muted-foreground truncate text-sm font-medium">
          {course.title}
        </h1>
        <ChevronRight className="text-muted-foreground/50 size-3.5 shrink-0" />
        <span className="truncate text-sm font-medium">{lesson.title}</span>
      </div>

      {/* Content row */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <LessonContent lesson={lesson} />
        </div>

        {/* Right panel: lesson list + AI tutor tabs (desktop only) */}
        <LessonRightPanel
          lessonTitle={lesson.title}
          courseTitle={course.title}
          sidebar={
            <LessonSidebar
              courseTitle={course.title}
              courseSlug={slug}
              lessons={allLessons}
              currentLessonId={lesson.id}
              completedIds={completedIds}
            />
          }
        />
      </div>

      {/* Navigation footer */}
      <div className="bg-background flex h-16 shrink-0 items-center justify-between border-t px-6">
        {/* Previous */}
        <div className="w-40">
          {prevLesson !== null && (
            <Button asChild variant="ghost" size="sm">
              <Link href={`/courses/${slug}/lessons/${prevLesson.slug}`}>
                <ChevronLeft className="size-4" />
                <span className="max-w-[120px] truncate">{prevLesson.title}</span>
              </Link>
            </Button>
          )}
        </div>

        {/* Mark complete */}
        <MarkCompleteButton lessonId={lesson.id} isCompleted={isCompleted} />

        {/* Next / Finish */}
        <div className="flex w-40 justify-end">
          {nextLesson !== null ? (
            <Button asChild variant="ghost" size="sm">
              <Link href={`/courses/${slug}/lessons/${nextLesson.slug}`}>
                <span className="max-w-[120px] truncate">{nextLesson.title}</span>
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link href={`/courses/${slug}`}>Finish course</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
