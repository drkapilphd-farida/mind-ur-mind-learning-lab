'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { devRunLegacyRecovery } from '@/lib/processing/actions/devLegacyRecoveryTools'
import type { LegacyRecoveryOutcome } from '@/lib/processing/recoverLegacyDocumentProcessing'

const OUTCOME_LABEL: Record<LegacyRecoveryOutcome['outcome'], string> = {
  recovered: 'Recovered — handed back to Background Intelligence',
  'already-complete': 'Already complete',
  'previously-failed-mid-pipeline': 'Previously failed mid-pipeline — needs review',
  'no-ulo-nothing-to-recover': 'No content to process — correctly ready',
  'skipped-not-terminal': 'Still genuinely in flight',
  failed: 'Failed',
}

// Reading Intelligence Engine™ Upgrade — Sprint PIPELINE-1: Legacy
// Document Recovery & Background Processing™. The one place a human can
// safely run recovery today without a live cron trigger — real,
// platform-wide (every user's stuck documents, not just the admin's
// own), same real devRunLegacyRecovery() a scheduled cron call would
// otherwise run.
export function DevLegacyRecoveryPanel(): React.JSX.Element {
  const [isPending, startTransition] = useTransition()
  const [outcomes, setOutcomes] = useState<readonly LegacyRecoveryOutcome[] | null>(null)

  function runRecovery(): void {
    startTransition(async () => {
      const result = await devRunLegacyRecovery()
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setOutcomes(result.outcomes)
      const recoveredCount = result.outcomes.filter((o) => o.outcome === 'recovered').length
      toast.success(`Recovery run complete — ${recoveredCount} document(s) recovered.`)
    })
  }

  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <p className="text-xs font-medium text-muted-foreground">
          Scans every document across every account for a missing <code>document_processing_progress</code> row and
          hands genuinely stuck ones back to Background Intelligence. Safe to run repeatedly — already-recovered and
          still-in-flight documents are always skipped.
        </p>

        <Button className="w-full justify-start gap-2" variant="outline" disabled={isPending} onClick={runRecovery}>
          <Wrench className="size-4" />
          Run Legacy Document Recovery
        </Button>

        {outcomes && (
          <ul className="space-y-1 text-xs">
            {outcomes.map((outcome) => (
              <li key={outcome.documentId} className="flex items-center justify-between gap-2">
                <span className="truncate text-muted-foreground">{outcome.documentId}</span>
                <span>{OUTCOME_LABEL[outcome.outcome]}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
