import type { Metadata } from 'next'
import Link from 'next/link'
import {
  BookOpen,
  Brain,
  Briefcase,
  Building2,
  Check,
  GraduationCap,
  HeartHandshake,
  Sparkles,
  Trophy,
  Upload,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FREE_TIER_DOCUMENT_LIMIT } from '@/features/quantum-document-transformer/freeTierLimit'

export const metadata: Metadata = {
  title: 'Mind Ur Mind Learning Lab™ — Read 3x Faster, Remember Everything',
  description:
    'An AI-powered learning system that helps students, competitive aspirants, and professionals read faster, retain more, and never forget what they read.',
}

// ── Who It's For ─────────────────────────────────────────────────────────

type AudienceCardProps = {
  icon: React.ReactNode
  title: string
  description: string
}

function AudienceCard({ icon, title, description }: AudienceCardProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-start gap-4 rounded-3xl border border-border/60 bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-muted/20">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  )
}

const AUDIENCES: readonly AudienceCardProps[] = [
  {
    icon: <GraduationCap className="size-5" aria-hidden="true" />,
    title: 'School & College Students',
    description: 'Finish heavy textbooks in days, not weeks — and hold on to formulas and concepts effortlessly.',
  },
  {
    icon: <Trophy className="size-5" aria-hidden="true" />,
    title: 'Competitive Aspirants',
    description:
      'UPSC, JEE, NEET and beyond — master massive current-affairs and reference material with Quantum Speed Reading™ and AI Spider Notes™.',
  },
  {
    icon: <Briefcase className="size-5" aria-hidden="true" />,
    title: 'Working Professionals',
    description: 'Absorb dense research papers and business reports 3x faster, without skimming past what matters.',
  },
  {
    icon: <HeartHandshake className="size-5" aria-hidden="true" />,
    title: 'Parents',
    description:
      "Quietly follow your child's real growth — retention, memory, and reading speed trends — without nagging or hovering.",
  },
  {
    icon: <Building2 className="size-5" aria-hidden="true" />,
    title: 'Schools & Coaching Institutes',
    description: 'Institutional licenses with bulk student management and a dedicated admin dashboard.',
  },
] as const

// ── 3-Step Transformation ────────────────────────────────────────────────

type TransformationStepProps = {
  icon: React.ReactNode
  title: string
  description: string
}

const TRANSFORMATION_STEPS: readonly TransformationStepProps[] = [
  {
    icon: <Sparkles className="size-5" aria-hidden="true" />,
    title: 'Discover Your Potential',
    description: 'A 5-minute Discovery Session reveals your starting point across reading, memory, and focus.',
  },
  {
    icon: <Upload className="size-5" aria-hidden="true" />,
    title: 'Upload & Train Daily',
    description: 'Turn any document into a personalized workout with the AI Document Transformer™ and your Learning Blueprint.',
  },
  {
    icon: <Brain className="size-5" aria-hidden="true" />,
    title: 'Master & Recall',
    description: 'Daily practice locks in permanent memory — so what you learn actually stays learned.',
  },
] as const

// ── Pricing ───────────────────────────────────────────────────────────────
// Aspirational tiers — mirrors the honesty convention already established on
// /pricing: no live recurring checkout exists yet (Stripe billing today only
// covers one-time course purchases), so every non-Free CTA here reads
// "Coming soon" rather than linking to a checkout that doesn't exist.

type PricingTierProps = {
  name: string
  price: string
  cadence?: string
  description: string
  features: readonly string[]
  cta: React.ReactNode
  highlighted?: boolean
}

function PricingTier({ name, price, cadence, description, features, cta, highlighted = false }: PricingTierProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-col gap-6 rounded-3xl border p-7',
        highlighted ? 'border-emerald-500/40 bg-emerald-500/[0.03] shadow-sm' : 'border-border/60 bg-card',
      )}
    >
      <div>
        <p className="text-base font-semibold text-foreground">{name}</p>
        <p className="mt-2 flex items-baseline gap-1">
          <span className="text-2xl font-semibold tracking-tight text-foreground">{price}</span>
          {cadence ? <span className="text-sm text-muted-foreground">{cadence}</span> : null}
        </p>
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
      </div>

      <ul className="flex flex-1 flex-col gap-2.5">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground">
            <Check className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>

      {cta}
    </div>
  )
}

function ComingSoonCta(): React.JSX.Element {
  return (
    <Button size="lg" className="w-full rounded-full" disabled>
      Coming soon
    </Button>
  )
}

// ── FAQ ───────────────────────────────────────────────────────────────────

type FaqItem = {
  question: string
  answer: string
}

const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: 'Why start free?',
    answer: `You get real access on Explorer — a full Discovery Session and ${FREE_TIER_DOCUMENT_LIMIT} AI document transformations — not a locked demo. See the transformation for yourself before you decide to go further.`,
  },
  {
    question: 'How does the Parent Tracking Dashboard work?',
    answer:
      "It's built to show growth trends — retention, memory, and reading-speed patterns — for your child's account, without requiring you to look over their shoulder. It ships with the Family Plan.",
  },
  {
    question: 'What happens when I hit my document limit?',
    answer: `Explorer includes ${FREE_TIER_DOCUMENT_LIMIT} AI document transformations to try the system for real. Paid plans raise or remove that limit — pricing for those isn't live yet, so join free today and we'll email you the moment they open.`,
  },
  {
    question: 'Is my data private?',
    answer:
      'Yes. Every account is isolated with row-level security, and nothing you upload is shared across accounts or used to train models for anyone else.',
  },
] as const

