'use client'

import { useEffect, useRef, useTransition, useState } from 'react'
import { Send, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { chatWithTutor } from '../actions/chat'
import type { ChatMessage } from '../types'

type AiTutorChatProps = {
  lessonTitle: string
  courseTitle: string
}

export function AiTutorChat({
  lessonTitle,
  courseTitle,
}: AiTutorChatProps): React.JSX.Element {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isPending, startTransition] = useTransition()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isPending])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isPending) return

    const userMessage: ChatMessage = { role: 'user', content: trimmed }
    const next = [...messages, userMessage]
    setMessages(next)
    setInput('')

    startTransition(async () => {
      const result = await chatWithTutor({ messages: next, lessonTitle, courseTitle })
      if (!result.success) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Sorry, something went wrong: ${result.error}` },
        ])
        return
      }
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: result.response },
      ])
    })
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-3">
        {messages.length === 0 && !isPending && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Bot className="text-muted-foreground/30 mx-auto mb-2 size-8" />
            <p className="text-muted-foreground text-xs leading-relaxed">
              Ask me anything about this lesson.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              'rounded-lg px-3 py-2 text-sm leading-relaxed',
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground ml-6'
                : 'bg-muted text-foreground mr-6',
            )}
          >
            <p className="whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}

        {isPending && (
          <div className="bg-muted text-muted-foreground mr-6 rounded-lg px-3 py-2 text-sm">
            Thinking…
          </div>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 border-t p-3">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question…"
            disabled={isPending}
            className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex-1 rounded-md border px-3 py-1.5 text-sm outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isPending || input.trim().length === 0}
            className="shrink-0"
          >
            <Send className="size-3.5" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
