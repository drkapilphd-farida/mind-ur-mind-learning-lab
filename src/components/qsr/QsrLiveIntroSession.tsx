"use client";

import { Video } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";
import { WHATSAPP_FREE_INTRO_SESSION_LINK } from "@/config/whatsappSupportLink";
import { trackGaEvent } from "@/lib/analytics/ga4";

// Free Live Intro Session™ — a genuinely free lead magnet, distinct
// from the 30-day paid program (see copy below and getIsPaidUser.ts —
// there is no free-access tier to the program itself). No booking/
// calendar backend exists for this session yet, so the CTA opens
// WhatsApp — the real interim registration path, not a placeholder
// standing in for a missing form.
//
// ─────────────────────────────────────────────────────────────────
// SWAP-IN POINT for the real registration flow: once a calendar/signup
// backend exists (e.g. a scheduled-session table + booking form), swap
// the <a href={WHATSAPP_FREE_INTRO_SESSION_LINK}> below for that real
// flow. Nothing else in this component needs to change.
// ─────────────────────────────────────────────────────────────────
export default function QsrLiveIntroSession(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.qsrLanding.liveIntroSession;

  // Visual Rhythm™ — lg:py-20 trims desktop-only vertical padding (base
  // py-24 unchanged, so mobile/tablet render identically to before).
  return (
    <section className="border-b border-line px-6 py-24 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-content">
        <div className="rounded-sm border border-teal/40 bg-teal-soft px-7 py-10 sm:px-10 sm:py-12">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-teal/50 bg-panel">
              <Video className="h-5 w-5 text-teal" aria-hidden="true" />
            </span>
            <Eyebrow color="text-teal">{section.eyebrow}</Eyebrow>
            <h2 className="text-[26px] font-extrabold leading-tight text-ink sm:text-[32px]">{section.title}</h2>
            <p className="text-[15px] leading-relaxed text-ink-dim">{section.desc}</p>
            <a
              href={WHATSAPP_FREE_INTRO_SESSION_LINK}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackGaEvent("whatsapp_click", { location: "qsr_live_intro_session" })}
              className="group mt-2 inline-flex items-center gap-2.5 rounded-sm bg-teal px-7 py-[15px] text-[14.5px] font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 hover:bg-teal-light"
            >
              {section.ctaLabel}
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
