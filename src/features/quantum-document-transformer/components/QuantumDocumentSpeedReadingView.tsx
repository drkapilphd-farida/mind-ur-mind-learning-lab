'use client'

import { useEffect, useMemo, useState } from 'react'
import { Pause, Play, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'

type SpeedPreset = 'slow' | 'normal' | 'fast'

const SPEED_MS: Record<SpeedPreset, number> = { slow: 480, normal: 320, fast: 200 }
const SPEED_LABEL: Record<SpeedPreset, string> = { slow: 'Slow', normal: 'Normal', fast: 'Fast' }
const NEXT_SPEED: Record<SpeedPreset, SpeedPreset> = { slow: 'normal', normal: 'fast', fast: 'slow' }

type CompletionCopy = { finishedHeadline: string; finishedSubtext: string; skipLabel: string; continueLabel: string }

const DEFAULT_COMPLETION_COPY: CompletionCopy = {
  finishedHeadline: 'Nice work — you read the whole document.',
  finishedSubtext: 'Ready to lock it in with a quick recall quiz?',
  skipLabel: 'Skip to quiz →',
  continueLabel: 'Continue to recall quiz →',
}

type QuantumDocumentSpeedReadingViewProps = {
  title: string
  readingText: string
  onComplete: () => void
  onExit: () => void
  // QSR Bridge™ — the full-document reading flow always leads into a
  // real recall quiz next, so that copy is baked in as the default. The
  // Summary Practice bridge (QuantumDocumentDetailView.tsx) reuses this
  // exact reader for just the one-sentence summary, with no quiz after
  // it — overriding this prop avoids promising a quiz that never comes.
  completionCopy?: CompletionCopy
}

// AI Document Transformer™ — Quantum Speed Reading (RSVP) over the
// document's own real reading text (the original extracted text for
// English targets; Claude's own translation for the other supported
// languages — see generateQuantumDocumentIntelligence.ts). Word-splitting
// on whitespace works unchanged for every supported language here (Hindi/
// Gujarati/Marathi/Tamil, like English, are space-delimited scripts).
// Deliberately a small, standalone reader rather than reusing the tracked
// Eye Foundation Module exercise engine: this content is arbitrary
// user-uploaded text, not a curated dataset item, so driving it through
// the real practice_sessions/exercise_progress tracking would mean
// inventing a fake exerciseId for content that isn't really a Lab
// exercise — the same "never pollute the tracked system with something
// that isn't really it" discipline this app already applies elsewhere.
export function QuantumDocumentSpeedReadingView({ title, readingText, onComplete, onExit, completionCopy = DEFAULT_COMPLETION_COPY }: QuantumDocumentSpeedReadingViewProps): React.JSX.Element {
  const words = useMemo(() => readingText.split(/\s+/).filter((word) => word.length > 0), [readingText])
  const [index, setIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [speed, setSpeed] = useState<SpeedPreset>('normal')
  const prefersReducedMotion = usePrefersReducedMotion()

  const isFinished = index >= words.length

  useEffect(() => {
    if (!isPlaying || isFinished) return undefined
    const timer = setTimeout(() => setIndex((current) => current + 1), SPEED_MS[speed])
    return () => clearTimeout(timer)
  }, [isPlaying, isFinished, index, speed])

  const progress = words.length > 0 ? Math.min(100, Math.round((Math.min(index, words.length) / words.length) * 100)) : 100
  const currentWord = words[index] ?? null

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className={TYPOGRAPHY.label}>Quantum Speed Reading™</p>
          <p className="truncate text-sm font-medium text-foreground">{title}</p>
        </div>
        <Button type="button" variant="ghost" size="icon-sm" onClick={onExit} aria-label="Exit reading session">
          <X className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <Progress value={progress} className="mt-4" />
      <p className="mt-1.5 text-xs text-muted-foreground">{Math.min(index, words.length)} / {words.length} words</p>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 py-12">
        {!isFinished ? (
          <p
            key={index}
            className={cn('px-6 text-center text-4xl font-bold tracking-tight text-foreground sm:text-5xl', !prefersReducedMotion && 'animate-in fade-in duration-150')}
          >
            {currentWord}
          </p>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <p className={TYPOGRAPHY.h2}>{completionCopy.finishedHeadline}</p>
            {completionCopy.finishedSubtext && <p className={TYPOGRAPHY.small}>{completionCopy.finishedSubtext}</p>}
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-3">
        {!isFinished ? (
          <>
            <Button type="button" variant="outline" onClick={() => setSpeed((current) => NEXT_SPEED[current])}>
              Speed: {SPEED_LABEL[speed]}
            </Button>
            <Button type="button" size="icon" onClick={() => setIsPlaying((current) => !current)} aria-label={isPlaying ? 'Pause reading' : 'Resume reading'}>
              {isPlaying ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
            </Button>
            <Button type="button" variant="ghost" onClick={onComplete}>
              {completionCopy.skipLabel}
            </Button>
          </>
        ) : (
          <Button type="button" size="lg" className="rounded-full" onClick={onComplete}>
            {completionCopy.continueLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
