"use client";

import { Gauge } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

// Free Lead-Gen™ — deliberately styled apart from the paid program cards
// above (teal, not gold; a plain centered banner, not a card in a grid)
// so a visitor never mistakes this free 2-minute test for another paid
// offer competing for the same attention.
export default function HomeSpeedTestCta(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.homeSpeedTest;

  return (
    <section className="border-b border-line bg-teal-soft/30 px-6 py-16 text-center sm:px-8 sm:py-20">
      <div className="mx-auto max-w-xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-teal/40 bg-teal-soft">
          <Gauge className="h-6 w-6 text-teal" aria-hidden="true" />
        </div>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.08em] text-teal">{section.eyebrow}</p>
        <h2 className="mt-3 text-[24px] font-extrabold leading-tight sm:text-[28px]">{section.title}</h2>
        <p className="mt-4 text-[14.5px] font-semibold leading-relaxed text-ink">{section.lead}</p>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-dim">{section.desc}</p>

        <a
          href="/programs/quantum-speed-reading/speed-test"
          className="group mt-7 inline-flex items-center gap-2.5 rounded-sm bg-teal px-7 py-[15px] text-[14.5px] font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 hover:bg-teal-light"
        >
          {section.cta}
          <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </a>
      </div>
    </section>
  );
}
