'use client'

import { useState } from 'react'
import { Check, RotateCcw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import type { QuizQuestion } from '../types'

type Assessment = 'correct' | 'missed'

type QuantumDocumentRecallQuizViewProps = {
  title: string
  quizQuestions: readonly QuizQuestion[]
  onComplete: (correctAnswersCount: number, totalQuestionsCount: number) => void
  onExit: () => void
}

// AI Document Transformer™ — Active Recall Memory session. Same
// tap-to-flip card interaction FlashCardDeckView.tsx already established
// for structural review cards, applied here to the AI-generated
// question/answer pairs, plus a real self-assessment step (Gamification &
// XP Sync): these are open-ended recall questions, not multiple choice,
// so there is no way to programmatically check "correct" — the learner
// grades their own recall after seeing the answer, the same honest
// mechanism every real spaced-repetition app (Anki, RemNote, etc.) uses
// for free-recall content. `onComplete` reports the real tally so the
// caller can award real, non-fabricated XP.
export function QuantumDocumentRecallQuizView({ title, quizQuestions, onComplete, onExit }: QuantumDocumentRecallQuizViewProps): React.JSX.Element {
  const [index, setIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [assessments, setAssessments] = useState<Record<number, Assessment>>({})

  const question = quizQuestions[index]
  const isLast = index === quizQuestions.length - 1

  function recordAssessment(value: Assessment): void {
    const nextAssessments = { ...assessments, [index]: value }
    setAssessments(nextAssessments)

    if (isLast) {
      const correctAnswersCount = Object.values(nextAssessments).filter((assessment) => assessment === 'correct').length
      onComplete(correctAnswersCount, quizQuestions.length)
      return
    }

    setIsFlipped(false)
    setIndex((current) => current + 1)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className={TYPOGRAPHY.label}>Active Recall Quiz™</p>
          <p className="truncate text-sm font-medium text-foreground">{title}</p>
        </div>
        <Button type="button" variant="ghost" size="icon-sm" onClick={onExit} aria-label="Exit quiz">
          <X className="size-4" aria-hidden="true" />
        </Button>
      </div>

      {question && (
        <>
          <p className="mt-4 text-center text-xs text-muted-foreground">Question {index + 1} of {quizQuestions.length}</p>

          <div className="flex flex-1 items-center justify-center py-8">
            <div className="w-full max-w-xl">
              <button
                type="button"
                onClick={() => setIsFlipped((current) => !current)}
                className="block w-full rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label={isFlipped ? 'Showing answer — tap to show question' : 'Showing question — tap to reveal answer'}
              >
                <Card className="min-h-56 transition-colors hover:bg-accent/20">
                  <CardContent className="flex min-h-56 flex-col items-center justify-center gap-3 px-8 py-10 text-center">
                    <p className={cn(TYPOGRAPHY.h2, 'whitespace-pre-line')}>{isFlipped ? question.answer : question.question}</p>
                    {!isFlipped && (
                      <span className={cn(TYPOGRAPHY.caption, 'mt-2 inline-flex items-center gap-1.5 text-muted-foreground')}>
                        <RotateCcw className="size-3.5" aria-hidden="true" />
                        Tap to reveal answer
                      </span>
                    )}
                  </CardContent>
                </Card>
              </button>

              {isFlipped && (
                <div className="mt-4 flex items-center justify-center gap-3">
                  <p className="w-full text-center text-sm text-muted-foreground">Did you get it right?</p>
                </div>
              )}
              {isFlipped && (
                <div className="mt-2 flex items-center justify-center gap-3">
                  <Button type="button" variant="destructive" className="flex-1 gap-2" onClick={() => recordAssessment('missed')}>
                    <X className="size-4" aria-hidden="true" />
                    I missed it
                  </Button>
                  <Button type="button" className="flex-1 gap-2 bg-success text-success-foreground hover:bg-success/90" onClick={() => recordAssessment('correct')}>
                    <Check className="size-4" aria-hidden="true" />
                    I got it right
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
