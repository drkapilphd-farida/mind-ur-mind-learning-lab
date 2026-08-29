"use client";

import { MapPin } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";
import { buildResidentialWhatsAppLink } from "@/config/whatsappSupportLink";
import { trackGaEvent } from "@/lib/analytics/ga4";

// The Official 2026–2027 Roadmap™ — the anchor section of this page,
// placed second (right after the hero) per the real, confirmed schedule:
// Nov 2026 Lonavala, Feb 2027 Rishikesh, Jun 2027 Lonavala, Nov 2027
// Lonavala. Each card's CTA pre-fills the WhatsApp message with that
// specific date so Dr. Kapil's team knows which retreat the visitor
// means without back-and-forth.
export default function ResidentialRoadmap(): React.JSX.Element {
  const { t } = useLanguage();
  const residential = t.residentialLanding;

  return (
    <section id="roadmap" className="border-b border-line bg-panel px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow color="text-gold">{residential.roadmap.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{residential.roadmap.title}</h2>
          <p className="mt-3 text-[15.5px] text-ink-dim">{residential.roadmap.desc}</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {residential.roadmap.items.map((item) => (
            <div key={item.when} className="flex flex-col rounded-sm border border-gold/30 bg-panel2 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 bg-gold-soft">
                <MapPin className="h-5 w-5 text-gold" aria-hidden="true" />
              </div>
              <div className="mt-4 font-mono text-[11px] uppercase tracking-[0.08em] text-gold">{item.when}</div>
              <h3 className="mt-1.5 text-[17px] font-bold leading-snug text-ink">{item.where}</h3>
              <p className="mt-2.5 flex-1 text-[13.5px] leading-relaxed text-ink-dim">{item.theme}</p>
              <a
                href={buildResidentialWhatsAppLink(`${item.when} — ${item.where} (${item.theme})`)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackGaEvent("whatsapp_click", { location: `residential_roadmap_${item.when}` })}
                className="mt-5 inline-flex items-center gap-2 text-[13px] font-semibold text-teal transition-colors hover:text-teal-light"
              >
                {residential.roadmap.ctaLabel}
                <span aria-hidden="true">→</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
