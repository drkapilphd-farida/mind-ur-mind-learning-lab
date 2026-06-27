import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, ChevronRight, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Admin Overview' }

export default async function AdminOverviewPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()

  const [courseRes, lessonRes, enrollmentRes] = await Promise.all([
    supabase.from('courses').select('id, is_published', { count: 'exact' }),
    supabase.from('lessons').select('id, is_published', { count: 'exact' }),
    supabase.from('enrollments').select('id', { count: 'exact' }),
  ])

  const courses = courseRes.data ?? []
  const lessons = lessonRes.data ?? []
  const enrollmentCount = enrollmentRes.count ?? 0

  const publishedCourses = courses.filter((c) => c.is_published).length
  const publishedLessons = lessons.filter((l) => l.is_published).length

  const stats = [
    {
      label: 'Total courses',
      value: courses.length,
      sub: `${publishedCourses} published`,
      icon: BookOpen,
      href: '/admin/courses',
    },
    {
      label: 'Total lessons',
      value: lessons.length,
      sub: `${publishedLessons} published`,
      icon: BookOpen,
      href: '/admin/courses',
    },
    {
      label: 'Total enrollments',
      value: enrollmentCount,
      sub: 'across all courses',
      icon: Users,
      href: '/admin/courses',
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Platform content at a glance.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/courses/new">New course</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-card hover:bg-muted/50 rounded-xl border p-5 transition-colors"
          >
            <div className="flex items-start justify-between">
              <stat.icon className="text-muted-foreground size-5" />
              <ChevronRight className="text-muted-foreground size-4" />
            </div>
            <p className="mt-3 text-3xl font-bold tabular-nums">{stat.value}</p>
            <p className="mt-1 text-sm font-medium">{stat.label}</p>
            <p className="text-muted-foreground mt-0.5 text-xs">{stat.sub}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
