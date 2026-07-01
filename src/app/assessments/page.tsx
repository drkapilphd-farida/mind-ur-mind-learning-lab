import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, Brain, Clock, Compass, Eye, Repeat, Sparkles } from 'lucide-react'
import { PrivacyCard } from '@/components/assessment/PrivacyCard'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Mind Assessment Center™',
  description:
    'Discover how your mind learns today so your learning journey can be personalized for you.',
}

const journeySteps = [
  { icon: BookOpen, label: 'Reading' },
  { icon: Brain, label: 'Memory' },
  { icon: Eye, label: 'Focus' },
  { icon: Repeat, label: 'Learning Habits' },
  { icon: Compass, label: 'Mindset' },
] as const

export default function AssessmentsLandingPage(): React.JSX.Element {
  return (
    <main className="relative isolate overflow-hidden bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[-12rem] -z-10 flex justify-center blur-3xl"
      >
        <div className="h-[26rem] w-[26rem] rounded-full bg-gradient-to-br from-violet-200 via-sky-200 to-emerald-100 opacity-50 dark:from-violet-900/30 dark:via-sky-900/20 dark:to-emerald-900/20" />
      </div>

      <section className="mx-auto flex max-w-3xl flex-col items-center px-6 pt-20 pb-16 text-center sm:pt-28 sm:pb-20">
        <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-700">
          <div
            aria-hidden="true"
            className="mx-auto mb-8 flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-sky-100 ring-1 ring-foreground/5 dark:from-violet-900/40 dark:to-sky-900/30"
          >
            <Sparkles className="size-10 text-violet-500" />
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 px-4 py-1.5 text-sm font-medium text-muted-foreground">
            Mind Assessment Center™
          </span>

          <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
            Welcome to Mind Assessment Center™
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
            Discover how your mind learns today so your learning journey can be personalized for
            you.
          </p>

          <p className="mx-auto mt-6 max-w-md text-sm leading-7 text-muted-foreground">
            In the next few minutes, you&apos;ll explore different aspects of how you read,
            remember and focus. There are no right or wrong answers. Simply respond honestly.
            Everything is private.
          </p>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both mt-10 flex flex-col items-center gap-4 delay-150 duration-700 sm:flex-row">
          <Button asChild size="lg" className="min-w-[220px] rounded-full">
            <Link href="/assessments/complete">Begin My Journey</Link>
          </Button>
          <Button asChild size="lg" variant="ghost" className="min-w-[160px] rounded-full">
            <Link href="#your-journey">Learn More</Link>
          </Button>
        </div>

        <div className="animate-in fade-in fill-mode-both mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground delay-300 duration-700">
          <Clock className="size-4" aria-hidden="true" />
          <span>≈ 8–10 minutes</span>
        </div>
      </section>

      <section id="your-journey" aria-labelledby="journey-heading" className="mx-auto max-w-4xl px-6 pb-16">
        <div className="rounded-[2rem] border border-border/60 bg-card/60 p-8 sm:p-10">
          <h2 id="journey-heading" className="text-center text-xl font-semibold text-foreground">
            What you&apos;ll explore
          </h2>

          <ul className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-5">
            {journeySteps.map((step) => {
              const Icon = step.icon
              return (
                <li key={step.label} className="flex flex-col items-center gap-3 text-center">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{step.label}</span>
                </li>
              )
            })}
          </ul>

          <div className="mt-8 flex items-center justify-center gap-2 rounded-2xl bg-primary/5 px-5 py-4 text-center">
            <Sparkles className="size-4 text-primary" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">Personalized AI Insights at the end</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 pb-24">
        <PrivacyCard />
      </section>
    </main>
  )
}
