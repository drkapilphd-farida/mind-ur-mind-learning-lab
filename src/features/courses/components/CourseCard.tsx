import Image from 'next/image'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Course } from '../types'

type CourseCardProps = {
  course: Course
}

export function CourseCard({ course }: CourseCardProps): React.JSX.Element {
  return (
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      {/* Thumbnail */}
      <div className="bg-muted relative aspect-video overflow-hidden">
        {course.thumbnail_url !== null ? (
          <Image
            src={course.thumbnail_url}
            alt={course.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="text-muted-foreground/30 size-12" />
          </div>
        )}
      </div>

      <CardHeader className="flex-1">
        <CardTitle className="line-clamp-2 text-base">{course.title}</CardTitle>
        {course.description !== null && (
          <CardDescription className="line-clamp-3">{course.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent>
        <Link
          href={`/courses/${course.slug}`}
          className="text-primary text-sm font-medium hover:underline"
        >
          View course →
        </Link>
      </CardContent>
    </Card>
  )
}