function FaqRow({ question, answer }: FaqItem): React.JSX.Element {
  return (
    <details className="group rounded-2xl border border-border/60 bg-card px-6 py-5 open:pb-5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-foreground marker:content-none">
        {question}
        <span className="text-muted-foreground transition-transform duration-(--duration-fast) group-open:rotate-45">+</span>
      </summary>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{answer}</p>
    </details>
  )
}

export default function HomePage(): React.JSX.Element {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="flex min-h-[88vh] items-center justify-center px-6 py-20">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center animate-in fade-in duration-700">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/[0.06] px-4 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <Zap className="size-3.5" aria-hidden="true" />
            AI-Powered Accelerated Learning
          </div>

          <h1 className="text-5xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-6xl">
            Read 3x Faster.
            <br />
            Remember Everything.
            <br />
            <span className="text-emerald-600 dark:text-emerald-400">Never Forget What You Read.</span>
          </h1>

          <p className="mx-auto mt-8 max-w-xl text-lg leading-8 text-muted-foreground">
            Mind Ur Mind Learning Lab™ turns any textbook, report, or reference material into a
            daily training ground for your mind — so what you read actually stays with you.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="min-w-[240px] rounded-full bg-emerald-600 text-white shadow-sm hover:bg-emerald-600/90">
              <Link href="/discover-learning-potential">Discover Your Potential — Free</Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="min-w-[200px] rounded-full">
              <Link href="/welcome">Get Started</Link>
            </Button>
          </div>

          <div className="mt-8 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="size-4" aria-hidden="true" />
            <span>Free to start — no credit card required</span>
          </div>
        </div>
      </section>

      {/* ── Who It's For ───────────────────────────────────────── */}
      <section id="who-its-for" aria-labelledby="who-its-for-heading" className="border-t border-border/60 mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="who-its-for-heading" className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Built for every kind of reader
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Whatever you&rsquo;re trying to master, the training adapts to you.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {AUDIENCES.map((audience) => (
            <AudienceCard key={audience.title} {...audience} />
          ))}
        </div>
      </section>

      {/* ── 3-Step Transformation ──────────────────────────────── */}
      <section id="how-it-works" aria-labelledby="how-it-works-heading" className="border-t border-border/60 bg-muted/20 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="how-it-works-heading" className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Your transformation, in three steps
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {TRANSFORMATION_STEPS.map((step, index) => (
              <div key={step.title} className="flex flex-col items-start gap-4 rounded-3xl border border-border/60 bg-card p-7">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {index + 1}
                  </div>
                  <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────── */}
      <section id="pricing-tiers" aria-labelledby="pricing-tiers-heading" className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="pricing-tiers-heading" className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Simple, honest pricing
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Start free today. Paid plans are on the way — join now and we&rsquo;ll let you know the moment they open.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <PricingTier
            highlighted
            name="Explorer"
            price="₹0"
            cadence="forever"
            description="Enough to feel the transformation for real."
            features={[
              '5-minute Discovery Session',
              `${FREE_TIER_DOCUMENT_LIMIT} AI document transformations`,
              'Days 1–3 of your Learning Blueprint',
            ]}
            cta={
              <Button asChild size="lg" className="w-full rounded-full bg-emerald-600 text-white hover:bg-emerald-600/90">
                <Link href="/welcome">Start Free</Link>
              </Button>
            }
          />

          <PricingTier
            name="Pro Learner"
            price="₹399"
            cadence="/mo"
            description="For learners ready to go all in."
            features={['Up to 15 documents/mo', 'Full 21-day Learning Blueprint', 'Everything in Explorer']}
            cta={<ComingSoonCta />}
          />

          <PricingTier
            name="Unlimited Pro"
            price="₹699"
            cadence="/mo"
            description="For power users who don't want limits."
            features={['Unlimited document uploads', 'Priority AI processing', 'Advanced Labs access']}
            cta={<ComingSoonCta />}
          />

          <PricingTier
            name="Family Plan"
            price="₹799"
            cadence="/mo"
            description="One plan, the whole household."
            features={['Up to 4 user accounts', 'Parent Tracking Dashboard', 'Everything in Unlimited Pro']}
            cta={<ComingSoonCta />}
          />
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-3xl border border-border/60 bg-muted/20 px-8 py-6 sm:flex-row">
          <div>
            <p className="text-base font-semibold text-foreground">Schools & Coaching Institutes</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Bulk student management, a dedicated admin dashboard, and custom pricing for your institution.
            </p>
          </div>
          <Button size="lg" className="rounded-full shrink-0" disabled>
            Request Quote — Coming Soon
          </Button>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────── */}
      <section id="faq" aria-labelledby="faq-heading" className="border-t border-border/60 bg-muted/20 py-20 sm:py-24">
        <div className="mx-auto max-w-2xl px-6">
          <h2 id="faq-heading" className="text-center text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Questions, answered
          </h2>

          <div className="mt-10 flex flex-col gap-3">
            {FAQ_ITEMS.map((item) => (
              <FaqRow key={item.question} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────── */}
      <section aria-labelledby="final-cta-heading" className="mx-auto flex max-w-3xl flex-col items-center px-6 py-20 text-center sm:py-24">
        <BookOpen className="size-8 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        <h2 id="final-cta-heading" className="mt-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Your mind, upgraded — starting today.
        </h2>
        <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">
          Take the free Discovery Session and see exactly where you stand.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg" className="min-w-[220px] rounded-full bg-emerald-600 text-white hover:bg-emerald-600/90">
            <Link href="/discover-learning-potential">Discover Your Potential — Free</Link>
          </Button>
        </div>
      </section>
    </>
  )
}
