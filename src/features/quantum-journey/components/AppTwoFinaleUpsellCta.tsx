import { Sparkles } from 'lucide-react'
import { RAZORPAY_MASTERCLASS_PAYMENT_LINK } from '@/config/masterclassPaymentLink'

// App 1 → App 2 Upsell™ — the Day 21 finale (Grand Celebration screen and
// the always-revisitable certificate page) is this app's single
// highest-intent moment: a learner who just finished all 21 real days
// and measured real WPM growth is the warmest possible audience for the
// next real step. "App 2" here is the real 30-Day Quantum Speed Reading
// Mastery Curriculum™ — the same ₹4,999 Razorpay link already sells
// elsewhere (ThirtyDayMasterclassHeroCard, MasterclassPaywallModal),
// reused rather than inventing a second checkout URL. Server-renderable
// on purpose (no 'use client', no hooks) so both the client-only
// GrandCelebrationScreen and the server-rendered certificate page can
// mount it directly. `print:hidden` keeps it out of the certificate's
// own printed/exported output — this is a screen-only upsell, never
// part of the "official record" the certificate represents. Completing
// this checkout takes real payment; it does not automatically grant
// in-app access (see RAZORPAY_MASTERCLASS_PAYMENT_LINK's own doc
// comment) — this CTA's copy never promises otherwise.
export function AppTwoFinaleUpsellCta(): React.JSX.Element {
  return (
    <div className="w-full rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-6 text-center shadow-sm print:hidden">
      <div
        className="mx-auto flex size-11 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
        aria-hidden="true"
      >
        <Sparkles className="size-5" />
      </div>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed font-medium text-foreground sm:text-base">
        अब अपनी इस नई स्पीड को अपने खुद के डॉक्यूमेंट्स और किताबों पर आजमाएं — Get 30-Day QSR Pro Suite (App 2) with Upload Documents, Spider
        Notes, &amp; Memory Techniques at ₹4,999.
      </p>
      <a
        href={RAZORPAY_MASTERCLASS_PAYMENT_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:from-emerald-500 hover:to-emerald-400 active:scale-95"
        data-enroll-button="true"
      >
        <Sparkles className="size-4" aria-hidden="true" />
        Enroll Now for ₹4,999 →
      </a>
    </div>
  )
}
