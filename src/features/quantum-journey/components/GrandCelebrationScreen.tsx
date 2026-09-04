'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Flame, TrendingUp, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LivingBrainLogo } from '@/components/brand/LivingBrainLogo'
import { playCertificateFanfare } from '@/app/unified-quantum-session-preview/components/soundEngine'
import { ConfettiBurst } from './ConfettiBurst'
import { AppTwoFinaleUpsellCta } from './AppTwoFinaleUpsellCta'
import { generateJourneyCompletionSummary } from '../actions/generateJourneyCompletionSummary'

const CERTIFICATE_HREF = '/labs/quantum-speed-reading/journey/certificate'

type GrandCelebrationScreenProps = {
  studentFirstName: string
  baselineWpm: number | null
  day21Wpm: number
  day21AccuracyPercent: number
  resultingStreak: number
}

// Day 21 Completion Certificate & Grand Celebration Flow™ — replaces the
// normal Day-Complete screen only on Day 21, the one genuine once-per-
// user finale in the whole journey. Confetti + fanfare fire once on
// mount (both respect prefers-reduced-motion — see ConfettiBurst.tsx's
// own guard); the AI summary streams in client-side without blocking the
// "View Your Certificate" CTA, the same "AI never blocks real progress"
// rule every other AI-Coach moment in this app already follows.
export function GrandCelebrationScreen({
  studentFirstName,
  baselineWpm,
  day21Wpm,
  day21AccuracyPercent,
  resultingStreak,
}: GrandCelebrationScreenProps): React.JSX.Element {
  const router = useRouter()
  const [summaryMessage, setSummaryMessage] = useState<string | null>(null)

  const growthPercent = baselineWpm !== null && baselineWpm > 0 ? Math.round(((day21Wpm - baselineWpm) / baselineWpm) * 100) : null

  useEffect(() => {
    playCertificateFanfare()
    // Day 21 Finale Haptic™ — the biggest celebratory moment in the whole
    // journey gets the single longest, most distinctive vibration pattern
    // in the app (every other haptic elsewhere is a short single pulse or
    // a breath-cadence flutter) — same inline guard convention used
    // everywhere else, no shared wrapper.
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([20, 60, 20, 60, 40])
    let cancelled = false
    void generateJourneyCompletionSummary({
      studentName: studentFirstName,
      baselineWpm: baselineWpm ?? 0,
      finalWpm: day21Wpm,
      growthPercent,
      finalAccuracyPercent: day21AccuracyPercent,
    }).then((result) => {
      if (!cancelled) setSummaryMessage(result)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 px-6 py-16 text-center">
      <ConfettiBurst />

      <motion.div
        animate={{ boxShadow: ['0 0 0px 0px rgba(245,158,11,0.4)', '0 0 32px 12px rgba(245,158,11,0.3)', '0 0 0px 0px rgba(245,158,11,0.4)'] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        className="flex size-20 items-center justify-center rounded-full"
      >
        <LivingBrainLogo size={72} />
      </motion.div>

      <div>
        <p className="flex items-center justify-center gap-1.5 text-xs font-medium tracking-widest text-amber-600 uppercase dark:text-amber-400">
          <Award className="size-3.5" aria-hidden="true" />
          Quantum Mindset & Habit Builder™ Complete
        </p>
        <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Congratulations, {studentFirstName}!
        </h1>
      </div>

      <div className="w-full rounded-2xl border border-border/60 bg-card/60 p-5 text-left">
        <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Dr. Kapil&apos;s Note™</p>
        {summaryMessage !== null ? (
          <p className="mt-2 text-sm leading-relaxed text-foreground">{summaryMessage}</p>
        ) : (
          <div className="mt-2.5 space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          </div>
        )}
      </div>

      <div className="flex w-full items-center gap-3">
        <div className="flex-1 rounded-2xl border border-border/60 bg-card/60 p-4">
          <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">Day 1 Baseline</p>
          <p className="font-heading text-xl font-bold tabular-nums text-foreground">{baselineWpm ?? '—'} WPM</p>
        </div>
        <TrendingUp className="size-5 shrink-0 text-amber-500" aria-hidden="true" />
        <div className="flex-1 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent p-4">
          <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">Day 21 Final</p>
          <p className="font-heading text-xl font-bold tabular-nums text-foreground">
            {day21Wpm} WPM
            {growthPercent !== null && (
              <span className={`ml-1 text-xs font-semibold ${growthPercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                {growthPercent >= 0 ? '+' : ''}
                {growthPercent}%
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 rounded-2xl border border-orange-500/20 bg-orange-500/5 px-4 py-3">
        <Flame className="size-4 text-orange-500" aria-hidden="true" />
        <span className="text-sm font-semibold text-foreground">{resultingStreak}-Day Streak</span>
      </div>

      <div className="flex w-full flex-col items-center gap-3">
        <Button asChild size="lg" className="w-full max-w-xs rounded-full">
          <Link href={CERTIFICATE_HREF}>View Your Certificate →</Link>
        </Button>
        <Button type="button" variant="outline" size="lg" className="rounded-full" onClick={() => router.push('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>

      <AppTwoFinaleUpsellCta />
    </div>
  )
}
