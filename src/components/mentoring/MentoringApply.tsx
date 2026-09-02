"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";
import PracticeDisclaimer from "../PracticeDisclaimer";
import { buildMentoringApplicationWhatsAppLink } from "@/config/whatsappSupportLink";
import { trackGaEvent } from "@/lib/analytics/ga4";

// Application Form™ — no hosted checkout or persisted application
// database exists for this offer yet (see whatsappSupportLink.ts's own
// note on buildMentoringApplicationWhatsAppLink), so this real, validated
// form hands off to WhatsApp with the visitor's answers already filled
// in, rather than silently dropping them or requiring a second round of
// typing on WhatsApp itself — same "WhatsApp is the real interim path,
// not a placeholder" pattern every other CTA on this site already uses.
export default function MentoringApply(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.mentoringLanding.apply;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [situation, setSituation] = useState("");

  const canSubmit = name.trim().length > 0 && phone.trim().length > 0 && city.trim().length > 0;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!canSubmit) return;

    trackGaEvent("whatsapp_click", { location: "mentoring_apply_form" });
    const url = buildMentoringApplicationWhatsAppLink({ name, phone, city, situation });
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <section id="apply" className="border-b border-line bg-panel px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-xl">
        <div className="mb-10 text-center">
          <div className="flex justify-center">
            <Eyebrow color="text-rose">{section.eyebrow}</Eyebrow>
          </div>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
          <p className="mt-3 text-[15px] font-semibold text-ink">{section.sub}</p>
          <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-ink-dim">{section.body}</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="rounded-sm border border-line-strong bg-panel2 p-7 sm:p-8">
          <div className="space-y-4">
            <div>
              <label htmlFor="mentoring-name" className="text-[12.5px] font-semibold text-ink-dim">
                {section.nameLabel}
              </label>
              <input
                id="mentoring-name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-1.5 w-full rounded-sm border border-line-strong bg-panel px-4 py-3 text-[14px] text-ink outline-none transition-colors focus:border-rose/60"
              />
            </div>

            <div>
              <label htmlFor="mentoring-phone" className="text-[12.5px] font-semibold text-ink-dim">
                {section.phoneLabel}
              </label>
              <input
                id="mentoring-phone"
                type="tel"
                required
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="mt-1.5 w-full rounded-sm border border-line-strong bg-panel px-4 py-3 text-[14px] text-ink outline-none transition-colors focus:border-rose/60"
              />
            </div>

            <div>
              <label htmlFor="mentoring-city" className="text-[12.5px] font-semibold text-ink-dim">
                {section.cityLabel}
              </label>
              <input
                id="mentoring-city"
                type="text"
                required
                autoComplete="address-level2"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className="mt-1.5 w-full rounded-sm border border-line-strong bg-panel px-4 py-3 text-[14px] text-ink outline-none transition-colors focus:border-rose/60"
              />
            </div>

            <div>
              <label htmlFor="mentoring-situation" className="flex items-baseline gap-2 text-[12.5px] font-semibold text-ink-dim">
                {section.situationLabel}
                <span className="font-mono text-[10.5px] font-normal uppercase tracking-[0.05em] text-ink-faint">
                  {section.situationOptionalTag}
                </span>
              </label>
              <textarea
                id="mentoring-situation"
                rows={3}
                placeholder={section.situationPlaceholder}
                value={situation}
                onChange={(event) => setSituation(event.target.value)}
                className="mt-1.5 w-full resize-none rounded-sm border border-line-strong bg-panel px-4 py-3 text-[14px] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-rose/60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-sm bg-rose px-7 py-[15px] text-[14.5px] font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#b8757e] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {section.submitLabel} <span aria-hidden="true">→</span>
          </button>
        </form>

        <PracticeDisclaimer className="mx-auto mt-6" text={section.disclaimer} />
      </div>
    </section>
  );
}
