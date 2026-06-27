import Image from 'next/image'
import Link from 'next/link'
import { BookOpen, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type CourseProgressCardProps = {
  course: {
    id: string
    title: string
    slug: string
    thumbnail_url: string | null
  }
  totalLessons: number
  completedLessons: number
  nextLessonSlug: string | null
}

export function CourseProgressCard({
  course,
  totalLessons,
  completedLessons,
  nextLessonSlug,
}: CourseProgressCardProps): React.JSX.Element {
  const pct =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
  const isComplete = completedLessons === totalLessons && totalLessons > 0

  const continueHref =
    nextLessonSlug !== null
      ? `/courses/${course.slug}/lessons/${nextLessonSlug}`
      : `/courses/${course.slug}`

  return (
    <div className="bg-card flex gap-4 rounded-xl border p-4">
      {/* Thumbnail */}
      <div className="bg-muted relative hidden h-24 w-36 shrink-0 overflow-hidden rounded-lg sm:block">
        {course.thumbnail_url !== null ? (
          <Image
            src={course.thumbnail_url}
            alt={course.title}
            fill
            className="object-cover"
            sizes="144px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="text-muted-foreground/30 size-8" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-start gap-2">
            <h3 className="flex-1 font-semibold leading-snug">{course.title}</h3>
            {isComplete && (
              <Badge
                variant="secondary"
                className="shrink-0 gap-1 text-green-700"
              >
                <CheckCircle2 className="size-3" />
                Complete
              </Badge>
            )}
          </div>

          {totalLessons > 0 ? (
            <p className="text-muted-foreground text-xs">
              {completedLessons} of {totalLessons} lesson
              {totalLessons !== 1 ? 's' : ''} completed
            </p>
          ) : (
            <p className="text-muted-foreground text-xs">No lessons yet</p>
          )}
        </div>

        {/* Progress bar */}
        {totalLessons > 0 && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-1.5 rounded-full bg-primary transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs font-medium">
            {totalLessons > 0 ? `${pct}%` : '—'}
          </span>
          <Button asChild size="sm" variant={isComplete ? 'outline' : 'default'}>
            <Link href={continueHref}>
              {isComplete ? 'Review course' : 'Continue learning'}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
