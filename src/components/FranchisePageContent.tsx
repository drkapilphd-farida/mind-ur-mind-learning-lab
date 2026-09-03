"use client";

import { useState } from "react";
import {
  BookOpen,
  HeartPulse,
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
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "./ui";
import SimplePageNav from "./SimplePageNav";
import Footer from "./Footer";
import WhatsAppWidget from "./WhatsAppWidget";
import { submitFranchiseLead } from "@/app/franchise-individual/actions/submitFranchiseLead";
import { buildFranchiseApplicationWhatsAppLink } from "@/config/whatsappSupportLink";

const PROBLEM_ICONS = [Blocks, IndianRupee, TrendingDown] as const;
const INCLUDED_ICONS = [BookOpen, HeartPulse, Megaphone, Presentation, LayoutDashboard, LifeBuoy] as const;
const EARNING_ICONS = [Clock, TrendingUp, Rocket] as const;
const WHO_FOR_ICONS = [GraduationCap, Building2, Presentation] as const;

type FormStatus = "idle" | "success";

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

// Franchise/Individual Trainer Application™ — rebuilt with a full
// application-funnel structure (problem → what's included → pricing →
// earning potential → process → credibility → audience fit → FAQ →
// form), not just a 3-card teaser. Copy is a first draft grounded only
// in what the site owner has explicitly confirmed (26 years in
// education, QSR training since 2015, 10,000+ students — the same
// figures already used on the homepage hero) — no numbers or claims
// invented beyond that, per the owner's own "honest framing, no
// overclaiming" instruction for the About section.
export default function FranchisePageContent(): React.JSX.Element {
  const { t } = useLanguage();
  const page = t.franchisePage;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [background, setBackground] = useState("");
  const [whyInterested, setWhyInterested] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");

  const canSubmit = name.trim().length > 0 && phone.trim().length > 0 && city.trim().length > 0;

  // WhatsApp-First Application™ — the WhatsApp tab is opened synchronously,
  // inside this same click/submit event, before any `await` — required
  // for the redirect to reliably open the WhatsApp app (not get silently
  // blocked as a popup) on mobile Safari and other browsers that revoke
  // "user activation" the moment an async gap is crossed. The
  // franchise_leads DB save is a best-effort backup record only: fired
  // after the redirect, never awaited, and its failure is deliberately
  // never surfaced to the visitor — the WhatsApp message they're about to
  // send is the real application either way.
  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!canSubmit) return;

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedCity = city.trim();
    const trimmedBackground = background.trim();
    const trimmedWhyInterested = whyInterested.trim();

    const whatsAppLink = buildFranchiseApplicationWhatsAppLink({
      name: trimmedName,
      phone: trimmedPhone,
      city: trimmedCity,
      background: trimmedBackground,
      whyInterested: trimmedWhyInterested,
    });
    window.open(whatsAppLink, "_blank", "noopener,noreferrer");

    setStatus("success");

    void submitFranchiseLead({
      name: trimmedName,
      phone: trimmedPhone,
      city: trimmedCity,
      background: trimmedBackground.length > 0 ? trimmedBackground : undefined,
      whyInterested: trimmedWhyInterested.length > 0 ? trimmedWhyInterested : undefined,
    }).catch(() => {
      // Silent by design — see this function's own doc comment.
    });
  }

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

        {/* 3. What's Included */}
        <section className="border-b border-line px-6 py-16 sm:px-8 sm:py-20">
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
            <SectionCta label={page.applyCta} />
          </div>
        </section>

        {/* 4. Investment & Fee */}
        <section className="border-b border-line bg-panel px-6 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-content">
            <div className="mb-10 max-w-xl sm:mb-12">
              <Eyebrow color="text-teal">{page.investment.eyebrow}</Eyebrow>
              <h2 className="mt-4 text-[24px] font-extrabold leading-tight sm:text-[30px]">{page.investment.headline}</h2>
            </div>

            <div className="mx-auto max-w-2xl rounded-sm border border-line-strong bg-panel2 p-7 sm:p-9">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
                <div>
                  <p className="font-mono text-[11.5px] uppercase tracking-[0.08em] text-ink-faint">{page.investment.feeLabel}</p>
                  <p className="mt-2 text-[26px] font-extrabold tabular-nums text-ink sm:text-[30px]">{page.investment.feeValue}</p>
                </div>
                <div>
                  <p className="font-mono text-[11.5px] uppercase tracking-[0.08em] text-ink-faint">{page.investment.revenueLabel}</p>
                  <p className="mt-2 text-[26px] font-extrabold tabular-nums text-teal sm:text-[30px]">{page.investment.revenueValue}</p>
                  <p className="mt-1 text-[13px] text-ink-dim">{page.investment.revenueUnit}</p>
                </div>
              </div>
              <p className="mt-4 border-t border-line pt-4 text-[13px] leading-relaxed text-ink-dim">{page.investment.revenueNote}</p>

              <h3 className="mt-7 text-[14px] font-bold text-ink">{page.investment.includesTitle}</h3>
              <ul className="mt-3 space-y-2.5">
                {page.investment.includesItems.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-ink-dim">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-teal" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 5. Earning Potential */}
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

        {/* 6. How It Works */}
        <section className="border-b border-line bg-panel px-6 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-content">
            <div className="mb-10 max-w-xl sm:mb-12">
              <Eyebrow color="text-teal">{page.howItWorks.eyebrow}</Eyebrow>
              <h2 className="mt-4 text-[24px] font-extrabold leading-tight sm:text-[30px]">{page.howItWorks.headline}</h2>
            </div>

            <div className="relative">
              <div className="absolute left-0 right-0 top-5 hidden h-px bg-line-strong sm:block" aria-hidden="true" />
              <div className="relative grid grid-cols-1 gap-8 sm:grid-cols-5 sm:gap-4">
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

        {/* 7. About Dr. Kapil */}
        <section className="border-b border-line px-6 py-16 sm:px-8 sm:py-20">
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

            <SectionCta label={page.applyCta} />
          </div>
        </section>

        {/* 8. Who Is This For */}
        <section className="border-b border-line bg-panel px-6 py-16 sm:px-8 sm:py-20">
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

        {/* 9. FAQ */}
        <section className="border-b border-line px-6 py-16 sm:px-8 sm:py-20">
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

        {/* 10. Application Form */}
        <section id="apply" className="px-6 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-xl">
            <div className="mb-8 text-center sm:mb-10">
              <div className="flex justify-center">
                <Eyebrow color="text-teal">{page.apply.eyebrow}</Eyebrow>
              </div>
              <h2 className="mt-4 text-[24px] font-extrabold leading-tight sm:text-[30px]">{page.apply.title}</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-ink-dim">{page.apply.sub}</p>
            </div>

            {status === "success" ? (
              <div className="flex flex-col items-center gap-3 rounded-sm border border-teal/40 bg-teal-soft px-7 py-10 text-center">
                <CheckCircle2 className="h-8 w-8 text-teal" aria-hidden="true" />
                <h3 className="text-[17px] font-bold text-ink">{page.apply.successTitle}</h3>
                <p className="max-w-sm text-[14px] leading-relaxed text-ink-dim">{page.apply.successDesc}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="rounded-sm border border-line-strong bg-panel2 p-6 sm:p-8">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="franchise-name" className="text-[12.5px] font-semibold text-ink-dim">
                      {page.apply.nameLabel}
                    </label>
                    <input
                      id="franchise-name"
                      type="text"
                      required
                      autoComplete="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="mt-1.5 w-full rounded-sm border border-line-strong bg-panel px-4 py-3 text-[14px] text-ink outline-none transition-colors focus:border-teal/60"
                    />
                  </div>

                  <div>
                    <label htmlFor="franchise-phone" className="text-[12.5px] font-semibold text-ink-dim">
                      {page.apply.phoneLabel}
                    </label>
                    <input
                      id="franchise-phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      className="mt-1.5 w-full rounded-sm border border-line-strong bg-panel px-4 py-3 text-[14px] text-ink outline-none transition-colors focus:border-teal/60"
                    />
                  </div>

                  <div>
                    <label htmlFor="franchise-city" className="text-[12.5px] font-semibold text-ink-dim">
                      {page.apply.cityLabel}
                    </label>
                    <input
                      id="franchise-city"
                      type="text"
                      required
                      autoComplete="address-level2"
                      value={city}
                      onChange={(event) => setCity(event.target.value)}
                      className="mt-1.5 w-full rounded-sm border border-line-strong bg-panel px-4 py-3 text-[14px] text-ink outline-none transition-colors focus:border-teal/60"
                    />
                  </div>

                  <div>
                    <label htmlFor="franchise-background" className="flex items-baseline gap-2 text-[12.5px] font-semibold text-ink-dim">
                      {page.apply.backgroundLabel}
                      <span className="font-mono text-[10.5px] font-normal uppercase tracking-[0.05em] text-ink-faint">
                        {page.apply.backgroundOptionalTag}
                      </span>
                    </label>
                    <select
                      id="franchise-background"
                      value={background}
                      onChange={(event) => setBackground(event.target.value)}
                      className="mt-1.5 w-full rounded-sm border border-line-strong bg-panel px-4 py-3 text-[14px] text-ink outline-none transition-colors focus:border-teal/60"
                    >
                      <option value="" disabled>
                        {page.apply.backgroundPlaceholder}
                      </option>
                      {page.apply.backgroundOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="franchise-why-interested" className="flex items-baseline gap-2 text-[12.5px] font-semibold text-ink-dim">
                      {page.apply.whyInterestedLabel}
                      <span className="font-mono text-[10.5px] font-normal uppercase tracking-[0.05em] text-ink-faint">
                        {page.apply.whyInterestedOptionalTag}
                      </span>
                    </label>
                    <textarea
                      id="franchise-why-interested"
                      rows={3}
                      placeholder={page.apply.whyInterestedPlaceholder}
                      value={whyInterested}
                      onChange={(event) => setWhyInterested(event.target.value)}
                      className="mt-1.5 w-full resize-none rounded-sm border border-line-strong bg-panel px-4 py-3 text-[14px] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-teal/60"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-sm bg-teal px-7 py-[15px] text-[14.5px] font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 hover:bg-teal-light disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {page.apply.submitLabel}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppWidget />
    </div>
  );
}
