'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { AuthActionResult } from '@/features/auth/types'

async function verifyAdmin(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return 'Not authenticated.'

  const adminEmails =
    process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim()) ?? []
  if (!adminEmails.includes(user.email ?? '')) return 'Forbidden.'

  return null
}

const LessonSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(200)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must contain only lowercase letters, numbers, and hyphens',
    ),
  content_url: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  content: z.string().max(50_000).optional(),
  duration_seconds: z.number().int().min(0).max(86400).default(0),
  sort_order: z.number().int().min(0).default(0),
  is_published: z.boolean().default(false),
})

export async function createLesson(
  courseId: string,
  input: unknown,
): Promise<AuthActionResult> {
  const adminError = await verifyAdmin()
  if (adminError) return { success: false, error: adminError }

  const parsed = LessonSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }

  const { content_url, content, ...rest } = parsed.data
  const supabase = await createClient()

  const { error } = await supabase.from('lessons').insert({
    ...rest,
    course_id: courseId,
    content_url: content_url !== '' && content_url !== undefined ? content_url : null,
    content: content !== undefined && content.trim() !== '' ? content : null,
  })

  if (error) {
    if (error.code === '23505') return { success: false, error: 'A lesson with this slug already exists in this course.' }
    return { success: false, error: 'Failed to create lesson.' }
  }

  revalidatePath(`/admin/courses/${courseId}/lessons`)
  return { success: true }
}

export async function updateLesson(
  lessonId: string,
  courseId: string,
  input: unknown,
): Promise<AuthActionResult> {
  const adminError = await verifyAdmin()
  if (adminError) return { success: false, error: adminError }

  const parsed = LessonSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }

  const { content_url, content, ...rest } = parsed.data
  const supabase = await createClient()

  const { error } = await supabase
    .from('lessons')
    .update({
      ...rest,
      content_url: content_url !== '' && content_url !== undefined ? content_url : null,
      content: content !== undefined && content.trim() !== '' ? content : null,
    })
    .eq('id', lessonId)

  if (error) {
    if (error.code === '23505') return { success: false, error: 'A lesson with this slug already exists in this course.' }
    return { success: false, error: 'Failed to update lesson.' }
  }

  revalidatePath(`/admin/courses/${courseId}/lessons`)
  return { success: true }
}

export async function toggleLessonPublished(
  lessonId: string,
  courseId: string,
): Promise<AuthActionResult> {
  const adminError = await verifyAdmin()
  if (adminError) return { success: false, error: adminError }

  const supabase = await createClient()

  const { data: lesson } = await supabase
    .from('lessons')
    .select('is_published')
    .eq('id', lessonId)
    .single()

  if (!lesson) return { success: false, error: 'Lesson not found.' }

  const { error } = await supabase
    .from('lessons')
    .update({ is_published: !lesson.is_published })
    .eq('id', lessonId)

  if (error) return { success: false, error: 'Failed to update lesson.' }

  revalidatePath(`/admin/courses/${courseId}/lessons`)
  return { success: true }
}

export async function deleteLesson(
  lessonId: string,
  courseId: string,
): Promise<AuthActionResult> {
  const adminError = await verifyAdmin()
  if (adminError) return { success: false, error: adminError }

  const supabase = await createClient()

  const { error } = await supabase.from('lessons').delete().eq('id', lessonId)

  if (error) return { success: false, error: 'Failed to delete lesson.' }

  revalidatePath(`/admin/courses/${courseId}/lessons`)
  return { success: true }
}
