'use client'

import { useState } from 'react'
import { ReadingLayout } from '@/features/reading-engine/components/ReadingLayout'
import type { VerticalChunkSlidingQuizQuestion } from '../verticalChunkSlidingDataset'

// Same literal high-contrast palette as VerticalChunkSlidingCanvas.tsx /
// Dynamic Chunk Sliding™ (own-copy, not a shared import — see those
// files' own comments on why these are static literal Tailwind classes).
const CARD_CLASS_NAME = 'bg-[#FBF9F4] dark:bg-[#16171A]'
const TEXT_COLOR_CLASS_NAME = 'text-[#17181C] dark:text-[#F5F5F2]'

type VerticalChunkSlidingQuizProps = {
  questions: readonly VerticalChunkSlidingQuizQuestion[]
  categoryLabel: string
  onComplete: (score: number) => void
  onExit: () => void
}

function scoreMessage(score: number, total: number): string {
  if (score === total) return 'Perfect recall — you caught every key idea.'
  if (score >= Math.ceil(total / 2)) return 'Solid comprehension — most of it stuck.'
  return 'Worth a re-read — a few key ideas slipped by.'
}

// Post-exercise MCQ comprehension quiz — appears once the vertical
// sliding passage finishes, before the standard ReadingSessionCompleteScreen.
// Deliberately its own small state machine (question -> feedback -> next,
// repeated 3x, then a results view) rather than a new phase inside the
// locked useReadingRuntime.ts — that hook's phase type ('settings' |
// 'reading' | 'paused' | 'complete') is shared by 18+ other exercises and
// stays untouched; the Experience orchestrator simply renders this
// component instead of the completion screen while a quiz is pending.
export function VerticalChunkSlidingQuiz({ questions, categoryLabel, onComplete, onExit }: VerticalChunkSlidingQuizProps): React.JSX.Element {
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)

  const totalQuestions = questions.length
  const currentQuestion = questions[questionIndex]

  function handleSelectOption(optionIndex: number): void {
    if (selectedOptionIndex !== null || !currentQuestion) return
    setSelectedOptionIndex(optionIndex)
    if (optionIndex === currentQuestion.correctOptionIndex) {
      setScore((current) => current + 1)
    }
  }

  function handleAdvance(): void {
    if (questionIndex + 1 < totalQuestions) {
      setQuestionIndex((current) => current + 1)
      setSelectedOptionIndex(null)
    } else {
      setShowResults(true)
    }
  }

  if (showResults || !currentQuestion) {
    return (
      <ReadingLayout maxWidthClassName="max-w-xl" onExit={onExit}>
        <div className="flex w-full flex-col items-center gap-8 text-center">
          <div>
            <p className="mb-3 text-center text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Comprehension Check</p>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">You scored {score} / {totalQuestions}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{scoreMessage(score, totalQuestions)}</p>
          </div>
          <button
            onClick={() => onComplete(score)}
            className="rounded-full bg-foreground px-10 py-3 text-sm font-medium text-background transition-all duration-150 hover:opacity-80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Continue
          </button>
        </div>
      </ReadingLayout>
    )
  }

  const isLastQuestion = questionIndex + 1 === totalQuestions

  return (
    <ReadingLayout maxWidthClassName="max-w-xl" onExit={onExit}>
      <div className="flex w-full flex-col items-center gap-6">
        <div className="w-full text-center">
          <p className="mb-1 text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Comprehension Check</p>
          <p className="text-xs text-muted-foreground">
            Theme: {categoryLabel} · Question {questionIndex + 1} of {totalQuestions}
          </p>
        </div>

        <div className={`w-full rounded-3xl border border-black/10 p-6 shadow-sm dark:border-white/10 ${CARD_CLASS_NAME}`}>
          <p className={`text-lg font-semibold ${TEXT_COLOR_CLASS_NAME}`}>{currentQuestion.question}</p>

          <div className="mt-5 flex flex-col gap-2.5">
            {currentQuestion.options.map((option, optionIndex) => {
              const isSelected = selectedOptionIndex === optionIndex
              const isCorrectOption = optionIndex === currentQuestion.correctOptionIndex
              const hasAnswered = selectedOptionIndex !== null

              let stateClassName = 'border-black/10 dark:border-white/15 hover:border-black/25 dark:hover:border-white/30'
              let stateLabel = ''
              if (hasAnswered && isCorrectOption) {
                stateClassName = 'border-emerald-500 bg-emerald-500/10 dark:border-emerald-400 dark:bg-emerald-400/10'
                stateLabel = ' (Correct answer)'
              } else if (hasAnswered && isSelected && !isCorrectOption) {
                stateClassName = 'border-red-500 bg-red-500/10 dark:border-red-400 dark:bg-red-400/10'
                stateLabel = ' (Your answer)'
              }

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelectOption(optionIndex)}
                  disabled={hasAnswered}
                  className={`rounded-xl border px-4 py-3 text-left text-sm font-medium ${TEXT_COLOR_CLASS_NAME} transition-colors disabled:cursor-default ${stateClassName} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50`}
                >
                  {option}
                  {stateLabel && <span className="text-xs font-normal opacity-70">{stateLabel}</span>}
                </button>
              )
            })}
          </div>

          {selectedOptionIndex !== null && (
            <p className="mt-4 text-sm font-medium text-muted-foreground">
              {selectedOptionIndex === currentQuestion.correctOptionIndex ? 'Correct!' : 'Not quite — the correct answer is highlighted above.'}
            </p>
          )}
        </div>

        {selectedOptionIndex !== null && (
          <button
            onClick={handleAdvance}
            className="rounded-full bg-foreground px-10 py-3 text-sm font-medium text-background transition-all duration-150 hover:opacity-80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {isLastQuestion ? 'See Results' : 'Next Question'}
          </button>
        )}
      </div>
    </ReadingLayout>
  )
}
