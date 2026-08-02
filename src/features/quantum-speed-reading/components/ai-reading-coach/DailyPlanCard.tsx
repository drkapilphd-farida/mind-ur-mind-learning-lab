import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PASSAGE_CATEGORY_LABEL, PASSAGE_DIFFICULTY_LABEL } from '../../passageDifficulty'
import type { DailyPlan } from '../../ai-reading-coach/dailyPlanEngine'
import { LAB_STAT_LABEL_CLASS } from '../shell/LabPageHeader'

type DailyPlanCardProps = {
  plan: DailyPlan
}

export function DailyPlanCard({ plan }: DailyPlanCardProps): React.JSX.Element {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Today&apos;s Plan</p>
        <p className="text-xs text-muted-foreground">Estimated Time: <span className="font-semibold text-foreground">{plan.estimatedTimeLabel}</span></p>
      </div>
      <div className="mt-4 space-y-2">
        {plan.steps.map((step, index) => (
          <div key={`${step.passage.id}-${index}`} className="flex items-center gap-3">
            <Link
              href={`/labs/quantum-speed-reading/start/prepare?passage=${step.passage.id}`}
              className="flex flex-1 items-center justify-between gap-3 rounded-xl bg-muted/40 px-4 py-3 transition-colors hover:bg-muted/70"
            >
              <div>
                <p className={LAB_STAT_LABEL_CLASS}>{step.label}</p>
                <p className="text-sm font-medium text-foreground">
                  {PASSAGE_CATEGORY_LABEL[step.passage.category]} · {PASSAGE_DIFFICULTY_LABEL[step.passage.difficulty]}
                </p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground/50" aria-hidden="true" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
