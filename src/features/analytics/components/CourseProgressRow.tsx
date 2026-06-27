import Link from 'next/link'
import { Award, ChevronRight, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type CourseProgressRowProps = {
  course: {
    id: string
    title: string
    slug: string
  }
  totalLessons: number
  completedLessons: number
  lastActivityLabel: string | null
  nextLessonSlug: string | null
  certificateToken: string | null
}

export function CourseProgressRow({
  course,
  totalLessons,
  completedLessons,
  lastActivityLabel,
  nextLessonSlug,
  certificateToken,
}: CourseProgressRowProps): React.JSX.Element {
  const pct =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
  const isFinished = completedLessons === totalLessons && totalLessons > 0
  const isStarted = completedLessons > 0

  const continueHref =
    !isFinished && nextLessonSlug !== null
      ? `/courses/${course.slug}/lessons/${nextLessonSlug}`
      : `/courses/${course.slug}`

  return (
    <div className="bg-card rounded-xl border p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-medium">{course.title}</h3>
            {isFinished ? (
              <Badge
                variant="secondary"
                className="shrink-0 gap-1 text-green-700"
              >
                <CheckCircle2 className="size-3" />
                Finished
              </Badge>
            ) : isStarted ? (
              <Badge variant="secondary" className="shrink-0 text-blue-700">
                In progress
              </Badge>
            ) : (
              <Badge variant="outline" className="shrink-0">
                Not started
              </Badge>
            )}
          </div>

          <p className="text-muted-foreground mt-1 text-xs">
            {totalLessons > 0
              ? `${completedLessons} of ${totalLessons} lesson${totalLessons !== 1 ? 's' : ''} · ${pct}%`
              : 'No lessons published yet'}
            {lastActivityLabel !== null && (
              <> · Last active: {lastActivityLabel}</>
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {isFinished && certificateToken !== null && (
            <Button asChild size="sm" variant="ghost">
              <Link href={`/certificates/${certificateToken}`}>
                <Award className="size-3.5" />
                Certificate
              </Link>
            </Button>
          )}
          <Button asChild size="sm" variant="ghost" className="shrink-0">
            <Link href={continueHref}>
              {isFinished ? 'Review' : isStarted ? 'Continue' : 'Start'}
              <ChevronRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {totalLessons > 0 && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-1.5 rounded-full bg-primary transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  )
}
