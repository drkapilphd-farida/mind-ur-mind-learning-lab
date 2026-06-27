'use client'

import { useState } from 'react'
import { BookOpen, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AiTutorChat } from '@/features/ai-tutor/components/AiTutorChat'

type Tab = 'lessons' | 'ai'

type LessonRightPanelProps = {
  sidebar: React.ReactNode
  lessonTitle: string
  courseTitle: string
}

export function LessonRightPanel({
  sidebar,
  lessonTitle,
  courseTitle,
}: LessonRightPanelProps): React.JSX.Element {
  const [tab, setTab] = useState<Tab>('lessons')

  return (
    <aside className="bg-card hidden w-72 shrink-0 flex-col border-l lg:flex">
      {/* Tab header */}
      <div className="flex shrink-0 border-b">
        <button
          type="button"
          onClick={() => setTab('lessons')}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors',
            tab === 'lessons'
              ? 'border-b-2 border-primary text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <BookOpen className="size-3.5" />
          Lessons
        </button>
        <button
          type="button"
          onClick={() => setTab('ai')}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors',
            tab === 'ai'
              ? 'border-b-2 border-primary text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Bot className="size-3.5" />
          Ask AI
        </button>
      </div>

      {/* Panel content — flex-1 + overflow-hidden so children can scroll */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {tab === 'lessons' ? (
          sidebar
        ) : (
          <AiTutorChat lessonTitle={lessonTitle} courseTitle={courseTitle} />
        )}
      </div>
    </aside>
  )
}
