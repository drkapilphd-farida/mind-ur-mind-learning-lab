import type { Metadata } from 'next'
import Link from 'next/link'
import { Award, BookOpen, DollarSign, TrendingUp, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Admin Overview' }

function formatRevenue(cents: number): string {
  if (cents === 0) return '$0'
  return `$${(cents / 100).toFixed(2)}`
}

export default async function AdminOverviewPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()
  // certificates_select_public was removed as a 2026-08-06 security fix
  // (it let anyone, unauthenticated, bulk-read every certificate ever
  // issued) — the only remaining client-facing policy is self-only, so
  // this platform-wide stats query needs the service-role client, same
  // as every other master-admin aggregate read in this app.
  const serviceClient = createServiceClient()

  const [courseRes, lessonRes, enrollmentRes, certRes] = await Promise.all([
    supabase
      .from('courses')
      .select('id, title, price_cents, is_published', { count: 'exact' }),
    supabase
      .from('lessons')
      .select('id, is_published', { count: 'exact' }),
    supabase.from('enrollments').select('course_id'),
    serviceClient.from('certificates').select('course_id'),
  ])

  const courses = courseRes.data ?? []
  const lessons = lessonRes.data ?? []
  const enrollments = enrollmentRes.data ?? []
  const certs = certRes.data ?? []

  // Per-course lookup maps
  const enrollCountByCourse = new Map<string, number>()
  for (const e of enrollments) {
    enrollCountByCourse.set(e.course_id, (enrollCountByCourse.get(e.course_id) ?? 0) + 1)
  }
  const certCountByCourse = new Map<string, number>()
  for (const c of certs) {
    certCountByCourse.set(c.course_id, (certCountByCourse.get(c.course_id) ?? 0) + 1)
  }

  // Platform totals
  const publishedCourseCount = courses.filter((c) => c.is_published).length
  const publishedLessonCount = lessons.filter((l) => l.is_published).length
  const totalEnrollments = enrollments.length
  const totalCerts = certs.length

  let totalRevenueCents = 0
  for (const course of courses) {
    totalRevenueCents += (enrollCountByCourse.get(course.id) ?? 0) * course.price_cents
  }

  // Per-course stats table (published only, sorted by enrollments desc)
  const courseStats = courses
    .filter((c) => c.is_published)
    .map((course) => {
      const enrollCount = enrollCountByCourse.get(course.id) ?? 0
      const certCount = certCountByCourse.get(course.id) ?? 0
      const rate = enrollCount > 0 ? Math.round((certCount / enrollCount) * 100) : null
      const revenueCents = enrollCount * course.price_cents
      return { course, enrollCount, certCount, rate, revenueCents }
    })
    .sort((a, b) => b.enrollCount - a.enrollCount)

  const summaryStats = [
    {
      label: 'Published courses',
      value: publishedCourseCount,
      sub: `${courseRes.count ?? 0} total`,
      icon: BookOpen,
    },
    {
      label: 'Published lessons',
      value: publishedLessonCount,
      sub: `${lessonRes.count ?? 0} total`,
      icon: BookOpen,
    },
    {
      label: 'Enrollments',
      value: totalEnrollments,
      sub: 'across all courses',
      icon: Users,
    },
    {
      label: 'Certificates',
      value: totalCerts,
      sub: 'issued to students',
      icon: Award,
    },
    {
      label: 'Est. revenue',
      value: formatRevenue(totalRevenueCents),
      sub: 'price × enrollments',
      icon: DollarSign,
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Platform metrics at a glance.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/courses/new">New course</Link>
        </Button>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {summaryStats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border p-5">
            <stat.icon className="text-muted-foreground size-4" />
            <p className="mt-3 text-3xl font-bold tabular-nums">{stat.value}</p>
            <p className="mt-1 text-sm font-medium">{stat.label}</p>
            <p className="text-muted-foreground mt-0.5 text-xs">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Per-course breakdown */}
      {courseStats.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-muted-foreground size-4" />
            <h2 className="text-base font-semibold">Course breakdown</h2>
          </div>

          <div className="rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b">
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wide">
                    Course
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-right text-xs font-medium uppercase tracking-wide">
                    Enrollments
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-right text-xs font-medium uppercase tracking-wide">
                    Completions
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-right text-xs font-medium uppercase tracking-wide">
                    Rate
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-right text-xs font-medium uppercase tracking-wide">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {courseStats.map(({ course, enrollCount, certCount, rate, revenueCents }) => (
                  <tr key={course.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/courses/${course.id}/edit`}
                        className="font-medium hover:underline"
                      >
                        {course.title}
                      </Link>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {course.price_cents === 0
                          ? 'Free'
                          : `$${(course.price_cents / 100).toFixed(2)}`}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{enrollCount}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{certCount}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {rate !== null ? (
                        <span
                          className={
                            rate >= 50
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-muted-foreground'
                          }
                        >
                          {rate}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatRevenue(revenueCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
