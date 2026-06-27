import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createCourse } from '@/features/admin/actions/courseActions'
import { CourseForm } from '@/features/admin/components/CourseForm'

export const metadata: Metadata = { title: 'New Course — Admin' }

export default function NewCoursePage(): React.JSX.Element {
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
        <h1 className="text-2xl font-semibold tracking-tight">New course</h1>
      </div>

      <CourseForm
        action={createCourse}
        submitLabel="Create course"
        cancelHref="/admin/courses"
      />
    </div>
  )
}
