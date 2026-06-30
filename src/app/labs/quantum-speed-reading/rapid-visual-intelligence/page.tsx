import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RAPID_VISUAL_MODULE, type RapidVisualExercise } from '@/features/rapid-visual-intelligence/rapidVisualModule'

export const metadata: Metadata = {
  title: 'Rapid Visual Intelligence™ — Quantum Speed Reading Lab™',
  description: 'Tachistoscopic training to develop visual processing speed, pattern recognition, and reading readiness.',
}

function ExerciseCard({ exercise, index }: { exercise: RapidVisualExercise; index: number }): React.JSX.Element {
  return (
    <Link
      href={exercise.href}
      className="group flex items-start gap-5 rounded-2xl border bg-card p-5 shadow-sm transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground/[0.06] text-sm font-semibold text-muted-foreground">
        {index + 1}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-semibold text-foreground">{exercise.title}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{exercise.description}</p>
        <Badge variant="outline" className="mt-2 text-[10px]">{exercise.trainsAbility}</Badge>
      </div>
      <ArrowRight
        className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  )
}

export default function RapidVisualIntelligencePage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Reading Intelligence Lab™ · Phase 3
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Rapid Visual Intelligence™
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-muted-foreground">
          Tachistoscopic training for visual processing speed and instant recognition.
          Flash durations automatically adapt to your accuracy — start easy, progress fast.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
        <span>Starts at 500ms flash</span>
        <span aria-hidden="true">·</span>
        <span>Adapts to your accuracy</span>
        <span aria-hidden="true">·</span>
        <span>20 items per session</span>
        <span aria-hidden="true">·</span>
        <span>~1–2 minutes each</span>
      </div>

      <ol className="mt-10 space-y-3" aria-label="Rapid Visual Intelligence exercises">
        {RAPID_VISUAL_MODULE.map((exercise, i) => (
          <li key={exercise.exerciseId}>
            <ExerciseCard exercise={exercise} index={i} />
          </li>
        ))}
      </ol>

      <div className="mt-10 text-center">
        <Button asChild variant="ghost" size="sm">
          <Link href="/labs/quantum-speed-reading">← Back to Reading Lab</Link>
        </Button>
      </div>
    </div>
  )
}
