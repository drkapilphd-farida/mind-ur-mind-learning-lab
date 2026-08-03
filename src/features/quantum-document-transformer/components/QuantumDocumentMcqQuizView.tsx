'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import type { McqQuizQuestion } from '../types'

type QuantumDocumentMcqQuizViewProps = {
  title: string
  quizQuestions: readonly McqQuizQuestion[]
  onComplete: (correctAnswersCount: number, totalQuestionsCount: number) => void
  onExit: () => void
}

// Smart Dynamic MCQ Assessment™ — the true multiple-choice recall
// session, used whenever a document's quiz_questions are the new MCQ
// shape (see isMcqQuizQuestion in ../types). Same header/progress/exit
// chrome as the legacy QuantumDocumentRecallQuizView (self-graded flip
// cards, still used for pre-upgrade documents) so the two feel like one
// family, but scoring here is real and programmatic — an option is
// either the document's own correctIndex or it isn't, never
// self-reported. Option feedback coloring mirrors
// SingleChoiceQuestionCard.tsx's established success/destructive
// convention (an own-copy, not a cross-feature import, per this
// codebase's existing precedent).
export function QuantumDocumentMcqQuizView({ title, quizQuestions, onComplete, onExit }: QuantumDocumentMcqQuizViewProps): React.JSX.Element {
  const [index, setIndex] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [correctCount, setCorrectCount] = useState(0)

  const question = quizQuestions[index]
  const isLast = index === quizQuestions.length - 1
  const isFeedback = selectedIndex !== null

  function handleSelect(optionIndex: number): void {
    if (isFeedback || !question) return
    setSelectedIndex(optionIndex)
    if (optionIndex === question.correctIndex) setCorrectCount((current) => current + 1)
  }

  function handleNext(): void {
    if (isLast) {
      onComplete(correctCount, quizQuestions.length)
      return
    }
    setSelectedIndex(null)
    setIndex((current) => current + 1)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className={TYPOGRAPHY.label}>Quantum Recall Quiz™</p>
          <p className="truncate text-sm font-medium text-foreground">{title}</p>
        </div>
        <Button type="button" variant="ghost" size="icon-sm" onClick={onExit} aria-label="Exit quiz">
          <X className="size-4" aria-hidden="true" />
        </Button>
      </div>

      {question && (
        <>
          <p className="mt-4 text-center text-xs text-muted-foreground">Question {index + 1} of {quizQuestions.length}</p>

          <div className="flex flex-1 flex-col items-center justify-center gap-6 py-8">
            <p className={cn(TYPOGRAPHY.h2, 'max-w-xl text-center whitespace-pre-line')}>{question.question}</p>

            <div className="grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2" role="group" aria-label="Choose your answer">
              {question.options.map((option, optionIndex) => {
                const isSelected = selectedIndex === optionIndex
                const isThisCorrect = isFeedback && optionIndex === question.correctIndex
                const isThisWrong = isFeedback && isSelected && !isThisCorrect

                return (
                  <button
                    key={optionIndex}
                    type="button"
                    onClick={() => handleSelect(optionIndex)}
                    disabled={isFeedback}
                    aria-pressed={isSelected}
                    aria-label={`Option ${optionIndex + 1}: ${option}`}
                    className={cn(
                      'flex min-h-[76px] items-center justify-center gap-2 rounded-xl border px-6 py-4 text-center text-base font-medium transition-all duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                      !isFeedback
                        ? 'border-border bg-card text-foreground hover:border-foreground/20 hover:bg-muted active:scale-[0.98]'
                        : isThisCorrect
                          ? 'border-success bg-success/10 text-success'
                          : isThisWrong
                            ? 'border-destructive bg-destructive/10 text-destructive'
                            : 'border-border bg-card text-muted-foreground opacity-50',
                    )}
                  >
                    {isThisCorrect && <Check className="size-4 shrink-0" aria-hidden="true" />}
                    {isThisWrong && <X className="size-4 shrink-0" aria-hidden="true" />}
                    {option}
                  </button>
                )
              })}
            </div>

            {isFeedback && (
              <Button type="button" size="lg" className="w-full max-w-xl rounded-full" onClick={handleNext}>
                {isLast ? 'Finish Quiz' : 'Next Question'}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
