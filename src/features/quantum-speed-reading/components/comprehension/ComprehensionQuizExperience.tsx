'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import type { Passage } from '../../passageLibrary'
import { estimateWpm } from '../../passageDifficulty'
import { computeLiveWpm } from '../../readingSessionEngine'
import type { ComprehensionQuestionSet, QuestionResponse } from '../../comprehensionTypes'
import { isResponseCorrect, computeAccuracyPercent, computeReadingIntelligenceScore } from '../../comprehensionEngine'
import { shuffleQuestionSet } from '../../comprehensionShuffle'
import { saveReadingIntelligenceSession } from '../../adaptive-intelligence/actions/saveReadingIntelligenceSession'
import { BrainChallengeIntro } from './BrainChallengeIntro'
import { QuestionProgressHeader } from './QuestionProgressHeader'
import { SingleChoiceQuestionCard } from './SingleChoiceQuestionCard'
import { MultiSelectQuestionCard } from './MultiSelectQuestionCard'
import { OrderingQuestionCard } from './OrderingQuestionCard'
import { QuestionExplanationPanel } from './QuestionExplanationPanel'
import { ComprehensionResultsScreen } from './ComprehensionResultsScreen'

const EXPLANATION_DELAY_MS = 400

type QuizPhase = 'intro' | 'question' | 'results'
type AnsweredRecord = { response: QuestionResponse; isCorrect: boolean }

type ComprehensionQuizExperienceProps = {
  passage: Passage
  questionSet: ComprehensionQuestionSet
  mode: string | null
  readingTimeMs: number
  focusMode: boolean
}

