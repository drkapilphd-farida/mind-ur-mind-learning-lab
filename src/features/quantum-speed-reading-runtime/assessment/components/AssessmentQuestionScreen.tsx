'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import type { AssessmentQuestion } from '../questions/AssessmentQuestion'

type AssessmentQuestionScreenProps = {
  questions: readonly AssessmentQuestion[]
  onComplete: (correctCount: number) => void
}

// Reading Assessment Engine™ — immediate per-question feedback, mirrors
// `ComprehensionCheckView.tsx`'s existing real UX exactly (same markup,
// same interaction), reused rather than reinvented. Every question here
// is already real (built from this passage's own real enrichment, or
// filtered out entirely upstream) — no honest-empty state needed here,
// the caller only renders this once `questions.length > 0`.
export function AssessmentQuestionScreen({ questions, onComplete }: AssessmentQuestionScreenProps): React.JSX.Element {
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedValue, setSelectedValue] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)

  const question = questions[questionIndex]
  if (!question) return <></>

  function handleSelect(value: string): void {
    if (selectedValue !== null) return
    setSelectedValue(value)
    const isCorrect = question?.options.find((option) => option.value === value)?.isCorrect ?? false
    if (isCorrect) setCorrectCount((count) => count + 1)
  }

  function handleNext(): void {
    if (questionIndex === questions.length - 1) {
      onComplete(correctCount)
      return
    }
    setSelectedValue(null)
    setQuestionIndex((index) => index + 1)
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-6 sm:p-8">
      <p className={cn(TYPOGRAPHY.caption, 'text-muted-foreground')}>
        Question {questionIndex + 1} of {questions.length}
      </p>
      <p className={TYPOGRAPHY.h4}>{question.prompt}</p>

      <div className="space-y-2">
        {question.options.map((option) => {
          const isSelected = selectedValue === option.value
          const showResult = selectedValue !== null
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              disabled={selectedValue !== null}
              className={cn(
                'flex w-full items-center justify-between gap-2 rounded-lg border p-3 text-left transition-colors',
                showResult && option.isCorrect && 'border-success bg-success/10',
                showResult && isSelected && !option.isCorrect && 'border-destructive bg-destructive/10',
                !showResult && 'border-border hover:border-primary/40 hover:bg-accent/20',
              )}
            >
              <span className={TYPOGRAPHY.small}>{option.value}</span>
              {showResult && option.isCorrect && <Check className="size-4 shrink-0 text-success" aria-hidden="true" />}
              {showResult && isSelected && !option.isCorrect && <X className="size-4 shrink-0 text-destructive" aria-hidden="true" />}
            </button>
          )
        })}
      </div>

      {selectedValue !== null && (
        <Button size="sm" onClick={handleNext}>
          {questionIndex === questions.length - 1 ? 'Continue' : 'Next Question'}
        </Button>
      )}
    </div>
  )
}
