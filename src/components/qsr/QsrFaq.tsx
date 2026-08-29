"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";
import { WHATSAPP_MASTERCLASS_INQUIRY_LINK } from "@/config/whatsappSupportLink";
import { trackGaEvent } from "@/lib/analytics/ga4";

export default function QsrFaq(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.qsrLanding.faq;

  return (
    <section id="faq" className="border-b border-line px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow>{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
        </div>

        <div className="mx-auto max-w-3xl divide-y divide-line border-y border-line">
          {section.items.map((item) => (
            <details key={item.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-[15.5px] font-semibold text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                {item.question}
                <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full border border-line-strong text-[13px] text-ink-faint transition-transform duration-200 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 pr-10 text-[14.5px] leading-relaxed text-ink-dim">{item.answer}</p>
            </details>
          ))}
        </div>

        <div className="mx-auto mt-10 flex max-w-3xl justify-center">
          <a
            href={WHATSAPP_MASTERCLASS_INQUIRY_LINK}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackGaEvent("whatsapp_click", { location: "qsr_faq" })}
            className="group inline-flex items-center gap-2.5 rounded-sm border border-teal/60 px-7 py-[15px] text-[14.5px] font-semibold text-teal transition-colors hover:bg-teal-soft"
          >
            {section.ctaLabel}
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
