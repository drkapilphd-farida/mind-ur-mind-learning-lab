'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { ArrowUpDown, Building2, Plus } from 'lucide-react'
import { useQueryState, parseAsString, parseAsStringEnum } from 'nuqs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge } from '@/components/ui/status-badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SCHOOL_TIER_LABELS, type SchoolStatus, type SchoolTier, type SchoolType } from '../types'
import { SUBSCRIPTION_STATUS_BADGE } from '../subscriptionStatus'
import { TENANT_COPY } from '../tenantCopy'
import type { TenantOverviewRow } from '../queries/getTenantsOverviewRows'

type TenantsTableClientProps = {
  type: SchoolType
  newHref: string
  rows: readonly TenantOverviewRow[]
}

type SortKey = 'name' | 'students' | 'aiUsage' | 'subscription'

const STATUS_FILTER_OPTIONS: readonly (SchoolStatus | 'all')[] = ['all', 'active', 'suspended', 'archived']
const TIER_FILTER_OPTIONS: readonly (SchoolTier | 'all')[] = ['all', 'tier_50', 'tier_100', 'tier_200', 'tier_500_plus']

function sortRows(rows: readonly TenantOverviewRow[], sortBy: SortKey, sortDir: 'asc' | 'desc'): TenantOverviewRow[] {
  const direction = sortDir === 'asc' ? 1 : -1
  const sorted = [...rows].sort((a, b) => {
    switch (sortBy) {
      case 'students':
        return (a.studentCount - b.studentCount) * direction
      case 'aiUsage':
        return (a.aiUsageThisMonth - b.aiUsageThisMonth) * direction
      case 'subscription':
        return a.subscriptionStatus.localeCompare(b.subscriptionStatus) * direction
      case 'name':
      default:
        return a.name.localeCompare(b.name) * direction
    }
  })
  return sorted
}

// The interactive half of TenantsTable.tsx — receives already-fetched,
// already-safe rows as props (never touches the service-role client
// itself). Filtering/sorting happens client-side over this small,
// already-fetched row set (this app's real tenant count is tens, not
// thousands) rather than a server round-trip per keystroke — search/
// filter/sort state still lives in the URL via nuqs, per the
// constitution's own convention, it just doesn't trigger a refetch.
export function TenantsTableClient({ type, newHref, rows }: TenantsTableClientProps): React.JSX.Element {
  const copy = TENANT_COPY[type]

  const [search, setSearch] = useQueryState('q', parseAsString.withDefault(''))
  const [statusFilter, setStatusFilter] = useQueryState('status', parseAsStringEnum<SchoolStatus | 'all'>([...STATUS_FILTER_OPTIONS]).withDefault('all'))
  const [tierFilter, setTierFilter] = useQueryState('tier', parseAsStringEnum<SchoolTier | 'all'>([...TIER_FILTER_OPTIONS]).withDefault('all'))
  const [sortBy, setSortBy] = useQueryState('sort', parseAsStringEnum<SortKey>(['name', 'students', 'aiUsage', 'subscription']).withDefault('name'))
  const [sortDir, setSortDir] = useQueryState('dir', parseAsStringEnum<'asc' | 'desc'>(['asc', 'desc']).withDefault('asc'))

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()
    const matching = rows.filter((row) => {
      if (statusFilter !== 'all' && row.status !== statusFilter) return false
      if (tierFilter !== 'all' && row.tier !== tierFilter) return false
      if (query === '') return true
      return row.name.toLowerCase().includes(query) || row.slug.toLowerCase().includes(query) || (row.ownerEmail ?? '').toLowerCase().includes(query)
    })
    return sortRows(matching, sortBy, sortDir)
  }, [rows, search, statusFilter, tierFilter, sortBy, sortDir])

  function toggleSort(key: SortKey): void {
    if (sortBy === key) {
      void setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      void setSortBy(key)
      void setSortDir('asc')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{copy.entityLabel}s</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {filteredRows.length} of {rows.length} {copy.entityLabelLower}
            {rows.length !== 1 ? 's' : ''} shown
          </p>
        </div>
        <Button asChild>
          <Link href={newHref}>
            <Plus className="size-4" />
            New {copy.entityLabelLower}
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by name, slug, or owner email"
          value={search}
          onChange={(event) => void setSearch(event.target.value === '' ? null : event.target.value)}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={(value) => void setStatusFilter(value === 'all' ? null : (value as SchoolStatus))}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option === 'all' ? 'All statuses' : option.charAt(0).toUpperCase() + option.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={tierFilter} onValueChange={(value) => void setTierFilter(value === 'all' ? null : (value as SchoolTier))}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tiers</SelectItem>
            {TIER_FILTER_OPTIONS.filter((option) => option !== 'all').map((option) => (
              <SelectItem key={option} value={option}>
                {SCHOOL_TIER_LABELS[option as SchoolTier]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredRows.length === 0 ? (
        <div className="bg-card rounded-xl border p-10 text-center">
          <Building2 className="text-muted-foreground/30 mx-auto mb-4 size-10" />
          <p className="text-muted-foreground text-sm">
            {rows.length === 0 ? (
              <>
                No {copy.entityLabelLower}s yet.{' '}
                <Link href={newHref} className="text-foreground hover:underline">
                  Create the first one.
                </Link>
              </>
            ) : (
              'No results match your search/filters.'
            )}
          </p>
        </div>
      ) : (
        <div className="bg-card overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button type="button" onClick={() => toggleSort('name')} className="flex items-center gap-1 font-medium">
                    Name / Slug
                    <ArrowUpDown className="size-3" />
                  </button>
                </TableHead>
                <TableHead>Owner email</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead className="text-right">
                  <button type="button" onClick={() => toggleSort('students')} className="ml-auto flex items-center gap-1 font-medium">
                    Students
                    <ArrowUpDown className="size-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button type="button" onClick={() => toggleSort('subscription')} className="flex items-center gap-1 font-medium">
                    Subscription
                    <ArrowUpDown className="size-3" />
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  <button type="button" onClick={() => toggleSort('aiUsage')} className="ml-auto flex items-center gap-1 font-medium">
                    AI Usage
                    <ArrowUpDown className="size-3" />
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((row) => {
                const badge = SUBSCRIPTION_STATUS_BADGE[row.subscriptionStatus]
                return (
                  <TableRow key={row.id} className="hover:bg-muted/30">
                    <TableCell>
                      <Link href={`/admin/tenants/${row.id}`} className="block">
                        <p className="font-medium hover:underline">{row.name}</p>
                        <p className="text-muted-foreground text-xs">/{row.slug}</p>
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{row.ownerEmail ?? '—'}</TableCell>
                    <TableCell>{SCHOOL_TIER_LABELS[row.tier]}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.studentCount} / {row.maxStudents}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={badge.status} label={badge.label} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.aiUsageThisMonth} / {row.monthlyAiQuota}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
