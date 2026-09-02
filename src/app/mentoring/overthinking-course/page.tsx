import type { Metadata } from 'next'
import { translations } from '@/lib/i18n'
import { buildFaqPageSchema } from '@/lib/seo/faqSchema'
import CourseNav from '@/components/course/CourseNav'
import CourseHero from '@/components/course/CourseHero'
import CourseFit from '@/components/course/CourseFit'
import CourseInside from '@/components/course/CourseInside'
import CourseProcess from '@/components/course/CourseProcess'
import CourseGuide from '@/components/course/CourseGuide'
import CourseTestimonials from '@/components/course/CourseTestimonials'
import CourseFaq from '@/components/course/CourseFaq'
import CourseFinalCta from '@/components/course/CourseFinalCta'
import Footer from '@/components/Footer'
import CourseStickyBar from '@/components/course/CourseStickyBar'
import CourseWhatsAppWidget from '@/components/course/CourseWhatsAppWidget'

export const metadata: Metadata = {
  title: 'The 21-Day Mind Reset System — Overthinking Mastery — Dr. Kapil Dev Sharma',
  description:
    '21 days of daily training, meditation, and guided activity, plus 2 live sessions with Dr. Kapil and a workbook — ₹2,999 for 30 days of full access via Classplus.',
}

// Overthinking Mastery Course Landing Page™ — NOT the live-workshop
// template ("Mind Expansion Intensive" / the Retreat pages' dates-seats-
// venue structure): this is a 21-day self-paced digital course hosted
// and sold entirely on Classplus. This page's only job is to build
// enough trust/clarity that a visitor clicks through to Classplus
// confidently — every CTA here is an external link, not a form or a
// Razorpay checkout on this site. Minimal nav (no links away from that
// one goal), sticky bottom CTA bar, WhatsApp widget for pre-purchase
// questions only (not the primary conversion path).
//
// Pricing correction (round 2): the real Classplus model is fixed-
// duration access, not a recurring subscription — ₹2,999/30 days
// (primary, promoted throughout), ₹5,999/90 days, ₹8,999/180 days, all
// selected at checkout on the one confirmed Classplus link. No "month"
// or "subscribe" language should appear anywhere on this page.
//
// Section order follows the given content spec: hook (Hero — dark
// treatment, see CourseHero.tsx/CourseNav.tsx's own notes on why) ->
// self-qualification (Fit) -> what's actually included (Inside, real
// inclusions incl. the workbook and 2 live sessions, with the
// mental-health disclaimer directly beneath it) -> what enrolling looks
// like (Process, now 4 steps) -> who's teaching it (Guide, the same
// shared GuideProfileCard the Personal Class page uses) -> social proof
// (Testimonials — intentionally empty until real course-specific videos
// exist, see that component's own note) -> objection handling (Faq) ->
// final push (FinalCta) before the footer.
export default function OverthinkingMasteryCoursePage(): React.JSX.Element {
  const faqSchema = buildFaqPageSchema(translations.en.courseLanding.faq.items)

  return (
    <div className="warm-light min-h-screen font-sans antialiased">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqSchema }} />
      <CourseNav />
      <main>
        <CourseHero />
        <CourseFit />
        <CourseInside />
        <CourseProcess />
        <CourseGuide />
        <CourseTestimonials />
        <CourseFaq />
        <CourseFinalCta />
      </main>
      <Footer />
      <CourseStickyBar />
      <CourseWhatsAppWidget />
    </div>
  )
}
