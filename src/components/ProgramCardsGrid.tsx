"use client";

import { BookOpen, Sparkles, UserRound, RefreshCw, Gauge, MessageCircle, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { WHATSAPP_GENERAL_INQUIRY_LINK } from "@/config/whatsappSupportLink";
import { trackGaEvent } from "@/lib/analytics/ga4";

type Accent = "gold" | "teal" | "rose";

const ACCENT_CLASSES: Record<Accent, { icon: string; iconBg: string; text: string }> = {
  gold: { icon: "text-gold", iconBg: "border-gold/40 bg-gold-soft", text: "text-gold" },
  teal: { icon: "text-teal", iconBg: "border-teal/40 bg-teal-soft", text: "text-teal" },
  rose: { icon: "text-rose", iconBg: "border-rose/40 bg-rose-soft", text: "text-rose" },
};

type SecondaryCard = {
  key: string;
  icon: LucideIcon;
  accent: Accent;
  eyebrowLabel: string;
  title: string;
  desc: string;
  cta: string;
  href: string;
  anchorId?: string;
};

// Program Cards™ — replaces the three separate, visually-identical
// TierRetreats/TierSpecialized card grids (plus a new Free Speed Test
// card) with one grid built for variety instead of one repeated
// template: a dark featured card for QSR (this business's real flagship,
// per its existing "Tier 01 · Prime Flagship" position), and four
// light cards each with their own icon, colored eyebrow, and specific
// CTA copy tied to that program rather than a generic "Learn More."
// TierFlagship.tsx's rich standalone content (AccessModelStrip, the
// 30-day streak visual, the full feature list) stays on the real QSR
// page where it already lives in full — this card is a teaser, not a
// duplicate of that page.
//
// #tier-1/#tier-2/#tier-3 anchors are preserved on the featured card and
// the Retreat/Mentoring cards specifically, since Navbar.tsx's nav links
// still jump to those ids.
//
// Residential Retreats deliberately has no card here (this grid is
// scoped to the 5 broader-appeal, more scalable offers) — it stays fully
// reachable via the Retreat card's page and the footer.
export default function ProgramCardsGrid(): React.JSX.Element {
  const { t } = useLanguage();
  const home = t.homeProgramCards;

  const secondaryCards: SecondaryCard[] = [
    {
      key: "retreat",
      icon: Sparkles,
      accent: "teal",
      eyebrowLabel: home.retreat.eyebrowLabel,
      title: t.tier2.online.title,
      desc: t.tier2.online.desc,
      cta: home.retreat.cta,
      href: "/retreats/online-11-day",
      anchorId: "tier-2",
    },
    {
      key: "mentoring",
      icon: UserRound,
      accent: "rose",
      eyebrowLabel: home.mentoring.eyebrowLabel,
      title: t.tier3.mentoring.title,
      desc: t.tier3.mentoring.desc,
      cta: home.mentoring.cta,
      href: "/mentoring/personal-class",
      anchorId: "tier-3",
    },
    {
      key: "course",
      icon: RefreshCw,
      accent: "rose",
      eyebrowLabel: home.course.eyebrowLabel,
      title: t.tier3.course.title,
      desc: t.tier3.course.desc,
      cta: home.course.cta,
      href: "/mentoring/overthinking-course",
      anchorId: "course-card",
    },
    {
      key: "speedTest",
      icon: Gauge,
      accent: "gold",
      eyebrowLabel: home.speedTest.eyebrowLabel,
      title: home.speedTest.title,
      desc: home.speedTest.desc,
      cta: home.speedTest.cta,
      href: "/programs/quantum-speed-reading/speed-test",
    },
  ];

  return (
    <section className="border-b border-line px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Featured card — QSR, dark, spans 2 of 3 columns on desktop */}
          <div
            id="tier-1"
            className="flex flex-col justify-between rounded-sm border border-line-strong bg-[#12162a] p-8 sm:p-10 lg:col-span-2"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/50 bg-gold-soft/20">
                <BookOpen className="h-5 w-5 text-gold" aria-hidden="true" />
              </div>
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.08em] text-gold">
                {home.featured.eyebrowLabel}
              </p>
              <h2 className="mt-2.5 text-[26px] font-extrabold leading-tight text-[#f5f1e6] sm:text-[30px]">
                {t.tier1.title} <span className="font-display italic text-gold">{t.tier1.titleEm}</span>
              </h2>
              <p className="mt-3 max-w-md text-[14.5px] leading-relaxed text-[#aeb2c8]">{t.tier1.desc}</p>
              <p className="mt-5 border-l-2 border-gold/40 pl-4 text-[13px] italic leading-relaxed text-[#c7cae0]">
                &ldquo;{t.tier1.trustQuote.quote}&rdquo;
                <span className="not-italic text-[#8b8fa8]"> — {t.tier1.trustQuote.name}</span>
              </p>
            </div>
            <a
              href="/programs/quantum-speed-reading"
              className="group mt-7 inline-flex w-fit items-center gap-2.5 rounded-sm bg-gold px-7 py-[15px] text-[14.5px] font-semibold text-[#1B1508] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#cb9a44]"
            >
              {home.featured.cta}
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </a>
          </div>

          {secondaryCards.map((card) => {
            const Icon = card.icon;
            const accentClasses = ACCENT_CLASSES[card.accent];
            return (
              <div
                key={card.key}
                id={card.anchorId}
                className="flex flex-col rounded-sm border border-line bg-panel p-7"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-full border ${accentClasses.iconBg}`}>
                  <Icon className={`h-5 w-5 ${accentClasses.icon}`} aria-hidden="true" />
                </div>
                <p className={`mt-4 font-mono text-[11px] uppercase tracking-[0.08em] ${accentClasses.text}`}>
                  {card.eyebrowLabel}
                </p>
                <h3 className="mt-2 text-[18px] font-bold leading-snug text-ink">{card.title}</h3>
                <p className="mt-2.5 flex-1 text-[13.5px] leading-relaxed text-ink-dim">{card.desc}</p>
                <a
                  href={card.href}
                  className={`group mt-6 inline-flex items-center gap-2 text-[13.5px] font-semibold ${accentClasses.text}`}
                >
                  {card.cta}
                  <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </a>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col items-center gap-3 rounded-sm border border-line-strong bg-panel2 px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-[#25D366]/40 bg-[#25D366]/10">
              <MessageCircle className="h-5 w-5 text-[#25D366]" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-ink">{home.whatsappCard.title}</h3>
              <p className="mt-0.5 max-w-sm text-[13px] leading-relaxed text-ink-dim">{home.whatsappCard.desc}</p>
            </div>
          </div>
          <a
            href={WHATSAPP_GENERAL_INQUIRY_LINK}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackGaEvent("whatsapp_click", { location: "home_program_cards" })}
            className="inline-flex flex-none items-center gap-2.5 rounded-sm bg-[#25D366] px-6 py-3 text-[13.5px] font-semibold text-[#062112] transition-transform duration-200 hover:-translate-y-0.5"
          >
            {home.whatsappCard.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
