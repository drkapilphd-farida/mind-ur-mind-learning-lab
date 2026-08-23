'use client'

type QuantumJourneyChapterReadyScreenProps = {
  chapterTitle: string
  wordCount: number
  chunkCount: number
  questionCount: number
  onStart: () => void
}

// Reading Intelligence Engine™ Upgrade — Sprint QSR-2. The journey's own
// intro beat — plain, warm counts only ("12 words," "8 groups," "3
// questions"), never "Exercise Assets" or "Word Flash items."
export function QuantumJourneyChapterReadyScreen({ chapterTitle, wordCount, chunkCount, questionCount, onStart }: QuantumJourneyChapterReadyScreenProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Reading Journey</p>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">{chapterTitle}</h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        Your chapter is ready. Move through the Rapid Recognition Drill, Reading Chunks, and a quick comprehension check — one continuous journey.
      </p>
      <dl className="grid w-full max-w-xs grid-cols-3 gap-3 text-center text-xs">
        <div>
          <dt className="text-muted-foreground">Words</dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums text-foreground">{wordCount}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Chunks</dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums text-foreground">{chunkCount}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Questions</dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums text-foreground">{questionCount}</dd>
        </div>
      </dl>
      <button onClick={onStart} className="rounded-full bg-foreground px-8 py-3 text-sm font-medium text-background transition-opacity hover:opacity-80">
        Begin Chapter
      </button>
    </div>
  )
}
