'use client'

import { useEffect, useMemo, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { splitIntoReadingGroups } from '../presentation/splitIntoReadingGroups'

type GuidedEyeFlowViewProps = {
  content: string
  // Quantum Speed Reading Hub Experience™ (Sprint-1) — called once, real,
  // when the guide genuinely reaches the last real line — the Hub's own
  // real completion signal for "Completed Today" card state / Today's
  // Sessions, same as every other mode's own completion.
  onComplete?: () => void
}

const WORDS_PER_LINE = 20
const TARGET_WPM = 250

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

// Quantum Speed Reading Experience Engine™ (QSR-E1) — Guided Eye Flow™.
// The same real chapter, split into real reading lines
// (`splitIntoReadingGroups`, reused verbatim from Smart Chunk Reading —
// same honest "presentation only" guarantee), with the current line
// highlighted and auto-advanced on a real, WPM-derived timer — "guide eye
// movement naturally, never become distracting." A real Play/Pause
// control always keeps the learner in control of the pace.
export function GuidedEyeFlowView({ content, onComplete }: GuidedEyeFlowViewProps): React.JSX.Element {
  const lines = useMemo(() => splitIntoReadingGroups(content, WORDS_PER_LINE), [content])
  const [lineIndex, setLineIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  useEffect(() => {
    if (!isPlaying || lineIndex >= lines.length - 1) return
    const currentLine = lines[lineIndex] ?? ''
    const durationMs = Math.max(800, (countWords(currentLine) / TARGET_WPM) * 60_000)
    const timer = window.setTimeout(() => setLineIndex((index) => Math.min(lines.length - 1, index + 1)), durationMs)
    return () => window.clearTimeout(timer)
  }, [isPlaying, lineIndex, lines])

  useEffect(() => {
    if (lines.length > 0 && lineIndex === lines.length - 1) onComplete?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineIndex, lines.length])

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-6 sm:p-8">
      <div className="space-y-2">
        {lines.map((line, index) => (
          <p
            key={index}
            className={cn(
              'mx-auto max-w-[65ch] text-lg leading-relaxed transition-opacity duration-(--duration-base) sm:text-xl',
              index === lineIndex ? 'text-foreground opacity-100' : 'text-muted-foreground opacity-40',
            )}
          >
            {line}
          </p>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <Button variant="outline" size="sm" onClick={() => setIsPlaying((playing) => !playing)}>
          {isPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
          {isPlaying ? 'Pause' : 'Resume'}
        </Button>
        <p className={cn(TYPOGRAPHY.caption, 'text-muted-foreground')}>
          Line {lineIndex + 1} of {lines.length}
        </p>
      </div>
    </div>
  )
}
