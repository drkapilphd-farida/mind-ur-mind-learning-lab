import { Sparkles } from 'lucide-react'

type TodaysAiCoachCardProps = {
  message: string
}

// Displays the output of Sprint-7's generateAdaptiveCoachMessage (reused
// read-only, called once in the route) — no new AI coach file needed.
export function TodaysAiCoachCard({ message }: TodaysAiCoachCardProps): React.JSX.Element {
  return (
    <div className="rounded-3xl border bg-card p-7 text-left shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
        <Sparkles className="size-3.5" aria-hidden="true" />
        Today&apos;s AI Coach™
      </div>
      <p className="mt-3 text-sm leading-relaxed text-foreground">{message}</p>
    </div>
  )
}
