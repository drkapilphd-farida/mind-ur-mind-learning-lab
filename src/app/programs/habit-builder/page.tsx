import type { Metadata } from 'next'
import { translations } from '@/lib/i18n'
import { buildFaqPageSchema } from '@/lib/seo/faqSchema'
import HabitBuilderNav from '@/components/habit-builder/HabitBuilderNav'
import HabitBuilderHero from '@/components/habit-builder/HabitBuilderHero'
import HabitBuilderBenefits from '@/components/habit-builder/HabitBuilderBenefits'
import HabitBuilderHowItWorks from '@/components/habit-builder/HabitBuilderHowItWorks'
import HabitBuilderPricing from '@/components/habit-builder/HabitBuilderPricing'
import HabitBuilderFaq from '@/components/habit-builder/HabitBuilderFaq'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'
import { WHATSAPP_HABIT_BUILDER_INQUIRY_LINK } from '@/config/whatsappSupportLink'

export const metadata: Metadata = {
  title: 'Quantum Mindset & Habit Builder™ — 21-Day Program | Mind Ur Mind',
  description:
    'A 21-day guided program pairing daily reading practice with focus and memory exercises. Free for Days 1–7, then a one-time ₹99 payment to continue — never a subscription.',
}

// Quantum Mindset & Habit Builder™ public landing page — the real
// standalone marketing page the earlier audit confirmed did not exist:
// the product itself only lived behind /labs/quantum-speed-reading/journey/*,
// which middleware.ts gates behind login, so a logged-out visitor had
// nowhere to actually learn about or sign up for it. This page lives
// under /programs (same tier as /programs/quantum-speed-reading) —
// outside PROTECTED_PATHS and outside DOMAIN_ROUTES, so it's reachable
// logged-out from either domain. Its own CTAs route through
// HABIT_BUILDER_SIGNUP_HREF (/signup?next=.../journey/1), which now
// resolves correctly since /signup/page.tsx was extended to read `next`.
//
// Deliberately no testimonials section — no testimonial in the site's
// content is tagged to this product specifically (every existing one is
// programKey: 'qsr'/'retreat'/'mentoring'/'course'); borrowing a QSR
// testimonial here would misattribute it. Add a real one once it exists.
// Also deliberately no XP/points/badges/leaderboard copy — none of that
// is user-facing in the real product today (confirmed in the code
// audit), so none of it is advertised here.
export default function HabitBuilderLandingPage(): React.JSX.Element {
  const faqSchema = buildFaqPageSchema(translations.en.habitBuilderLanding.faq.items)

  return (
    <div className="warm-light min-h-screen font-sans antialiased">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqSchema }} />
      <HabitBuilderNav />
      <main>
        <HabitBuilderHero />
        <HabitBuilderBenefits />
        <HabitBuilderHowItWorks />
        <HabitBuilderPricing />
        <HabitBuilderFaq />
      </main>
      <Footer />
      <WhatsAppWidget href={WHATSAPP_HABIT_BUILDER_INQUIRY_LINK} analyticsLocation="habit_builder_widget" />
    </div>
  )
}
