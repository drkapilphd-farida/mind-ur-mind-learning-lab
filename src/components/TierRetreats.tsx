"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow, CtaButton, Pill } from "./ui";

export default function TierRetreats(): React.JSX.Element {
  const { t } = useLanguage();
  const tier = t.tier2;

  const cards = [
    { data: tier.online, key: "online" },
    { data: tier.residential, key: "residential" },
  ] as const;

  return (
    <section id="tier-2" className="border-b border-line px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow color="text-teal">{tier.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[30px] font-extrabold leading-tight sm:text-[38px]">
            {tier.title} <span className="font-display italic text-teal">{tier.titleEm}</span>
          </h2>
          <p className="mt-4 text-[16px] text-ink-dim">{tier.desc}</p>
        </div>

        <div className="grid grid-cols-1 gap-7 lg:grid-cols-2">
          {cards.map(({ data, key }) => (
            <div
              key={key}
              className="flex flex-col rounded-sm border border-line bg-panel p-8 sm:p-9"
            >
              <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.09em] text-teal">
                {data.tag}
              </div>
              <h3 className="mb-3 text-[21px] font-bold leading-snug">{data.title}</h3>
              <p className="mb-6 text-[14.5px] leading-relaxed text-ink-dim">{data.desc}</p>
              <div className="mb-8 flex flex-wrap gap-2">
                {data.pills.map((pill) => (
                  <Pill key={pill}>{pill}</Pill>
                ))}
              </div>
              <CtaButton
                href={key === "online" ? "/retreats/online-11-day" : "/retreats/residential"}
                variant="ghost"
                accent="teal"
                className="mt-auto self-start"
              >
                {data.cta}
              </CtaButton>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
