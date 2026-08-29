// Google Analytics 4 — marketing/conversion tracking for the public
// landing pages (QSR, Retreat, homepage). Deliberately separate from
// track.ts's `trackEvent` (Sprint 1's internal product-analytics log,
// typed to in-app learning events and backed by the app logger, not
// GA4) — different destination, different event vocabulary, no shared
// call sites.
export const GA_MEASUREMENT_ID = process.env['NEXT_PUBLIC_GA_MEASUREMENT_ID']

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

// Marketing conversion events this session wires up: WhatsApp inquiry
// clicks and Razorpay checkout button clicks, across both landing
// pages, plus a video-engagement event for the Residential Retreats
// page's "watch more" playlist link (not itself a conversion, but a
// meaningful engagement signal distinct from a WhatsApp/checkout click).
// Extend this union, not ad-hoc string literals, so every call site
// stays typo-proof and greppable.
export type GaEventName = 'whatsapp_click' | 'razorpay_checkout_click' | 'video_testimonial_click'

// No-ops when GA isn't configured (NEXT_PUBLIC_GA_MEASUREMENT_ID unset)
// or gtag.js hasn't loaded yet — never throws, since a tracking call
// must never be able to break a conversion-critical CTA click.
export function trackGaEvent(event: GaEventName, params?: Record<string, string>): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', event, params)
}
