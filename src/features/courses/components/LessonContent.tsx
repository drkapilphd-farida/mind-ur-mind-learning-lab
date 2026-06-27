import { BookOpen } from 'lucide-react'
import type { Lesson } from '../types'

type LessonContentProps = {
  lesson: Lesson
}

function getEmbedUrl(url: string): string {
  const ytId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1]
  if (ytId !== undefined) return `https://www.youtube.com/embed/${ytId}`

  const loomId = url.match(/loom\.com\/share\/([^?\s]+)/)?.[1]
  if (loomId !== undefined) return `https://www.loom.com/embed/${loomId}`

  const vimeoId = url.match(/vimeo\.com\/(\d+)/)?.[1]
  if (vimeoId !== undefined) return `https://player.vimeo.com/video/${vimeoId}`

  return url
}

export function LessonContent({ lesson }: LessonContentProps): React.JSX.Element {
  const isEmbeddable =
    lesson.content_url !== null &&
    (lesson.content_url.includes('youtube.com') ||
      lesson.content_url.includes('youtu.be') ||
      lesson.content_url.includes('loom.com') ||
      lesson.content_url.includes('vimeo.com'))

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{lesson.title}</h1>

      {lesson.content_url !== null && isEmbeddable ? (
        <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
          <iframe
            src={getEmbedUrl(lesson.content_url)}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
      ) : lesson.content_url !== null ? (
        <div className="rounded-xl border p-4 text-sm">
          <a
            href={lesson.content_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Open lesson resource →
          </a>
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-xl border-2 border-dashed bg-muted/50">
          <div className="text-center">
            <BookOpen className="text-muted-foreground/30 mx-auto mb-3 size-10" />
            <p className="text-muted-foreground text-sm">
              Lesson content coming soon.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
