import { ChevronDown } from 'lucide-react'

type WhyThisDrillWorksProps = {
  children: React.ReactNode
}

// Action-First Training™ — every exercise intro screen leads with a
// short, plain instruction (title + ≤30 words + Start button, all above
// the fold); the mechanics/scoring detail that used to live in that same
// paragraph moves here instead, collapsed by default. Native <details> —
// no JS state, accessible by default, no new dependency for something
// this simple.
export function WhyThisDrillWorks({ children }: WhyThisDrillWorksProps): React.JSX.Element {
  return (
    <details className="group w-full rounded-2xl border border-border/60 bg-card/60 px-4 py-3 text-left">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase [&::-webkit-details-marker]:hidden">
        Why this drill works
        <ChevronDown className="size-3.5 shrink-0 text-muted-foreground/70 transition-transform duration-150 group-open:rotate-180" aria-hidden="true" />
      </summary>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{children}</p>
    </details>
  )
}
