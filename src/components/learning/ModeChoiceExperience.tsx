'use client'

import Link from 'next/link'
import { BookOpenText, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { trackEvent } from '@/lib/analytics/track'
import { cn } from '@/lib/utils'

type ModeChoiceExperienceProps = {
  projectId: string
  projectTitle: string
  documentTitle: string
  // Mode A's real destination — /read with the 6-stage Intelligent
  // Reading sub-mode pre-selected (see read/page.tsx's own `qsrMode`
  // search param handling) rather than /read's own default 'sequential'
  // view, so choosing Mode A here lands directly in the flow this screen
  // promises, no extra in-page mode picker required.
  modeAHref: string
  // Mode B routes straight to the existing, already-real Learning
  // Blueprint hub (summaries, spider notes/mind map, memory pegs,
  // the full mode grid) — this screen is a fork in front of it, not a
  // replacement for it.
  modeBHref: string
}

type ModeCardProps = {
  href: string
  icon: React.ComponentType<{ className?: string }>
  eyebrow: string
  title: string
  description: string
  points: readonly string[]
  ctaLabel: string
  onSelect: () => void
}

const CARD_CLASS =
  'group relative flex h-full flex-col items-start gap-4 overflow-hidden rounded-3xl border border-border bg-background/60 px-7 py-8 text-left backdrop-blur-sm transition-all duration-300 ease-out shadow-sm hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'

function ModeCard({ href, icon: Icon, eyebrow, title, description, points, ctaLabel, onSelect }: ModeCardProps): React.JSX.Element {
  return (
    <Link href={href} onClick={onSelect} className={CARD_CLASS}>
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-foreground/[0.04] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden="true"
      />
      <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="size-6" />
      </div>
      <div>
        <Badge variant="secondary">{eyebrow}</Badge>
        <p className={cn(TYPOGRAPHY.h2, 'mt-2')}>{title}</p>
        <p className={cn(TYPOGRAPHY.body, 'mt-2 text-muted-foreground')}>{description}</p>
      </div>
      <ul className="mt-1 space-y-1.5">
        {points.map((point) => (
          <li key={point} className={cn(TYPOGRAPHY.caption, 'flex items-start gap-2')}>
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            {point}
          </li>
        ))}
      </ul>
      <p className="brand-gradient-text mt-auto pt-2 text-sm font-semibold">{ctaLabel}</p>
    </Link>
  )
}

// Mode A / Mode B Fork™ (Phase 2) — the one real decision point every
// upload reaches exactly once, right after processing finishes (see
// processing/page.tsx and ProcessingExperience.tsx's own redirect target).
// A returning visitor who navigates straight to the project's own hub URL
// later never sees this again — it's the "before they start studying"
// moment, not a gate repeated on every visit. Both destinations are real,
// already-built experiences; this screen is purely a fork in front of
// them, not a new mode of its own.
export function ModeChoiceExperience({ projectId, projectTitle, documentTitle, modeAHref, modeBHref }: ModeChoiceExperienceProps): React.JSX.Element {
  function trackChoice(mode: 'speed-reading' | 'ai-supercharged'): void {
    trackEvent('mode_choice_selected', { projectId, mode })
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col items-center justify-center gap-10 px-6 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <p className={TYPOGRAPHY.label}>{documentTitle}</p>
        <h1 className={TYPOGRAPHY.display}>How do you want to study this?</h1>
        <p className={cn(TYPOGRAPHY.body, 'max-w-md text-muted-foreground')}>
          {projectTitle} is ready. Pick a mode to start — you can always reach the other one later from this project.
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
        <ModeCard
          href={modeAHref}
          icon={BookOpenText}
          eyebrow="Mode A"
          title="Pure Speed Reading"
          description="A clean, distraction-free reading session with a live, adjustable WPM pacer."
          points={['Choose your own reading method', 'Live speed control as you read', 'The real 6-stage reading flow']}
          ctaLabel="Start Speed Reading →"
          onSelect={() => trackChoice('speed-reading')}
        />
        <ModeCard
          href={modeBHref}
          icon={Sparkles}
          eyebrow="Mode B"
          title="AI Supercharged Learning"
          description="Let AI transform this document into study material alongside your reading."
          points={['Summaries & Neural Map Notes', 'Mind maps & memory pegs', 'The full AI Learning Mode toolkit']}
          ctaLabel="Open AI Study Tools →"
          onSelect={() => trackChoice('ai-supercharged')}
        />
      </div>
    </div>
  )
}
