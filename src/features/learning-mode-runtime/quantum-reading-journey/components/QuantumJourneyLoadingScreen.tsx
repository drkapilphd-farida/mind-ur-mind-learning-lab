'use client'

type QuantumJourneyLoadingScreenProps = {
  label: string
}

// Reading Intelligence Engine™ Upgrade — Sprint QSR-2. One shared,
// premium, non-technical loading/transition screen for every beat between
// stages (Objective 5/6) — never "Building Exercise Assets" or "Querying
// Learning Assets," always plain, warm language.
export function QuantumJourneyLoadingScreen({ label }: QuantumJourneyLoadingScreenProps): React.JSX.Element {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-4" role="status" aria-live="polite">
      <div className="size-8 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-foreground" aria-hidden="true" />
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  )
}
