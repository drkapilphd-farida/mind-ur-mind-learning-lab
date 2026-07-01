import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { updateLesson } from '@/features/admin/actions/lessonActions'
import { LessonForm } from '@/features/admin/components/LessonForm'
import type { AuthActionResult } from '@/features/auth/types'

type EditLessonPageProps = {
  params: Promise<{ courseId: string; lessonId: string }>
}

export const metadata: Metadata = { title: 'Edit Lesson — Admin' }

export default async function EditLessonPage({
  params,
}: EditLessonPageProps): Promise<React.JSX.Element> {
  const { courseId, lessonId } = await params

  const supabase = await createClient()

  const [courseRes, lessonRes] = await Promise.all([
    supabase
      .from('courses')
      .select('id, title, slug, is_published')
      .eq('id', courseId)
      .single(),
    supabase
      .from('lessons')
      .select(
        'id, title, slug, content_url, content, duration_seconds, sort_order, is_published',
      )
      .eq('id', lessonId)
      .eq('course_id', courseId)
      .single(),
  ])

  if (!courseRes.data || !lessonRes.data) notFound()

  const course = courseRes.data
  const lesson = lessonRes.data

  async function action(input: unknown): Promise<AuthActionResult> {
    'use server'
    return updateLesson(lessonId, courseId, input)
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link
          href={`/admin/courses/${courseId}/lessons`}
          className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm transition-colors"
        >
          <ChevronLeft className="size-4" />
          Back to {course.title}
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          Edit: {lesson.title}
        </h1>
        {course.is_published && lesson.is_published && (
          <a
            href={`/courses/${course.slug}/lessons/${lesson.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground mt-1 inline-flex items-center gap-1 text-xs transition-colors"
          >
            <ExternalLink className="size-3" />
            View on site
          </a>
        )}
      </div>

      <LessonForm
        courseTitle={course.title}
        defaultValues={{
          title: lesson.title,
          slug: lesson.slug,
          content_url: lesson.content_url ?? '',
          content: lesson.content ?? '',
          duration_seconds: lesson.duration_seconds,
          sort_order: lesson.sort_order,
          is_published: lesson.is_published,
        }}
        action={action}
        submitLabel="Save changes"
        cancelHref={`/admin/courses/${courseId}/lessons`}
      />
    </div>
  )
}
