import Link from 'next/link'
import { ArrowRight, IdCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { MindPassportSnapshot } from '../../dna/dnaTypes'

type MindPassportCompactCardProps = {
  snapshot: MindPassportSnapshot | null
  achievementCountFallback: number
}

// Reads Sprint-8's actual persisted Mind Passport snapshot (getMindPassportSnapshot,
// reused read-only) — the real "future page automatically consumes these
// values" integration point Sprint-8 was built for.
export function MindPassportCompactCard({ snapshot, achievementCountFallback }: MindPassportCompactCardProps): React.JSX.Element {
  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
        <IdCard className="size-3.5" aria-hidden="true" />
        Mind Passport™
      </div>

      {snapshot === null ? (
        <p className="mt-3 text-sm text-muted-foreground">Visit Visual DNA™ once to create your Mind Passport.</p>
      ) : (
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
          <div>
            <dt className="text-muted-foreground">Visual Intelligence</dt>
            <dd className="mt-0.5 font-semibold text-foreground">{snapshot.visualIntelligenceScore} / 1000</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Visual DNA</dt>
            <dd className="mt-0.5 font-semibold text-foreground">{snapshot.visualDnaLevel}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Achievements</dt>
            <dd className="mt-0.5 font-semibold text-foreground">{snapshot.achievementCount ?? achievementCountFallback}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Mind Score</dt>
            <dd className="mt-0.5 font-semibold text-foreground">{snapshot.visualIntelligenceScore} / 1000</dd>
          </div>
        </dl>
      )}

      <Button asChild variant="outline" className="mt-5 w-full gap-2 rounded-full">
        <Link href="/labs/visual-intelligence/dna">
          Open Mind Passport™
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  )
}
