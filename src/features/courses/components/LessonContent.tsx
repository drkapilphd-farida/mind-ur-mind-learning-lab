'use client'

import Markdown from 'react-markdown'
import type { Components } from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import { BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
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

const mdComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mb-4 mt-8 text-2xl font-bold tracking-tight first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-3 mt-7 text-xl font-semibold tracking-tight">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-5 text-base font-semibold">{children}</h3>
  ),
  p: ({ children }) => <p className="mb-4 leading-7">{children}</p>,
  ul: ({ children }) => (
    <ul className="mb-4 list-disc space-y-1 pl-6">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 list-decimal space-y-1 pl-6">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-7">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="mb-4 border-l-4 border-muted-foreground/30 pl-4 italic text-muted-foreground">
      {children}
    </blockquote>
  ),
  pre: ({ children }) => (
    <pre className="mb-4 overflow-x-auto rounded-lg bg-muted p-4 text-sm leading-relaxed">
      {children}
    </pre>
  ),
  code: ({ children, className }) => (
    <code
      className={cn(
        'font-mono text-sm',
        !className && 'rounded bg-muted px-1 py-0.5',
      )}
    >
      {children}
    </code>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-4 hover:opacity-80"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  hr: () => <hr className="my-6 border-border" />,
}

export function LessonContent({ lesson }: LessonContentProps): React.JSX.Element {
  const contentUrl = lesson.content_url

  const isEmbeddable =
    contentUrl !== null &&
    (contentUrl.includes('youtube.com') ||
      contentUrl.includes('youtu.be') ||
      contentUrl.includes('loom.com') ||
      contentUrl.includes('vimeo.com'))

  const hasBody =
    lesson.content !== null && lesson.content.trim().length > 0

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{lesson.title}</h1>

      {/* Video embed or external link */}
      {contentUrl !== null && (
        isEmbeddable ? (
          <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
            <iframe
              src={getEmbedUrl(contentUrl)}
              title={lesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
        ) : (
          <div className="rounded-xl border p-4 text-sm">
            <a
              href={contentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Open lesson resource →
            </a>
          </div>
        )
      )}

      {/* Markdown body */}
      {hasBody && lesson.content !== null && (
        <div className="text-foreground">
          <Markdown rehypePlugins={[rehypeSanitize]} components={mdComponents}>
            {lesson.content}
          </Markdown>
        </div>
      )}

      {/* Placeholder when no media and no body */}
      {contentUrl === null && !hasBody && (
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
