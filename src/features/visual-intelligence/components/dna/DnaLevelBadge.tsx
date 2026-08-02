import { Sparkle } from 'lucide-react'
import type { DnaLevelName, DnaLevelNumber } from '../../dna/dnaTypes'

type DnaLevelBadgeProps = {
  level: DnaLevelNumber
  levelName: DnaLevelName
}

export function DnaLevelBadge({ level, levelName }: DnaLevelBadgeProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-3 rounded-3xl border bg-card p-5 shadow-sm">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/[0.08] text-primary" aria-hidden="true">
        <Sparkle className="size-5" />
      </div>
      <div>
        <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Visual Intelligence Level™</p>
        <p className="mt-0.5 font-heading text-lg font-bold tracking-tight text-foreground">
          Level {level} · {levelName}
        </p>
      </div>
    </div>
  )
}
