import { HelpCircle } from 'lucide-react'

type RecallQuestionsCardProps = {
  questions: readonly string[]
}

// Active Recall (unscored)™ — recall_questions are deliberately not the
// scored MCQ quiz (see McqQuizQuestion / quiz_questions): no options, no
// correct answer to check, just open prompts for quick self-reflection.
// Rendered as plain numbered prompts with no input/submit affordance,
// same "display only" philosophy as FeynmanChallengeCard.
export function RecallQuestionsCard({ questions }: RecallQuestionsCardProps): React.JSX.Element | null {
  if (questions.length === 0) return null

  return (
    <div className="quantum-section-card p-4">
      <div className="flex items-center gap-2">
        <div className="quantum-icon-chip" aria-hidden="true">
          <HelpCircle className="size-3.5 text-emerald-500" />
        </div>
        <p className="text-sm font-semibold tracking-wide text-foreground">Quick Recall Questions</p>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">No scoring — just pause and answer each one in your own words.</p>
      <ol className="mt-3 space-y-2.5">
        {questions.map((question, index) => (
          <li key={`${index}-${question}`} className="flex items-start gap-2.5">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              {index + 1}
            </span>
            <span className="text-sm leading-relaxed text-foreground">{question}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
