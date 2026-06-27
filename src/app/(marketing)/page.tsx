import type { Metadata } from 'next'
import Link from 'next/link'
import { Bot, CreditCard, MonitorSmartphone, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { CourseGrid } from '@/features/courses/components/CourseGrid'

export const metadata: Metadata = {
  title: 'Mind Ur Mind Learning Lab™ — AI-Powered Learning',
  description:
    'Master new skills with AI-powered courses and a personal AI tutor that answers every question.',
}

type FeatureCardProps = {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({
  icon,
  title,
  description,
}: FeatureCardProps): React.JSX.Element {
  return (
    <div className="bg-card flex flex-col items-start gap-3 rounded-xl border p-6">
      <div className="bg-primary/10 rounded-lg p-2">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </div>
  )
}

export default async function HomePage(): Promise<React.JSX.Element> {
  const supabase = await createClient()

  const [
    { count: courseCount },
    { count: lessonCount },
    { data: featuredCourses },
  ] = await Promise.all([
    supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true),
    supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true),
    supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const courses = courseCount ?? 0
  const lessons = lessonCount ?? 0

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="from-background to-muted/40 relative overflow-hidden bg-gradient-to-b py-24 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Learn anything,
            <br />
            <span className="text-primary">powered by AI</span>
          </h1>
          <p className="text-muted-foreground mx-auto mb-8 max-w-xl text-lg leading-relaxed">
            Structured courses with a personal AI tutor that answers every
            question — exactly when you need it.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/courses">Browse courses</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/signup">Get started free</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────── */}
      <section className="bg-muted/40 border-y py-10">
        <div className="mx-auto grid max-w-2xl grid-cols-3 gap-6 px-6 text-center">
          <div>
            <p className="text-3xl font-bold">{courses}</p>
            <p className="text-muted-foreground mt-1 text-sm">
              {courses === 1 ? 'Course' : 'Courses'}
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold">{lessons}</p>
            <p className="text-muted-foreground mt-1 text-sm">
              {lessons === 1 ? 'Lesson' : 'Lessons'}
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold">AI</p>
            <p className="text-muted-foreground mt-1 text-sm">Powered tutor</p>
          </div>
        </div>
      </section>

      {/* ── Featured courses ──────────────────────────────────── */}
      {(featuredCourses ?? []).length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Featured courses
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Start learning today — free and paid courses available.
              </p>
            </div>
            <Link
              href="/courses"
              className="text-primary shrink-0 text-sm font-medium hover:underline"
            >
              Browse all →
            </Link>
          </div>

          <CourseGrid courses={featuredCourses ?? []} />
        </section>
      )}

      {/* ── Features strip ────────────────────────────────────── */}
      <section className="bg-muted/30 border-t py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold tracking-tight">
              Everything you need to master a skill
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Built for focused, effective learning — not endless scrolling.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<Bot className="text-primary size-5" />}
              title="AI Tutor"
              description="Ask questions about any lesson and get instant, context-aware answers from your personal tutor."
            />
            <FeatureCard
              icon={<TrendingUp className="text-primary size-5" />}
              title="Progress tracking"
              description="Mark lessons complete and watch your progress build — across every course you're enrolled in."
            />
            <FeatureCard
              icon={<CreditCard className="text-primary size-5" />}
              title="Free & paid courses"
              description="Start with free courses or unlock premium content with a one-time payment via Stripe."
            />
            <FeatureCard
              icon={<MonitorSmartphone className="text-primary size-5" />}
              title="Learn anywhere"
              description="Fully responsive — pick up exactly where you left off on any device."
            />
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────── */}
      <section className="py-20 text-center">
        <div className="mx-auto max-w-xl px-6">
          <h2 className="mb-3 text-2xl font-bold tracking-tight">
            Ready to start learning?
          </h2>
          <p className="text-muted-foreground mb-6 text-sm">
            Create a free account and access your first course in minutes.
          </p>
          <Button asChild size="lg">
            <Link href="/signup">Get started — it&apos;s free</Link>
          </Button>
        </div>
      </section>
    </>
  )
}
