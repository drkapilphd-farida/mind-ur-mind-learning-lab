'use client'

import { useEffect, useMemo, useState } from 'react'
import { playClickChime, playCorrectChime, playGentleMissChime } from '@/app/unified-quantum-session-preview/components/soundEngine'
import { computeReadingPowerScore } from '@/app/unified-quantum-session-preview/components/quantumReadingSprintDataset'
import { pickJourneyReadingSet, type JourneyReadingSet, type JourneyLengthTier } from '../readingContent'

export type ReadingPresentationMode = 'phrase' | 'vertical-word' | 'sentence' | 'paragraph'

export type JourneyReadingModeResult = {
  wpm: number
  accuracyPercent: number
  score: number
  selectedSet: JourneyReadingSet
}

type JourneyReadingModePlayerProps = {
  mode: ReadingPresentationMode
  lengthTier: JourneyLengthTier
  speedMultiplier: number
  onComplete: (result: JourneyReadingModeResult) => void
}

const MODE_LABELS: Record<ReadingPresentationMode, string> = {
  phrase: 'Phrase Reading™',
  'vertical-word': 'Vertical Word Reading™',
  sentence: 'Sentence Reading™',
  paragraph: 'Paragraph Reading™',
}

// Baseline pace this player's flash timings are built around (~214 WPM at
// speedMultiplier 1) — scaled the same way QuantumReadingSprintPhase
// scales its own stage durations: shorter duration ÷ multiplier = faster
// effective pace.
const BASE_MS_PER_WORD = 280
const MAX_SENTENCE_STAGE_MS = 6000
const QUESTIONS_PER_SET = 2
const REVEAL_DURATION_MS = 1100

type Stage = { text: string; durationMs: number }

function splitIntoWords(text: string): string[] {
  return text.split(/\s+/).filter((word) => word.length > 0)
}

function splitIntoSentences(text: string): string[] {
  const matches = text.match(/[^.!?]+[.!?]+(\s+|$)/g)
  return (matches ?? [text]).map((s) => s.trim()).filter((s) => s.length > 0)
}

function buildStages(mode: ReadingPresentationMode, text: string, speedMultiplier: number): readonly Stage[] {
  const msPerWord = BASE_MS_PER_WORD / speedMultiplier

  if (mode === 'vertical-word') {
    return splitIntoWords(text).map((word) => ({ text: word, durationMs: Math.round(msPerWord) }))
  }

  if (mode === 'phrase') {
    const words = splitIntoWords(text)
    const groupSize = 3
    const stages: Stage[] = []
    for (let i = 0; i < words.length; i += groupSize) {
      const group = words.slice(i, i + groupSize)
      stages.push({ text: group.join(' '), durationMs: Math.round(msPerWord * group.length) })
    }
    return stages
  }

  if (mode === 'sentence') {
    return splitIntoSentences(text).map((sentence) => {
      const wordCount = splitIntoWords(sentence).length
      return { text: sentence, durationMs: Math.min(Math.round(msPerWord * wordCount), MAX_SENTENCE_STAGE_MS) }
    })
  }

  // 'paragraph' — a single stage covering the whole text; duration is
  // only used as an estimate for the live progress bar, since the user
  // can click "Done Reading" early (see the manual-advance UI below) —
  // real elapsed time when they click IS their real reading duration.
  const totalWords = splitIntoWords(text).length
  return [{ text, durationMs: Math.round(msPerWord * totalWords) }]
}

type Phase = 'reading' | 'question' | 'revealing'

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

