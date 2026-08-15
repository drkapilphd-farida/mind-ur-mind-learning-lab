'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { GraduationCap, MessageCircle, PlayCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCurriculumDayTheme } from '@/features/thirty-day-curriculum/curriculumDatabase'
import { computeConsistencyPercent, getHighestUnlockedDay, loadCurriculumProgress } from '@/features/thirty-day-curriculum/curriculumProgress'
import { RAZORPAY_MASTERCLASS_PAYMENT_LINK } from '@/config/masterclassPaymentLink'
import { WHATSAPP_MASTERCLASS_INQUIRY_LINK } from '@/config/whatsappSupportLink'

const CURRICULUM_ROUTE = '/labs/quantum-speed-reading/thirty-day-curriculum'

// Tier 3 · Flagship Mastery Program — the 3-Tier Value Ladder's premium
// hero card, presenting the real, free, self-paced 30-Day Curriculum
// (client-only progress, no payment gate — see curriculumProgress.ts)
// alongside a direct Live Cohort enrollment CTA. The ₹4,999 checkout
// opens Razorpay's real hosted payment link in a new tab — completing it
// takes real payment; it does not automatically unlock anything in this
// app (no entitlement is wired to it), so this card only ever promises
// what's true: enrollment/scheduling happens after payment, not before.
export function ThirtyDayMasterclassHeroCard(): React.JSX.Element {
  const [nextDay, setNextDay] = useState<number | null>(null)
  const [hasStarted, setHasStarted] = useState(false)
  const [consistencyPercent, setConsistencyPercent] = useState(0)

  useEffect(() => {
    const progress = loadCurriculumProgress()
    setHasStarted(progress.completedDays.length > 0)
    setNextDay(getHighestUnlockedDay(progress))
    setConsistencyPercent(computeConsistencyPercent(progress))
  }, [])

  const theme = nextDay !== null ? getCurriculumDayTheme(nextDay) : null

  return (
    <div
      className="glass-premium-card glass-premium-lift glass-tier-flagship relative overflow-hidden p-6 sm:p-8"
      data-hero-card="thirty-day-masterclass"
    >
      <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-emerald-500/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-28 -left-14 size-64 rounded-full bg-emerald-400/[0.06] blur-3xl" aria-hidden="true" />

      <div className="relative flex flex-col gap-6">
        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-500 text-white shadow-md">
              <GraduationCap className="size-6" aria-hidden="true" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-semibold tracking-widest text-emerald-600 uppercase dark:text-emerald-400">Tier 3 · Flagship Mastery Program</p>
                <span
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400"
                  data-urgency-badge="true"
                >
                  🟢 Batch 01 Filling Fast
                </span>
              </div>
              <h2 className="mt-1 font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                ⚡ 30-Day Quantum Speed Reading Mastery™ + Live Mentorship
              </h2>
              <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
                Unlock superhuman reading speed (1000+ WPM), photographic memory, and direct live coaching with Dr. Kapil Dev Sharma.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
            <Button
              asChild
              size="lg"
              className="w-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md transition-all duration-300 hover:from-emerald-500 hover:to-emerald-400 active:scale-95 sm:w-auto"
              data-enroll-button="true"
            >
              <a href={RAZORPAY_MASTERCLASS_PAYMENT_LINK} target="_blank" rel="noopener noreferrer">
                <Sparkles className="size-4" aria-hidden="true" />
                Enroll Now for ₹4,999 →
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              className="w-full rounded-full bg-[#25D366] text-white shadow-md transition-all duration-300 hover:bg-[#1EBE5B] active:scale-95 sm:w-auto"
              data-whatsapp-button="true"
            >
              <a href={WHATSAPP_MASTERCLASS_INQUIRY_LINK} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-4" aria-hidden="true" />
                💬 Chat with Dr. Kapil on WhatsApp
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full rounded-full transition-all duration-300 active:scale-95 sm:w-auto"
              data-reviews-button="true"
            >
              <Link href="/reviews">
                <PlayCircle className="size-4" aria-hidden="true" />
                ▶ Watch Success Stories (200+ Reviews)
              </Link>
            </Button>
          </div>

          <p className="text-xs font-medium text-muted-foreground" data-trust-badge="true">
            ★ Trusted by thousands of students &amp; professionals
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-2 text-sm text-foreground sm:grid-cols-3">
          <li className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/60 px-3 py-2.5">
            <Sparkles className="size-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
            30-day structured curriculum
          </li>
          <li className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/60 px-3 py-2.5">
            <Sparkles className="size-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
            7 live mentorship sessions
          </li>
          <li className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/60 px-3 py-2.5">
            <Sparkles className="size-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
            Real WPM + comprehension checkpoints
          </li>
        </ul>

        <div className="flex flex-col gap-3 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Your Curriculum Progress</p>
            <p className="mt-0.5 text-sm font-medium text-foreground" data-curriculum-status={hasStarted ? 'in-progress' : 'not-started'}>
              {nextDay === null ? 'Loading…' : hasStarted && theme !== null ? `Day ${nextDay} — ${theme.title}` : 'Not started yet — free to begin'}
            </p>
            {hasStarted && <p className="text-xs text-muted-foreground">{consistencyPercent}% of the 30 days complete</p>}
          </div>
          <Button asChild size="lg" variant="outline" className="w-full rounded-full transition-all duration-300 active:scale-95 sm:w-auto">
            <Link href={CURRICULUM_ROUTE}>{nextDay === null ? 'Open Curriculum' : hasStarted ? `Continue Day ${nextDay}` : 'Start Day 1 — Free'}</Link>
          </Button>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 px-4 py-3">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Live Cohort Mentorship</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            7 live sessions with Dr. Kapil Dev Sharma. Enrollment is via secure Razorpay checkout — your batch schedule follows by email after
            payment.
          </p>
        </div>

        <Link href="/pricing" className="text-xs font-medium text-primary hover:underline">
          View all plans &amp; pricing →
        </Link>
      </div>
    </div>
  )
}
