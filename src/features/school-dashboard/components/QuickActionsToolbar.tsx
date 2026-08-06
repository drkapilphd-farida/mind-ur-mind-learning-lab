'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Coins, Download, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { TENANT_COPY } from '../tenantCopy'
import type { TenantOverviewRow } from '../queries/getTenantsOverviewRows'

type QuickActionsToolbarProps = {
  tenants: readonly TenantOverviewRow[]
}

const CSV_COLUMNS = [
  'Name',
  'Slug',
  'Type',
  'Owner Email',
  'Tier',
  'Students',
  'Max Students',
  'AI Usage This Month',
  'Monthly AI Quota',
  'Subscription Status',
] as const

function escapeCsvField(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

function buildCsv(tenants: readonly TenantOverviewRow[]): string {
  const rows = tenants.map((tenant) =>
    [
      tenant.name,
      tenant.slug,
      TENANT_COPY[tenant.type].entityLabel,
      tenant.ownerEmail ?? '',
      tenant.tier,
      String(tenant.studentCount),
      String(tenant.maxStudents),
      String(tenant.aiUsageThisMonth),
      String(tenant.monthlyAiQuota),
      tenant.subscriptionStatus,
    ]
      .map(escapeCsvField)
      .join(','),
  )
  return [CSV_COLUMNS.join(','), ...rows].join('\n')
}

function downloadCsv(csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `quantum-mind-tenants-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

// Receives the already-fetched, already-safe tenant list as a prop from
// the Server Component overview page — never fetches with a privileged
// client itself. Export and the credit-allocation search both operate
// on this same in-memory list, so neither needs its own round trip.
export function QuickActionsToolbar({ tenants }: QuickActionsToolbarProps): React.JSX.Element {
  const [creditDialogOpen, setCreditDialogOpen] = useState(false)
  const [search, setSearch] = useState('')

  // A full navigation (not next/navigation's router.push) — confirmed
  // live, repeatedly, that a client-side router.push() fired from a
  // button inside this Radix Dialog issues the RSC request correctly
  // but the router never commits the URL change (the request completes,
  // the dialog's own state is unaffected either way, yet the address
  // bar and rendered page both stay on /admin) — a real, reproducible
  // interaction bug between this Dialog and the App Router's client
  // transition, not a one-off flake. window.location.href sidesteps it
  // entirely with a guaranteed-correct full page load; this is an
  // infrequent admin action, not a hot path, so the lost SPA-transition
  // smoothness is a fully acceptable trade for actually working.
  function goToTenant(tenantId: string): void {
    window.location.href = `/admin/tenants/${tenantId}`
  }

  const filteredTenants = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (query === '') return tenants
    return tenants.filter((tenant) => tenant.name.toLowerCase().includes(query) || tenant.slug.toLowerCase().includes(query))
  }, [tenants, search])

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button asChild size="sm">
        <Link href="/admin/schools/new">
          <Plus className="size-4" />
          Add New School
        </Link>
      </Button>
      <Button variant="outline" size="sm" onClick={() => downloadCsv(buildCsv(tenants))}>
        <Download className="size-4" />
        Export Analytics
      </Button>
      <Button variant="outline" size="sm" onClick={() => setCreditDialogOpen(true)}>
        <Coins className="size-4" />
        Allocate Credits
      </Button>

      <Dialog open={creditDialogOpen} onOpenChange={setCreditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Allocate credits</DialogTitle>
            <DialogDescription>Find a school or partner to open their seat limit, AI quota, and subscription controls.</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              autoFocus
              placeholder="Search by name or slug…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>
          <div className="max-h-72 space-y-1 overflow-y-auto">
            {filteredTenants.length === 0 ? (
              <p className="text-muted-foreground px-1 py-4 text-center text-sm">No matches.</p>
            ) : (
              filteredTenants.map((tenant) => (
                <button
                  key={tenant.id}
                  type="button"
                  onClick={() => goToTenant(tenant.id)}
                  className="hover:bg-muted/60 flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors"
                >
                  <span>
                    <span className="font-medium">{tenant.name}</span>
                    <span className="text-muted-foreground ml-2 text-xs">/{tenant.slug}</span>
                  </span>
                  <Badge variant="outline">{TENANT_COPY[tenant.type].entityLabel}</Badge>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
