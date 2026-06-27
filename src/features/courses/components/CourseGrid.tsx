import { BookOpen } from 'lucide-react'
import { CourseCard } from './CourseCard'
import type { Course } from '../types'

type CourseGridProps = {
  courses: Course[]
}

export function CourseGrid({ courses }: CourseGridProps): React.JSX.Element {
  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <BookOpen className="text-muted-foreground/30 mb-4 size-12" />
        <p className="text-muted-foreground text-sm">
          No courses available yet. Check back soon!
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  )
}
