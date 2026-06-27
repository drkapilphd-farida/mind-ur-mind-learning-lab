import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { CourseGrid } from '@/features/courses/components/CourseGrid'

export const metadata: Metadata = {
  title: 'Course Catalog',
  description: 'Browse AI-powered learning courses.',
}

export default async function CoursesPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Course Catalog</h1>
        <p className="text-muted-foreground">
          Explore our AI-powered learning courses.
        </p>
      </div>

      <CourseGrid courses={courses ?? []} />
    </div>
  )
}
