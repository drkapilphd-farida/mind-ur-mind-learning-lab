import { createClient } from '@/lib/supabase/server'
import type { SchoolClass } from '../types'

// Classes visible to the caller for one school — RLS (classes_select_scoped)
// does the real scoping (admin: all, teacher: assigned only, student:
// their own), this just maps rows to the camelCase shape.
export async function getClassesForUser(schoolId: string): Promise<SchoolClass[]> {
  const supabase = await createClient()

  const { data: rows } = await supabase
    .from('classes')
    .select('id, school_id, name, grade_level, section, created_at, updated_at')
    .eq('school_id', schoolId)
    .order('name', { ascending: true })

  if (!rows) {
    return []
  }

  return rows.map((row) => ({
    id: row.id,
    schoolId: row.school_id,
    name: row.name,
    gradeLevel: row.grade_level,
    section: row.section,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}
