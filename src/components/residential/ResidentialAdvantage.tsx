"use client";

import { WifiOff, Zap, Users, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";

const ADVANTAGE_ICONS = [WifiOff, Zap, Users, ShieldCheck] as const;

// The In-Person Advantage™ — the four differentiators the user named
// explicitly: total disconnect, direct energy transmission, small
// exclusive cohorts, personal vetting. This is the section that answers
// "why not just do the online retreat."
export default function ResidentialAdvantage(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.residentialLanding.advantage;

  return (
    <section className="border-b border-line bg-panel px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow color="text-gold">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
          <p className="mt-3 text-[15.5px] text-ink-dim">{section.desc}</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {section.items.map((item, index) => {
            const Icon = ADVANTAGE_ICONS[index % ADVANTAGE_ICONS.length] ?? WifiOff;
            return (
              <div key={item.title} className="rounded-sm border border-line-strong bg-panel2 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 bg-gold-soft">
                  <Icon className="h-5 w-5 text-gold" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-[16px] font-bold leading-snug text-ink">{item.title}</h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-dim">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
