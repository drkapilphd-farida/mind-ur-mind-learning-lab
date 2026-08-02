'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PrimaryLearningMethodCard } from '@/components/learning/PrimaryLearningMethodCard'
import { Badge } from '@/components/ui/badge'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { ArrivalBackground } from './ArrivalBackground'
import { AIPresenceLogo } from './AIPresenceLogo'
import { HeroPromise } from './HeroPromise'
import { OnboardingJourneyIndicator } from './OnboardingJourneyIndicator'

// Immersive Onboarding Polish™ (Sprint LW-1C.3) — visually secondary
// "Coming Soon" previews of future learning sources, per the brief's
// Future Features section.
const FUTURE_LEARNING_SOURCES = [
  { emoji: '📺', label: 'YouTube & Learn' },
  { emoji: '🌐', label: 'Website & Learn' },
] as const

// Sprint LW-1C.1 — learning materials, not technical file formats
// ("show 📚 Books, not PDF/DOC/DOCX").
const UPLOAD_MATERIALS = [
  { emoji: '📚', label: 'Books' },
  { emoji: '📄', label: 'Study PDFs' },
  { emoji: '📝', label: 'Notes' },
  { emoji: '📷', label: 'Notebook Photos' },
  { emoji: '📃', label: 'Text' },
] as const

// Sprint LW-1C — Choose Learning Method™. The real screen the previous
// sprint's `/welcome/preparing` placeholder was always meant to become.
// Reuses PrimaryLearningMethodCard.tsx (no duplication), plus
// ArrivalBackground and AIPresenceLogo (the Living AI Symbol™, continuing
// its breathing animation here, unmodified).
//
// Discovery-First Onboarding — Discover Your Learning Potential™ now runs
// as the mandatory first step right after signup (see signUp.ts and
// LearningPotentialRevealExperience.tsx), before this screen is ever
// reached, so the third "Discover Your Learning Potential™" card that
// Sprint QSR-3.5 added here is redundant and was removed. This screen is
// back to exactly two paths — Path A: Quantum Speed Reading™ / 21-Day
// Blueprint, Path B: Upload & Learn™ — matching the locked entry
// architecture (Home → Discover → Goal → Choose Your Path → AI Processing
// → Learning Workspace). Record & Learn™ remains intentionally absent
// from this hub (Sprint QSR-3.5); its own route (/welcome/record) and
// code are still fully intact and reachable directly.
export function ChooseLearningMethodExperience(): React.JSX.Element {
  const router = useRouter()
  const prefersReducedMotion = usePrefersReducedMotion()
  const [isExiting, setIsExiting] = useState(false)

  // Every screen transition should feel connected — the card itself already
  // holds a brief selection glow (PrimaryLearningMethodCard's own 280ms
  // hold) before calling this; layering a short screen-level fade on top
  // avoids a hard cut to the next route, matching the pattern already used
  // by Arrival Experience™ and the AI Thinking screen.
  function handleSelect(path: string): void {
    if (prefersReducedMotion) {
      router.push(path)
      return
    }
    setIsExiting(true)
    window.setTimeout(() => router.push(path), 200)
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-16">
      <ArrivalBackground />

      <div className={cn('mx-auto flex w-full max-w-3xl flex-col items-center gap-10 text-center transition-opacity duration-[250ms]', isExiting && 'opacity-0')}>
        <OnboardingJourneyIndicator currentStepId="method" className="w-full max-w-sm" />

        <AIPresenceLogo size={84} />

        <div>
          <h1 className={TYPOGRAPHY.display}>Choose Your Path</h1>
          <HeroPromise className="mt-6" startDelayMs={200} />
        </div>

        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
          <PrimaryLearningMethodCard
            emoji="⚡"
            title="Quantum Speed Reading™"
            subtitle="Start your 21-Day Blueprint — train reading speed, focus, and recall, no upload required."
            ctaLabel="Start Training →"
            onSelect={() => handleSelect('/labs/quantum-speed-reading')}
          />
          <PrimaryLearningMethodCard
            emoji="📄"
            title="Upload & Learn™"
            subtitle="Bring books, study notes, or handwritten pages."
            formats={UPLOAD_MATERIALS}
            ctaLabel="Start Uploading →"
            onSelect={() => handleSelect('/preview/learning-projects/new')}
          />
        </div>

        <div className="flex w-full flex-wrap items-center justify-center gap-3 pt-2">
          {FUTURE_LEARNING_SOURCES.map((source) => (
            <div
              key={source.label}
              className="flex items-center gap-2 rounded-full border border-border/50 bg-background/40 px-4 py-2 opacity-70 backdrop-blur-sm"
            >
              <span aria-hidden="true">{source.emoji}</span>
              <span className={TYPOGRAPHY.caption}>{source.label}</span>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
