'use client'

import { useState } from 'react'
import { ReadingLayout } from '@/features/reading-engine/components/ReadingLayout'
import type { NarrationLanguage } from '../hologramVoiceSelection'

const RATING_OPTIONS = [1, 2, 3, 4, 5] as const

type ReflectionQuestion = { id: string; en: string; hi: string }

// Deliberately NOT a graded quiz — there is no "correct" answer to a
// sensory visualization. These 3 short self-report questions are how
// this exercise honestly measures itself: the averaged rating becomes
// the session's own Sensory Immersion Score, the real (not fabricated)
// number behind this exercise's accuracyPercent-shaped onComplete seam.
const REFLECTION_QUESTIONS: readonly ReflectionQuestion[] = [
  {
    id: 'clarity',
    en: 'How clear was your mental image?',
    hi: 'आपकी मानसिक छवि कितनी स्पष्ट थी?',
  },
  {
    id: 'relaxation',
    en: 'How relaxed do you feel right now?',
    hi: 'आप अभी कितना आराम महसूस कर रहे हैं?',
  },
  {
    id: 'connection',
    en: 'How connected did you feel to this vision?',
    hi: 'आप इस दृष्टि से कितना जुड़ाव महसूस कर रहे थे?',
  },
]

// Frosted-glass palette — own-copy, matching this exercise's own Canvas.
const CARD_CLASS_NAME = 'bg-[#FBF9F4]/95 dark:bg-[#16171A]/95 backdrop-blur-md'

function computeImmersionScorePercent(ratings: readonly number[]): number {
  if (ratings.length === 0) return 0
  const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
  return Math.round(average * 20)
}

type SensoryHologramBuilderReflectionScreenProps = {
  language: NarrationLanguage
  onComplete: (immersionScorePercent: number) => void
  onExit: () => void
}

export function SensoryHologramBuilderReflectionScreen({
  language,
  onComplete,
  onExit,
}: SensoryHologramBuilderReflectionScreenProps): React.JSX.Element {
  const [questionIndex, setQuestionIndex] = useState(0)
  const [ratings, setRatings] = useState<number[]>([])
  const [selectedRating, setSelectedRating] = useState<number | null>(null)

  const totalQuestions = REFLECTION_QUESTIONS.length
  const currentQuestion = REFLECTION_QUESTIONS[questionIndex]
  const isLastQuestion = questionIndex + 1 === totalQuestions

  function handleSelectRating(rating: number): void {
    setSelectedRating(rating)
  }

  function handleAdvance(): void {
    if (selectedRating === null) return
    const nextRatings = [...ratings, selectedRating]
    setRatings(nextRatings)
    setSelectedRating(null)
    if (isLastQuestion) {
      onComplete(computeImmersionScorePercent(nextRatings))
    } else {
      setQuestionIndex((index) => index + 1)
    }
  }

  if (!currentQuestion) {
    return <></>
  }

  return (
    <ReadingLayout maxWidthClassName="max-w-xl" onExit={onExit}>
      <div className="flex w-full flex-col items-center gap-6">
        <div className="w-full text-center">
          <p className="mb-1 text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Sensory Immersion Reflection</p>
          <p className="text-xs text-muted-foreground">
            Question {questionIndex + 1} of {totalQuestions}
          </p>
        </div>

        <div className={`w-full rounded-3xl border border-black/10 p-6 shadow-sm dark:border-white/10 ${CARD_CLASS_NAME}`}>
          <p className="text-lg font-semibold text-foreground">{language === 'hi' ? currentQuestion.hi : currentQuestion.en}</p>

          <div className="mt-6 flex items-center justify-center gap-3">
            {RATING_OPTIONS.map((rating) => (
              <button
                key={rating}
                type="button"
                data-rating-option={rating}
                onClick={() => handleSelectRating(rating)}
                aria-pressed={selectedRating === rating}
                className={`flex size-11 items-center justify-center rounded-full border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 ${
                  selectedRating === rating
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-background text-foreground hover:border-primary/40 hover:bg-accent/20'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
          <div className="mt-3 flex justify-between text-[10px] text-muted-foreground">
            <span>{language === 'hi' ? 'बिल्कुल नहीं' : 'Not at all'}</span>
            <span>{language === 'hi' ? 'पूरी तरह' : 'Completely'}</span>
          </div>
        </div>

        <button
          onClick={handleAdvance}
          disabled={selectedRating === null}
          className="rounded-full bg-foreground px-10 py-3 text-sm font-medium text-background transition-all duration-150 hover:opacity-80 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {isLastQuestion ? 'See Summary' : 'Next Question'}
        </button>
      </div>
    </ReadingLayout>
  )
}
