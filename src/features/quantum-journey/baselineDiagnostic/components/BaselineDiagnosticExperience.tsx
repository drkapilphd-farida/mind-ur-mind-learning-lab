'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LivingBrainLogo } from '@/components/brand/LivingBrainLogo'
import { pickDiagnosticPassage, type DiagnosticPassage } from '../diagnosticContent'
import { computeTrueWpm } from '../../trueWpm'
import { saveBaselineDiagnostic } from '../actions/saveBaselineDiagnostic'
import { RsvpModePlayer, type RsvpModeResult } from '../../readingModes/components/RsvpModePlayer'
import { computeDefaultTargetWpm } from '../../readingModes/pacingMath'
import type { JourneyReadingSet } from '../../readingContent'

type Phase = 'reading' | 'saving' | 'result'

// diagnosticContent.ts's DiagnosticPassage is deliberately its own,
// smaller type (no category/lengthTier/retentionQuestions — this content
// pool has no rotation to track), but RsvpModePlayer and
// ComprehensionQuestionFlow are both typed against the richer
// JourneyReadingSet shape from ../../readingContent. `category` and
// `lengthTier` are inert here — neither component reads them once a set
// has already been selected, they only drive readingContent's own pool
// *selection*, which this bypasses entirely via `selectedSetOverride`.
// `retentionQuestions` is required by the shared type but never read by
// either component this flow uses, so it's safe to just mirror
// `comprehensionQuestions` rather than authoring a second, unused
// question pair.
function toJourneyReadingSet(passage: DiagnosticPassage): JourneyReadingSet {
  return {
    id: passage.id,
    category: 'short-stories',
    lengthTier: 'short',
    text: passage.text,
    comprehensionQuestions: passage.questions,
    retentionQuestions: passage.questions,
  }
}

// Baseline Reading Speed Diagnostic™ — the mandatory, one-time gate a
// brand-new user completes before their real Day 1 of the 21-Day
// Transformation Journey. Previously a free, self-timed 30-second read
// (WPM = the WHOLE passage's word count ÷ elapsed time, regardless of how
// much was actually read) — real user testing found this trivially
// produced inflated, meaningless scores (300+ WPM from barely reading a
// word), because nothing tracked genuine reading progress. Now reuses
// RsvpModePlayer — the same Rapid Serial Visual Presentation engine
// Weeks 2 & 3 of the real journey already use — which paces word-by-word
// exposure itself and derives WPM from words ACTUALLY flashed over real
// elapsed time, structurally closing that gap rather than patching around
// it. Starts at computeDefaultTargetWpm(1, null) — this app's own
// established "no baseline yet" starting pace (250 WPM) — with the same
// speed slider real journey sessions offer, so finding a comfortable
// starting pace is itself part of what "baseline" measures.
export function BaselineDiagnosticExperience(): React.JSX.Element {
  // Client-only pick — same hydration-mismatch reasoning as
  // RsvpModePlayer's own internal pick.
  const [selectedSet, setSelectedSet] = useState<JourneyReadingSet | null>(null)
  useEffect(() => {
    setSelectedSet(toJourneyReadingSet(pickDiagnosticPassage()))
  }, [])

  const [phase, setPhase] = useState<Phase>('reading')
  const [result, setResult] = useState<{ rawWpm: number; accuracyPercent: 0 | 50 | 100; trueBaselineWpm: number } | null>(null)

  async function handleRsvpComplete({ wpm, accuracyPercent }: RsvpModeResult): Promise<void> {
    setPhase('saving')
    // RsvpModePlayer always derives this as Math.round((correctCount / 2)
    // * 100) for exactly 2 questions — always 0, 50, or 100 — but the
    // value arrives here typed as `number`, so this asserts what's always
    // structurally true rather than re-deriving it.
    const tristateAccuracy = accuracyPercent as 0 | 50 | 100
    const trueBaselineWpm = computeTrueWpm(wpm, tristateAccuracy)
    await saveBaselineDiagnostic({ rawWpm: wpm, accuracyPercent: tristateAccuracy, trueBaselineWpm })
    setResult({ rawWpm: wpm, accuracyPercent: tristateAccuracy, trueBaselineWpm })
    setPhase('result')
  }

  if (selectedSet === null) return <div className="min-h-[70vh]" />

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center gap-6 px-6 py-12 text-center">
      {phase === 'reading' && (
        <RsvpModePlayer
          lengthTier="short"
          initialTargetWpm={computeDefaultTargetWpm(1, null)}
          selectedSetOverride={selectedSet}
          onComplete={(rsvpResult) => void handleRsvpComplete(rsvpResult)}
        />
      )}

      {phase === 'saving' && (
        <p className="mt-4 text-center text-xs text-muted-foreground" aria-live="polite">
          Locking in your baseline…
        </p>
      )}

      {phase === 'result' && result !== null && (
        <div className="flex w-full flex-1 flex-col items-center justify-center gap-6">
          <LivingBrainLogo size={56} />
          <div>
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Baseline Locked In™</p>
            <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-foreground">Your Starting Point</h1>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Every day of your Quantum Mindset & Habit Builder™ journey now measures real growth against this.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-teal-500/10 p-4">
              <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">Baseline WPM</p>
              <p className="font-heading text-xl font-bold tabular-nums text-foreground">{result.trueBaselineWpm} WPM</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
              <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">Comprehension</p>
              <p className="font-heading text-xl font-bold tabular-nums text-foreground">{result.accuracyPercent}%</p>
            </div>
          </div>

          <Button asChild size="lg" className="rounded-full">
            <Link href="/labs/quantum-speed-reading/journey/1">Begin Day 1 →</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
