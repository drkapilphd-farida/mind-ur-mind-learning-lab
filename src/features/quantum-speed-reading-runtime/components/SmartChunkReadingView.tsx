'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { splitIntoReadingGroups } from '../presentation/splitIntoReadingGroups'

type SmartChunkReadingViewProps = {
  content: string
}

// Quantum Speed Reading Experience Engine™ (QSR-E1) — Smart Chunk
// Reading™, the signature mode. The uploaded chapter remains fully
// intact — `splitIntoReadingGroups` only changes presentation, never
// meaning — the learner advances group by group with the same real
// content underneath. Chunk-level Previous/Next (moving to the actual
// next real `LearningChunk`) stays owned by the outer
// `SessionNavigationControls`, unchanged — this component only manages
// its own, smaller, in-chunk stepper.
export function SmartChunkReadingView({ content }: SmartChunkReadingViewProps): React.JSX.Element {
  const groups = useMemo(() => splitIntoReadingGroups(content), [content])
  const [groupIndex, setGroupIndex] = useState(0)
  const currentGroup = groups[Math.min(groupIndex, groups.length - 1)] ?? content

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-6 sm:p-8">
      <p className={cn(TYPOGRAPHY.caption, 'text-center text-muted-foreground')}>
        Reading group {Math.min(groupIndex + 1, groups.length)} of {groups.length}
      </p>

      <p className="mx-auto max-w-[65ch] text-lg leading-relaxed whitespace-pre-wrap text-foreground sm:text-xl sm:leading-loose">{currentGroup}</p>

      <div className="flex items-center justify-center gap-3 pt-2">
        <Button variant="outline" size="sm" disabled={groupIndex === 0} onClick={() => setGroupIndex((index) => Math.max(0, index - 1))}>
          <ChevronLeft aria-hidden="true" />
          Previous
        </Button>
        <Button size="sm" disabled={groupIndex >= groups.length - 1} onClick={() => setGroupIndex((index) => Math.min(groups.length - 1, index + 1))}>
          Next
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
