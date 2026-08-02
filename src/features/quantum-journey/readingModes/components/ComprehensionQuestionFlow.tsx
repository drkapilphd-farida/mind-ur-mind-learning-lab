'use client'

import { useState } from 'react'
import { playClickChime, playCorrectChime, playGentleMissChime } from '@/app/unified-quantum-session-preview/components/soundEngine'
import type { JourneyReadingSet } from '../../readingContent'

const QUESTIONS_PER_SET = 2
const REVEAL_DURATION_MS = 1100

type Phase = 'question' | 'revealing'

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = copy[i]
    copy[i] = copy[j] as T
    copy[j] = temp as T
  }
  return copy
}

type ComprehensionQuestionFlowProps = {
  selectedSet: JourneyReadingSet
  onFinish: (correctCount: number) => void
}

// Shared "Quick Check" phase — the same 2-question comprehension flow
// JourneyReadingModePlayer already runs, factored out here so the two new
// pacing-style players (Guiding Line Pacer, RSVP Mode) don't each carry
// their own third copy of this same reveal/reshuffle/reduce logic. Only
// used by the two new players — JourneyReadingModePlayer's own inline
// copy is left untouched to avoid destabilizing already-shipped code.
export function ComprehensionQuestionFlow({ selectedSet, onFinish }: ComprehensionQuestionFlowProps): React.JSX.Element | null {
  const [questionIndex, setQuestionIndex] = useState(0)
  const [currentOptions, setCurrentOptions] = useState<readonly string[]>(() => shuffle(selectedSet.comprehensionQuestions[0].options))
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [lastOutcome, setLastOutcome] = useState<{ isCorrect: boolean } | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [phase, setPhase] = useState<Phase>('question')

  const currentQuestion = selectedSet.comprehensionQuestions[questionIndex]
  if (currentQuestion === undefined) return null

  function beginQuestion(index: number): void {
    const question = selectedSet.comprehensionQuestions[index]
    if (question === undefined) return
    setQuestionIndex(index)
    setCurrentOptions(shuffle(question.options))
    setSelectedOption(null)
    setPhase('question')
  }

  function resolveGuess(option: string): void {
    const question = selectedSet.comprehensionQuestions[questionIndex]
    if (question === undefined) return
    const isCorrect = option === question.options[question.correctIndex]

    playClickChime()
    setSelectedOption(option)
    setLastOutcome({ isCorrect })
    setPhase('revealing')
    if (isCorrect) {
      setCorrectCount((count) => count + 1)
      playCorrectChime()
    } else {
      playGentleMissChime()
    }

    setTimeout(() => {
      const nextIndex = questionIndex + 1
      if (nextIndex >= QUESTIONS_PER_SET) {
        onFinish(isCorrect ? correctCount + 1 : correctCount)
      } else {
        beginQuestion(nextIndex)
      }
    }, REVEAL_DURATION_MS)
  }

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-6">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Question {questionIndex + 1} of {QUESTIONS_PER_SET}
      </p>
      <p className="font-heading text-xl font-bold tracking-tight text-foreground">{currentQuestion.question}</p>

      {phase === 'revealing' && lastOutcome !== null && (
        <p className={`text-sm font-medium ${lastOutcome.isCorrect ? 'text-emerald-600' : 'text-muted-foreground'}`}>
          {lastOutcome.isCorrect ? 'Correct!' : `Not quite — it was "${currentQuestion.options[currentQuestion.correctIndex]}".`}
        </p>
      )}

      <div className="grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
        {currentOptions.map((option) => {
          const isCorrectOption = phase === 'revealing' && option === currentQuestion.options[currentQuestion.correctIndex]
          const isPickedWrong = phase === 'revealing' && selectedOption === option && lastOutcome !== null && !lastOutcome.isCorrect
          let stateClassName = 'border-border hover:border-primary/40 hover:bg-accent/20'
          if (phase === 'revealing') {
            if (isCorrectOption) stateClassName = 'border-emerald-500 bg-emerald-500/5'
            else if (isPickedWrong) stateClassName = 'border-red-500 bg-red-500/5'
            else stateClassName = 'border-border opacity-40'
          }
          return (
            <button
              key={option}
              type="button"
              disabled={phase !== 'question'}
              onClick={() => resolveGuess(option)}
              className={`rounded-2xl border-2 px-4 py-4 text-left text-sm font-medium text-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${stateClassName}`}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}
