'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { ArrowUpDown, Trophy } from 'lucide-react'
import { useQueryState, parseAsString, parseAsStringEnum } from 'nuqs'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RankBadge } from './RankBadge'
import { TENANT_COPY } from '../tenantCopy'
import { SCHOOL_TIER_LABELS, type SchoolType } from '../types'
import type { LeaderboardRow } from '../queries/getLeaderboardRows'

type LeaderboardTableProps = {
  schoolRows: readonly LeaderboardRow[]
  partnerRows: readonly LeaderboardRow[]
}

type SortKey = 'rank' | 'name' | 'students' | 'aiUsage' | 'score'

function sortRows(rows: readonly LeaderboardRow[], sortBy: SortKey, sortDir: 'asc' | 'desc'): LeaderboardRow[] {
  const direction = sortDir === 'asc' ? 1 : -1
  return [...rows].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name) * direction
      case 'students':
        return (a.studentCount - b.studentCount) * direction
      case 'aiUsage':
        return (a.aiUsageThisMonth - b.aiUsageThisMonth) * direction
      case 'score':
        return (a.score - b.score) * direction
      case 'rank':
      default:
        return (a.rank - b.rank) * direction
    }
  })
}

// Client half — receives both tenant types' already-ranked rows as
// props (small row sets, tens not thousands, same "fetch once, filter/
// sort client-side" convention as TenantsTableClient). The Rank badge
// always shows each tenant's true precomputed standing regardless of
// the current sort column, exactly like a sports table can be sorted by
// a stat while each row still shows its real league position.
export function LeaderboardTable({ schoolRows, partnerRows }: LeaderboardTableProps): React.JSX.Element {
  const [type, setType] = useQueryState('type', parseAsStringEnum<SchoolType>(['school', 'franchise_partner']).withDefault('school'))
  const [search, setSearch] = useQueryState('q', parseAsString.withDefault(''))
  const [sortBy, setSortBy] = useQueryState('sort', parseAsStringEnum<SortKey>(['rank', 'name', 'students', 'aiUsage', 'score']).withDefault('rank'))
  const [sortDir, setSortDir] = useQueryState('dir', parseAsStringEnum<'asc' | 'desc'>(['asc', 'desc']).withDefault('asc'))

  const copy = TENANT_COPY[type]
  const rows = type === 'school' ? schoolRows : partnerRows

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()
    const matching = query === '' ? rows : rows.filter((row) => row.name.toLowerCase().includes(query) || row.slug.toLowerCase().includes(query))
    return sortRows(matching, sortBy, sortDir)
  }, [rows, search, sortBy, sortDir])

  function toggleSort(key: SortKey): void {
    if (sortBy === key) {
      void setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      void setSortBy(key)
      void setSortDir(key === 'rank' ? 'asc' : 'desc')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={type} onValueChange={(value) => void setType(value as SchoolType)}>
          <TabsList>
            <TabsTrigger value="school">Schools</TabsTrigger>
            <TabsTrigger value="franchise_partner">Partners</TabsTrigger>
          </TabsList>
        </Tabs>
        <Input
          placeholder={`Search ${copy.entityLabelLower}s`}
          value={search}
          onChange={(event) => void setSearch(event.target.value === '' ? null : event.target.value)}
          className="max-w-xs"
        />
      </div>

      {filteredRows.length === 0 ? (
        <div className="bg-card rounded-xl border p-10 text-center">
          <Trophy className="text-muted-foreground/30 mx-auto mb-4 size-10" />
          <p className="text-muted-foreground text-sm">
            {rows.length === 0 ? `No active ${copy.entityLabelLower}s to rank yet.` : 'No results match your search.'}
          </p>
        </div>
      ) : (
        <div className="bg-card overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button type="button" onClick={() => toggleSort('rank')} className="flex items-center gap-1 font-medium">
                    Rank
                    <ArrowUpDown className="size-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button type="button" onClick={() => toggleSort('name')} className="flex items-center gap-1 font-medium">
                    Name / Slug
                    <ArrowUpDown className="size-3" />
                  </button>
                </TableHead>
                <TableHead>Tier</TableHead>
                <TableHead className="text-right">
                  <button type="button" onClick={() => toggleSort('students')} className="ml-auto flex items-center gap-1 font-medium">
                    Active Students
                    <ArrowUpDown className="size-3" />
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  <button type="button" onClick={() => toggleSort('aiUsage')} className="ml-auto flex items-center gap-1 font-medium">
                    AI Usage (mo.)
                    <ArrowUpDown className="size-3" />
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  <button type="button" onClick={() => toggleSort('score')} className="ml-auto flex items-center gap-1 font-medium">
                    Score
                    <ArrowUpDown className="size-3" />
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((row) => (
                <TableRow key={row.schoolId} className="hover:bg-muted/30">
                  <TableCell>
                    <RankBadge rank={row.rank} rankTier={row.rankTier} />
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/tenants/${row.schoolId}`} className="block">
                      <p className="font-medium hover:underline">{row.name}</p>
                      <p className="text-muted-foreground text-xs">/{row.slug}</p>
                    </Link>
                  </TableCell>
                  <TableCell>{SCHOOL_TIER_LABELS[row.tier]}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.studentCount} / {row.maxStudents}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{row.aiUsageThisMonth}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{row.score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
