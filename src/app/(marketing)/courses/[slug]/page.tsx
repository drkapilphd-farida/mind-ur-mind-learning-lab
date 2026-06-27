import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BookOpen, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { EnrollButton } from '@/features/courses/components/EnrollButton'
import { formatDuration } from '@/features/courses/types'

type CourseDetailPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: CourseDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: course } = await supabase
    .from('courses')
    .select('title, description')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  return {
    title: course?.title ?? 'Course',
    description: course?.description ?? null,
  }
}

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps): Promise<React.JSX.Element> {
  const { slug } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!course) notFound()

  // Check enrollment and load lessons if the user is enrolled
  let isEnrolled = false
  let lessons: Array<{
    id: string
    title: string
    slug: string
    duration_seconds: number
    sort_order: number
  }> = []

  if (user !== null) {
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', course.id)
      .single()

    isEnrolled = enrollment !== null

    if (isEnrolled) {
      const { data: lessonData } = await supabase
        .from('lessons')
        .select('id, title, slug, duration_seconds, sort_order')
        .eq('course_id', course.id)
        .eq('is_published', true)
        .order('sort_order', { ascending: true })

      lessons = lessonData ?? []
    }
  }

  const loginHref = `/login?next=/courses/${course.slug}`

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* Hero */}
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Badge variant="secondary">Course</Badge>
          <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
          {course.description !== null && (
            <p className="text-muted-foreground leading-relaxed">
              {course.description}
            </p>
          )}

          <div className="pt-2">
            {isEnrolled ? (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm">
                  ✓ Enrolled
                </Badge>
                <span className="text-muted-foreground text-sm">
                  {lessons.length} lesson{lessons.length !== 1 ? 's' : ''} below
                </span>
              </div>
            ) : (
              <EnrollButton
                courseId={course.id}
                isAuthenticated={user !== null}
                loginHref={loginHref}
              />
            )}
          </div>
        </div>

        {/* Thumbnail */}
        <div className="bg-muted order-first relative aspect-video overflow-hidden rounded-xl lg:order-last">
          {course.thumbnail_url !== null ? (
            <Image
              src={course.thumbnail_url}
              alt={course.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 320px"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="text-muted-foreground/30 size-16" />
            </div>
          )}
        </div>
      </div>

      <Separator className="my-10" />

      {/* Curriculum */}
      <section>
        <h2 className="mb-6 text-xl font-semibold tracking-tight">
          Course curriculum
        </h2>

        {isEnrolled && lessons.length > 0 ? (
          <ol className="space-y-2">
            {lessons.map((lesson, index) => (
              <li
                key={lesson.id}
                className="bg-card flex items-center gap-4 rounded-lg border px-4 py-3 text-sm"
              >
                <span className="text-muted-foreground w-6 shrink-0 text-right font-mono text-xs">
                  {index + 1}
                </span>
                <span className="flex-1 font-medium">{lesson.title}</span>
                {lesson.duration_seconds > 0 && (
                  <span className="text-muted-foreground flex items-center gap-1 shrink-0">
                    <Clock className="size-3" />
                    {formatDuration(lesson.duration_seconds)}
                  </span>
                )}
              </li>
            ))}
          </ol>
        ) : isEnrolled ? (
          <p className="text-muted-foreground text-sm">
            No lessons published yet. Check back soon.
          </p>
        ) : (
          <div className="bg-muted/50 rounded-xl border border-dashed px-6 py-12 text-center">
            <BookOpen className="text-muted-foreground/40 mx-auto mb-3 size-8" />
            <p className="text-muted-foreground text-sm">
              {user !== null
                ? 'Enroll to unlock the full curriculum.'
                : 'Sign in and enroll to see the lessons.'}
            </p>
            {user === null && (
              <Link
                href={loginHref}
                className="text-foreground mt-2 inline-block text-sm font-medium hover:underline"
              >
                Sign in →
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
