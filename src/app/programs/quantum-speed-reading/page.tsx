import type { Metadata } from 'next'
import { translations } from '@/lib/i18n'
import { buildFaqPageSchema } from '@/lib/seo/faqSchema'
import QsrNav from '@/components/qsr/QsrNav'
import QsrHero from '@/components/qsr/QsrHero'
import QsrBrainScience from '@/components/qsr/QsrBrainScience'
import QsrAgeGroups from '@/components/qsr/QsrAgeGroups'
import QsrAppPreview from '@/components/qsr/QsrAppPreview'
import QsrMechanics from '@/components/qsr/QsrMechanics'
import QsrMoreThanSpeed from '@/components/qsr/QsrMoreThanSpeed'
import QsrFocusScreenTime from '@/components/qsr/QsrFocusScreenTime'
import QsrAllRoundDevelopment from '@/components/qsr/QsrAllRoundDevelopment'
import QsrCurriculum from '@/components/qsr/QsrCurriculum'
import QsrExamBenefits from '@/components/qsr/QsrExamBenefits'
import QsrAuthority from '@/components/qsr/QsrAuthority'
import QsrCredibilityStrip from '@/components/qsr/QsrCredibilityStrip'
import QsrFounderVideo from '@/components/qsr/QsrFounderVideo'
import QsrLiveIntroSession from '@/components/qsr/QsrLiveIntroSession'
import QsrAudience from '@/components/qsr/QsrAudience'
import QsrVideoTestimonials from '@/components/qsr/QsrVideoTestimonials'
import QsrFaq from '@/components/qsr/QsrFaq'
import QsrBatchNotice from '@/components/qsr/QsrBatchNotice'
import QsrSpeedTestInlineCta from '@/components/qsr/QsrSpeedTestInlineCta'
import Footer from '@/components/Footer'
import QsrStickyBar from '@/components/qsr/QsrStickyBar'
import QsrWhatsAppWidget from '@/components/qsr/QsrWhatsAppWidget'
import { WORKSHOP_CITIES } from '@/config/workshopCities'

export const metadata: Metadata = {
  title: '30-Day Quantum Speed Reading Masterclass — Dr. Kapil Dev Sharma',
  description:
    'Read 5x faster, retain more, and rebuild how your mind processes information in 30 days. 7 live masterclasses, daily app-tracked drills, ₹4,999 one-time enrollment.',
}

// Flagship Program Landing Page™ — the real destination TierFlagship's
// homepage CTA already points to (/programs/quantum-speed-reading), and
// the public landing page ThirtyDayMasterclassHeroCard's own comment
// names as still outstanding ("wherever eventually becomes the public
// landing page — out of scope here"). Single-goal direct-response page:
// deliberately no shared Navbar/nav links away from enrollment, just
// this page's own minimal QsrNav plus a sticky bottom CTA bar and a
// WhatsApp widget tuned to this exact program.
//
// Section order follows a deliberate narrative arc: hook (Hero) → why it
// works (BrainScience) → a free, no-risk taste of the technique itself
// (SpeedTestInlineCta) → how the training meets kids and adults
// differently (AgeGroups) → what daily practice feels like (AppPreview)
// → how the program is structured (Mechanics) → what it covers beyond
// raw reading speed (MoreThanSpeed, FocusScreenTime, AllRoundDevelopment
// — the latter cross-sells the standalone Habit App) → the week-by-week
// breakdown (Curriculum) → who is actually teaching it (Authority,
// CredibilityStrip, FounderVideo) → fit
// (Audience) → the same free test again, now as a lower-commitment
// alternative right where a hesitant visitor is deciding whether to
// commit to ₹4,999 (SpeedTestInlineCta) → social proof
// (VideoTestimonials) → final objection handling (Faq) → real batch
// cadence + final push (BatchNotice) before the footer. Three total
// speed-test CTAs on this page (Hero + these two) — deliberately no
// fourth or sticky/floating version, to avoid feeling spammy.
export default function QuantumSpeedReadingLandingPage(): React.JSX.Element {
  const faqSchema = buildFaqPageSchema(translations.en.qsrLanding.faq.items)

  return (
    <div className="warm-light min-h-screen font-sans antialiased">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqSchema }} />
      <QsrNav />
      <main>
        <QsrHero />
        <QsrBrainScience />
        <QsrSpeedTestInlineCta variant="afterScience" />
        <QsrAgeGroups />
        <QsrAppPreview />
        <QsrMechanics />
        <QsrMoreThanSpeed />
        <QsrFocusScreenTime />
        <QsrAllRoundDevelopment />
        <QsrCurriculum />
        <QsrExamBenefits />
        <QsrAuthority />
        <QsrCredibilityStrip cities={WORKSHOP_CITIES} />
        <QsrFounderVideo />
        <QsrLiveIntroSession />
        <QsrAudience />
        <QsrSpeedTestInlineCta variant="beforePricing" />
        <QsrVideoTestimonials />
        <QsrFaq />
        <QsrBatchNotice />
      </main>
      <Footer />
      <QsrStickyBar />
      <QsrWhatsAppWidget />
    </div>
  )
}
