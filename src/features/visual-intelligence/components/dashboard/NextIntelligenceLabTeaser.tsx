import { Map } from 'lucide-react'

const UPCOMING_LABS = ['Reading Intelligence Lab™', 'Memory Intelligence Lab™', 'Focus Intelligence Lab™', 'Meditation Intelligence Lab™'] as const

// A large premium teaser — static, honest roadmap, same "Coming Soon"
// precedent as Sprint-8's Future Intelligence Map.
export function NextIntelligenceLabTeaser(): React.JSX.Element {
  return (
    <div className="rounded-3xl border bg-gradient-to-br from-primary/[0.06] via-card to-card p-7 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
        <Map className="size-3.5" aria-hidden="true" />
        Next Intelligence Lab™
      </div>
      <p className="mt-2 text-sm text-muted-foreground">You&apos;re building an entire Brain Operating System.</p>
      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {UPCOMING_LABS.map((lab) => (
          <div key={lab} className="flex items-center justify-between rounded-2xl border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            <span>{lab}</span>
            <span className="text-xs font-medium">Coming Soon</span>
          </div>
        ))}
      </div>
    </div>
  )
}
