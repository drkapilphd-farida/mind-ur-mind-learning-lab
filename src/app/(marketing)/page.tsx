import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, Brain, Calendar, CheckCircle2, Eye, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Mind Ur Mind Learning Lab™ — Train Your Mind',
  description:
    'An AI-powered learning system that helps students improve reading speed, memory, focus and learning efficiency through daily intelligent practice.',
}

type LabCardProps = {
  icon: React.ReactNode
  title: string
  description: string
}

function LabCard({ icon, title, description }: LabCardProps): React.JSX.Element {
  return (
    <div className="group flex flex-col items-start gap-4 rounded-3xl border border-border/60 bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-muted/20">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  )
}

const journeySteps = ['Assessment', 'Practice', 'Improvement', 'Mastery'] as const

export default function HomePage(): React.JSX.Element {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="flex min-h-[88vh] items-center justify-center px-6 py-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center animate-in fade-in duration-700">
          <h1 className="text-5xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-6xl">
            Train Your Mind.
            <br />
            Transform The Way You Learn.
          </h1>

          <p className="mx-auto mt-8 max-w-xl text-lg leading-8 text-muted-foreground">
            An AI-powered learning system that helps students improve reading speed, memory,
            focus and learning efficiency through daily intelligent practice.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="min-w-[220px] rounded-full shadow-sm">
              <Link href="/assessments">Start Free Assessment</Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="min-w-[200px] rounded-full">
              <Link href="#learning-system">Explore Learning System</Link>
            </Button>
          </div>

          <div className="mt-8 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="size-4" aria-hidden="true" />
            <span>Built for curious minds, ages 5 through adulthood</span>
          </div>
        </div>
      </section>

      {/* ── Three Core Intelligence Labs ───────────────────────── */}
      <section id="learning-system" aria-labelledby="learning-system-heading" className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="learning-system-heading" className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Three Core Intelligence Labs
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Each lab is a focused practice space — built to sharpen one part of how your mind
            works.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <LabCard
            icon={<BookOpen className="size-5" aria-hidden="true" />}
            title="Quantum Speed Reading Lab™"
            description="Read faster. Understand better."
          />
          <LabCard
            icon={<Brain className="size-5" aria-hidden="true" />}
            title="Memory Intelligence Lab™"
            description="Remember more. Forget less."
          />
          <LabCard
            icon={<Eye className="size-5" aria-hidden="true" />}
            title="Focus Intelligence Lab™"
            description="Build deep concentration."
          />
        </div>
      </section>

      {/* ── AI Learning Coach ──────────────────────────────────── */}
      <section aria-labelledby="ai-coach-heading" className="border-t border-border/60 bg-muted/20 py-20 sm:py-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
          <div
            aria-hidden="true"
            className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"
          >
            <Sparkles className="size-6" />
          </div>
          <h2 id="ai-coach-heading" className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Your AI Learning Coach
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            Every student receives personalized guidance — calm, encouraging, and tailored to how
            your mind learns. It notices your patterns and gently shapes your next practice
            session around them.
          </p>
        </div>
      </section>

      {/* ── Student Journey ────────────────────────────────────── */}
      <section aria-labelledby="journey-heading" className="mx-auto max-w-4xl px-6 py-20 sm:py-24">
        <h2 id="journey-heading" className="text-center text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Your Journey
        </h2>

        <ol className="mt-12 grid grid-cols-2 gap-y-10 sm:grid-cols-4 sm:gap-y-0">
          {journeySteps.map((step, index) => (
            <li key={step} className="flex flex-col items-center gap-3 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {index + 1}
              </div>
              <span className="text-sm font-medium text-foreground">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Live Mentorship / About ─────────────────────────────── */}
      <section id="about" aria-labelledby="mentorship-heading" className="border-t border-border/60 bg-muted/20 py-20 sm:py-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
          <div
            aria-hidden="true"
            className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"
          >
            <Calendar className="size-6" />
          </div>
          <h2 id="mentorship-heading" className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Live Mentorship
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            When deeper understanding is needed, students join live learning sessions with Dr.
            Kapil Dev Sharma. No recorded courses. No video library — just real guidance, in real
            time.
          </p>
        </div>
      </section>
    </>
  )
}
