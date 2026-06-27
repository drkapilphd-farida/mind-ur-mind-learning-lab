import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { PublishToggle } from '@/features/admin/components/PublishToggle'
import { DeleteButton } from '@/features/admin/components/DeleteButton'
import { toggleCoursePublished, deleteCourse } from '@/features/admin/actions/courseActions'

export const metadata: Metadata = { title: 'Courses — Admin' }

export default async function AdminCoursesPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()

  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, slug, is_published, created_at')
    .order('created_at', { ascending: false })

  const allCourses = courses ?? []

  // Get enrollment counts per course
  const { data: enrollmentData } = await supabase
    .from('enrollments')
    .select('course_id')

  const enrollmentCounts = new Map<string, number>()
  for (const e of enrollmentData ?? []) {
    enrollmentCounts.set(e.course_id, (enrollmentCounts.get(e.course_id) ?? 0) + 1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Courses</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {allCourses.length} course{allCourses.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/courses/new">
            <Plus className="size-4" />
            New course
          </Link>
        </Button>
      </div>

      {allCourses.length === 0 ? (
        <div className="bg-card rounded-xl border p-10 text-center">
          <BookOpen className="text-muted-foreground/30 mx-auto mb-4 size-10" />
          <p className="text-muted-foreground text-sm">
            No courses yet.{' '}
            <Link href="/admin/courses/new" className="text-foreground hover:underline">
              Create the first one.
            </Link>
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-muted-foreground px-4 py-3 text-left font-medium">
                  Title
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left font-medium">
                  Status
                </th>
                <th className="text-muted-foreground px-4 py-3 text-right font-medium">
                  Enrollments
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {allCourses.map((course) => (
                <tr key={course.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{course.title}</p>
                      <p className="text-muted-foreground text-xs">/courses/{course.slug}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <PublishToggle
                      isPublished={course.is_published}
                      toggleAction={toggleCoursePublished.bind(null, course.id)}
                    />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {enrollmentCounts.get(course.id) ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/courses/${course.id}/lessons`}>
                          Lessons
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/courses/${course.id}/edit`}>
                          Edit
                        </Link>
                      </Button>
                      <DeleteButton
                        label={course.title}
                        deleteAction={deleteCourse.bind(null, course.id)}
                        redirectTo="/admin/courses"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
