'use server'

import { createClient } from '@/lib/supabase/server'
import type { AuthActionResult } from '@/features/auth/types'

export async function enrollInCourse(courseId: string): Promise<AuthActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'You must be signed in to enroll.' }
  }

  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('id', courseId)
    .eq('is_published', true)
    .single()

  if (!course) {
    return { success: false, error: 'Course not found.' }
  }

  const { error } = await supabase
    .from('enrollments')
    .insert({ user_id: user.id, course_id: courseId })

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'You are already enrolled in this course.' }
    }
    return { success: false, error: 'Failed to enroll. Please try again.' }
  }

  return { success: true }
}
