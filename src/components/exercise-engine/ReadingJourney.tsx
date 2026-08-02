// Reading Journey™ — pack-wide progress indicator, shared across the
// Reading Intelligence Pack™. Distinct from a mission's own internal Level
// Map (Levels 1-5 within one mission): this shows WHICH mission the
// learner is in, across the whole reading-unit ladder (Word → Chunk →
// Phrase → Multi-Line → Sentence → Paragraph → Page). New component — no
// prior mission displayed this, so it can't yet be retrofitted onto the
// two already-locked missions (Flash Intelligence Pack™, Progressive
// Chunk Reading™) without modifying locked files; every mission built
// from here forward can reuse it as-is.
//
// A mostly-static, illustrative diagram: stages before the current one
// render as done (●), the current stage renders active (🟢), stages after
// render locked (○) — since Sentence/Paragraph/Page don't have real
// missions behind them yet, this isn't wired to live per-learner unlock
// state, just the pack's real, current build status.
//
// 'multi-line' was added between 'phrase' and 'sentence' for Multi-Line
// Reading™ — additive only; Phrase Reading's existing `currentStage="phrase"`
// usage is unaffected (it still renders as the active 🟢 stage at the same
// relative position, just with one more locked ○ dot after it now).

import { cn } from '@/lib/utils'

export type ReadingJourneyStage = 'word' | 'chunk' | 'phrase' | 'multi-line' | 'sentence' | 'paragraph' | 'page'

const STAGES: readonly { id: ReadingJourneyStage; label: string }[] = [
  { id: 'word', label: 'Word' },
  { id: 'chunk', label: 'Chunk' },
  { id: 'phrase', label: 'Phrase' },
  { id: 'multi-line', label: 'Multi-Line' },
  { id: 'sentence', label: 'Sentence' },
  { id: 'paragraph', label: 'Paragraph' },
  { id: 'page', label: 'Page' },
]

export function ReadingJourney({
  currentStage,
  compact = false,
}: {
  currentStage: ReadingJourneyStage
  compact?: boolean
}): React.JSX.Element {
  const currentIndex = STAGES.findIndex((s) => s.id === currentStage)

  return (
    <div
      className={cn('flex flex-col items-center', compact ? 'gap-1' : 'gap-1.5')}
      aria-label={`Reading Journey: currently on ${STAGES[currentIndex]?.label ?? currentStage}`}
    >
      <p className={cn('font-medium text-muted-foreground', compact ? 'text-[10px]' : 'text-xs')}>Reading Journey</p>
      <div className="flex items-center gap-1.5">
        {STAGES.map((stage, i) => (
          <span
            key={stage.id}
            className={cn(
              'flex items-center gap-1',
              i < currentIndex ? 'text-success' : i === currentIndex ? 'font-semibold text-foreground' : 'text-muted-foreground/40',
            )}
          >
            <span aria-hidden="true">{i < currentIndex ? '●' : i === currentIndex ? '🟢' : '○'}</span>
            {!compact && <span className="text-[11px]">{stage.label}</span>}
          </span>
        ))}
      </div>
    </div>
  )
}
