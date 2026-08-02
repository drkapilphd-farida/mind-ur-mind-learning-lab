'use client'

import { useState } from 'react'
import { Check, Flag, HelpCircle } from 'lucide-react'
import { ICON_SIZE } from '@/lib/designSystem/icons'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { EmptyStateCard } from '@/components/ui/empty-state-card'
import type { ModeChunkView } from '@/features/learning-mode-runtime'
import { buildStructureQuestion } from '../presentation/buildStructureQuestion'
import type { DocumentSectionHeading } from '../presentation/listDocumentSectionHeadings'
import type { DocumentDefinition } from '../presentation/listDocumentDefinitions'

type StructureQuestionCardProps = {
  chunk: ModeChunkView
  allHeadings: readonly DocumentSectionHeading[]
  allDefinitions: readonly DocumentDefinition[]
}

// MCQs™ — AI Learning Studio™ Sprint ALS-17. Real, structural, single-
// select questions (`buildStructureQuestion.ts` — never fabricated
// comprehension questions; see that file's own header for why). Tapping
// an option neutrally reveals the real correct one — no "Correct!"/
// "Wrong!", no per-question score, no running tally anywhere in this
// component or its parent, honoring this platform's own banned-vocabulary
// rules (PROJECT_RULES.md's Content Rules explicitly ban "Wrong,"
// "Correct," "Score," "Quiz," "Test," "Submit"). The selected option (if
// not the real answer) gets a neutral outline, never a red/error
// treatment — this is a review moment, not a penalty. Local `isRevealed`/
// `selectedChunkNodeId` state resets for free each chunk, since the
// parent Workspace keys this component by `chunk.chunkNodeId` (a fresh
// mount per chunk), the same pattern Memory Mode's own Recall Practice
// method (ALS-15) already established.
export function StructureQuestionCard({ chunk, allHeadings, allDefinitions }: StructureQuestionCardProps): React.JSX.Element {
  const [selectedChunkNodeId, setSelectedChunkNodeId] = useState<string | null>(null)
  const question = buildStructureQuestion(chunk, allHeadings, allDefinitions)

  if (question === null) {
    return <EmptyStateCard icon={HelpCircle} title="No real question for this section" description="This document doesn't have enough distinct real sections to build a meaningful question here." />
  }

  return (
    <div aria-live="polite" aria-atomic="true">
      <div className="animate-in fade-in rounded-xl border bg-card p-6 duration-(--duration-base) sm:p-8">
        {chunk.isCheckpoint && chunk.checkpointLabel !== undefined && (
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Flag className={ICON_SIZE.sm} aria-hidden="true" />
            Checkpoint — {chunk.checkpointLabel}
          </div>
        )}

        <p className={cn(TYPOGRAPHY.h4, 'mb-3')}>{question.prompt}</p>

        {question.kind === 'excerpt-to-heading' && (
          <p className="mb-4 rounded-lg bg-muted/40 p-4 text-sm leading-relaxed whitespace-pre-wrap text-foreground">{question.excerpt}</p>
        )}
        {question.kind === 'heading-to-next' && <p className="mb-4 text-base font-medium text-foreground">{question.heading}</p>}
        {question.kind === 'definition-to-term' && (
          <p className="mb-4 rounded-lg bg-muted/40 p-4 text-sm leading-relaxed whitespace-pre-wrap text-foreground">{question.definition}</p>
        )}

        <div role="radiogroup" aria-label="Answer options" className="space-y-2">
          {question.options.map((option) => {
            const isSelected = selectedChunkNodeId === option.chunkNodeId
            const showAsCorrect = selectedChunkNodeId !== null && option.isCorrect

            return (
              <button
                key={option.chunkNodeId}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={selectedChunkNodeId !== null}
                onClick={() => setSelectedChunkNodeId(option.chunkNodeId)}
                className={cn(
                  'flex w-full items-center justify-between gap-2 rounded-lg border px-4 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  showAsCorrect ? 'border-primary bg-primary/10 text-foreground' : isSelected ? 'border-foreground/30' : 'hover:bg-accent/30',
                  selectedChunkNodeId !== null && !showAsCorrect && !isSelected && 'opacity-60',
                )}
              >
                <span>{option.heading}</span>
                {showAsCorrect && <Check className={cn(ICON_SIZE.sm, 'shrink-0 text-primary')} aria-hidden="true" />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
