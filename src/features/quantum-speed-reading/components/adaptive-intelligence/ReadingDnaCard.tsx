import type { ReadingDnaTrait, ReadingDnaDimension } from '../../adaptive-intelligence/readingIntelligenceTypes'

type ReadingDnaCardProps = {
  traits: readonly ReadingDnaTrait[]
}

const DIMENSION_LABEL: Record<ReadingDnaDimension, string> = {
  'reading-style': 'Reading Style',
  'visual-processing': 'Visual Processing',
  'reading-strategy': 'Reading Strategy',
  'focus-pattern': 'Focus Pattern',
  'difficulty-comfort': 'Difficulty Comfort',
  'category-preference': 'Category Preference',
}

// Every trait always shows its confidence alongside the label — never a
// permanent verdict. Confidence grows across sessions (see
// readingDnaEngine.ts's computeConfidence), recomputed fresh every visit.
export function ReadingDnaCard({ traits }: ReadingDnaCardProps): React.JSX.Element {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Reading DNA™</p>
      <p className="mt-2 text-xs text-muted-foreground">
        These traits describe how your brain reads best — confidence grows the more you practice, it isn&rsquo;t a score to chase.
      </p>
      <div className="mt-4 space-y-4">
        {traits.map((trait) => (
          <div key={trait.dimension}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{DIMENSION_LABEL[trait.dimension]}</span>
              <span className="font-medium text-foreground">
                {trait.label} <span className="text-xs text-muted-foreground">· {trait.confidence}% confidence</span>
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
              <div
                className="h-full rounded-full bg-primary/60 transition-[width] duration-500 ease-out"
                style={{ width: `${trait.confidence}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
