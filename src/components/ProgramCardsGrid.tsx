"use client";

import { BookOpen, Sparkles, UserRound, RefreshCw, MessageCircle, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "./ui";
import { WHATSAPP_GENERAL_INQUIRY_LINK } from "@/config/whatsappSupportLink";
import { HABIT_BUILDER_APP_URL } from "@/config/habitBuilderSignupLink";
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
  number: string;
  eyebrowLabel: string;
  title: string;
  desc: string;
  cta: string;
  href: string;
  anchorId?: string;
};

// Explore Our Programs™ — five real offers, deliberately unequal in
// visual weight per explicit instruction: Habit Builder (01) gets a
// full-width, light, gold-bordered banner — the easiest, free entry
// point, already featured in its own dedicated section above, so it
// doesn't need a second dark/dominant treatment here, just a clear,
// consistent presence at the top of the list. Quantum Speed Reading (02)
// stays the dark, 2-of-3-column flagship card it already was — this
// business's real flagship program. Retreats (03), Overthinking Mastery
// (04), and Mentoring (05) fill the remaining three secondary slots, each
// keeping its own icon/accent color. The Free Reading Speed Test no
// longer has a card here — it now has its own dedicated section
// (HomeSpeedTestCta.tsx) so it never competes with these five paid
// programs for the same visual priority.
export default function ProgramCardsGrid(): React.JSX.Element {
  const { t } = useLanguage();
  const home = t.homeProgramCards;

  const secondaryCards: SecondaryCard[] = [
    {
      key: "retreat",
      icon: Sparkles,
      accent: "teal",
      number: home.retreat.number,
      eyebrowLabel: home.retreat.eyebrowLabel,
      title: t.tier2.online.title,
      desc: t.tier2.online.desc,
      cta: home.retreat.cta,
      href: "/retreats/online-11-day",
      anchorId: "tier-2",
    },
    {
      key: "course",
      icon: RefreshCw,
      accent: "rose",
      number: home.course.number,
      eyebrowLabel: home.course.eyebrowLabel,
      title: t.tier3.course.title,
      desc: t.tier3.course.desc,
      cta: home.course.cta,
      href: "/mentoring/overthinking-course",
      anchorId: "course-card",
    },
    {
      key: "mentoring",
      icon: UserRound,
      accent: "rose",
      number: home.mentoring.number,
      eyebrowLabel: home.mentoring.eyebrowLabel,
      title: t.tier3.mentoring.title,
      desc: t.tier3.mentoring.desc,
      cta: home.mentoring.cta,
      href: "/mentoring/personal-class",
      anchorId: "tier-3",
    },
  ];

  return (
    <section id="explore-programs" className="border-b border-line px-6 py-24 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-content">
        <div className="mb-12 max-w-xl">
          <Eyebrow color="text-teal">{home.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[26px] font-extrabold leading-tight sm:text-[32px]">{home.title}</h2>
        </div>

        {/* 01 — Habit Builder banner, full width, light + gold */}
        <a
          href={HABIT_BUILDER_APP_URL}
          onClick={() => trackGaEvent("signup_cta_click", { location: "explore_programs_habit_banner" })}
          className="group mb-6 flex flex-col gap-5 rounded-sm border border-gold/50 bg-gold-soft/20 p-7 transition-colors hover:border-gold sm:flex-row sm:items-center sm:justify-between sm:p-8"
        >
          <div className="flex items-start gap-4">
            <span className="font-mono text-[13px] font-bold text-gold">{home.habitBuilder.number}</span>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-gold">{home.habitBuilder.eyebrowLabel}</p>
              <h3 className="mt-2 text-[19px] font-bold leading-snug text-ink">{home.habitBuilder.title}</h3>
              <p className="mt-1.5 max-w-md text-[13.5px] leading-relaxed text-ink-dim">{home.habitBuilder.desc}</p>
              <p className="mt-2 font-mono text-[11.5px] uppercase tracking-[0.05em] text-gold">{home.habitBuilder.priceLine}</p>
            </div>
          </div>
          <span className="inline-flex flex-none items-center gap-2 rounded-sm bg-gold px-6 py-3 text-[13.5px] font-semibold text-[#1B1508] transition-transform duration-200 group-hover:-translate-y-0.5">
            {home.habitBuilder.cta}
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </span>
        </a>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* 02 — QSR flagship card, dark, spans 2 of 3 columns on desktop */}
          <div
            id="tier-1"
            className="flex flex-col justify-between rounded-sm border border-line-strong bg-[#12162a] p-8 sm:p-10 lg:col-span-2"
          >
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[13px] font-bold text-gold">{home.featured.number}</span>
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/50 bg-gold-soft/20">
                  <BookOpen className="h-5 w-5 text-gold" aria-hidden="true" />
                </div>
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
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-[13px] font-bold ${accentClasses.text}`}>{card.number}</span>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-full border ${accentClasses.iconBg}`}>
                    <Icon className={`h-5 w-5 ${accentClasses.icon}`} aria-hidden="true" />
                  </div>
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
