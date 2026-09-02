"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";
import { CLASSPLUS_OVERTHINKING_COURSE_LINK } from "@/config/overthinkingCoursePaymentLink";
import { trackGaEvent } from "@/lib/analytics/ga4";

export default function CourseFinalCta(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.courseLanding.finalCta;

  return (
    <section className="px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <div className="flex justify-center">
          <Eyebrow color="text-rose">{section.eyebrow}</Eyebrow>
        </div>
        <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[36px]">{section.headline}</h2>
        <div className="mt-9 flex justify-center">
          <a
            href={CLASSPLUS_OVERTHINKING_COURSE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackGaEvent("classplus_click", { location: "course_final_cta" })}
            className="group inline-flex items-center gap-2.5 rounded-sm bg-rose px-8 py-[17px] text-[15px] font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#b8757e]"
          >
            {section.cta}
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
