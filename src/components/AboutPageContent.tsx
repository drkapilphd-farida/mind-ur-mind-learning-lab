"use client";

import { useLanguage } from "@/context/LanguageContext";
import SimplePageNav from "./SimplePageNav";
import Footer from "./Footer";
import WhatsAppWidget from "./WhatsAppWidget";
import GuideProfileCard from "./GuideProfileCard";

// About Us™ — company-level page. The footer's old "About Dr. Sharma"
// link pointed at this same /about route while implying a
// founder-bio-only page; there's no separate dedicated founder bio page
// in this codebase to link out to instead, so rather than inventing one
// (or a link to a page that doesn't exist), the real founder bio content
// is embedded directly on this page via the same shared GuideProfileCard
// the Personal Class and Course pages already use — real, existing
// content, not new copy.
export default function AboutPageContent(): React.JSX.Element {
  const { t } = useLanguage();
  const a = t.aboutPage;

  return (
    <div className="warm-light min-h-screen font-sans antialiased">
      <SimplePageNav />
      <main>
        <section className="border-b border-line px-6 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-[32px] font-extrabold leading-tight sm:text-[40px]">{a.headline}</h1>

            <div className="mx-auto mt-8 max-w-xl space-y-5 text-left">
              {a.body.map((paragraph) => (
                <p key={paragraph} className="text-[15.5px] leading-relaxed text-ink-dim">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mx-auto mt-10 grid max-w-md grid-cols-3 gap-4">
              {a.stats.map((stat) => (
                <div key={stat.label} className="rounded-sm border border-line-strong bg-panel2 px-3 py-4 text-center">
                  <div className="font-display text-[22px] font-bold text-ink sm:text-[26px]">{stat.value}</div>
                  <div className="mt-1 text-[11px] leading-snug text-ink-faint">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <GuideProfileCard {...a.guide} accent="gold" />
      </main>
      <Footer />
      <WhatsAppWidget />
    </div>
  );
}
