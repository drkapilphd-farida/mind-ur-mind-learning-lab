"use client";

import { useLanguage } from "@/context/LanguageContext";
import { HABIT_BUILDER_APP_URL } from "@/config/habitBuilderSignupLink";
import { trackGaEvent } from "@/lib/analytics/ga4";

export default function HomeFinalCta(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.homeFinalCta;

  return (
    <section className="border-b border-line bg-panel px-6 py-20 text-center sm:px-8 sm:py-24">
      <div className="mx-auto max-w-xl">
        <h2 className="text-[28px] font-extrabold leading-tight sm:text-[36px]">{section.title}</h2>
        <p className="mx-auto mt-4 max-w-md text-[15.5px] leading-relaxed text-ink-dim">{section.desc}</p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <a
            href={HABIT_BUILDER_APP_URL}
            onClick={() => trackGaEvent("signup_cta_click", { location: "home_final_cta" })}
            className="group inline-flex items-center gap-2.5 rounded-sm bg-gold px-7 py-[15px] text-[14.5px] font-semibold tracking-tight text-[#1B1508] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#cb9a44]"
          >
            {section.ctaPrimary}
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </a>
          <a
            href="#explore-programs"
            className="inline-flex items-center gap-2 rounded-sm border border-line-strong px-7 py-[15px] text-[14.5px] font-semibold text-ink transition-colors hover:bg-panel2"
          >
            {section.ctaSecondary}
          </a>
        </div>
      </div>
    </section>
  );
}
