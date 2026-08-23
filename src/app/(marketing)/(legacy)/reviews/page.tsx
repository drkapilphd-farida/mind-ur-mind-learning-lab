import type { Metadata } from 'next'
import Link from 'next/link'
import { ExternalLink, GraduationCap, MessageCircle, PlayCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RAZORPAY_MASTERCLASS_PAYMENT_LINK } from '@/config/masterclassPaymentLink'
import { WHATSAPP_ENROLLMENT_INQUIRY_LINK, WHATSAPP_MASTERCLASS_INQUIRY_LINK } from '@/config/whatsappSupportLink'
import { SUCCESS_STORIES_PLAYLIST_EMBED_URL, SUCCESS_STORIES_PLAYLIST_WATCH_URL } from '@/config/reviewsPlaylist'

export const metadata: Metadata = {
  title: 'Success Stories',
  description: '200+ real student video reviews of the 30-Day Quantum Speed Reading Mastery + Live Cohort.',
}

// Success Stories™ — houses the real, live YouTube playlist of 200+
// student video reviews (see reviewsPlaylist.ts) as a dedicated
// conversion page for the flagship 30-Day Masterclass. No per-video data
// is fabricated: without a YouTube Data API key wired up, the page
// embeds the real playlist directly via YouTube's own player rather than
// faking individual video cards — see reviewsPlaylist.ts's doc comment.
// Entirely static markup (no client state needed), so this stays a
// Server Component end to end.
export default function ReviewsPage(): React.JSX.Element {
  return (
    <>
      {/* Sticky conversion bar — pinned just below the marketing header
          (which is itself sticky top-0 h-16) so the primary CTA stays
          visible the entire time a visitor scrolls through testimonials. */}
      <div className="bg-background/90 sticky top-16 z-30 border-b border-border/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-foreground">Ready to write your own success story?</p>
          <Button asChild size="sm" className="brand-gradient w-full rounded-full text-white shadow-md hover:opacity-90 sm:w-auto">
            <a href={RAZORPAY_MASTERCLASS_PAYMENT_LINK} target="_blank" rel="noopener noreferrer">
              <Sparkles className="size-4" aria-hidden="true" />
              Enroll Now for ₹4,999 →
            </a>
          </Button>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
            data-review-count-badge="true"
          >
            <PlayCircle className="size-3.5" aria-hidden="true" />
            200+ Real Student Video Reviews
          </span>
          <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Success Stories: See How Thousands of Students Mastered Quantum Speed Reading
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Real students, in their own words — recorded across every batch of the 30-Day Quantum Speed Reading Mastery + Live Cohort.
          </p>
        </div>

        <div className="mx-auto mt-8 flex flex-col gap-2.5 sm:w-fit sm:flex-row">
          <Button
            asChild
            size="lg"
            className="brand-gradient w-full rounded-full text-white shadow-lg hover:opacity-90 sm:w-auto"
            data-enroll-button="true"
          >
            <a href={RAZORPAY_MASTERCLASS_PAYMENT_LINK} target="_blank" rel="noopener noreferrer">
              <Sparkles className="size-4" aria-hidden="true" />
              Enroll Now for ₹4,999 →
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            className="w-full rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#1EBE5B] sm:w-auto"
            data-whatsapp-button="true"
          >
            <a href={WHATSAPP_ENROLLMENT_INQUIRY_LINK} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-4" aria-hidden="true" />
              💬 Chat with Dr. Kapil on WhatsApp
            </a>
          </Button>
        </div>

        {/* Trust grid — 3 columns desktop, 1 column mobile. Each card is a
            genuine, non-fabricated touchpoint (browse, ask, enroll)
            rather than invented per-video stats. */}
        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="glass-premium-card rounded-2xl p-5">
            <PlayCircle className="size-6 text-primary" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold text-foreground">200+ Video Reviews</p>
            <p className="mt-1 text-sm text-muted-foreground">Real testimonials from real students, across every batch of the 30-Day Masterclass.</p>
          </div>
          <a
            href={WHATSAPP_MASTERCLASS_INQUIRY_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-premium-card glass-premium-lift rounded-2xl p-5 transition-opacity hover:opacity-90"
          >
            <MessageCircle className="size-6 text-primary" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold text-foreground">Questions Before You Join?</p>
            <p className="mt-1 text-sm text-muted-foreground">Chat directly with Dr. Kapil on WhatsApp — batch timing, pricing, anything.</p>
          </a>
          <a
            href={RAZORPAY_MASTERCLASS_PAYMENT_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-premium-card glass-premium-lift rounded-2xl p-5 transition-opacity hover:opacity-90"
          >
            <GraduationCap className="size-6 text-primary" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold text-foreground">Be Our Next Success Story</p>
            <p className="mt-1 text-sm text-muted-foreground">Enroll today and start your own 30-day transformation.</p>
          </a>
        </div>

        {/* The real playlist, embedded directly — every video shown here
            is real and pulled live from YouTube, not a fabricated list. */}
        <div className="glass-premium-card glass-premium-card--emphasized mt-14 overflow-hidden rounded-2xl p-3 sm:p-4">
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
            <iframe
              src={SUCCESS_STORIES_PLAYLIST_EMBED_URL}
              title="Quantum Mind Learning Lab™ — Success Stories playlist"
              className="size-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <div className="flex flex-col items-center justify-between gap-2 px-2 pt-4 pb-1 text-center sm:flex-row sm:text-left">
            <p className="text-xs text-muted-foreground">Browse all 200+ stories using the list inside the player above.</p>
            <Link
              href={SUCCESS_STORIES_PLAYLIST_WATCH_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Watch the full playlist on YouTube
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Bottom conversion banner — same real CTAs, repeated for anyone
            who scrolled straight through to the end of the stories. */}
        <div className="mt-14 flex flex-col items-center gap-4 rounded-3xl border border-primary/30 bg-primary/[0.03] p-8 text-center">
          <div>
            <p className="text-lg font-semibold text-foreground">Convinced? Your transformation starts on Day 1.</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              30-day structured curriculum, 7 live mentorship sessions, real WPM checkpoints. One-time enrollment — ₹4,999.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2.5 sm:w-fit sm:flex-row">
            <Button asChild size="lg" className="brand-gradient w-full rounded-full text-white shadow-lg hover:opacity-90 sm:w-auto">
              <a href={RAZORPAY_MASTERCLASS_PAYMENT_LINK} target="_blank" rel="noopener noreferrer">
                <Sparkles className="size-4" aria-hidden="true" />
                Enroll Now for ₹4,999 →
              </a>
            </Button>
            <Button asChild size="lg" className="w-full rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#1EBE5B] sm:w-auto">
              <a href={WHATSAPP_ENROLLMENT_INQUIRY_LINK} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-4" aria-hidden="true" />
                💬 Chat with Dr. Kapil on WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
