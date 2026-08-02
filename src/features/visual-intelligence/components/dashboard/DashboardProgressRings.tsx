import { ProgressRing } from '@/components/exercises/ProgressRing'

export type DashboardRingsData = {
  visualIntelligence: number
  focus: number
  observation: number | null
  peripheralVision: number | null
  persistence: number | null
  accuracy: number | null
  adaptiveIntelligence: number
}

type RingTile = {
  label: string
  value: number | null
}

type DashboardProgressRingsProps = {
  data: DashboardRingsData
}

// Beautiful Apple-Fitness-style ring grid — every value here is reused
// read-only from Sprint-7/8's already-computed results, zero duplicated
// formulas. null values (no data yet) render a dim, unfilled ring rather
// than a fabricated number.
export function DashboardProgressRings({ data }: DashboardProgressRingsProps): React.JSX.Element {
  const tiles: readonly RingTile[] = [
    { label: 'Visual Intelligence', value: data.visualIntelligence },
    { label: 'Focus', value: data.focus },
    { label: 'Observation', value: data.observation },
    { label: 'Peripheral Vision', value: data.peripheralVision },
    { label: 'Persistence', value: data.persistence },
    { label: 'Accuracy', value: data.accuracy },
    { label: 'Adaptive Intelligence', value: data.adaptiveIntelligence },
  ]

  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Progress Rings™</p>
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="flex flex-col items-center gap-2 text-center">
            <ProgressRing
              progress={(tile.value ?? 0) / 100}
              size={64}
              label={tile.value === null ? '—' : String(tile.value)}
              accessibleLabel={tile.value === null ? `${tile.label} — train more to unlock` : `${tile.label} ${tile.value} out of 100`}
            />
            <p className="text-[10px] font-medium text-foreground">{tile.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
