import type { Metadata } from 'next'
import { Search, X } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CourseGrid } from '@/features/courses/components/CourseGrid'

export const metadata: Metadata = {
  title: 'Course Catalog',
  description: 'Browse AI-powered learning courses.',
}

type CoursesPageProps = {
  searchParams: Promise<{ q?: string | undefined }>
}

export default async function CoursesPage({
  searchParams,
}: CoursesPageProps): Promise<React.JSX.Element> {
  const { q } = await searchParams
  const query = q?.trim() ?? ''

  const supabase = await createClient()

  let dbQuery = supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (query.length > 0) {
    dbQuery = dbQuery.ilike('title', `%${query}%`)
  }

  const { data: courses } = await dbQuery

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Course Catalog</h1>
          <p className="text-muted-foreground">
            Explore our AI-powered learning courses.
          </p>
        </div>

        {/* Search form — works without JS */}
        <form method="GET" action="/courses" className="flex max-w-md gap-2">
          <div className="relative flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              name="q"
              defaultValue={query}
              placeholder="Search courses…"
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
          {query.length > 0 && (
            <Button asChild variant="ghost" size="icon" title="Clear search">
              <Link href="/courses">
                <X className="size-4" />
              </Link>
            </Button>
          )}
        </form>

        {query.length > 0 && (
          <p className="text-muted-foreground text-sm">
            {(courses ?? []).length === 0
              ? `No courses found for "${query}"`
              : `${(courses ?? []).length} result${(courses ?? []).length === 1 ? '' : 's'} for "${query}"`}
          </p>
        )}
      </div>

      <CourseGrid courses={courses ?? []} />
    </div>
  )
}
