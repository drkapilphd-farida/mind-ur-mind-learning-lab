import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { getTenantDetail } from '@/features/school-dashboard/queries/getTenantDetail'
import { TenantLimitsForm } from '@/features/school-dashboard/components/TenantLimitsForm'
import { TENANT_COPY } from '@/features/school-dashboard/tenantCopy'
import { SCHOOL_TIER_LABELS } from '@/features/school-dashboard/types'
import { SUBSCRIPTION_STATUS_BADGE } from '@/features/school-dashboard/subscriptionStatus'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type TenantDetailPageProps = {
  params: Promise<{ tenantId: string }>
}

export async function generateMetadata({ params }: TenantDetailPageProps): Promise<Metadata> {
  const { tenantId } = await params
  const detail = await getTenantDetail(tenantId)
  return { title: detail ? `${detail.school.name} — Admin` : 'Tenant Not Found' }
}

// One canonical detail route for either tenant type (reads the row's
// own `type` and uses TENANT_COPY for terminology) — linked from both
// /admin/schools and /admin/partners rows, avoiding a schools/[id] vs
// partners/[id] split for what's the same underlying table and page.
export default async function TenantDetailPage({ params }: TenantDetailPageProps): Promise<React.JSX.Element> {
  const { tenantId } = await params
  const detail = await getTenantDetail(tenantId)

  if (!detail) {
    notFound()
  }

  const { school, ownerEmail, aiUsageThisMonth, subscriptionStatus, students } = detail
  const copy = TENANT_COPY[school.type]
  const listHref = school.type === 'franchise_partner' ? '/admin/partners' : '/admin/schools'
  const subscriptionBadge = SUBSCRIPTION_STATUS_BADGE[subscriptionStatus]

  return (
    <div className="space-y-8">
      <div>
        <Link href={listHref} className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm transition-colors">
          <ChevronLeft className="size-4" />
          Back to {copy.entityLabelLower}s
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{school.name}</h1>
          <Badge variant="outline">{copy.entityLabel}</Badge>
          <Badge variant="secondary">{SCHOOL_TIER_LABELS[school.tier]}</Badge>
          <StatusBadge status={subscriptionBadge.status} label={subscriptionBadge.label} />
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          /{school.slug} · Owned by {ownerEmail ?? 'unknown'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-card rounded-xl border p-5">
          <p className="text-3xl font-bold tabular-nums">
            {students.length} / {school.maxStudents}
          </p>
          <p className="text-muted-foreground mt-1 text-sm">Seats used</p>
        </div>
        <div className="bg-card rounded-xl border p-5">
          <p className="text-3xl font-bold tabular-nums">
            {aiUsageThisMonth} / {school.monthlyAiQuota}
          </p>
          <p className="text-muted-foreground mt-1 text-sm">AI documents this month</p>
        </div>
        <div className="bg-card rounded-xl border p-5">
          <p className="text-3xl font-bold tabular-nums">{school.expiresAt ? new Date(school.expiresAt).toLocaleDateString() : '—'}</p>
          <p className="text-muted-foreground mt-1 text-sm">Subscription expires</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Master admin controls</h2>
        <div className="max-w-sm">
          <TenantLimitsForm schoolId={school.id} maxStudents={school.maxStudents} monthlyAiQuota={school.monthlyAiQuota} expiresAt={school.expiresAt} />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Students ({students.length})</h2>
        {students.length === 0 ? (
          <div className="bg-card rounded-xl border p-10 text-center">
            <p className="text-muted-foreground text-sm">No students enrolled yet.</p>
          </div>
        ) : (
          <div className="bg-card overflow-x-auto rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Roll number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">AI documents processed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.schoolMemberId}>
                    <TableCell className="font-medium">{student.fullName ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{student.username ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{student.rollNumber ?? '—'}</TableCell>
                    <TableCell className="capitalize">{student.status}</TableCell>
                    <TableCell className="text-right tabular-nums">{student.aiDocumentsProcessed}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
