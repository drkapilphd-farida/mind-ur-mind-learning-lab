'use client'

import { useEffect, useMemo, useState } from 'react'
import { Brain, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyStateCard } from '@/components/ui/empty-state-card'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { buildComprehensionQuestions } from '../presentation/buildComprehensionQuestions'
import type { DocumentComprehensionSignal } from '../presentation/listDocumentComprehensionSignals'
import type { ReadingChunkView } from '../types/ReadingChunkView'

type ComprehensionCheckViewProps = {
  chunk: ReadingChunkView
  allSignals: readonly DocumentComprehensionSignal[]
  // Quantum Speed Reading Hub Experience™ (Sprint-1) — called once, real,
  // on reaching the real results screen (never for the "no questions
  // yet" honest-empty state, which isn't a real completion).
  onComplete?: () => void
}

// Quantum Speed Reading Experience Engine™ (QSR-E1) — Comprehension
// Check™. Real questions, built entirely from this exact chapter's own
// already-real, already-stored AI enrichment (`buildComprehensionQuestions`)
// — never a new Claude call. Honestly shows nothing when this chunk has
// no real enrichment yet (still processing, or a chunk enrichment call
// that failed) rather than fabricating a question.
export function ComprehensionCheckView({ chunk, allSignals, onComplete }: ComprehensionCheckViewProps): React.JSX.Element {
  const questions = useMemo(() => buildComprehensionQuestions(chunk, allSignals), [chunk, allSignals])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedValue, setSelectedValue] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)

  useEffect(() => {
    if (questions.length > 0 && questionIndex >= questions.length) onComplete?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionIndex, questions.length])

  if (questions.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <EmptyStateCard icon={Brain} title="No comprehension questions yet" description="This section doesn't have enough real, AI-extracted detail yet to build a question from." />
      </div>
    )
  }

  if (questionIndex >= questions.length) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-8 text-center">
        <p className={TYPOGRAPHY.h3}>
          {correctCount} of {questions.length}
        </p>
        <p className={cn(TYPOGRAPHY.small, 'text-muted-foreground')}>real questions about what you just read</p>
      </div>
    )
  }

  const question = questions[questionIndex]
  if (!question) return <></>

  function handleSelect(value: string): void {
    if (selectedValue !== null) return
    setSelectedValue(value)
    const isCorrect = question?.options.find((option) => option.value === value)?.isCorrect ?? false
    if (isCorrect) setCorrectCount((count) => count + 1)
  }

  function handleNext(): void {
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
          {questionIndex === questions.length - 1 ? 'See Results' : 'Next Question'}
        </Button>
      )}
    </div>
  )
}
