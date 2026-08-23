import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Library — Quantum Speed Reading Lab™',
}

// SPRINT-2A — Quantum Speed Reading Library Cleanup™. Curates the review
// build from SPRINT-1B into the real Version-1 Library: Flash Intelligence
// Pack™, Progressive Chunk Reading™, Fixation Reduction™, and every
// legacy/orphaned item (Rapid Visual Intelligence™, legacy Chunk Reading,
// the old Sprint-1 "Start" flow) are removed from this list only — their
// route files and code are untouched, they simply aren't linked from here
// anymore. Reading Preparation™ is labeled optional since Core Reading
// Journey™ no longer requires it (see phrase-reading/page.tsx's gate).
// Visual Activation™ (now "Brain Gym") is no longer a journey step, so
// it's no longer listed here either — same treatment as this Library's
// other sibling pillars (Reading Intelligence, Intuition Development,
// Visualisation, Right Brain Activation, Brain Gym), none of which are
// listed on this page; it's reachable from its own pillar card instead.
type LibrarySection = {
  title: string
  note?: string
  items: { label: string; href: string }[]
}

const SECTIONS: LibrarySection[] = [
  {
    title: 'Reading Preparation™',
    note: 'Optional — you can also skip straight to Core Reading Journey™ below.',
    items: [
      { label: 'Reading Preparation™ (guided 6-step sequence)', href: '/labs/quantum-speed-reading/preparation' },
      { label: 'Eye Warm-up', href: '/labs/quantum-speed-reading/eye-warm-up' },
      { label: 'Eye Stretch', href: '/labs/quantum-speed-reading/eye-stretch' },
      { label: 'Eye Span', href: '/labs/quantum-speed-reading/eye-span' },
      { label: 'Regression Control', href: '/labs/quantum-speed-reading/regression-control' },
      { label: 'Reading Speed', href: '/labs/quantum-speed-reading/reading-speed' },
      { label: 'RSVP', href: '/labs/quantum-speed-reading/rsvp' },
    ],
  },
  {
    title: 'Core Reading Journey™',
    items: [
      { label: 'Phrase Reading™', href: '/labs/quantum-speed-reading/phrase-reading' },
      { label: 'Multi-Line Reading™', href: '/labs/quantum-speed-reading/multi-line-reading' },
      { label: 'Sentence Reading™', href: '/labs/quantum-speed-reading/sentence-reading' },
      { label: 'Paragraph Reading™', href: '/labs/quantum-speed-reading/paragraph-reading' },
    ],
  },
  {
    title: 'Reading Intelligence™',
    items: [
      { label: 'Reading Intelligence (hub)', href: '/labs/quantum-speed-reading/intelligence' },
      { label: 'Goals', href: '/labs/quantum-speed-reading/intelligence/goals' },
      { label: 'History', href: '/labs/quantum-speed-reading/intelligence/history' },
      { label: 'Achievements', href: '/labs/quantum-speed-reading/intelligence/achievements' },
      { label: 'Analytics', href: '/labs/quantum-speed-reading/intelligence/analytics' },
      { label: 'Reports', href: '/labs/quantum-speed-reading/reports' },
      { label: 'AI Reading Coach', href: '/labs/quantum-speed-reading/coach' },
    ],
  },
]

export default function QsrLibraryPage(): React.JSX.Element {
  return (
    <div>
      <div className="mx-auto max-w-3xl space-y-10 px-6 py-16">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Library</h1>
          <p className="mt-2 text-sm text-muted-foreground">Every Quantum Speed Reading exercise in your journey, in one place.</p>
        </div>

        {SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="mb-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">{section.title}</p>
            {section.note !== undefined && <p className="mb-3 text-xs text-muted-foreground">{section.note}</p>}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between gap-2 rounded-xl border bg-card px-4 py-3 text-sm text-foreground shadow-sm transition-colors hover:border-foreground/30"
                >
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
