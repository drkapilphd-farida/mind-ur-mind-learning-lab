import { ProgressRing } from '@/components/exercises/ProgressRing'
import type { NeuralEvolutionIndexResult } from '@/features/neural-evolution/neuralEvolutionIndex'

const FUTURE_MODULES = ['Reading', 'Memory', 'Focus', 'Meditation'] as const

type NeuralEvolutionCenterpieceProps = {
  result: NeuralEvolutionIndexResult
}

// Reuses Sprint-8's exact computeNeuralEvolutionIndex result (imported
// read-only from src/features/neural-evolution/) — the global, cross-lab
// architecture built specifically so this dashboard could read it without
// any redesign.
export function NeuralEvolutionCenterpiece({ result }: NeuralEvolutionCenterpieceProps): React.JSX.Element {
  return (
    <div className="rounded-3xl border bg-gradient-to-br from-primary/[0.06] via-card to-card p-7 shadow-sm">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">🧬 Neural Evolution Index™</p>
      <p className="mt-1 text-[11px] text-muted-foreground">
        The global architecture for Quantum Mind Learning Lab™. {result.activeDimensionCount} of {result.dimensions.length} dimensions active.
      </p>

      <div className="mt-6 flex justify-center">
        <ProgressRing
          progress={result.overallScore / 100}
          size={130}
          label={String(result.overallScore)}
          accessibleLabel={`Overall Neural Evolution ${result.overallScore} out of 100`}
        />
      </div>
      <p className="mt-2 text-center text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Overall Neural Evolution</p>

      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {result.dimensions.map((dimension) => (
          <div key={dimension.id} className="flex flex-col items-center gap-2 rounded-2xl border p-3 text-center">
            {dimension.status === 'active' && dimension.score !== null ? (
              <ProgressRing progress={dimension.score / 100} size={52} label={String(dimension.score)} accessibleLabel={`${dimension.label} ${dimension.score} out of 100`} />
            ) : (
              <div className="flex size-[52px] items-center justify-center rounded-full border border-dashed border-border text-[9px] text-muted-foreground">
                Soon
              </div>
            )}
            <p className="text-[10px] font-medium text-foreground">{dimension.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t pt-5">
        <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Future Modules</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {FUTURE_MODULES.map((module) => (
            <span key={module} className="rounded-full border border-dashed px-3 py-1 text-[11px] text-muted-foreground">
              {module} · Locked
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
