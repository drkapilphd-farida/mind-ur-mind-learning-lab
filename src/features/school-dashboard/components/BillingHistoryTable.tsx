import { Receipt } from 'lucide-react'
import { BILLING_EVENT_LABELS, formatBillingAmount } from '../billing'
import type { BillingEventRow } from '../queries/getTenantDetail'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type BillingHistoryTableProps = {
  events: readonly BillingEventRow[]
}

// Shared by the master-admin tenant drill-down and both portal billing
// pages — the same read-only "what happened, when, for how much" view,
// sourced from school_billing_events (one row per webhook event).
export function BillingHistoryTable({ events }: BillingHistoryTableProps): React.JSX.Element {
  if (events.length === 0) {
    return (
      <div className="bg-card rounded-xl border p-10 text-center">
        <Receipt className="text-muted-foreground/30 mx-auto mb-4 size-10" />
        <p className="text-muted-foreground text-sm">No billing activity yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-card overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Event</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="text-muted-foreground">{new Date(event.occurredAt).toLocaleString()}</TableCell>
              <TableCell>{BILLING_EVENT_LABELS[event.eventType]}</TableCell>
              <TableCell className="text-right tabular-nums">{formatBillingAmount(event.amountCents, event.currency)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
