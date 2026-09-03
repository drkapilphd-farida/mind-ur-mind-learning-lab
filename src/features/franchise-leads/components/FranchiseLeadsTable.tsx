'use client'

import { useState, useTransition } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { updateFranchiseLeadStatus, type FranchiseLeadStatus } from '../actions/updateFranchiseLeadStatus'
import type { FranchiseLeadRow } from '../queries/getFranchiseLeads'

const STATUS_OPTIONS: { value: FranchiseLeadStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

const STATUS_TEXT_CLASS: Record<FranchiseLeadStatus, string> = {
  new: 'text-foreground',
  contacted: 'text-warning',
  approved: 'text-success',
  rejected: 'text-destructive',
}

function formatSubmittedAt(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

// Status changes are optimistic (updated in local state immediately) and
// rolled back if the Server Action reports failure — approving/rejecting
// this table does NOT create a tenant row; that's still a manual step
// through /admin/partners/new, per the site owner's explicit
// instruction (see updateFranchiseLeadStatus.ts).
export function FranchiseLeadsTable({ rows }: { rows: FranchiseLeadRow[] }): React.JSX.Element {
  const [leads, setLeads] = useState(rows)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleStatusChange(id: string, nextStatus: FranchiseLeadStatus): void {
    const previous = leads
    setLeads((current) => current.map((lead) => (lead.id === id ? { ...lead, status: nextStatus } : lead)))
    setPendingId(id)

    startTransition(async () => {
      const result = await updateFranchiseLeadStatus({ id, status: nextStatus })
      if (!result.success) {
        setLeads(previous)
      }
      setPendingId(null)
    })
  }

  if (leads.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        No franchise applications yet.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Background</TableHead>
            <TableHead>Why Interested</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell className="font-medium">{lead.name}</TableCell>
              <TableCell>{lead.phone}</TableCell>
              <TableCell>{lead.city}</TableCell>
              <TableCell className="max-w-xs truncate text-muted-foreground" title={lead.background ?? undefined}>
                {lead.background ?? '—'}
              </TableCell>
              <TableCell className="max-w-xs truncate text-muted-foreground" title={lead.whyInterested ?? undefined}>
                {lead.whyInterested ?? '—'}
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">{formatSubmittedAt(lead.submittedAt)}</TableCell>
              <TableCell>
                <Select
                  value={lead.status}
                  disabled={isPending && pendingId === lead.id}
                  onValueChange={(value) => handleStatusChange(lead.id, value as FranchiseLeadStatus)}
                >
                  <SelectTrigger size="sm" className={cn('w-[130px] font-medium', STATUS_TEXT_CLASS[lead.status])}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
