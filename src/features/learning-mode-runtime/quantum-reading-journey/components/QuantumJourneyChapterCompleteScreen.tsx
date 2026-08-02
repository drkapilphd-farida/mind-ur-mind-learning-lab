'use client'

type QuantumJourneyChapterCompleteScreenProps = {
  assessmentScore: { correct: number; total: number } | null
  wordsCovered: number
  readingTimeMinutes: number
  chaptersCompleted: number
  totalChapters: number
  hasNextChapter: boolean
  onNextChapter: () => void
  onGoHome: () => void
}

// Reading Intelligence Engine™ Upgrade — Sprint QSR-2.5: Reading Journey
// UX & Navigation™. Objective 8 — a real completion summary, not a
// generic success screen: reading time and words covered are both real
// (elapsed wall-clock time since the chapter started, the chapter's own
// real word count), never fabricated placeholders.
export function QuantumJourneyChapterCompleteScreen({ assessmentScore, wordsCovered, readingTimeMinutes, chaptersCompleted, totalChapters, hasNextChapter, onNextChapter, onGoHome }: QuantumJourneyChapterCompleteScreenProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <p className="text-4xl" aria-hidden="true">
        🎉
      </p>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Chapter Complete</h1>

      <dl className="grid w-full max-w-xs grid-cols-3 gap-3 text-center text-xs">
        <div>
          <dt className="text-muted-foreground">Reading Time</dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums text-foreground">{readingTimeMinutes < 1 ? '<1' : readingTimeMinutes} min</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Words Covered</dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums text-foreground">{wordsCovered}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Journey Progress</dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums text-foreground">
            {chaptersCompleted}/{totalChapters}
          </dd>
        </div>
      </dl>

      {assessmentScore && (
        <p className="text-sm text-muted-foreground">
          You got <span className="font-semibold text-foreground">{assessmentScore.correct}</span> of{' '}
          <span className="font-semibold text-foreground">{assessmentScore.total}</span> right on the comprehension check.
        </p>
      )}

      <div className="flex flex-col items-center gap-3">
        {hasNextChapter && (
          <button onClick={onNextChapter} className="rounded-full bg-foreground px-8 py-3 text-sm font-medium text-background transition-opacity hover:opacity-80">
            Next Chapter Ready →
          </button>
        )}
        <button onClick={onGoHome} className="text-sm text-muted-foreground hover:text-foreground">
          {hasNextChapter ? 'Back to Journey' : 'Finish for now'}
        </button>
      </div>
    </div>
  )
}
