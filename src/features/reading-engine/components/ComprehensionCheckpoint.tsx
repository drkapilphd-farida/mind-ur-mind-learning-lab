'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ComprehensionOption, ComprehensionQuestion } from '../comprehensionTypes'

type ComprehensionCheckpointProps = {
  blockLabel: string
  questions: readonly ComprehensionQuestion[]
  passThreshold: number
  isLastBlock: boolean
  nextTargetWpm: number
  onPassContinue: () => void
  onExit: () => void
}

// Auto-advance delays: a correct answer barely needs a pause before moving
// on; a wrong answer needs real time on screen so the revealed correct
// option actually gets read, not just flashed.
const AUTO_ADVANCE_CORRECT_MS = 650
const AUTO_ADVANCE_WRONG_MS = 1700

// Option Randomization Sprint — every dataset that feeds this component
// (Sentence/Paragraph/Guided-Paragraph Reading, Flash Recall Sprint)
// authors `correctOptionId` for its own convenience, which in practice
// means the correct option is always written first (or, in a couple of
// datasets, only ever first-or-second) — a real positional tell once a
// learner notices it. Scoring is already entirely ID-based
// (`answers[question.id] === question.correctOptionId`, never index-
// based), so shuffling only the *display order* here fixes every
// consumer at once without touching any dataset file or the scoring
// logic itself.
function shuffleOptions(options: readonly ComprehensionOption[]): ComprehensionOption[] {
  const shuffled = [...options]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const a = shuffled[i]
    const b = shuffled[j]
    if (a === undefined || b === undefined) continue
    shuffled[i] = b
    shuffled[j] = a
  }
  return shuffled
}

// Sequential MCQ Sprint — refactors the Comprehension Checkpoint from one
// long scrollable page (every question visible at once, a single "Check
// Answers" at the end) into a step-by-step flow: one question per screen,
// auto-advancing to the next the moment an answer is picked. A wrong pick
// immediately reveals the correct option in green (alongside the wrong
// pick in red) so the learner sees the right answer before moving on,
// rather than only finding out at a final summary. Still a purely
// presentation-only component (additive to the Reading Shell folder, not
// a modification of any of the four locked components) — same external
// contract as before, so neither Experience file needed to change: it
// still owns only its own local per-question answer state, never touches
// useReadingRuntime/useReadingSession, and reports upward via
// `onPassContinue` once `passThreshold` is met on the final summary step.
export function ComprehensionCheckpoint({
  blockLabel,
  questions,
  passThreshold,
  isLastBlock,
  nextTargetWpm,
  onPassContinue,
  onExit,
}: ComprehensionCheckpointProps): React.JSX.Element {
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [showSummary, setShowSummary] = useState(false)

  const currentQuestion = questions[questionIndex]
  const isLastQuestion = questionIndex >= questions.length - 1
  const correctCount = questions.filter((question) => answers[question.id] === question.correctOptionId).length
  const passed = correctCount >= passThreshold

  // Shuffled once per question (memoized on the question object itself,
  // a stable reference from the caller's static dataset) so the random
  // order stays stable while the learner is looking at it — it doesn't
  // re-shuffle on every re-render (e.g. the moment an option is
  // selected), only when moving to a genuinely different question.
  const shuffledOptions = useMemo(
    () => (currentQuestion ? shuffleOptions(currentQuestion.options) : []),
    [currentQuestion],
  )

  useEffect(() => {
    if (selectedOptionId === null || !currentQuestion) return
    const isCorrect = selectedOptionId === currentQuestion.correctOptionId
    const delay = isCorrect ? AUTO_ADVANCE_CORRECT_MS : AUTO_ADVANCE_WRONG_MS
    const timer = window.setTimeout(() => {
      if (isLastQuestion) {
        setShowSummary(true)
      } else {
        setQuestionIndex((index) => index + 1)
        setSelectedOptionId(null)
      }
    }, delay)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOptionId])

  function selectOption(optionId: string): void {
    if (selectedOptionId !== null || !currentQuestion) return
    setSelectedOptionId(optionId)
    setAnswers((current) => ({ ...current, [currentQuestion.id]: optionId }))
  }

  function handleTryAgain(): void {
    setQuestionIndex(0)
    setAnswers({})
    setSelectedOptionId(null)
    setShowSummary(false)
  }

  if (showSummary) {
    return (
      <div className="relative mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center gap-8 px-6 py-16 text-center">
        <button
          onClick={onExit}
          className="absolute top-4 right-6 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
          aria-label="Exit exercise"
        >
          Exit
        </button>

        <div>
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">{blockLabel}</p>
          <h1 className="font-heading mt-2 text-2xl font-bold tracking-tight text-foreground">
            {passed ? 'Nice work.' : 'Almost there.'}
          </h1>
          <p className={`mt-3 text-sm font-medium ${passed ? 'text-emerald-600' : 'text-muted-foreground'}`}>
            {correctCount} of {questions.length} correct{passed ? '' : ` — need ${passThreshold} to continue.`}
          </p>
        </div>

        {passed ? (
          <button
            type="button"
            onClick={onPassContinue}
            className="w-full max-w-xs rounded-full bg-foreground px-8 py-3 text-sm font-medium text-background transition-all duration-150 hover:opacity-80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {isLastBlock ? 'Finish' : `Next — ${nextTargetWpm} WPM`}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleTryAgain}
            className="w-full max-w-xs rounded-full border border-border px-8 py-3 text-sm font-medium text-foreground transition-all duration-150 hover:bg-accent/20 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
          >
            Try Again
          </button>
        )}
      </div>
    )
  }

  if (!currentQuestion) return <></>

  return (
    <div className="relative mx-auto flex min-h-[70vh] max-w-2xl flex-col gap-8 px-6 py-16">
      <button
        onClick={onExit}
        className="absolute top-4 right-6 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
        aria-label="Exit exercise"
      >
        Exit
      </button>

      <div className="text-center">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">{blockLabel}</p>
        <h1 className="font-heading mt-2 text-2xl font-bold tracking-tight text-foreground">Check Your Understanding</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Question {questionIndex + 1} of {questions.length}
        </p>
        <div className="mx-auto mt-4 flex max-w-xs items-center gap-1.5">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className={`h-1 flex-1 rounded-full ${index < questionIndex ? 'bg-foreground' : index === questionIndex ? 'bg-foreground/50' : 'bg-border'}`}
            />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border p-6">
        <p className="text-base font-semibold text-foreground">{currentQuestion.prompt}</p>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {shuffledOptions.map((option) => {
            const isSelected = selectedOptionId === option.id
            const isCorrectOption = option.id === currentQuestion.correctOptionId
            let stateClassName = 'border-border hover:border-primary/40 hover:bg-accent/20'
            if (selectedOptionId !== null) {
              if (isCorrectOption) {
                stateClassName = 'border-emerald-500/60 bg-emerald-500/10 text-emerald-700'
              } else if (isSelected) {
                stateClassName = 'border-red-500/60 bg-red-500/10'
              } else {
                stateClassName = 'border-border opacity-50'
              }
            }
            return (
              <button
                key={option.id}
                type="button"
                disabled={selectedOptionId !== null}
                onClick={() => selectOption(option.id)}
                aria-pressed={isSelected}
                className={`rounded-xl border px-4 py-2 text-left text-sm text-foreground transition-colors duration-200 ${stateClassName}`}
              >
                {option.text}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