export function ComprehensionQuizExperience({ passage, questionSet, mode, readingTimeMs, focusMode }: ComprehensionQuizExperienceProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [phase, setPhase] = useState<QuizPhase>('intro')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<AnsweredRecord[]>([])

  // Shuffled once per quiz attempt (this mount) so the correct answer's
  // position is never predictable — never re-shuffle on re-render, or
  // options would visibly reorder mid-attempt under the learner.
  const [questions] = useState(() => shuffleQuestionSet(questionSet.questions))

  // Per-question interim interaction state — reset whenever currentIndex changes.
  const [singleSelectedIndex, setSingleSelectedIndex] = useState<number | null>(null)
  const [multiSelectedIndices, setMultiSelectedIndices] = useState<readonly number[]>([])
  const [orderState, setOrderState] = useState<readonly number[]>([])
  const [showExplanation, setShowExplanation] = useState(false)
  const [pendingRecord, setPendingRecord] = useState<AnsweredRecord | null>(null)

  const currentQuestion = questions[currentIndex]
  const isFeedback = pendingRecord !== null

  const resetInteractionState = useCallback(() => {
    setSingleSelectedIndex(null)
    setMultiSelectedIndices([])
    setOrderState([])
    setShowExplanation(false)
    setPendingRecord(null)
  }, [])

  const commitAnswer = useCallback((response: QuestionResponse) => {
    if (!currentQuestion) return
    const correct = isResponseCorrect(currentQuestion, response)
    setPendingRecord({ response, isCorrect: correct })
    window.setTimeout(() => setShowExplanation(true), EXPLANATION_DELAY_MS)
  }, [currentQuestion])

  function handleSingleSelect(idx: number): void {
    if (isFeedback) return
    setSingleSelectedIndex(idx)
    commitAnswer({ format: currentQuestion?.format === 'true-false' ? 'true-false' : 'single-choice', selectedIndex: idx })
  }

  function handleMultiToggle(idx: number): void {
    if (isFeedback) return
    setMultiSelectedIndices((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]))
  }

  function handleMultiSubmit(): void {
    commitAnswer({ format: 'multi-select', selectedIndices: multiSelectedIndices })
  }

  function handleOrderToggle(idx: number): void {
    if (isFeedback) return
    setOrderState((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]))
  }

  function handleOrderSubmit(): void {
    commitAnswer({ format: 'ordering', order: orderState })
  }

  // Sprint-3's own scoring, computed once results are reachable — reused
  // both by the results screen render below and the recording effect.
  const correctCount = answers.filter((a) => a.isCorrect).length
  const totalQuestions = questions.length
  const accuracyPercent = computeAccuracyPercent(correctCount, totalQuestions)
  const readingWpm = computeLiveWpm(passage.wordCount, readingTimeMs)
  const targetWpm = estimateWpm(passage.difficulty)
  const readingIntelligenceScore = computeReadingIntelligenceScore(readingWpm, targetWpm, correctCount, totalQuestions)

  // Sprint-4's one recording hook — fires exactly once when results are
  // reached, same notifiedRef-guard pattern PhraseReadingExperience.tsx
  // already uses for its own once-per-completion history write. Never
  // calls verifyExerciseIsUnlocked or touches practice_sessions/
  // exercise_progress — a separate, append-only Adaptive Intelligence record.
  const notifiedResultsRef = useRef(false)
  useEffect(() => {
    if (phase !== 'results' || notifiedResultsRef.current) return
    notifiedResultsRef.current = true
    void saveReadingIntelligenceSession({
      passageId: passage.id,
      category: passage.category,
      difficulty: passage.difficulty,
      mode,
      wpm: readingWpm,
      readingTimeMs,
      comprehensionPercent: accuracyPercent,
      accuracyPercent,
      readingIntelligenceScore,
      focusMode,
      hintsUsed: 0,
    })
  }, [phase, passage.id, passage.category, passage.difficulty, mode, readingWpm, readingTimeMs, accuracyPercent, readingIntelligenceScore, focusMode])

  const advance = useCallback(() => {
    if (!pendingRecord) return
    const nextAnswers = [...answers, pendingRecord]
    setAnswers(nextAnswers)
    resetInteractionState()

    if (currentIndex + 1 >= questions.length) {
      setPhase('results')
    } else {
      setCurrentIndex((i) => i + 1)
    }
  }, [pendingRecord, answers, currentIndex, questions.length, resetInteractionState])

  // Keyboard: number keys select a single-choice/true-false option;
  // Enter advances past a shown explanation. No shortcut overloads
  // multi-select/ordering submission — those stay mouse/tap driven since
  // they involve building up a selection first.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent): void {
      if (phase !== 'question' || !currentQuestion) return
      if (showExplanation && e.key === 'Enter') {
        advance()
        return
      }
      if (!isFeedback && (currentQuestion.format === 'single-choice' || currentQuestion.format === 'true-false')) {
        const num = Number(e.key)
        if (num >= 1 && num <= currentQuestion.options.length) handleSingleSelect(num - 1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentQuestion, isFeedback, showExplanation, advance])

  if (phase === 'intro') {
    return (
      <BrainChallengeIntro
        passageTitle={passage.title}
        questionCount={questions.length}
        onStart={() => setPhase('question')}
      />
    )
  }

  if (phase === 'results') {
    return (
      <ComprehensionResultsScreen
        correctCount={correctCount}
        totalQuestions={totalQuestions}
        accuracyPercent={accuracyPercent}
        readingTimeMs={readingTimeMs}
        readingWpm={readingWpm}
        readingIntelligenceScore={readingIntelligenceScore}
      />
    )
  }

  if (!currentQuestion) return <></>

  const fadeClass = !prefersReducedMotion ? 'animate-in fade-in slide-in-from-bottom-2 duration-300' : ''

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-xl flex-col items-center justify-center gap-8 px-6 py-16">
      <QuestionProgressHeader currentQuestionNumber={currentIndex + 1} totalQuestions={questions.length} />

      <div key={currentQuestion.id} className={cn('flex w-full flex-col items-center gap-6', fadeClass)}>
        <p className="text-center text-xl leading-snug font-semibold text-balance text-foreground">
          {currentQuestion.prompt}
        </p>

        {(currentQuestion.format === 'single-choice' || currentQuestion.format === 'true-false') && (
          <SingleChoiceQuestionCard
            options={currentQuestion.options}
            correctIndex={currentQuestion.correctIndex ?? -1}
            selectedIndex={singleSelectedIndex}
            isFeedback={isFeedback}
            onSelect={handleSingleSelect}
          />
        )}

        {currentQuestion.format === 'multi-select' && (
          <MultiSelectQuestionCard
            options={currentQuestion.options}
            correctIndices={currentQuestion.correctIndices ?? []}
            selectedIndices={multiSelectedIndices}
            isFeedback={isFeedback}
            onToggle={handleMultiToggle}
            onSubmit={handleMultiSubmit}
          />
        )}

        {currentQuestion.format === 'ordering' && (
          <OrderingQuestionCard
            options={currentQuestion.options}
            correctOrder={currentQuestion.correctOrder ?? []}
            order={orderState}
            isFeedback={isFeedback}
            onToggle={handleOrderToggle}
            onSubmit={handleOrderSubmit}
          />
        )}

        {showExplanation && pendingRecord && (
          <>
            <QuestionExplanationPanel isCorrect={pendingRecord.isCorrect} explanation={currentQuestion.explanation} />
            <Button size="lg" className="w-full rounded-full" onClick={advance}>
              {currentIndex + 1 >= questions.length ? 'See Results' : 'Next Question'}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
