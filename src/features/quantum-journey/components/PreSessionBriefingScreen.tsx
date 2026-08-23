'use client'

import { useEffect, useState } from 'react'
import { Flame, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LivingBrainLogo } from '@/components/brand/LivingBrainLogo'
import { generatePreSessionBriefing } from '../actions/generatePreSessionBriefing'
import type { PreSessionBriefingContext } from '@/lib/ai/prompts/preSessionBriefingPrompt'

type PreSessionBriefingScreenProps = PreSessionBriefingContext & {
  onStart: () => void
}

// Pre-Session AI Coach Welcome & Briefing™ — the very first thing shown
// when a user opens any day of the 21-Day Transformation Journey, before
// Step 1 ever mounts. The AI message streams in client-side (never
// blocking): "Start Today's Session" is clickable the instant this
// screen renders, exactly like every other AI-Coach moment in this app
// (generateCoachFeedback.ts's own comment) — a slow or failed AI call
// must never delay real progress.
export function PreSessionBriefingScreen(props: PreSessionBriefingScreenProps): React.JSX.Element {
  const { onStart, ...context } = props
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void generatePreSessionBriefing(context).then((result) => {
      if (!cancelled) setMessage(result)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const hasPreviousResult = !context.isBaselineDay && context.previousWpm !== null && context.previousAccuracyPercent !== null

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 px-6 py-16 text-center">
      <LivingBrainLogo size={56} />

      <div>
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          {context.isBaselineDay ? 'Welcome to Your Journey' : `Day ${context.day} Briefing`}
        </p>
        <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Welcome, {context.studentName}!
        </h1>
      </div>

      {context.currentStreak > 0 && (
        <div className="flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/5 px-4 py-2 text-sm font-medium text-foreground">
          <Flame className="size-4 text-orange-500" aria-hidden="true" />
          {context.currentStreak}-Day Streak
        </div>
      )}

      <div className="w-full rounded-2xl border border-border/60 bg-card/60 p-5 text-left">
        <div className="flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
          <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Dr. Kapil&apos;s Note™</p>
        </div>
        {message !== null ? (
          <p className="mt-2 text-sm leading-relaxed text-foreground">{message}</p>
        ) : (
          <div className="mt-2.5 space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
          </div>
        )}
      </div>

      {hasPreviousResult && (
        <div className="grid w-full grid-cols-2 gap-3">
          <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-teal-500/10 p-4">
            <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">Last Reading Speed</p>
            <p className="font-heading text-xl font-bold tabular-nums text-foreground">{context.previousWpm} WPM</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
            <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">Comprehension</p>
            <p className="font-heading text-xl font-bold tabular-nums text-foreground">{context.previousAccuracyPercent}%</p>
          </div>
        </div>
      )}

      <Button type="button" size="lg" className="w-full max-w-xs rounded-full" onClick={onStart}>
        Start Today&rsquo;s Session →
      </Button>
    </div>
  )
}
