import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getReadingIntelligenceSessions, getSelectedReadingGoal } from '@/features/quantum-speed-reading/adaptive-intelligence/readingIntelligenceQueries'
import { computeReadingProfile } from '@/features/quantum-speed-reading/adaptive-intelligence/readingProfileEngine'
import { computeReadingDna } from '@/features/quantum-speed-reading/adaptive-intelligence/readingDnaEngine'
import { computeCategoryIntelligence } from '@/features/quantum-speed-reading/adaptive-intelligence/categoryIntelligenceEngine'
import { generateSessionFeedbackReport } from '@/features/quantum-speed-reading/ai-reading-coach/sessionFeedbackEngine'
import { generateImprovementTips } from '@/features/quantum-speed-reading/ai-reading-coach/improvementTipsEngine'
import { detectWeaknesses } from '@/features/quantum-speed-reading/ai-reading-coach/weaknessDetectorEngine'
import { detectStrengths } from '@/features/quantum-speed-reading/ai-reading-coach/strengthDetectorEngine'
import { recommendNextSession } from '@/features/quantum-speed-reading/ai-reading-coach/nextSessionRecommendationEngine'
import { generateAiMentorObservation } from '@/features/quantum-speed-reading/ai-reading-coach/aiMentorEngine'
import { SessionFeedbackReport } from '@/features/quantum-speed-reading/components/ai-reading-coach/SessionFeedbackReport'
import { ImprovementTipsList } from '@/features/quantum-speed-reading/components/ai-reading-coach/ImprovementTipsList'
import { WeaknessStrengthCards } from '@/features/quantum-speed-reading/components/ai-reading-coach/WeaknessStrengthCards'
import { AiMentorCard } from '@/features/quantum-speed-reading/components/ai-reading-coach/AiMentorCard'
import { NextSessionRecommendationCard } from '@/features/quantum-speed-reading/components/ai-reading-coach/NextSessionRecommendationCard'

export const metadata: Metadata = {
  title: 'AI Reading Coach™ — Quantum Speed Reading™',
}

// Sprint-5 — the real AI Reading Coach™ report that Sprint-3's "Continue"
// button already points at. This page's own URL never changes; only its
// content does (it was always a disclosed Sprint-4/5 placeholder, never
// part of Sprint-3's locked component tree). It sources the just-completed
// session by querying Sprint-4's existing, unmodified
// getReadingIntelligenceSessions() rather than extending any Sprint-2/3
// query string further.
export default async function AiReadingCoachPage(): Promise<React.JSX.Element> {
  const [sessions, selectedGoalId] = await Promise.all([getReadingIntelligenceSessions(), getSelectedReadingGoal()])
  const latest = sessions[0] ?? null

  if (!latest) {
    return (
      <div className="mx-auto flex min-h-[80dvh] max-w-md flex-col items-center justify-center gap-8 px-6 py-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/[0.08]" aria-hidden="true">
          <div className="size-8 rounded-full bg-primary/[0.15]" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-balance text-foreground">
            Your Reading Coach report is on its way
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Your session is still saving — refresh in a moment to see your full report.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full transition-transform active:scale-[0.98]">
          <Link href="/labs/quantum-speed-reading">Back to Lab</Link>
        </Button>
      </div>
    )
  }

  const previous = sessions[1] ?? null
  const priorSessions = sessions.slice(1, 6) // up to 5 sessions before the latest, for rolling comparisons
  const recentWindow = sessions.slice(0, 5) // most recent 5, including latest, for strength detection

  const profile = computeReadingProfile(sessions)
  const dnaTraits = computeReadingDna(sessions)
  const categoryIntelligence = computeCategoryIntelligence(sessions)

  const feedbackReport = generateSessionFeedbackReport(latest, priorSessions)
  const tips = generateImprovementTips(latest, priorSessions)
  const weaknesses = detectWeaknesses(latest, priorSessions)
  const strengths = detectStrengths(dnaTraits, recentWindow)
  const recommendation = recommendNextSession(profile, categoryIntelligence, latest, previous, selectedGoalId)
  const mentorObservation = generateAiMentorObservation(latest, strengths, weaknesses)

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="text-center">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">AI Reading Coach™</p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground">Your Coaching Report</h1>
      </div>

      <div className="mt-10 space-y-6">
        <SessionFeedbackReport report={feedbackReport} />
        <AiMentorCard observation={mentorObservation} />
        <ImprovementTipsList tips={tips} />
        <WeaknessStrengthCards strengths={strengths} weaknesses={weaknesses} />
        {recommendation && <NextSessionRecommendationCard recommendation={recommendation} />}

        <div className="flex flex-col gap-2">
          <Button asChild size="lg" className="rounded-full">
            <Link href="/labs/quantum-speed-reading/coach">View Full Dashboard</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link href="/labs/quantum-speed-reading">Back to Lab</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
