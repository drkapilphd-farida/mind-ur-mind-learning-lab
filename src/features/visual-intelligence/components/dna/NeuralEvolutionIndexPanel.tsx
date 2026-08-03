import { ProgressRing } from '@/components/exercises/ProgressRing'
import type { NeuralEvolutionIndexResult } from '@/features/neural-evolution/neuralEvolutionIndex'

type NeuralEvolutionIndexPanelProps = {
  result: NeuralEvolutionIndexResult
}

// Section 14 — the one genuinely global-architecture piece in this sprint.
// For Sprint-8, only the Visual Intelligence dimension is real; every other
// dimension honestly shows "Coming Soon" rather than an estimated score,
// per the brief's explicit "DO NOT fabricate scores, DO NOT estimate
// future modules" instruction.
export function NeuralEvolutionIndexPanel({ result }: NeuralEvolutionIndexPanelProps): React.JSX.Element {
  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">🧬 Neural Evolution Index™</p>
      <p className="mt-1 text-[11px] text-muted-foreground">
        The global architecture for Quantum Mind Learning Lab™. {result.activeDimensionCount} of {result.dimensions.length} dimensions active.
      </p>

      <div className="mt-5 flex items-center justify-center">
        <ProgressRing
          progress={result.overallScore / 100}
          size={110}
          label={String(result.overallScore)}
          accessibleLabel={`Overall Neural Evolution ${result.overallScore} out of 100`}
        />
      </div>
      <p className="mt-2 text-center text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Overall Neural Evolution</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {result.dimensions.map((dimension) => (
          <div key={dimension.id} className="flex flex-col items-center gap-2 rounded-2xl border p-4 text-center">
            {dimension.status === 'active' && dimension.score !== null ? (
              <ProgressRing progress={dimension.score / 100} size={56} label={String(dimension.score)} accessibleLabel={`${dimension.label} ${dimension.score} out of 100`} />
            ) : (
              <div className="flex size-14 items-center justify-center rounded-full border border-dashed border-border text-[9px] text-muted-foreground">
                Soon
              </div>
            )}
            <p className="text-[10px] font-medium text-foreground">{dimension.label}</p>
            {dimension.status === 'coming-soon' ? (
              <p className="text-[9px] text-muted-foreground">Will activate as more Intelligence Labs are completed.</p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
