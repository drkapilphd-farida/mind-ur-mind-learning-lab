import Link from 'next/link'
import { CheckCircle, Circle, PlayCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDuration } from '../types'

type LessonSummary = {
  id: string
  title: string
  slug: string
  duration_seconds: number
  sort_order: number
}

type LessonSidebarProps = {
  courseTitle: string
  courseSlug: string
  lessons: LessonSummary[]
  currentLessonId: string
  completedIds: string[]
}

export function LessonSidebar({
  courseTitle,
  courseSlug,
  lessons,
  currentLessonId,
  completedIds,
}: LessonSidebarProps): React.JSX.Element {
  const completedSet = new Set(completedIds)

  return (
    <aside className="bg-card hidden w-72 shrink-0 flex-col overflow-y-auto border-l lg:flex">
      <div className="shrink-0 border-b p-4">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          Course
        </p>
        <p className="mt-1 text-sm font-semibold">{courseTitle}</p>
        <p className="text-muted-foreground mt-0.5 text-xs">
          {completedSet.size} / {lessons.length} completed
        </p>
      </div>

      <nav className="flex-1 p-2">
        {lessons.map((lesson, index) => {
          const isActive = lesson.id === currentLessonId
          const isCompleted = completedSet.has(lesson.id)

          const Icon = isCompleted ? CheckCircle : isActive ? PlayCircle : Circle

          return (
            <Link
              key={lesson.id}
              href={`/courses/${courseSlug}/lessons/${lesson.slug}`}
              className={cn(
                'flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon
                className={cn(
                  'mt-0.5 size-4 shrink-0',
                  !isActive && isCompleted && 'text-green-600',
                )}
              />
              <span className="min-w-0 flex-1">
                <span className="block font-medium leading-snug">
                  {index + 1}. {lesson.title}
                </span>
                {lesson.duration_seconds > 0 && (
                  <span className="text-xs opacity-70">
                    {formatDuration(lesson.duration_seconds)}
                  </span>
                )}
              </span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
