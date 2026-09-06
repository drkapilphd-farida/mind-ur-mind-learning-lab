"use client";

import Image from "next/image";
import {
  BookOpen,
  Megaphone,
  Presentation,
  LayoutDashboard,
  LifeBuoy,
  Blocks,
  IndianRupee,
  TrendingDown,
  Clock,
  TrendingUp,
  Rocket,
  GraduationCap,
  Building2,
  CheckCircle2,
  Info,
  Percent,
  Wallet,
  RefreshCw,
  User,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "./ui";
import SimplePageNav from "./SimplePageNav";
import Footer from "./Footer";
import WhatsAppWidget from "./WhatsAppWidget";
import VideoReviewGrid from "./VideoReviewGrid";
import {
  WHATSAPP_FRANCHISE_TEAM_INQUIRY_LINK,
  WHATSAPP_FRANCHISE_INSTANT_APPLY_LINK,
} from "@/config/whatsappSupportLink";
import { trackGaEvent } from "@/lib/analytics/ga4";
import type { Lang } from "@/lib/i18n";

const PROBLEM_ICONS = [Blocks, IndianRupee, TrendingDown] as const;
const INCLUDED_ICONS = [GraduationCap, Blocks, LayoutDashboard, Megaphone, BookOpen, LifeBuoy] as const;
const EARNING_ICONS = [Clock, TrendingUp, Rocket] as const;
const BUSINESS_MODEL_ICONS = [IndianRupee, Percent, Wallet, RefreshCw] as const;
const WHO_FOR_ICONS = [GraduationCap, Building2, Presentation] as const;

// Real founder intro video, one per site language — same two verified
// videos already wired up on the QSR landing page (QsrFounderVideo.tsx),
// reused here via the same useLanguage()-driven lang map rather than a
// second, independent language system.
const INTRO_VIDEO_ID: Record<Lang, string> = {
  en: "Zsz0eUQ3t0o",
  hi: "64UmqM5_mEM",
};

// Real trainer WhatsApp-testimonial screenshots — genuine messages, used
// with permission. Photos aren't available for these trainers, so the
// screenshot itself is the proof; name/city come from t.franchisePage
// .trainerTestimonials.items (translated), matched here by stable id.
const TRAINER_TESTIMONIAL_IMAGES: Record<string, string> = {
  "dev-prakash": "/trainer_testimonial_dev_prakash_whatsapp.jpg.jpeg",
  "saloni-shah": "/trainer_testimonial_saloni_shah_whatsapp.jpg.jpeg",
  "sandeep-gupta": "/trainer_testimonial_sandeep_gupta_whatsapp.jpg.jpeg",
};

// Real student testimonial YouTube Shorts — the same 6 verified video IDs
// supplied for this page, with thumbnails already downloaded locally
// (public/qsr-videos/) from the QSR video-testimonial work. No names/
// cities are attached — none were confidently verified for these specific
// videos, so each card is labeled generically via studentTestimonials
// .videoLabel rather than guessed.
const STUDENT_TESTIMONIAL_VIDEOS: ReadonlyArray<{ videoId: string; thumbnailSrc: string | undefined }> = [
  { videoId: "WCt_kzlmdj8", thumbnailSrc: "/qsr-videos/WCt_kzlmdj8-thumb.jpg" },
  { videoId: "1pvc5yHgJGU", thumbnailSrc: "/qsr-videos/1pvc5yHgJGU-thumb.jpg" },
  { videoId: "VHgzVzVr-B8", thumbnailSrc: "/qsr-videos/VHgzVzVr-B8-thumb.jpg" },
  { videoId: "UM9LBm0hh0Y", thumbnailSrc: "/qsr-videos/UM9LBm0hh0Y-thumb.jpg" },
  { videoId: "RX7t26jYNUg", thumbnailSrc: "/qsr-videos/RX7t26jYNUg-thumb.jpg" },
  { videoId: "R2icA1-gbTY", thumbnailSrc: "/qsr-videos/R2icA1-gbTY-thumb.jpg" },
];

function SectionCta({ label }: { label: string }): React.JSX.Element {
  return (
    <div className="mt-10 flex justify-center sm:mt-12">
      <a
        href="#apply"
        className="group inline-flex items-center gap-2.5 rounded-sm border border-teal/60 px-7 py-[15px] text-[14.5px] font-semibold text-teal transition-colors hover:bg-teal-soft"
      >
        {label}
        <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">
          →
        </span>
      </a>
    </div>
  );
}

// Franchise/Individual Trainer Application™ — a full application-funnel
// structure (hero → problem → founder → what's included → real trainer
// proof → real student proof → earning potential → process → business
// model → audience fit → FAQ → apply), not just a 3-card teaser. Copy is
// grounded only in what the site owner has explicitly confirmed (26 years
// in education, QSR training since 2015, 10,000+ students, and the
// verified partner-program terms in businessModel/faq below) — no numbers
// or claims invented beyond that, per the owner's own repeated "honest
// framing, no overclaiming" instruction.
//
// The "Earning Potential" section (three illustrative rupee-range
// scenarios computed off an unstated example course fee) was removed in
// an earlier pass, then explicitly reinstated by the site owner — with
// the "illustrative, not guaranteed" disclaimer kept exactly as-is — to
// surface financial upside earlier in the funnel, right after the real
// trainer/student proof and before the process/FAQ detail.
//
// WhatsApp-First, No-Form™ — the old name/phone/city application form
// (and its franchise_leads DB backup save) has been removed per explicit
// instruction: it added drop-off friction a single-tap WhatsApp CTA
// doesn't need. The visitor's details are simply given inside the
// WhatsApp conversation that opens, same as every other WhatsApp-only
// conversion path already used elsewhere on this site (QSR live intro
// session, retreats, mentoring). submitFranchiseLead.ts /
// franchiseLeadSchema.ts are left untouched — the admin dashboard at
// /admin/franchise-leads still reads whatever rows already exist there.
export default function FranchisePageContent(): React.JSX.Element {
  const { t, lang } = useLanguage();
  const page = t.franchisePage;
  const introVideoId = INTRO_VIDEO_ID[lang];

  return (
    <div className="warm-light min-h-screen font-sans antialiased">
      <SimplePageNav />
      <main>
        {/* 1. Hero */}
        <section className="border-b border-line px-6 py-16 text-center sm:px-8 sm:py-28">
          <div className="mx-auto max-w-2xl">
            <div className="flex justify-center">
              <Eyebrow color="text-teal">{page.hero.eyebrow}</Eyebrow>
            </div>
            <h1 className="mt-5 text-[30px] font-extrabold leading-tight sm:text-[42px]">{page.hero.headline}</h1>
            <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-ink-dim sm:text-[16px]">{page.hero.sub}</p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#apply"
                className="group inline-flex items-center gap-2.5 rounded-sm bg-teal px-7 py-[15px] text-[14.5px] font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 hover:bg-teal-light"
              >
                {page.hero.ctaPrimary}
                <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </a>
              <a
                href="#founder"
                className="inline-flex items-center gap-2 rounded-sm border border-line-strong px-7 py-[15px] text-[14.5px] font-semibold text-ink transition-colors hover:bg-panel2"
              >
                {page.hero.ctaSecondary}
              </a>
            </div>

            {/* First-Screen Trust Strip™ — reuses the same verified
                credentials already stated in the Founder section below
                (no new claim introduced), surfaced here too so a visitor
                sees "why trust this" without needing to scroll first. */}
            <div className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-x-3 gap-y-1.5 font-mono text-[11px] uppercase tracking-[0.05em] text-ink-faint">
              {page.about.credentials.map((credential, index) => (
                <span key={credential} className="flex items-center gap-3">
                  {index > 0 && <span aria-hidden="true">•</span>}
                  {credential}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* 2. Problem */}
        <section className="border-b border-line bg-panel px-6 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-content">
            <div className="mb-10 max-w-xl sm:mb-12">
              <Eyebrow color="text-rose">{page.problem.eyebrow}</Eyebrow>
              <h2 className="mt-4 text-[24px] font-extrabold leading-tight sm:text-[30px]">{page.problem.headline}</h2>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {page.problem.points.map((point, index) => {
                const Icon = PROBLEM_ICONS[index % PROBLEM_ICONS.length] ?? Blocks;
                return (
                  <div key={point.title} className="rounded-sm border border-rose/25 bg-panel2 p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-rose/40 bg-rose-soft">
                      <Icon className="h-5 w-5 text-rose" aria-hidden="true" />
                    </div>
                    <h3 className="mt-4 text-[15.5px] font-bold leading-snug text-ink">{point.title}</h3>
                    <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-dim">{point.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. Meet the Founder — this page's primary trust anchor, given
            more room (py-20 sm:py-24, one step more than every sibling
            section's sm:py-20) and a framed, near-full-width video so it
            reads as the visual high point of the top half of the page,
            not just another equal-weight section. */}
        <section id="founder" className="border-b border-line px-6 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex justify-center">
              <Eyebrow color="text-teal">{page.about.eyebrow}</Eyebrow>
            </div>
            <h2 className="mt-4 text-[24px] font-extrabold leading-tight sm:text-[30px]">{page.about.headline}</h2>
            <p className="mx-auto mt-5 max-w-2xl text-[14.5px] leading-relaxed text-ink-dim">{page.about.bio}</p>

            <div className="mx-auto mt-7 flex max-w-2xl flex-wrap items-center justify-center gap-x-3 gap-y-2 font-mono text-[12px] uppercase tracking-[0.05em] text-ink-faint">
              {page.about.credentials.map((credential, index) => (
                <span key={credential} className="flex items-center gap-3">
                  {index > 0 && <span aria-hidden="true">•</span>}
                  {credential}
                </span>
              ))}
            </div>

            {/* Real per-language intro video — key={lang} forces a full
                iframe remount on language switch (same technique as
                QsrFounderVideo.tsx), so only one video is ever mounted and
                the previous language's video is never left stale. Framed
                in an outer padded panel (not just a plain inset box) so it
                reads as the section's centerpiece. */}
            <div className="mx-auto mt-10 max-w-3xl rounded-sm border border-line-strong bg-panel p-2.5 shadow-[0_20px_50px_rgba(34,31,29,0.14)] sm:p-3">
              <div className="aspect-video w-full overflow-hidden rounded-sm">
                <iframe
                  key={lang}
                  src={`https://www.youtube-nocookie.com/embed/${introVideoId}`}
                  title={page.about.videoTitle}
                  loading="lazy"
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>

            <SectionCta label={page.applyCta} />
          </div>
        </section>

        {/* 4. What's Included */}
        <section className="border-b border-line bg-panel px-6 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-content">
            <div className="mb-10 max-w-xl sm:mb-12">
              <Eyebrow color="text-teal">{page.included.eyebrow}</Eyebrow>
              <h2 className="mt-4 text-[24px] font-extrabold leading-tight sm:text-[30px]">{page.included.title}</h2>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {page.included.items.map((item, index) => {
                const Icon = INCLUDED_ICONS[index % INCLUDED_ICONS.length] ?? BookOpen;
                return (
                  <div key={item.title} className="rounded-sm border border-line-strong bg-panel2 p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-teal/40 bg-teal-soft">
                      <Icon className="h-5 w-5 text-teal" aria-hidden="true" />
                    </div>
                    <h3 className="mt-4 text-[16px] font-bold leading-snug text-ink">{item.title}</h3>
                    <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-dim">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. Real Trainer Experiences — genuine WhatsApp-testimonial
            screenshots, used with the trainers' permission. No photos
            exist for these trainers, so the screenshot itself is the
            proof; shown close to its original crop (name/timestamp bar
            intact), not treated as a marketing graphic. */}
        <section id="trainer-testimonials" className="border-b border-line px-6 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-content">
            <div className="mb-10 max-w-xl sm:mb-12">
              <Eyebrow color="text-teal">{page.trainerTestimonials.eyebrow}</Eyebrow>
              <h2 className="mt-4 text-[24px] font-extrabold leading-tight sm:text-[30px]">{page.trainerTestimonials.title}</h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-ink-dim">{page.trainerTestimonials.desc}</p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {page.trainerTestimonials.items.map((trainer) => (
                <div
                  key={trainer.id}
                  className="mx-auto w-full max-w-[300px] overflow-hidden rounded-sm border border-line-strong bg-panel2 shadow-[0_10px_30px_rgba(34,31,29,0.08)] transition-transform duration-200 hover:-translate-y-1"
                >
                  <div className="relative aspect-[591/1280] w-full">
                    <Image
                      src={TRAINER_TESTIMONIAL_IMAGES[trainer.id] ?? ""}
                      alt={`WhatsApp testimonial from ${trainer.name}, ${trainer.city}`}
                      fill
                      sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw"
                      className="object-cover object-top"
                    />
                  </div>
                  <div className="border-t border-line-strong px-4 py-3 text-center">
                    <div className="text-[13.5px] font-bold text-ink">{trainer.name}</div>
                    <div className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-faint">{trainer.city}</div>
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-teal/30 bg-teal-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.04em] text-teal">
                      <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                      {page.trainerTestimonials.verifiedLabel}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. What Students Say — 6 real YouTube Shorts, lazy-loaded via
            VideoReviewGrid's existing thumbnail-then-iframe-on-click
            pattern (no new video component). aspectRatioClassName keeps
            the true 9:16 Shorts frame instead of the component's default
            16:9 crop. No names/cities are attached — none were confidently
            verified for these specific videos. */}
        <section id="student-testimonials" className="border-b border-line bg-panel px-6 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-content">
            <div className="mb-10 max-w-xl sm:mb-12">
              <Eyebrow color="text-teal">{page.studentTestimonials.eyebrow}</Eyebrow>
              <h2 className="mt-4 text-[24px] font-extrabold leading-tight sm:text-[30px]">{page.studentTestimonials.title}</h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-ink-dim">{page.studentTestimonials.desc}</p>
            </div>
            {/* Framed in a bordered panel (same treatment as the founder
                video and business-model cards) so this reads as a
                deliberate proof gallery, not a bare embedded grid.
                Component default (1/2/3 columns at mobile/tablet/desktop)
                already matches this section's required layout exactly. */}
            <div className="rounded-sm border border-line-strong bg-panel2 p-5 sm:p-8">
              <VideoReviewGrid
                videos={STUDENT_TESTIMONIAL_VIDEOS}
                aspectRatioClassName="aspect-[9/16]"
                cardLabel={page.studentTestimonials.videoLabel}
              />
            </div>
          </div>
        </section>

        {/* 7. Earning Potential — placed right after the real trainer/
            student proof and before the process/fee detail, so financial
            upside is visible well before FAQ or the bottom of the page.
            Every figure carries the same "illustrative, not guaranteed"
            disclaimer it always has — nothing here is a new claim. */}
        <section className="border-b border-line px-6 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-content">
            <div className="mb-10 max-w-xl sm:mb-12">
              <Eyebrow color="text-teal">{page.earning.eyebrow}</Eyebrow>
              <h2 className="mt-4 text-[24px] font-extrabold leading-tight sm:text-[30px]">{page.earning.headline}</h2>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {page.earning.scenarios.map((scenario, index) => {
                const Icon = EARNING_ICONS[index % EARNING_ICONS.length] ?? Clock;
                return (
                  <div key={scenario.label} className="rounded-sm border border-line-strong bg-panel2 p-6 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-teal/40 bg-teal-soft">
                      <Icon className="h-5 w-5 text-teal" aria-hidden="true" />
                    </div>
                    <h3 className="mt-4 text-[15.5px] font-bold text-ink">{scenario.label}</h3>
                    <p className="mt-1 text-[12.5px] text-ink-faint">{scenario.desc}</p>
                    <p className="mt-3 text-[21px] font-extrabold tabular-nums text-teal">{scenario.range}</p>
                  </div>
                );
              })}
            </div>

            <div className="mx-auto mt-7 flex max-w-2xl items-start gap-3 rounded-sm border border-gold/40 bg-gold-soft px-5 py-4">
              <Info className="mt-0.5 h-4 w-4 flex-none text-gold-dim" aria-hidden="true" />
              <p className="text-[13px] leading-relaxed text-ink-dim">{page.earning.disclaimer}</p>
            </div>

            <SectionCta label={page.applyCta} />
          </div>
        </section>

        {/* 8. How It Works */}
        <section className="border-b border-line px-6 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-content">
            <div className="mb-10 max-w-xl sm:mb-12">
              <Eyebrow color="text-teal">{page.howItWorks.eyebrow}</Eyebrow>
              <h2 className="mt-4 text-[24px] font-extrabold leading-tight sm:text-[30px]">{page.howItWorks.headline}</h2>
            </div>

            <div className="relative">
              <div className="absolute left-0 right-0 top-5 hidden h-px bg-line-strong lg:block" aria-hidden="true" />
              <div className="relative grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-6 lg:grid-cols-7 lg:gap-4">
                {page.howItWorks.steps.map((step, index) => (
                  <div key={step.title} className="flex flex-col items-center text-center">
                    <div className="z-10 flex h-10 w-10 flex-none items-center justify-center rounded-full border border-teal/50 bg-panel font-mono text-[13px] font-bold text-teal">
                      {index + 1}
                    </div>
                    <h3 className="mt-3 text-[14.5px] font-bold text-ink">{step.title}</h3>
                    <p className="mt-1.5 max-w-[180px] text-[12.5px] leading-relaxed text-ink-dim">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 9. Business Model — every fee visible at once, including the
            ₹5,000 renewal fee (previously not mentioned anywhere on this
            page), plus an explicit "We Provide / You Bring" split so the
            page never implies students are provided or income is
            guaranteed. */}
        <section className="border-b border-line bg-panel px-6 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-content">
            <div className="mb-10 max-w-xl sm:mb-12">
              <Eyebrow color="text-teal">{page.businessModel.eyebrow}</Eyebrow>
              <h2 className="mt-4 text-[24px] font-extrabold leading-tight sm:text-[30px]">{page.businessModel.headline}</h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-ink-dim">{page.businessModel.explanation}</p>
            </div>

            <div className="mx-auto grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: page.businessModel.onboardingLabel, value: page.businessModel.onboardingValue, sub: undefined },
                { label: page.businessModel.revenueLabel, value: page.businessModel.revenueValue, sub: page.businessModel.revenueUnit },
                { label: page.businessModel.monthlyLabel, value: page.businessModel.monthlyValue, sub: undefined },
                { label: page.businessModel.renewalLabel, value: page.businessModel.renewalValue, sub: undefined },
              ].map((stat, index) => {
                const Icon = BUSINESS_MODEL_ICONS[index % BUSINESS_MODEL_ICONS.length] ?? IndianRupee;
                return (
                  <div key={stat.label} className="rounded-sm border border-line-strong bg-panel2 p-5 text-center">
                    <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-teal/40 bg-teal-soft">
                      <Icon className="h-4.5 w-4.5 text-teal" aria-hidden="true" />
                    </div>
                    <p className="mt-3 text-[19px] font-extrabold tabular-nums text-ink sm:text-[21px]">{stat.value}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase leading-tight tracking-[0.05em] text-ink-faint">{stat.label}</p>
                    {stat.sub !== undefined && <p className="mt-1 text-[11px] text-ink-faint">{stat.sub}</p>}
                  </div>
                );
              })}
            </div>

            <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="rounded-sm border border-teal/30 bg-panel2 p-6">
                <h3 className="text-[14px] font-bold text-ink">{page.businessModel.weProvideTitle}</h3>
                <ul className="mt-3 space-y-2.5">
                  {page.businessModel.weProvideItems.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-ink-dim">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-teal" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-sm border border-line-strong bg-panel2 p-6">
                <h3 className="text-[14px] font-bold text-ink">{page.businessModel.youBringTitle}</h3>
                <ul className="mt-3 space-y-2.5">
                  {page.businessModel.youBringItems.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-ink-dim">
                      <User className="mt-0.5 h-4 w-4 flex-none text-ink-faint" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <SectionCta label={page.applyCta} />
          </div>
        </section>

        {/* 10. Who Is This For */}
        <section className="border-b border-line px-6 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-content">
            <div className="mb-10 max-w-xl sm:mb-12">
              <Eyebrow color="text-teal">{page.whoFor.eyebrow}</Eyebrow>
              <h2 className="mt-4 text-[24px] font-extrabold leading-tight sm:text-[30px]">{page.whoFor.headline}</h2>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {page.whoFor.cards.map((card, index) => {
                const Icon = WHO_FOR_ICONS[index % WHO_FOR_ICONS.length] ?? GraduationCap;
                return (
                  <div key={card.title} className="rounded-sm border border-line-strong bg-panel2 p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-teal/40 bg-teal-soft">
                      <Icon className="h-5 w-5 text-teal" aria-hidden="true" />
                    </div>
                    <h3 className="mt-4 text-[16px] font-bold leading-snug text-ink">{card.title}</h3>
                    <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-dim">{card.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 11. FAQ */}
        <section className="border-b border-line bg-panel px-6 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-content">
            <div className="mb-10 max-w-xl sm:mb-12">
              <Eyebrow color="text-teal">{page.faq.eyebrow}</Eyebrow>
              <h2 className="mt-4 text-[24px] font-extrabold leading-tight sm:text-[30px]">{page.faq.headline}</h2>
            </div>

            <div className="mx-auto max-w-3xl divide-y divide-line border-y border-line">
              {page.faq.items.map((item) => (
                <details key={item.question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-[15px] font-semibold text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                    {item.question}
                    <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full border border-line-strong text-[13px] text-ink-faint transition-transform duration-200 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 pr-10 text-[14px] leading-relaxed text-ink-dim">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 12. Apply — WhatsApp-First, No-Form™ (see this component's own
            top-of-file doc comment). A single instant-apply CTA replaces
            the old name/phone/city form; no typed fields are required to
            start the conversation. */}
        <section id="apply" className="border-b border-line bg-panel px-6 py-16 text-center sm:px-8 sm:py-24">
          <div className="mx-auto max-w-xl">
            <div className="flex justify-center">
              <Eyebrow color="text-teal">{page.apply.eyebrow}</Eyebrow>
            </div>
            <h2 className="mt-4 text-[24px] font-extrabold leading-tight sm:text-[30px]">{page.apply.title}</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-ink-dim">{page.apply.sub}</p>

            <a
              href={WHATSAPP_FRANCHISE_INSTANT_APPLY_LINK}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackGaEvent("whatsapp_click", { location: "franchise_apply_instant" })}
              className="group mt-8 inline-flex items-center gap-3 rounded-sm bg-[#25D366] px-9 py-[18px] text-[16px] font-bold text-[#062112] shadow-[0_14px_35px_rgba(37,211,102,0.35)] transition-transform duration-200 hover:-translate-y-0.5"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 flex-none fill-current">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.8 14.16c-.24.68-1.4 1.32-1.93 1.4-.5.08-1.12.11-1.8-.11-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.14-4.9-4.34-.14-.2-1.17-1.56-1.17-2.97 0-1.41.74-2.1 1-2.39.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.58.81 2 .88 2.15.07.14.12.31.02.5-.1.19-.15.31-.29.48-.14.17-.3.37-.43.5-.14.14-.29.29-.12.57.17.29.75 1.24 1.61 2.01 1.11 1 2.05 1.31 2.33 1.46.29.14.46.12.63-.07.17-.19.72-.84.92-1.13.19-.29.38-.24.64-.14.26.1 1.66.79 1.95.93.29.14.48.21.55.33.07.12.07.68-.17 1.35Z" />
              </svg>
              {page.apply.instantApplyCta}
            </a>

            <div>
              <a
                href={WHATSAPP_FRANCHISE_TEAM_INQUIRY_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-teal hover:underline"
              >
                {page.apply.talkToTeamLabel}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      {/* Compact-Button-First™ (same pattern as QsrWhatsAppWidget.tsx) —
          this page now has screenshot- and video-heavy proof sections
          below the fold; auto-dismissing the explanatory bubble after 6s
          keeps the compact round button available everywhere without it
          parking over that content indefinitely. Copy/link overridden to
          this page's own trainer-partner context instead of the generic
          homepage default. */}
      <WhatsAppWidget
        href={WHATSAPP_FRANCHISE_TEAM_INQUIRY_LINK}
        bubble={page.whatsapp.bubble}
        buttonLabel={page.whatsapp.button}
        ariaLabel={page.whatsapp.ariaLabel}
        analyticsLocation="franchise_widget"
        autoDismissBubbleMs={6000}
      />
    </div>
  );
}
