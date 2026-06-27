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

const CourseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(200)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must contain only lowercase letters, numbers, and hyphens',
    ),
  description: z.string().max(2000).optional(),
  thumbnail_url: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  is_published: z.boolean().default(false),
  price_cents: z.number().int().min(0),
})

export async function createCourse(input: unknown): Promise<AuthActionResult> {
  const adminError = await verifyAdmin()
  if (adminError) return { success: false, error: adminError }

  const parsed = CourseSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }

  const { description, thumbnail_url, ...rest } = parsed.data
  const supabase = await createClient()

  const { error } = await supabase.from('courses').insert({
    ...rest,
    description: description ?? null,
    thumbnail_url:
      thumbnail_url !== '' && thumbnail_url !== undefined ? thumbnail_url : null,
  })

  if (error) {
    if (error.code === '23505') return { success: false, error: 'A course with this slug already exists.' }
    return { success: false, error: 'Failed to create course.' }
  }

  revalidatePath('/admin/courses')
  return { success: true }
}

export async function updateCourse(
  courseId: string,
  input: unknown,
): Promise<AuthActionResult> {
  const adminError = await verifyAdmin()
  if (adminError) return { success: false, error: adminError }

  const parsed = CourseSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }

  const { description, thumbnail_url, ...rest } = parsed.data
  const supabase = await createClient()

  const { error } = await supabase
    .from('courses')
    .update({
      ...rest,
      description: description ?? null,
      thumbnail_url:
        thumbnail_url !== '' && thumbnail_url !== undefined ? thumbnail_url : null,
    })
    .eq('id', courseId)

  if (error) {
    if (error.code === '23505') return { success: false, error: 'A course with this slug already exists.' }
    return { success: false, error: 'Failed to update course.' }
  }

  revalidatePath('/admin/courses')
  revalidatePath(`/admin/courses/${courseId}/edit`)
  return { success: true }
}

export async function toggleCoursePublished(
  courseId: string,
): Promise<AuthActionResult> {
  const adminError = await verifyAdmin()
  if (adminError) return { success: false, error: adminError }

  const supabase = await createClient()

  const { data: course } = await supabase
    .from('courses')
    .select('is_published')
    .eq('id', courseId)
    .single()

  if (!course) return { success: false, error: 'Course not found.' }

  const { error } = await supabase
    .from('courses')
    .update({ is_published: !course.is_published })
    .eq('id', courseId)

  if (error) return { success: false, error: 'Failed to update course.' }

  revalidatePath('/admin/courses')
  return { success: true }
}

export async function deleteCourse(courseId: string): Promise<AuthActionResult> {
  const adminError = await verifyAdmin()
  if (adminError) return { success: false, error: adminError }

  const supabase = await createClient()

  const { error } = await supabase.from('courses').delete().eq('id', courseId)

  if (error) return { success: false, error: 'Failed to delete course.' }

  revalidatePath('/admin/courses')
  return { success: true }
}
