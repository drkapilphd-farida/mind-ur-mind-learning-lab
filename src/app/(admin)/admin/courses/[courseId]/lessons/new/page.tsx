import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createLesson } from '@/features/admin/actions/lessonActions'
import { LessonForm } from '@/features/admin/components/LessonForm'
import type { AuthActionResult } from '@/features/auth/types'

type NewLessonPageProps = {
  params: Promise<{ courseId: string }>
}

export const metadata: Metadata = { title: 'New Lesson — Admin' }

export default async function NewLessonPage({
  params,
}: NewLessonPageProps): Promise<React.JSX.Element> {
  const { courseId } = await params

  const supabase = await createClient()
  const { data: course } = await supabase
    .from('courses')
    .select('id, title')
    .eq('id', courseId)
    .single()

  if (!course) notFound()

  // Suggest next sort_order based on existing lessons
  const { data: lastLesson } = await supabase
    .from('lessons')
    .select('sort_order')
    .eq('course_id', courseId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const nextSortOrder = (lastLesson?.sort_order ?? -1) + 1

  async function action(input: unknown): Promise<AuthActionResult> {
    'use server'
    return createLesson(courseId, input)
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
        <h1 className="text-2xl font-semibold tracking-tight">New lesson</h1>
      </div>

      <LessonForm
        courseTitle={course.title}
        defaultValues={{
          title: '',
          slug: '',
          content_url: '',
          content: '',
          duration_seconds: 0,
          sort_order: nextSortOrder,
          is_published: false,
        }}
        action={action}
        submitLabel="Create lesson"
        cancelHref={`/admin/courses/${courseId}/lessons`}
      />
    </div>
  )
}
