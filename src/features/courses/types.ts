import type { Tables } from '@/lib/supabase/types'

export type Course = Tables<'courses'>
export type Lesson = Tables<'lessons'>
export type Enrollment = Tables<'enrollments'>

export function formatDuration(seconds: number): string {
  if (seconds === 0) return ''
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rem = minutes % 60
  return rem > 0 ? `${hours}h ${rem}min` : `${hours}h`
}
