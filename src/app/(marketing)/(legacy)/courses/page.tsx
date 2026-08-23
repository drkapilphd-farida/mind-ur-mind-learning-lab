import type { Metadata } from 'next'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CourseGrid } from '@/features/courses/components/CourseGrid'
import type { Course } from '@/features/courses/types'

export const metadata: Metadata = {
  title: 'Course Catalog',
  description: 'Browse AI-powered learning courses.',
}

type FilterValue = 'all' | 'free' | 'paid'
type SortValue = 'newest' | 'popular'

type CoursesPageProps = {
  searchParams: Promise<{
    q?: string | undefined
    filter?: string | undefined
    sort?: string | undefined
  }>
}

function buildCatalogUrl(
  current: { q: string; filter: FilterValue; sort: SortValue },
  overrides: { q?: string; filter?: FilterValue; sort?: SortValue },
): string {
  const q = overrides.q ?? current.q
  const filter = overrides.filter ?? current.filter
  const sort = overrides.sort ?? current.sort
  const params = new URLSearchParams()
  if (q.length > 0) params.set('q', q)
  if (filter !== 'all') params.set('filter', filter)
  if (sort !== 'newest') params.set('sort', sort)
  const qs = params.toString()
  return `/courses${qs.length > 0 ? `?${qs}` : ''}`
}

export default async function CoursesPage({
  searchParams,
}: CoursesPageProps): Promise<React.JSX.Element> {
  const { q, filter: filterParam, sort: sortParam } = await searchParams
  const query = q?.trim() ?? ''
  const filter: FilterValue =
    filterParam === 'free' || filterParam === 'paid' ? filterParam : 'all'
  const sort: SortValue = sortParam === 'popular' ? 'popular' : 'newest'

  const supabase = await createClient()

  // Build Supabase query — filter applied at DB level, sort optionally too
  let dbQuery = supabase.from('courses').select('*').eq('is_published', true)

  if (query.length > 0) {
    dbQuery = dbQuery.ilike('title', `%${query}%`)
  }
  if (filter === 'free') {
    dbQuery = dbQuery.eq('price_cents', 0)
  } else if (filter === 'paid') {
    dbQuery = dbQuery.gt('price_cents', 0)
  }
  // Popular sort is done in-memory after fetching enrollment counts
  if (sort === 'newest') {
    dbQuery = dbQuery.order('created_at', { ascending: false })
  }

  const { data: coursesRaw } = await dbQuery
  let courses: Course[] = coursesRaw ?? []

  // Popular: count enrollments for the result set, sort in-memory
  if (sort === 'popular' && courses.length > 0) {
    const courseIds = courses.map((c) => c.id)
    const { data: enrollRows } = await supabase
      .from('enrollments')
      .select('course_id')
      .in('course_id', courseIds)

    const enrollCount = new Map<string, number>()
    for (const e of enrollRows ?? []) {
      enrollCount.set(e.course_id, (enrollCount.get(e.course_id) ?? 0) + 1)
    }
    courses = [...courses].sort(
      (a, b) => (enrollCount.get(b.id) ?? 0) - (enrollCount.get(a.id) ?? 0),
    )
  }

  const current = { q: query, filter, sort }
  const hasActiveFilters = filter !== 'all' || sort !== 'newest'
  const isFiltered = query.length > 0 || hasActiveFilters
  const count = courses.length

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10 space-y-5">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Course Catalog</h1>
          <p className="text-muted-foreground">
            Explore our AI-powered learning courses.
          </p>
        </div>

        {/* All controls in one form — works without JS */}
        <form method="GET" action="/courses">
          <div className="flex max-w-3xl flex-wrap gap-2">
            {/* Search */}
            <div className="relative min-w-48 flex-1">
              <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input
                name="q"
                defaultValue={query}
                placeholder="Search courses…"
                className="pl-9"
              />
            </div>

            {/* Filter */}
            <select
              name="filter"
              defaultValue={filter}
              className="border-input bg-background text-foreground focus:ring-ring rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1"
            >
              <option value="all">All courses</option>
              <option value="free">Free only</option>
              <option value="paid">Paid only</option>
            </select>

            {/* Sort */}
            <select
              name="sort"
              defaultValue={sort}
              className="border-input bg-background text-foreground focus:ring-ring rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1"
            >
              <option value="newest">Newest first</option>
              <option value="popular">Most popular</option>
            </select>

            <Button type="submit" variant="secondary">
              <SlidersHorizontal className="size-4" />
              Apply
            </Button>

            {isFiltered && (
              <Button asChild variant="ghost" size="icon" title="Clear all">
                <Link href="/courses">
                  <X className="size-4" />
                </Link>
              </Button>
            )}
          </div>
        </form>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-xs">Filters:</span>
            {filter !== 'all' && (
              <Link
                href={buildCatalogUrl(current, { filter: 'all' })}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/70 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors"
              >
                {filter === 'free' ? 'Free' : 'Paid'}
                <X className="size-2.5" />
              </Link>
            )}
            {sort !== 'newest' && (
              <Link
                href={buildCatalogUrl(current, { sort: 'newest' })}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/70 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors"
              >
                Most popular
                <X className="size-2.5" />
              </Link>
            )}
          </div>
        )}

        {/* Result summary */}
        {isFiltered && (
          <p className="text-muted-foreground text-sm">
            {count === 0
              ? 'No courses found'
              : `${count} course${count !== 1 ? 's' : ''}`}
            {query.length > 0 && ` matching "${query}"`}
          </p>
        )}
      </div>

      <CourseGrid courses={courses} />
    </div>
  )
}
