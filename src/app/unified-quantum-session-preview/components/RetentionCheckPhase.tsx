'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HeartHandshake } from 'lucide-react'
import { cn } from '@/lib/utils'
import { playClickChime, playCorrectChime, playGentleMissChime } from './soundEngine'
import type { ReadingSet } from './quantumReadingSprintDataset'

const REVEAL_DURATION_MS = 1_100

type SubPhase = 'question' | 'revealing' | 'encouragement'

type RetentionCheckPhaseProps = {
  readingSet: ReadingSet
  onComplete: (correctCount: number, totalCount: number) => void
}

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

// Level 4 — a quick 2-question retention check on the same passage Level
// 3 just read, testing genuine recall rather than re-testing the exact
// comprehension questions already asked live. A wrong answer never ends
// in a fail screen: one gentle "let's reinforce this" retry is offered,
// with fresh option order, and the retry's own result is always what
// gets reported — this is about locking the material in, not scoring a
// single unlucky guess.
export function RetentionCheckPhase({ readingSet, onComplete }: RetentionCheckPhaseProps): React.JSX.Element {
  const totalQuestions = readingSet.retentionQuestions.length
  const [attempt, setAttempt] = useState<1 | 2>(1)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [currentOptions, setCurrentOptions] = useState<readonly string[]>(() => {
    const firstQuestion = readingSet.retentionQuestions[0]
    return firstQuestion !== undefined ? shuffle(firstQuestion.options) : []
  })
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [subPhase, setSubPhase] = useState<SubPhase>('question')
  const [correctCount, setCorrectCount] = useState(0)
  const [lastOutcome, setLastOutcome] = useState<{ isCorrect: boolean } | null>(null)

  const isMountedRef = useRef(true)
  const hasCompletedRef = useRef(false)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  function beginQuestion(index: number): void {
    const question = readingSet.retentionQuestions[index]
    if (question === undefined) return
    setQuestionIndex(index)
    setCurrentOptions(shuffle(question.options))
    setSelectedOption(null)
    setSubPhase('question')
  }

  function handleSelect(option: string): void {
    if (subPhase !== 'question') return
    const question = readingSet.retentionQuestions[questionIndex]
    if (question === undefined) return

    const correctOptionText = question.options[question.correctIndex]
    const isCorrect = option === correctOptionText
    setSelectedOption(option)
    setLastOutcome({ isCorrect })
    if (isCorrect) {
      playCorrectChime()
    } else {
      playGentleMissChime()
    }
    setSubPhase('revealing')

    const attemptCorrectSoFar = isCorrect ? correctCount + 1 : correctCount
    setCorrectCount(attemptCorrectSoFar)

    setTimeout(() => {
      if (!isMountedRef.current) return
      const nextIndex = questionIndex + 1
      if (nextIndex < totalQuestions) {
        beginQuestion(nextIndex)
        return
      }
      // This attempt is finished.
      if (attemptCorrectSoFar < totalQuestions && attempt === 1) {
        setSubPhase('encouragement')
        return
      }
      if (!hasCompletedRef.current) {
        hasCompletedRef.current = true
        onComplete(attemptCorrectSoFar, totalQuestions)
      }
    }, REVEAL_DURATION_MS)
  }

  function handleRetry(): void {
    playClickChime()
    setAttempt(2)
    setCorrectCount(0)
    beginQuestion(0)
  }

  const currentQuestion = readingSet.retentionQuestions[questionIndex]

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <p className="text-xs font-semibold tracking-widest text-primary uppercase">Retention Check</p>

      <AnimatePresence mode="wait">
        {subPhase === 'encouragement' && (
          <motion.div
            key="encouragement"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex w-full max-w-sm flex-col items-center gap-5"
          >
            <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 to-teal-500/20 text-indigo-500">
              <HeartHandshake className="size-7" aria-hidden="true" />
            </div>
            <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">Let&rsquo;s Reinforce This</h2>
            <p className="text-sm text-muted-foreground">
              You got {correctCount} of {totalQuestions} — one more quick pass locks it in for good.
            </p>
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/30"
            >
              Try Once More
            </button>
          </motion.div>
        )}

        {(subPhase === 'question' || subPhase === 'revealing') && currentQuestion !== undefined && (
          <motion.div
            key={`question-${attempt}-${questionIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex w-full max-w-md flex-col items-center gap-6"
          >
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Question {questionIndex + 1} of {totalQuestions}
            </p>
            <p className="font-heading text-xl font-bold tracking-tight text-foreground">{currentQuestion.question}</p>

            {subPhase === 'revealing' && lastOutcome !== null && (
              <p className={cn('text-sm font-medium', lastOutcome.isCorrect ? 'text-emerald-600' : 'text-muted-foreground')}>
                {lastOutcome.isCorrect
                  ? 'Correct!'
                  : `Not quite — it was "${currentQuestion.options[currentQuestion.correctIndex]}".`}
              </p>
            )}

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
              {currentOptions.map((option) => {
                const correctOptionText = currentQuestion.options[currentQuestion.correctIndex]
                const isCorrectOption = subPhase === 'revealing' && option === correctOptionText
                const isPickedWrong = subPhase === 'revealing' && selectedOption === option && lastOutcome !== null && !lastOutcome.isCorrect
                let stateClassName = 'border-border hover:border-primary/40 hover:bg-accent/20'
                if (subPhase === 'revealing') {
                  if (isCorrectOption) stateClassName = 'border-emerald-500 bg-emerald-500/5'
                  else if (isPickedWrong) stateClassName = 'border-red-500 bg-red-500/5'
                  else stateClassName = 'border-border opacity-40'
                }

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={subPhase !== 'question'}
                    onClick={() => handleSelect(option)}
                    className={cn(
                      'rounded-2xl border-2 px-4 py-4 text-left text-sm font-medium text-foreground transition-all duration-200',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                      stateClassName,
                    )}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
