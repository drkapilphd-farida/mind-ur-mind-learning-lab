import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DnaLevelName, VisualIdentity } from '../../dna/dnaTypes'

type VisualDnaCompactCardProps = {
  identity: VisualIdentity
  dnaLevelName: DnaLevelName
  growthPercent: number | null
}

export function VisualDnaCompactCard({ identity, dnaLevelName, growthPercent }: VisualDnaCompactCardProps): React.JSX.Element {
  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Visual DNA™</p>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
        <div>
          <dt className="text-muted-foreground">Primary Trait</dt>
          <dd className="mt-0.5 font-semibold text-foreground">{identity.observationStyle}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Observation Style</dt>
          <dd className="mt-0.5 font-semibold text-foreground">{identity.observationStyle}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Focus Style</dt>
          <dd className="mt-0.5 font-semibold text-foreground">{identity.focusStyle}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Current Level</dt>
          <dd className="mt-0.5 font-semibold text-foreground">{dnaLevelName}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted-foreground">Growth</dt>
          <dd className="mt-0.5 font-semibold text-foreground">{growthPercent === null ? 'More training required' : `${growthPercent > 0 ? '+' : ''}${growthPercent}%`}</dd>
        </div>
      </dl>

      <Button asChild variant="outline" className="mt-5 w-full gap-2 rounded-full">
        <Link href="/labs/visual-intelligence/dna">
          Open Visual DNA
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  )
}
