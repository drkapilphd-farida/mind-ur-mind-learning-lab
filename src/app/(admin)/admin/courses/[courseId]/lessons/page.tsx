import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, ExternalLink, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { PublishToggle } from '@/features/admin/components/PublishToggle'
import { DeleteButton } from '@/features/admin/components/DeleteButton'
import { toggleLessonPublished, deleteLesson } from '@/features/admin/actions/lessonActions'
import { formatDuration } from '@/features/courses/types'

type CourseLessonsPageProps = {
  params: Promise<{ courseId: string }>
}

export const metadata: Metadata = { title: 'Lessons — Admin' }

export default async function CourseLessonsPage({
  params,
}: CourseLessonsPageProps): Promise<React.JSX.Element> {
  const { courseId } = await params

  const supabase = await createClient()

  const { data: course } = await supabase
    .from('courses')
    .select('id, title, slug, is_published')
    .eq('id', courseId)
    .single()

  if (!course) notFound()

  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, title, slug, sort_order, duration_seconds, is_published')
    .eq('course_id', courseId)
    .order('sort_order', { ascending: true })

  const allLessons = lessons ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/courses"
            className="text-muted-foreground hover:text-foreground mb-1 inline-flex items-center gap-1 text-sm transition-colors"
          >
            <ChevronLeft className="size-4" />
            {course.title}
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Lessons</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
            <span>{allLessons.length} lesson{allLessons.length !== 1 ? 's' : ''}</span>
            <span>·</span>
            {course.is_published ? (
              <a
                href={`/courses/${course.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground inline-flex items-center gap-1 transition-colors"
              >
                /courses/{course.slug}
                <ExternalLink className="size-3" />
              </a>
            ) : (
              <span>/courses/{course.slug}</span>
            )}
          </p>
        </div>
        <Button asChild>
          <Link href={`/admin/courses/${courseId}/lessons/new`}>
            <Plus className="size-4" />
            New lesson
          </Link>
        </Button>
      </div>

      {allLessons.length === 0 ? (
        <div className="bg-card rounded-xl border p-10 text-center">
          <p className="text-muted-foreground text-sm">
            No lessons yet.{' '}
            <Link
              href={`/admin/courses/${courseId}/lessons/new`}
              className="text-foreground hover:underline"
            >
              Add the first lesson.
            </Link>
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-muted-foreground w-12 px-4 py-3 text-left font-medium">
                  #
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left font-medium">
                  Title
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left font-medium">
                  Duration
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left font-medium">
                  Status
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {allLessons.map((lesson) => (
                <tr key={lesson.id} className="hover:bg-muted/30">
                  <td className="text-muted-foreground px-4 py-3 font-mono text-xs tabular-nums">
                    {lesson.sort_order}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{lesson.title}</p>
                      <p className="text-muted-foreground text-xs">{lesson.slug}</p>
                    </div>
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    {lesson.duration_seconds > 0
                      ? formatDuration(lesson.duration_seconds)
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <PublishToggle
                      isPublished={lesson.is_published}
                      toggleAction={toggleLessonPublished.bind(
                        null,
                        lesson.id,
                        courseId,
                      )}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link
                          href={`/admin/courses/${courseId}/lessons/${lesson.id}/edit`}
                        >
                          Edit
                        </Link>
                      </Button>
                      <DeleteButton
                        label={lesson.title}
                        deleteAction={deleteLesson.bind(
                          null,
                          lesson.id,
                          courseId,
                        )}
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