// Full Reading Sprint Variety™ — one shared player for the 4 additional
// reading presentation modes (Phrase, Vertical Word, Sentence,
// Paragraph), all drawing from the Rich Indian-Centric Content
// Database™ (../readingContent). Unlike Dynamic Chunking, every mode
// here produces a genuine ReadingSet-shaped result (real comprehension
// AND retention questions from the same real passage), so Retention
// Check can pair with all of them — not just the classic Quantum
// Reading Sprint.
export function JourneyReadingModePlayer({ mode, lengthTier, speedMultiplier, onComplete }: JourneyReadingModePlayerProps): React.JSX.Element | null {
  // The random anti-repeat pick must happen client-side only — unlike
  // QuantumReadingSprintPhase (whose countdown phase delays the passage
  // text past hydration), this player renders passage text on its very
  // first paint, so picking during SSR would render one passage then
  // hydrate to a different random one, a real visible hydration
  // mismatch. Deferring to useEffect keeps server and client's first
  // real paint identical.
  const [selectedSet, setSelectedSet] = useState<JourneyReadingSet | null>(null)
  const [stageIndex, setStageIndex] = useState(0)
  const [readingStartedAt] = useState(() => Date.now())
  const [readingElapsedMs, setReadingElapsedMs] = useState(0)

  const [phase, setPhase] = useState<Phase>('reading')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [currentOptions, setCurrentOptions] = useState<readonly string[]>([])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [lastOutcome, setLastOutcome] = useState<{ isCorrect: boolean } | null>(null)
  const [correctCount, setCorrectCount] = useState(0)

  // The random anti-repeat pick must happen client-side only — unlike
  // QuantumReadingSprintPhase (whose countdown phase delays the passage
  // text past hydration), this player renders passage text on its very
  // first paint, so picking during SSR would render one passage then
  // hydrate to a different random one, a real visible hydration
  // mismatch. Deferring to this mount-only effect keeps server and
  // client's first real paint identical (a brief empty frame instead).
  useEffect(() => {
    const set = pickJourneyReadingSet(lengthTier)
    setSelectedSet(set)
    setCurrentOptions(shuffle(set.comprehensionQuestions[0].options))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stages = useMemo(() => (selectedSet !== null ? buildStages(mode, selectedSet.text, speedMultiplier) : []), [mode, selectedSet, speedMultiplier])
  const totalWordCount = useMemo(() => (selectedSet !== null ? splitIntoWords(selectedSet.text).length : 0), [selectedSet])

  // Auto-advance through reading stages for every mode except 'paragraph'
  // (which waits for the user's own "Done Reading" click instead).
  useEffect(() => {
    if (selectedSet === null || phase !== 'reading' || mode === 'paragraph') return undefined
    const currentStage = stages[stageIndex]
    if (currentStage === undefined) {
      finishReading()
      return undefined
    }
    const timeout = setTimeout(() => {
      const nextIndex = stageIndex + 1
      if (nextIndex >= stages.length) {
        finishReading()
      } else {
        setStageIndex(nextIndex)
      }
    }, currentStage.durationMs)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, stageIndex, mode, selectedSet])

  function finishReading(): void {
    setReadingElapsedMs(Date.now() - readingStartedAt)
    setPhase('question')
  }

  function beginQuestion(index: number): void {
    if (selectedSet === null) return
    const question = selectedSet.comprehensionQuestions[index]
    if (question === undefined) return
    setQuestionIndex(index)
    setCurrentOptions(shuffle(question.options))
    setSelectedOption(null)
    setPhase('question')
  }

  function resolveGuess(option: string): void {
    if (selectedSet === null) return
    const question = selectedSet.comprehensionQuestions[questionIndex]
    if (question === undefined) return
    const correctOptionText = question.options[question.correctIndex]
    const isCorrect = option === correctOptionText

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
        const finalCorrectCount = isCorrect ? correctCount + 1 : correctCount
        const accuracyPercent = Math.round((finalCorrectCount / QUESTIONS_PER_SET) * 100)
        const wpm = readingElapsedMs > 0 ? Math.round((totalWordCount / readingElapsedMs) * 60000) : 0
        const score = computeReadingPowerScore(wpm, accuracyPercent)
        onComplete({ wpm, accuracyPercent, score, selectedSet })
      } else {
        beginQuestion(nextIndex)
      }
    }, REVEAL_DURATION_MS)
  }

  if (selectedSet === null) return null

  const currentStage = stages[stageIndex]
  const currentQuestion = selectedSet.comprehensionQuestions[questionIndex]
  const readingProgressPercent =
    mode === 'paragraph' || stages.length === 0 ? 100 : Math.round(((stageIndex + 1) / stages.length) * 100)

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center gap-6 px-6 py-12 text-center">
      <p className="text-xs font-semibold tracking-widest text-primary uppercase">{MODE_LABELS[mode]}</p>

      {phase === 'reading' && currentStage !== undefined && (
        <div className="flex w-full flex-1 flex-col items-center justify-center gap-8">
          <div className="h-1 w-full max-w-xs overflow-hidden rounded-full bg-border">
            <div className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out" style={{ width: `${readingProgressPercent}%` }} />
          </div>
          <p
            key={`${mode}-${stageIndex}`}
            className={
              mode === 'paragraph'
                ? 'max-w-xl text-left text-lg leading-relaxed text-foreground'
                : 'px-4 text-center font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl'
            }
          >
            {currentStage.text}
          </p>
          {mode === 'paragraph' && (
            <button
              type="button"
              onClick={finishReading}
              className="rounded-full bg-foreground px-8 py-3 text-sm font-medium text-background transition-all duration-150 hover:opacity-80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Done Reading →
            </button>
          )}
        </div>
      )}

      {(phase === 'question' || phase === 'revealing') && currentQuestion !== undefined && (
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
      )}
    </div>
  )
}
