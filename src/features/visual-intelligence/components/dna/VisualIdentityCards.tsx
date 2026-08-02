import { Eye, Focus, Scan, Compass } from 'lucide-react'
import type { VisualIdentity } from '../../dna/dnaTypes'

type VisualIdentityCardsProps = {
  identity: VisualIdentity
}

export function VisualIdentityCards({ identity }: VisualIdentityCardsProps): React.JSX.Element {
  const cards = [
    { icon: Eye, label: 'Observation Style', value: identity.observationStyle },
    { icon: Focus, label: 'Focus Style', value: identity.focusStyle },
    { icon: Scan, label: 'Visual Processing Style', value: identity.visualProcessingStyle },
    { icon: Compass, label: 'Peripheral Style', value: identity.peripheralStyle },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div key={card.label} className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/[0.08] text-primary" aria-hidden="true">
              <Icon className="size-4" />
            </div>
            <p className="mt-3 text-[10px] font-medium tracking-widest text-muted-foreground uppercase">{card.label}</p>
            <p className="mt-1 font-heading text-lg font-bold tracking-tight text-foreground">{card.value}</p>
          </div>
        )
      })}
    </div>
  )
}
