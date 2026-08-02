import { Lightbulb } from 'lucide-react'

type ImprovementTipsListProps = {
  tips: readonly string[]
}

export function ImprovementTipsList({ tips }: ImprovementTipsListProps): React.JSX.Element | null {
  if (tips.length === 0) return null

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">AI Improvement Tips</p>
      <ul className="mt-3 space-y-3">
        {tips.map((tip, index) => (
          <li key={index} className="flex items-start gap-3 text-sm leading-relaxed text-foreground">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Lightbulb className="size-3" aria-hidden="true" />
            </span>
            {tip}
          </li>
        ))}
      </ul>
    </div>
  )
}
