import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { updateCourse } from '@/features/admin/actions/courseActions'
import { CourseForm } from '@/features/admin/components/CourseForm'
import type { AuthActionResult } from '@/features/auth/types'

type EditCoursePageProps = {
  params: Promise<{ courseId: string }>
}

export const metadata: Metadata = { title: 'Edit Course — Admin' }

export default async function EditCoursePage({
  params,
}: EditCoursePageProps): Promise<React.JSX.Element> {
  const { courseId } = await params

  const supabase = await createClient()
  const { data: course } = await supabase
    .from('courses')
    .select('id, title, slug, description, thumbnail_url, is_published, price_cents')
    .eq('id', courseId)
    .single()

  if (!course) notFound()

  async function action(input: unknown): Promise<AuthActionResult> {
    'use server'
    return updateCourse(courseId, input)
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link
          href="/admin/courses"
          className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm transition-colors"
        >
          <ChevronLeft className="size-4" />
          Back to courses
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          Edit: {course.title}
        </h1>
      </div>

      <CourseForm
        defaultValues={{
          title: course.title,
          slug: course.slug,
          description: course.description ?? '',
          thumbnail_url: course.thumbnail_url ?? '',
          is_published: course.is_published,
          price_cents: course.price_cents,
        }}
        action={action}
        submitLabel="Save changes"
        cancelHref="/admin/courses"
      />
    </div>
  )
}
