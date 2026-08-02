import { Sparkles } from 'lucide-react'

type AdaptiveCoachMessageProps = {
  message: string
}

// Mirrors FixationCoachMessage.tsx's client-render-only pattern — receives
// the already-generated string as a prop (generated server-side by
// generateAdaptiveCoachMessage.ts), never fetches anything itself.
export function AdaptiveCoachMessage({ message }: AdaptiveCoachMessageProps): React.JSX.Element {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 text-left shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
        <Sparkles className="size-3.5" aria-hidden="true" />
        Adaptive Coach™
      </div>
      <p className="mt-3 text-sm leading-relaxed text-foreground">{message}</p>
    </div>
  )
}
