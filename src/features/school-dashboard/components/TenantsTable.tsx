import Link from 'next/link'
import { Building2, Plus } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/service'
import { Button } from '@/components/ui/button'
import { SCHOOL_TIER_LABELS, type SchoolTier, type SchoolType } from '../types'
import { TENANT_COPY } from '../tenantCopy'

type TenantsTableProps = {
  type: SchoolType
  newHref: string
}

// Shared by /admin/schools and /admin/partners — same schools table,
// filtered by tenant type, so partners never leak into the schools list
// (or vice versa) even though both live in the same table. Reads via
// createServiceClient() (bypasses RLS), same posture as every other
// master-admin page — access control is the (admin)/layout.tsx
// ADMIN_EMAILS gate above this, not RLS.
export async function TenantsTable({ type, newHref }: TenantsTableProps): Promise<React.JSX.Element> {
  const copy = TENANT_COPY[type]
  const supabase = createServiceClient()

  const { data: schools } = await supabase
    .from('schools')
    .select('id, name, slug, tier, max_students, status, created_at')
    .eq('type', type)
    .order('created_at', { ascending: false })

  const allSchools = schools ?? []
  const schoolIds = allSchools.map((school) => school.id)

  const { data: studentCounts } =
    schoolIds.length === 0
      ? { data: [] }
      : await supabase.from('school_members').select('school_id').eq('role', 'student').eq('status', 'active').in('school_id', schoolIds)

  const studentCountBySchoolId = new Map<string, number>()
  for (const row of studentCounts ?? []) {
    studentCountBySchoolId.set(row.school_id, (studentCountBySchoolId.get(row.school_id) ?? 0) + 1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{copy.entityLabel}s</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {allSchools.length} {copy.entityLabelLower}
            {allSchools.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button asChild>
          <Link href={newHref}>
            <Plus className="size-4" />
            New {copy.entityLabelLower}
          </Link>
        </Button>
      </div>

      {allSchools.length === 0 ? (
        <div className="bg-card rounded-xl border p-10 text-center">
          <Building2 className="text-muted-foreground/30 mx-auto mb-4 size-10" />
          <p className="text-muted-foreground text-sm">
            No {copy.entityLabelLower}s yet.{' '}
            <Link href={newHref} className="text-foreground hover:underline">
              Create the first one.
            </Link>
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-muted-foreground px-4 py-3 text-left font-medium">Name</th>
                <th className="text-muted-foreground px-4 py-3 text-left font-medium">Tier</th>
                <th className="text-muted-foreground px-4 py-3 text-right font-medium">Seats used</th>
                <th className="text-muted-foreground px-4 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {allSchools.map((school) => (
                <tr key={school.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-medium">{school.name}</p>
                    <p className="text-muted-foreground text-xs">/{school.slug}</p>
                  </td>
                  <td className="px-4 py-3">{SCHOOL_TIER_LABELS[school.tier as SchoolTier]}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {studentCountBySchoolId.get(school.id) ?? 0} / {school.max_students}
                  </td>
                  <td className="px-4 py-3 capitalize">{school.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
