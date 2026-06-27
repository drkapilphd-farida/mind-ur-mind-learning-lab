'use server'

import { z } from 'zod'
import { anthropic } from '@/lib/ai/client'
import { createClient } from '@/lib/supabase/server'
import type { ChatResult } from '../types'

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(8000),
})

const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1).max(40),
  lessonTitle: z.string().max(500),
  courseTitle: z.string().max(500),
})

export async function chatWithTutor(input: unknown): Promise<ChatResult> {
  const parsed = ChatRequestSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Invalid request.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Not authenticated.' }

  const { messages, lessonTitle, courseTitle } = parsed.data

  const systemPrompt =
    `You are an AI learning assistant for the course "${courseTitle}". ` +
    `The student is currently on the lesson "${lessonTitle}". ` +
    `Help them understand the material by answering questions clearly and concisely. ` +
    `Keep responses focused and educational. ` +
    `If asked something unrelated, gently redirect to the lesson topic.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    })

    const block = response.content.find((b) => b.type === 'text')
    if (!block) return { success: false, error: 'No response generated.' }
    if (block.type !== 'text') return { success: false, error: 'Unexpected response type.' }

    return { success: true, response: block.text }
  } catch {
    return { success: false, error: 'AI service unavailable. Please try again.' }
  }
}
