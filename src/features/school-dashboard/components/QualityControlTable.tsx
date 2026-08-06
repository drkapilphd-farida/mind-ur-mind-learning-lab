'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { ArrowUpDown, MessageSquareHeart, TriangleAlert } from 'lucide-react'
import { useQueryState, parseAsString, parseAsStringEnum } from 'nuqs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TENANT_COPY } from '../tenantCopy'
import type { SchoolType } from '../types'
import type { QualityControlRow } from '../queries/getQualityControlStats'

type QualityControlTableProps = {
  rows: readonly QualityControlRow[]
}

type SortKey = 'nps' | 'name' | 'responses' | 'average'
type TypeFilter = SchoolType | 'all'

const TYPE_FILTER_OPTIONS: readonly TypeFilter[] = ['all', 'school', 'franchise_partner']

function sortRows(rows: readonly QualityControlRow[], sortBy: SortKey, sortDir: 'asc' | 'desc'): QualityControlRow[] {
  const direction = sortDir === 'asc' ? 1 : -1
  return [...rows].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name) * direction
      case 'responses':
        return (a.responseCount - b.responseCount) * direction
      case 'average':
        return ((a.averageScore ?? -1) - (b.averageScore ?? -1)) * direction
      case 'nps':
      default:
        return (a.nps - b.nps) * direction
    }
  })
}

// Master-admin Quality Control dashboard — receives already-fetched,
// already-computed rows as props (small row set, same "fetch once,
// filter/sort client-side" convention as TenantsTableClient/
// LeaderboardTable). Default sort is NPS ascending — the whole point is
// surfacing low performers first for a quality audit, not requiring the
// admin to know to sort for it.
export function QualityControlTable({ rows }: QualityControlTableProps): React.JSX.Element {
  const [search, setSearch] = useQueryState('q', parseAsString.withDefault(''))
  const [typeFilter, setTypeFilter] = useQueryState('type', parseAsStringEnum<TypeFilter>([...TYPE_FILTER_OPTIONS]).withDefault('all'))
  const [sortBy, setSortBy] = useQueryState('sort', parseAsStringEnum<SortKey>(['nps', 'name', 'responses', 'average']).withDefault('nps'))
  const [sortDir, setSortDir] = useQueryState('dir', parseAsStringEnum<'asc' | 'desc'>(['asc', 'desc']).withDefault('asc'))

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()
    const matching = rows.filter((row) => {
      if (typeFilter !== 'all' && row.type !== typeFilter) return false
      if (query === '') return true
      return row.name.toLowerCase().includes(query) || row.slug.toLowerCase().includes(query)
    })
    return sortRows(matching, sortBy, sortDir)
  }, [rows, search, typeFilter, sortBy, sortDir])

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
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by name or slug"
          value={search}
          onChange={(event) => void setSearch(event.target.value === '' ? null : event.target.value)}
          className="max-w-xs"
        />
        <Select value={typeFilter} onValueChange={(value) => void setTypeFilter(value === 'all' ? null : (value as SchoolType))}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="school">Schools</SelectItem>
            <SelectItem value="franchise_partner">Partners</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredRows.length === 0 ? (
        <div className="bg-card rounded-xl border p-10 text-center">
          <MessageSquareHeart className="text-muted-foreground/30 mx-auto mb-4 size-10" />
          <p className="text-muted-foreground text-sm">{rows.length === 0 ? 'No active tenants yet.' : 'No results match your search/filter.'}</p>
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
                <TableHead>Type</TableHead>
                <TableHead className="text-right">
                  <button type="button" onClick={() => toggleSort('responses')} className="ml-auto flex items-center gap-1 font-medium">
                    Responses
                    <ArrowUpDown className="size-3" />
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  <button type="button" onClick={() => toggleSort('average')} className="ml-auto flex items-center gap-1 font-medium">
                    Avg. score
                    <ArrowUpDown className="size-3" />
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  <button type="button" onClick={() => toggleSort('nps')} className="ml-auto flex items-center gap-1 font-medium">
                    NPS
                    <ArrowUpDown className="size-3" />
                  </button>
                </TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((row) => (
                <TableRow key={row.schoolId} className={row.needsReview ? 'bg-destructive/5 hover:bg-destructive/10' : 'hover:bg-muted/30'}>
                  <TableCell>
                    <Link href={`/admin/tenants/${row.schoolId}`} className="block">
                      <p className="font-medium hover:underline">{row.name}</p>
                      <p className="text-muted-foreground text-xs">/{row.slug}</p>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{TENANT_COPY[row.type].entityLabel}</Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{row.responseCount}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.averageScore ?? '—'}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{row.responseCount > 0 ? row.nps : '—'}</TableCell>
                  <TableCell>
                    {row.needsReview ? (
                      <span className="bg-destructive/10 text-destructive inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium">
                        <TriangleAlert className="size-3.5" />
                        Needs review
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">{row.responseCount === 0 ? 'No data' : 'Healthy'}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
