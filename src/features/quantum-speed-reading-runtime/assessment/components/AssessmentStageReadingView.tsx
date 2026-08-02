'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { splitIntoReadingGroups } from '../../presentation/splitIntoReadingGroups'
import { splitIntoWordChunks } from '../splitIntoWordChunks'
import type { AssessmentStageId } from '../selectAssessmentPassages'

type AssessmentStageReadingViewProps = {
  stage: AssessmentStageId
  content: string
  onDone: () => void
}

const WORD_CHUNK_SIZE = 3
const PHRASE_CHUNK_TARGET_WORDS = 8
// `splitIntoReadingGroups`'s own real behavior: a group only breaks
// *before* adding a sentence once the running word count already exceeds
// the target — a target of 1 therefore always yields exactly one real
// sentence per group, without needing a second, separately-exported
// sentence splitter.
const SENTENCE_STAGE_TARGET_WORDS = 1

function resolveGroups(stage: AssessmentStageId, content: string): readonly string[] {
  switch (stage) {
    case 'word-chunk':
      return splitIntoWordChunks(content, WORD_CHUNK_SIZE)
    case 'phrase-chunk':
      return splitIntoReadingGroups(content, PHRASE_CHUNK_TARGET_WORDS)
    case 'sentence':
      return splitIntoReadingGroups(content, SENTENCE_STAGE_TARGET_WORDS)
    case 'paragraph':
      return [content]
  }
}

// Reading Assessment Engine™ — one shared reading view for all 4 stages,
// mirroring `SmartChunkReadingView.tsx`'s exact real Prev/Next stepper
// markup (reused, not reinvented) with a "Done Reading" button in place
// of "Next" on the last group — the same real completion gesture
// `ReadingSprintView.tsx` already uses. The learner controls pace
// entirely; nothing here paces or reveals content on a timer.
export function AssessmentStageReadingView({ stage, content, onDone }: AssessmentStageReadingViewProps): React.JSX.Element {
  const groups = useMemo(() => resolveGroups(stage, content), [stage, content])
  const [groupIndex, setGroupIndex] = useState(0)
  const currentGroup = groups[Math.min(groupIndex, groups.length - 1)] ?? content
  const isLastGroup = groupIndex >= groups.length - 1

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-6 sm:p-8">
      {groups.length > 1 && (
        <p className={cn(TYPOGRAPHY.caption, 'text-center text-muted-foreground')}>
          {groupIndex + 1} of {groups.length}
        </p>
      )}

      <p className="mx-auto max-w-[65ch] text-lg leading-relaxed whitespace-pre-wrap text-foreground sm:text-xl sm:leading-loose">{currentGroup}</p>

      <div className="flex items-center justify-center gap-3 pt-2">
        {groups.length > 1 && (
          <Button variant="outline" size="sm" disabled={groupIndex === 0} onClick={() => setGroupIndex((index) => Math.max(0, index - 1))}>
            <ChevronLeft aria-hidden="true" />
            Previous
          </Button>
        )}
        {isLastGroup ? (
          <Button size="sm" onClick={onDone}>
            Done Reading
          </Button>
        ) : (
          <Button size="sm" onClick={() => setGroupIndex((index) => Math.min(groups.length - 1, index + 1))}>
            Next
            <ChevronRight aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  )
}
