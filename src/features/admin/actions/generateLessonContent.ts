'use server'

import { z } from 'zod'
import { anthropic } from '@/lib/ai/client'
import { createClient } from '@/lib/supabase/server'

const GenerateSchema = z.object({
  lessonTitle: z.string().min(1).max(200),
  courseTitle: z.string().min(1).max(200),
})

type GenerateResult =
  | { success: true; content: string }
  | { success: false; error: string }

export async function generateLessonContent(input: unknown): Promise<GenerateResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Not authenticated.' }

  const adminEmails =
    process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim()) ?? []
  if (!adminEmails.includes(user.email ?? ''))
    return { success: false, error: 'Forbidden.' }

  const parsed = GenerateSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid input.',
    }
  }

  const { lessonTitle, courseTitle } = parsed.data

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content:
            `Write comprehensive educational content for a lesson titled "${lessonTitle}" ` +
            `from the course "${courseTitle}".\n\n` +
            `Format the content in Markdown with these sections:\n\n` +
            `## Introduction\n` +
            `Brief overview of what the student will learn (2-3 sentences).\n\n` +
            `## Key Concepts\n` +
            `3-5 core concepts with clear explanations. Use ### sub-headings for each concept.\n\n` +
            `## Examples\n` +
            `Practical examples or code snippets that illustrate the concepts.\n\n` +
            `## Summary\n` +
            `3-5 bullet points covering the key takeaways.\n\n` +
            `## Review Questions\n` +
            `2-3 questions to check understanding (no answers).\n\n` +
            `Write for an online learning audience. Be clear, concise, and educational.`,
        },
      ],
    })

    const block = response.content.find((b) => b.type === 'text')
    if (!block || block.type !== 'text') {
      return { success: false, error: 'No content generated.' }
    }

    return { success: true, content: block.text }
  } catch {
    return { success: false, error: 'AI generation failed. Please try again.' }
  }
}
