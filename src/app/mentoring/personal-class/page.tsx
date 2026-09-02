import type { Metadata } from 'next'
import { translations } from '@/lib/i18n'
import { buildFaqPageSchema } from '@/lib/seo/faqSchema'
import MentoringNav from '@/components/mentoring/MentoringNav'
import MentoringHero from '@/components/mentoring/MentoringHero'
import MentoringFit from '@/components/mentoring/MentoringFit'
import MentoringAreas from '@/components/mentoring/MentoringAreas'
import MentoringComparison from '@/components/mentoring/MentoringComparison'
import MentoringProcess from '@/components/mentoring/MentoringProcess'
import MentoringGuide from '@/components/mentoring/MentoringGuide'
import MentoringTestimonials from '@/components/mentoring/MentoringTestimonials'
import MentoringApply from '@/components/mentoring/MentoringApply'
import MentoringFaq from '@/components/mentoring/MentoringFaq'
import Footer from '@/components/Footer'
import MentoringStickyBar from '@/components/mentoring/MentoringStickyBar'
import MentoringWhatsAppWidget from '@/components/mentoring/MentoringWhatsAppWidget'

export const metadata: Metadata = {
  title: 'Personal Class — 1-on-1 Intensive Mentoring — Dr. Kapil Dev Sharma',
  description:
    'Private, one-on-one mentoring for overthinking, focus, and personal growth, shaped around your own situation — guided by Dr. Kapil Dev Sharma, 26 years of experience as a professor, researcher, and life coach.',
}

// Personal Class Landing Page™ — same single-goal direct-response
// pattern as the QSR and Retreat pages: minimal nav (no links away from
// applying), sticky bottom CTA bar, WhatsApp widget tuned to this exact
// offer. No hosted checkout or persisted application backend exists for
// this offer — pricing and scope are fully customised per person after
// the short conversation step, so WhatsApp (via the real, validated
// Apply form in MentoringApply.tsx) is the real interim path, the same
// pattern every other offer without dedicated checkout infra already
// uses on this site.
//
// Section order follows the given content spec directly: hook (Hero) ->
// self-qualification (Fit) -> what's covered (Areas) -> how this differs
// from the group programs (Comparison) -> what applying actually looks
// like (Process) -> who's teaching it (Guide) -> social proof
// (Testimonials — real content only, see that component's own note) ->
// the actual application (Apply) -> objection handling (Faq) before the
// footer.
export default function PersonalClassMentoringLandingPage(): React.JSX.Element {
  const faqSchema = buildFaqPageSchema(translations.en.mentoringLanding.faq.items)

  return (
    <div className="warm-light min-h-screen font-sans antialiased">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqSchema }} />
      <MentoringNav />
      <main>
        <MentoringHero />
        <MentoringFit />
        <MentoringAreas />
        <MentoringComparison />
        <MentoringProcess />
        <MentoringGuide />
        <MentoringTestimonials />
        <MentoringApply />
        <MentoringFaq />
      </main>
      <Footer />
      <MentoringStickyBar />
      <MentoringWhatsAppWidget />
    </div>
  )
}
